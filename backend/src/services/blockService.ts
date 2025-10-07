import pool from '../config/database';
import { Block, BlockCreateInput, BlockStatus, BlockType, Priority, RecurrenceType, CompletionBasis } from '../../../shared/types/types';

export class BlockService {
  // Create a new block
  static async createBlock(blockData: BlockCreateInput, userId: number): Promise<Block> {
    const {
      title,
      type,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      tags = [],
      categories = [],
      priority = 'none',
      recurrence = 'one-time',
      completionBasis
    } = blockData;

    const query = `
      INSERT INTO blocks (
        title, type, description, start_date, end_date, start_time, end_time,
        tags, categories, priority, recurrence, completion_basis_unit,
        completion_basis_goal, completion_basis_goal_unit, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      title,
      type,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      tags,
      categories,
      priority,
      recurrence,
      completionBasis?.unit || null,
      completionBasis?.goal || null,
      completionBasis?.goalUnit || null,
      userId
    ];

    const result = await pool.query(query, values);
    return this.mapDatabaseBlockToBlock(result.rows[0]);
  }

  // Get blocks for a user
  static async getBlocksByUserId(userId: number, limit = 50, offset = 0): Promise<Block[]> {
    const query = `
      SELECT * FROM blocks
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows.map(this.mapDatabaseBlockToBlock);
  }

  // Get a specific block by ID
  static async getBlockById(blockId: number, userId: number): Promise<Block | null> {
    const query = `
      SELECT * FROM blocks
      WHERE id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [blockId, userId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapDatabaseBlockToBlock(result.rows[0]);
  }

  // Get blocks by date range
  static async getBlocksByDateRange(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Block[]> {
    const query = `
      SELECT * FROM blocks
      WHERE user_id = $1
      AND (
        (start_date >= $2 AND start_date <= $3) OR
        (end_date >= $2 AND end_date <= $3) OR
        (start_date <= $2 AND end_date >= $3)
      )
      ORDER BY start_date ASC, start_time ASC
    `;

    const result = await pool.query(query, [userId, startDate, endDate]);
    return result.rows.map(this.mapDatabaseBlockToBlock);
  }

  // Update a block
  static async updateBlock(
    blockId: number,
    userId: number,
    updateData: Partial<BlockCreateInput & { status: BlockStatus }>
  ): Promise<Block | null> {
    const allowedFields = [
      'title', 'type', 'description', 'start_date', 'end_date',
      'start_time', 'end_time', 'status', 'tags', 'categories',
      'priority', 'recurrence'
    ];

    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      const dbField = this.camelToSnake(key);
      if (allowedFields.includes(dbField)) {
        setClause.push(`${dbField} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Handle completion basis separately if provided
    if (updateData.completionBasis) {
      setClause.push(`completion_basis_unit = $${paramCount}`);
      values.push(updateData.completionBasis.unit);
      paramCount++;

      setClause.push(`completion_basis_goal = $${paramCount}`);
      values.push(updateData.completionBasis.goal || null);
      paramCount++;

      setClause.push(`completion_basis_goal_unit = $${paramCount}`);
      values.push(updateData.completionBasis.goalUnit || null);
      paramCount++;
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE blocks
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    values.push(blockId, userId);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapDatabaseBlockToBlock(result.rows[0]);
  }

  // Delete a block
  static async deleteBlock(blockId: number, userId: number): Promise<boolean> {
    const query = `
      DELETE FROM blocks
      WHERE id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [blockId, userId]);
    return (result.rowCount || 0) > 0;
  }

  // Helper method to convert database row to Block interface
  private static mapDatabaseBlockToBlock(row: any): Block {
    const completionBasis: CompletionBasis | undefined = row.completion_basis_unit ? {
      unit: row.completion_basis_unit,
      goal: row.completion_basis_goal,
      goalUnit: row.completion_basis_goal_unit
    } : undefined;

    return {
      id: row.id,
      title: row.title,
      type: row.type as BlockType,
      description: row.description,
      startDate: row.start_date ? new Date(row.start_date) : undefined,
      endDate: row.end_date ? new Date(row.end_date) : undefined,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status as BlockStatus,
      tags: row.tags || [],
      categories: row.categories || [],
      priority: row.priority as Priority,
      recurrence: row.recurrence as RecurrenceType,
      completionBasis,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  // Helper method to convert camelCase to snake_case
  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}