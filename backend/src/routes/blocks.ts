import express from 'express';
import { BlockService } from '../services/blockService';
import { UserService } from '../services/userService';
import { BlockCreateInput, ApiResponse, Block } from '../../../shared/types/types';

const router: express.Router = express.Router();

// Middleware to check if user exists and handle authentication
const requireUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // Get the first user (single-user system)
    const user = await UserService.getFirstUser();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No user found - please complete setup first'
      } as ApiResponse);
    }

    // If user has authentication enabled, check session
    if (user.hasAuthentication) {
      if (!req.session?.userId || !req.session.authenticated) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
      }
    } else {
      // User doesn't have authentication enabled, create/update session
      req.session.userId = user.id;
      req.session.authenticated = true;
    }

    next();
  } catch (error) {
    console.error('Error in requireUser middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication check failed'
    } as ApiResponse);
  }
};

// GET /api/blocks - Get blocks for the current user
router.get('/', requireUser, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.session.userId!;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const blocks = await BlockService.getBlocksByUserId(userId, limit, offset);

    res.json({
      success: true,
      data: blocks
    } as ApiResponse<Block[]>);
  } catch (error: any) {
    console.error('Error fetching blocks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blocks',
      error: error.message
    } as ApiResponse);
  }
});

// GET /api/blocks/:id - Get a specific block
router.get('/:id', requireUser, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.session.userId!;
    const blockId = parseInt(req.params.id);

    if (isNaN(blockId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid block ID'
      } as ApiResponse);
    }

    const block = await BlockService.getBlockById(blockId, userId);

    if (!block) {
      return res.status(404).json({
        success: false,
        message: 'Block not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: block
    } as ApiResponse<Block>);
  } catch (error: any) {
    console.error('Error fetching block:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch block',
      error: error.message
    } as ApiResponse);
  }
});

// POST /api/blocks - Create a new block
router.post('/', requireUser, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.session.userId!;
    const blockData: BlockCreateInput = req.body;

    // Basic validation
    if (!blockData.title?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Block title is required'
      } as ApiResponse);
    }

    if (!blockData.type) {
      return res.status(400).json({
        success: false,
        message: 'Block type is required'
      } as ApiResponse);
    }

    // Validate block type
    const validTypes = ['task', 'habit', 'event', 'appointment'];
    if (!validTypes.includes(blockData.type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid block type'
      } as ApiResponse);
    }

    // Validate priority if provided
    if (blockData.priority) {
      const validPriorities = ['high', 'medium', 'low', 'none'];
      if (!validPriorities.includes(blockData.priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority'
        } as ApiResponse);
      }
    }

    // Validate recurrence if provided
    if (blockData.recurrence) {
      const validRecurrences = ['one-time', 'daily', 'weekly', 'monthly', 'yearly', 'occasional', 'frequent'];
      if (!validRecurrences.includes(blockData.recurrence)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid recurrence type'
        } as ApiResponse);
      }
    }

    const block = await BlockService.createBlock(blockData, userId);

    res.status(201).json({
      success: true,
      data: block,
      message: 'Block created successfully'
    } as ApiResponse<Block>);
  } catch (error: any) {
    console.error('Error creating block:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create block',
      error: error.message
    } as ApiResponse);
  }
});

// PUT /api/blocks/:id - Update a block
router.put('/:id', requireUser, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.session.userId!;
    const blockId = parseInt(req.params.id);
    const updateData = req.body;

    if (isNaN(blockId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid block ID'
      } as ApiResponse);
    }

    // Validate data if provided
    if (updateData.type) {
      const validTypes = ['task', 'habit', 'event', 'appointment'];
      if (!validTypes.includes(updateData.type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid block type'
        } as ApiResponse);
      }
    }

    if (updateData.priority) {
      const validPriorities = ['high', 'medium', 'low', 'none'];
      if (!validPriorities.includes(updateData.priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority'
        } as ApiResponse);
      }
    }

    if (updateData.status) {
      const validStatuses = ['completed', 'skipped', 'postponed', 'cancelled'];
      if (!validStatuses.includes(updateData.status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        } as ApiResponse);
      }
    }

    const updatedBlock = await BlockService.updateBlock(blockId, userId, updateData);

    if (!updatedBlock) {
      return res.status(404).json({
        success: false,
        message: 'Block not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: updatedBlock,
      message: 'Block updated successfully'
    } as ApiResponse<Block>);
  } catch (error: any) {
    console.error('Error updating block:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update block',
      error: error.message
    } as ApiResponse);
  }
});

// DELETE /api/blocks/:id - Delete a block
router.delete('/:id', requireUser, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.session.userId!;
    const blockId = parseInt(req.params.id);

    if (isNaN(blockId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid block ID'
      } as ApiResponse);
    }

    const deleted = await BlockService.deleteBlock(blockId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Block not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Block deleted successfully'
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error deleting block:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete block',
      error: error.message
    } as ApiResponse);
  }
});

export default router;
