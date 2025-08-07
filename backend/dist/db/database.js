"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const pg_promise_1 = __importDefault(require("pg-promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class Database {
    constructor() {
        this.initialized = false;
        this.initPromise = null;
        this.initPromise = this.initialize();
    }
    async initialize() {
        try {
            console.log('Initializing NeonDB connection');
            const pgp = (0, pg_promise_1.default)();
            const connectionString = process.env.DATABASE_URL;
            if (!connectionString) {
                throw new Error('DATABASE_URL environment variable is not defined');
            }
            this.db = pgp(connectionString);
            await this.createTables();
            this.initialized = true;
            console.log('NeonDB connection established');
        }
        catch (error) {
            console.error('Database initialization error:', error);
            throw new Error('Failed to initialize database');
        }
    }
    async createTables() {
        try {
            await this.db.none(`
        CREATE TABLE IF NOT EXISTS slack_tokens (
          userId TEXT PRIMARY KEY,
          accessToken TEXT NOT NULL,
          refreshToken TEXT NOT NULL,
          expiresAt TIMESTAMP WITH TIME ZONE NOT NULL
        )
      `);
            const tableExists = await this.db.oneOrNone(`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'scheduled_messages'
        )
      `);
            if (tableExists && tableExists.exists) {
                const statusColumnExists = await this.db.oneOrNone(`
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'scheduled_messages'
            AND column_name = 'status'
          )
        `);
                if (!statusColumnExists || !statusColumnExists.exists) {
                    console.log('Adding status column to scheduled_messages table');
                    await this.db.none(`
            ALTER TABLE scheduled_messages
            ADD COLUMN status TEXT DEFAULT 'scheduled',
            ADD COLUMN errorMessage TEXT
          `);
                }
            }
            else {
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
        }
        catch (error) {
            console.error('Error creating tables:', error);
            throw new Error('Failed to create database tables');
        }
    }
    async ensureInitialized() {
        if (!this.initialized) {
            if (this.initPromise) {
                await this.initPromise;
            }
            else {
                throw new Error('Database not initialized and no initialization in progress');
            }
        }
    }
    async query(sql, params = []) {
        await this.ensureInitialized();
        try {
            return await this.db.any(sql, params);
        }
        catch (error) {
            console.error('Database query error:', error);
            throw new Error(`Database query failed: ${error.message}`);
        }
    }
    async execute(sql, params = []) {
        await this.ensureInitialized();
        try {
            await this.db.none(sql, params);
        }
        catch (error) {
            console.error('Database execution error:', error);
            throw new Error(`Database execution failed: ${error.message}`);
        }
    }
    async close() {
        if (this.db.$pool) {
            await this.db.$pool.end();
            this.initialized = false;
            console.log('Database connection closed');
        }
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map