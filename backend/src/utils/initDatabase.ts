import pool from '../config/database';

export const initDatabase = async (): Promise<void> => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        alias VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        has_authentication BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table for express-session (only if it doesn't exist)
    // connect-pg-simple may have already created it
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
      WITH (OIDS=FALSE);
    `);

    // Add primary key constraint only if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE session
        ADD CONSTRAINT session_pkey
        PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
      `);
    } catch (error: any) {
      // Ignore error if primary key already exists
      if (!error.message.includes('already exists') && !error.message.includes('multiple primary keys')) {
        console.error('Warning: Could not add session primary key:', error.message);
      }
    }

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS IDX_session_expire
      ON session (expire);
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error: any) {
    // Ignore errors for constraints that already exist
    if (!error.message.includes('already exists') && !error.message.includes('multiple primary keys')) {
      console.error('❌ Error initializing database:', error);
      throw error;
    } else {
      console.log('✅ Database tables initialized successfully');
    }
  }
};
