import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import dotenv from 'dotenv';
import pool, { testConnection } from './config/database';
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
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database');
      console.log('\n💡 Database Setup Required:');
      console.log('1. Make sure PostgreSQL is running');
      console.log('2. Create the database: CREATE DATABASE dbd_database;');
      console.log('3. Check your .env.local file for correct credentials');
      console.log('4. Current config:');
      console.log(`   - Host: ${process.env.DB_HOST || 'localhost'}`);
      console.log(`   - Port: ${process.env.DB_PORT || '5432'}`);
      console.log(`   - Database: ${process.env.DB_NAME || 'dbd_database'}`);
      console.log(`   - User: ${process.env.DB_USER || 'postgres'}`);
      console.log('\n🔧 For development, you can also run the backend without database connectivity (limited functionality)');
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
