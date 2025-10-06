import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import type { User, UserCreateInput, BackendAuthResponse } from '../types/index';

export class UserService {
  // Create a new user (for first-time setup or authentication signup)
  static async createUser(userData: UserCreateInput): Promise<BackendAuthResponse> {
    try {
      const { name, email, password } = userData;

      // Check if a user already exists (since this is single-user app)
      const existingUser = await this.getFirstUser();
      if (existingUser) {
        return {
          success: false,
          message: 'A user already exists in this app instance'
        };
      }

      // Hash password if provided
      let passwordHash: string | null = null;
      let hasAuthentication = false;

      if (email && password) {
        passwordHash = await bcrypt.hash(password, 12);
        hasAuthentication = true;
      }

      // Insert user into database
      const query = `
        INSERT INTO users (name, email, password_hash, has_authentication)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, has_authentication, created_at, updated_at
      `;

      const result = await pool.query(query, [
        name,
        email || null,
        passwordHash,
        hasAuthentication
      ]);

      const user = result.rows[0];

      // Generate JWT token if authentication is enabled
      let token: string | undefined;
      if (hasAuthentication) {
        token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );
      }

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          hasAuthentication: user.has_authentication,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        },
        token,
        message: 'User created successfully'
      };

    } catch (error: any) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: 'Failed to create user'
      };
    }
  }

  // Get the first (and only) user
  static async getFirstUser(): Promise<User | null> {
    try {
      const result = await pool.query('SELECT * FROM users ORDER BY id ASC LIMIT 1');
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Authenticate user login
  static async authenticate(email: string, password: string): Promise<BackendAuthResponse> {
    try {
      const query = 'SELECT * FROM users WHERE email = $1 AND has_authentication = true';
      const result = await pool.query(query, [email]);

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      const user = result.rows[0];

      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          hasAuthentication: user.has_authentication,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        },
        token,
        message: 'Authentication successful'
      };

    } catch (error: any) {
      console.error('Error authenticating user:', error);
      return {
        success: false,
        message: 'Authentication failed'
      };
    }
  }

  // Update user information
  static async updateUser(userId: number, updates: Partial<UserCreateInput>): Promise<BackendAuthResponse> {
    try {
      const { name, email } = updates;

      const query = `
        UPDATE users
        SET name = COALESCE($2, name),
            email = COALESCE($4, email),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, name, email, has_authentication
      `;

      const result = await pool.query(query, [userId, name, email]);

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const user = result.rows[0];

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          hasAuthentication: user.has_authentication,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        message: 'User updated successfully'
      };

    } catch (error: any) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: 'Failed to update user'
      };
    }
  }
}
