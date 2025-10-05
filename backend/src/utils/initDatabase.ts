import pool from '../config/database';

export const initDatabase = async (): Promise<void> => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
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

    // TODO: Add foreign key constraint for type, tags, categories, and priority once customization is implemented
    // TODO: Add more flexible options for recurrence and completion_basis_unit
    // Create blocks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blocks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('Tasks', 'Habits', 'Events', 'Appointments')),
        description TEXT,
        start_date DATE,
        end_date DATE,
        start_time TIME,
        end_time TIME,
        status VARCHAR(20) CHECK (status IN ('completed', 'skipped', 'postponed', 'cancelled')),
        tags TEXT[],
        categories TEXT[],
        priority VARCHAR(10) NOT NULL DEFAULT 'None' CHECK (priority IN ('High', 'Medium', 'Low', 'None')),
        recurrence VARCHAR(20) NOT NULL DEFAULT 'one-time' CHECK (recurrence IN ('one-time', 'daily', 'weekly', 'monthly', 'yearly', 'occasional', 'frequent')),
        completion_basis_unit VARCHAR(20) CHECK (completion_basis_unit IN ('simple', 'count', 'duration', 'distance', 'percent')),
        completion_basis_goal INTEGER,
        completion_basis_goal_unit VARCHAR(50),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for blocks table
    await pool.query(`
      CREATE INDEX IF NOT EXISTS IDX_blocks_user_id ON blocks (user_id);
      CREATE INDEX IF NOT EXISTS IDX_blocks_type ON blocks (type);
      CREATE INDEX IF NOT EXISTS IDX_blocks_start_date ON blocks (start_date);
      CREATE INDEX IF NOT EXISTS IDX_blocks_priority ON blocks (priority);
      CREATE INDEX IF NOT EXISTS IDX_blocks_status ON blocks (status);
    `);

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
