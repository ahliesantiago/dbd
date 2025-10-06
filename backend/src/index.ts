import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import dotenv from 'dotenv';
import pool, { testConnection, createDatabaseIfNotExists } from './config/database';
import { initDatabase } from './utils/initDatabase';
import authRoutes from './routes/auth';
import blockRoutes from './routes/blocks';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Create session store
const PgSession = connectPgSimple(session);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'session',
  }),
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API routes placeholder
app.get('/api', (req, res) => {
  res.json({ message: 'DBD API v1.0' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Blocks routes
app.use('/api/blocks', blockRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// Start server
const startServer = async () => {
  try {
    // Try to create database if it doesn't exist
    const dbCreated = await createDatabaseIfNotExists();
    if (!dbCreated) {
      console.error('❌ Failed to ensure database exists');
      console.log('\n💡 Database Setup Issues:');
      console.log('1. Make sure PostgreSQL is running');
      console.log('2. Ensure all required environment variables are set in .env file');
      console.log('3. Check your credentials can connect to the default postgres database');
      console.log('4. Current config:');
      console.log(`   - Host: ${process.env.DB_HOST || 'NOT SET'}`);
      console.log(`   - Port: ${process.env.DB_PORT || 'NOT SET'}`);
      console.log(`   - Database: ${process.env.DB_NAME || 'NOT SET'}`);
      console.log(`   - User: ${process.env.DB_USER || 'NOT SET'}`);
      console.log(`   - Password: ${process.env.DB_PASSWORD ? '[SET]' : 'NOT SET'}`);
      console.log('\n🔧 Create a .env file in the backend directory with the above variables');
      process.exit(1);
    }

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database after creation');
      console.log('\n💡 Database Connection Issues:');
      console.log('1. Database was created but connection failed');
      console.log('2. This might be a permissions or configuration issue');
      console.log('3. Verify all environment variables are correctly set');
      console.log('4. Current config:');
      console.log(`   - Host: ${process.env.DB_HOST || 'NOT SET'}`);
      console.log(`   - Port: ${process.env.DB_PORT || 'NOT SET'}`);
      console.log(`   - Database: ${process.env.DB_NAME || 'NOT SET'}`);
      console.log(`   - User: ${process.env.DB_USER || 'NOT SET'}`);
      console.log(`   - Password: ${process.env.DB_PASSWORD ? '[SET]' : 'NOT SET'}`);
      process.exit(1);
    }

    // Initialize database tables
    await initDatabase();

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: Connected to ${process.env.DB_NAME || 'dbd_database'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
