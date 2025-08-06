import { Database } from './database';

async function migrateDatabase() {
  console.log('Starting database migration...');
  const db = new Database();
  
  try {
    // Check if status column exists in scheduled_messages
    const query = `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'scheduled_messages'
        AND column_name = 'status'
      )
    `;
    
    const result = await db.query(query);
    const statusColumnExists = result[0]?.exists;
    
    // Add status and errorMessage columns if they don't exist
    if (!statusColumnExists) {
      console.log('Adding status and errorMessage columns to scheduled_messages table');
      await db.execute(`
        ALTER TABLE scheduled_messages
        ADD COLUMN status TEXT DEFAULT 'scheduled',
        ADD COLUMN errorMessage TEXT
      `);
      console.log('Migration completed successfully');
    } else {
      console.log('No migrations needed. Database schema is up to date.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await db.close();
  }
}

// Run the migration
migrateDatabase().catch(console.error);
