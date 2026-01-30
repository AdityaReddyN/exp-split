import express from 'express';
import { query, getClient } from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /
 * Add new expense with splits
 * Uses database transaction to ensure consistency
 */
router.post('/', authMiddleware, async (req, res) => {
  const client = await getClient();

  try {
    const { groupId, description, amount, paidBy, splits, category, date } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!groupId || !description || !amount || !paidBy || !splits || splits.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    // Validate splits sum to total
    const splitsSum = splits.reduce((sum, split) => sum + parseFloat(split.amount), 0);
    const tolerance = 0.01;
    if (Math.abs(splitsSum - parsedAmount) > tolerance) {
      return res.status(400).json({
        success: false,
        error: `Splits total (${splitsSum.toFixed(2)}) must equal amount (${parsedAmount.toFixed(2)})`
      });
    }

    // Start transaction
    await client.query('BEGIN');

    // Insert expense
    const expenseResult = await client.query(
      `INSERT INTO expenses (group_id, description, amount, paid_by, category, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, amount, paid_by, created_at`,
      [groupId, description, parsedAmount, paidBy, category || 'other', date || new Date().toISOString().split('T')[0]]
    );

    const expense = expenseResult.rows[0];

    // Insert splits
    for (const split of splits) {
      await client.query(
        `INSERT INTO expense_splits (expense_id, user_id, amount)
         VALUES ($1, $2, $3)`,
        [expense.id, split.userId, parseFloat(split.amount)]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        expenseId: expense.id,
        amount: parseFloat(expense.amount),
        paidBy: expense.paid_by,
        createdAt: expense.created_at
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add expense error:', error);
    res.status(500).json({
      success: false,
      error: 'Error adding expense'
    });
  } finally {
    client.release();
  }
});

/**
 * GET /group/:groupId
 * Get all expenses for a group with split details
 */
router.get('/group/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;

    const result = await query(
      `SELECT 
        e.id, e.description, e.amount, e.paid_by, e.category, e.date, e.created_at,
        u.name as paid_by_name, u.avatar,
        json_agg(json_build_object('userId', es.user_id, 'amount', es.amount)) as splits
       FROM expenses e
       JOIN users u ON e.paid_by = u.id
       LEFT JOIN expense_splits es ON e.id = es.expense_id
       WHERE e.group_id = $1
       GROUP BY e.id, u.name, u.avatar
       ORDER BY e.date DESC, e.created_at DESC`,
      [groupId]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        amount: parseFloat(row.amount),
        splits: row.splits.filter(s => s.userId !== null).map(s => ({
          ...s,
          amount: parseFloat(s.amount)
        }))
      }))
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching expenses'
    });
  }
});

/**
 * GET /balances/:groupId
 * Calculate net balance for each member in group
 */
router.get('/balances/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Get all expenses and splits for the group
    const result = await query(
      `SELECT 
        u.id, u.name,
        COALESCE(SUM(CASE WHEN e.paid_by = u.id THEN e.amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(es.amount), 0) as total_owed
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       LEFT JOIN expenses e ON e.group_id = gm.group_id
       LEFT JOIN expense_splits es ON es.expense_id = e.id AND es.user_id = u.id
       WHERE gm.group_id = $1
       GROUP BY u.id, u.name
       ORDER BY u.name`,
      [groupId]
    );

    const balances = result.rows.map(row => ({
      userId: row.id,
      name: row.name,
      totalPaid: parseFloat(row.total_paid),
      totalOwed: parseFloat(row.total_owed),
      balance: parseFloat(parseFloat(row.total_paid - row.total_owed).toFixed(2))
    }));

    const totalSpent = balances.reduce((sum, b) => sum + b.totalPaid, 0);

    res.json({
      success: true,
      data: {
        balances,
        totalSpent: parseFloat(totalSpent.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Get balances error:', error);
    res.status(500).json({
      success: false,
      error: 'Error calculating balances'
    });
  }
});

/**
 * DELETE /:id
 * Delete an expense (admin/creator only)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const client = await getClient();

  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Get expense details
    const expenseResult = await client.query(
      'SELECT id, group_id, paid_by FROM expenses WHERE id = $1',
      [id]
    );

    if (expenseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    const expense = expenseResult.rows[0];

    // Check if user is admin or creator
    const roleResult = await client.query(
      'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
      [expense.group_id, userId]
    );

    if (roleResult.rows.length === 0 || (roleResult.rows[0].role !== 'admin' && expense.paid_by !== userId)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this expense'
      });
    }

    // Delete in transaction
    await client.query('BEGIN');

    // Delete splits first
    await client.query('DELETE FROM expense_splits WHERE expense_id = $1', [id]);

    // Delete expense
    await client.query('DELETE FROM expenses WHERE id = $1', [id]);

    await client.query('COMMIT');

    res.json({
      success: true,
      data: { message: 'Expense deleted successfully' }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting expense'
    });
  } finally {
    client.release();
  }
});

export default router;