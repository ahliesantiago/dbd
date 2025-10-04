import express from 'express';
import { UserService } from '../services/userService';
import '../types/index'; // Import session type extensions

const router: express.Router = express.Router();

// Check if user exists (for first-time setup detection)
router.get('/user/exists', async (req, res) => {
  try {
    const user = await UserService.getFirstUser();
    res.json({
      success: true,
      exists: !!user,
      user: user ? {
        name: user.name,
        hasAuthentication: user.hasAuthentication
      } : null
    });
  } catch (error) {
    console.error('Error checking user existence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check user existence'
    });
  }
});

// Create user (first-time setup)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // If email is provided, password must also be provided
    if (email && !password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required when email is provided'
      });
    }

    const result = await UserService.createUser({ name, email, password });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Set session
    if (result.user) {
      req.session.userId = result.user.id;
      req.session.authenticated = true;
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await UserService.authenticate(email, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    // Set session
    req.session.userId = result.user?.id;
    req.session.authenticated = true;

    res.json(result);
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to logout'
      });
    }

    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const user = await UserService.getFirstUser();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if authentication is required and user is not authenticated
    if (user.hasAuthentication && !req.session.authenticated) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        hasAuthentication: user.hasAuthentication
      }
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
});

// Update user information
router.put('/update', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Get current user
    const currentUser = await UserService.getFirstUser();
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if authentication is required and user is not authenticated
    if (currentUser.hasAuthentication && !req.session.authenticated) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // If email is being updated and password is provided, validate it
    if (email && password) {
      const result = await UserService.updateUser(currentUser.id, { name, email, password });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } else {
      // Update only name
      const result = await UserService.updateUser(currentUser.id, { name });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

export default router;
