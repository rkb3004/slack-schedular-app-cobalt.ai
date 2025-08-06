import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

export class Database {
  private db!: pgPromise.IDatabase<any>;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      console.log('Initializing NeonDB connection');
      const pgp = pgPromise();
      
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not defined');
      }
      
      this.db = pgp(connectionString);
      
      // Initialize tables
      await this.createTables();
      
      this.initialized = true;
      console.log('NeonDB connection established');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw new Error('Failed to initialize database');
    }
  }

  private async createTables(): Promise<void> {
    try {
      // Create slack_tokens table
      await this.db.none(`
        CREATE TABLE IF NOT EXISTS slack_tokens (
          userId TEXT PRIMARY KEY,
          accessToken TEXT NOT NULL,
          refreshToken TEXT NOT NULL,
          expiresAt TIMESTAMP WITH TIME ZONE NOT NULL
        )
      `);

      // Check if the scheduled_messages table exists
      const tableExists = await this.db.oneOrNone(`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'scheduled_messages'
        )
      `);

      if (tableExists && tableExists.exists) {
        // Check if status column exists
        const statusColumnExists = await this.db.oneOrNone(`
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'scheduled_messages'
            AND column_name = 'status'
          )
        `);

        // Add status column if it doesn't exist
        if (!statusColumnExists || !statusColumnExists.exists) {
          console.log('Adding status column to scheduled_messages table');
          await this.db.none(`
            ALTER TABLE scheduled_messages
            ADD COLUMN status TEXT DEFAULT 'scheduled',
            ADD COLUMN errorMessage TEXT
          `);
        }
      } else {
        // Create scheduled_messages table with all columns
        await this.db.none(`
          CREATE TABLE IF NOT EXISTS scheduled_messages (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            channel TEXT NOT NULL,
            text TEXT NOT NULL,
            scheduledTime TIMESTAMP WITH TIME ZONE NOT NULL,
            status TEXT DEFAULT 'scheduled',
            errorMessage TEXT
          )
        `);
      }

      console.log('Database tables created or verified');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw new Error('Failed to create database tables');
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      if (this.initPromise) {
        await this.initPromise;
      } else {
        throw new Error('Database not initialized and no initialization in progress');
      }
    }
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    await this.ensureInitialized();
    try {
      return await this.db.any(sql, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error(`Database query failed: ${(error as Error).message}`);
    }
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    await this.ensureInitialized();
    try {
      await this.db.none(sql, params);
    } catch (error) {
      console.error('Database execution error:', error);
      throw new Error(`Database execution failed: ${(error as Error).message}`);
    }
  }

  async close(): Promise<void> {
    // pgp doesn't have an explicit close method but we can
    // use the IMain.end() method to properly shut down
    if (this.db.$pool) {
      await this.db.$pool.end();
      this.initialized = false;
      console.log('Database connection closed');
    }
  }
}
