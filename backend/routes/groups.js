import express from 'express';
import { query } from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Generate unique 6-character group code
 */
const generateGroupCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * POST /
 * Create a new group
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, category, type } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Group name is required'
      });
    }

    // Generate unique code
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateGroupCode();
      const existing = await query('SELECT id FROM groups WHERE code = $1', [code]);
      isUnique = existing.rows.length === 0;
    }

    // Create group
    const groupResult = await query(
      'INSERT INTO groups (name, description, code, category, type, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, code, category, type',
      [name, description || null, code, category || 'other', type || 'private', userId]
    );

    const group = groupResult.rows[0];

    // Add creator as admin member
    await query(
      'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)',
      [group.id, userId, 'admin']
    );

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating group'
    });
  }
});

/**
 * GET /my-groups
 * Get all groups user belongs to with stats
 */
router.get('/my-groups', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT 
        g.id, g.name, g.description, g.code, g.category, g.type, g.created_at,
        COUNT(DISTINCT gm.user_id) as member_count,
        COALESCE(SUM(e.amount), 0) as total_expenses
      FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN expenses e ON g.id = e.group_id
      WHERE g.id IN (SELECT group_id FROM group_members WHERE user_id = $1)
      GROUP BY g.id
      ORDER BY g.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        member_count: parseInt(row.member_count),
        total_expenses: parseFloat(row.total_expenses)
      }))
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching groups'
    });
  }
});

/**
 * GET /public
 * List public groups with optional search
 */
router.get('/public', async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `SELECT 
        g.id, g.name, g.description, g.code, g.category, g.type, g.created_at,
        COUNT(DISTINCT gm.user_id) as member_count,
        COALESCE(SUM(e.amount), 0) as total_expenses
      FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN expenses e ON g.id = e.group_id
      WHERE g.type = 'public'`;

    const params = [];

    if (search) {
      sql += ` AND (g.name ILIKE $1 OR g.description ILIKE $1)`;
      params.push(`%${search}%`);
    }

    sql += ` GROUP BY g.id ORDER BY g.created_at DESC LIMIT 50`;

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        member_count: parseInt(row.member_count),
        total_expenses: parseFloat(row.total_expenses)
      }))
    });
  } catch (error) {
    console.error('Get public groups error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching public groups'
    });
  }
});

/**
 * POST /join
 * Join group by code
 */
router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.userId;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Group code is required'
      });
    }

    // Find group by code
    const groupResult = await query('SELECT id FROM groups WHERE code = $1', [code.toUpperCase()]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invalid group code'
      });
    }

    const groupId = groupResult.rows[0].id;

    // Check if already member
    const existingMember = await query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );

    if (existingMember.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Already a member of this group'
      });
    }

    // Add user to group
    await query(
      'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)',
      [groupId, userId, 'member']
    );

    res.json({
      success: true,
      data: { groupId, message: 'Successfully joined group' }
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({
      success: false,
      error: 'Error joining group'
    });
  }
});

/**
 * GET /:id
 * Get group details with members
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verify user is member
    const memberCheck = await query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Not a member of this group'
      });
    }

    // Get group details
    const groupResult = await query(
      'SELECT id, name, description, code, category, type, created_at FROM groups WHERE id = $1',
      [id]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    const group = groupResult.rows[0];

    // Get members
    const membersResult = await query(
      `SELECT u.id, u.name, u.email, u.avatar, gm.role, gm.joined_at
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = $1
       ORDER BY gm.joined_at ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...group,
        members: membersResult.rows
      }
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching group'
    });
  }
});

/**
 * GET /:id/members
 * Get all group members
 */
router.get('/:id/members', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT u.id, u.name, u.email, u.avatar, gm.role, gm.joined_at
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = $1
       ORDER BY gm.joined_at ASC`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching members'
    });
  }
});

export default router;