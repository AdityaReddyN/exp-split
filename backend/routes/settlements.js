import express from 'express';
import { query } from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { calculateOptimalSettlements, calculateBalances } from '../utils/settlementAlgorithm.js';

const router = express.Router();

router.get('/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const expensesResult = await query(
      `SELECT 
        e.id, e.amount, e.paid_by,
        json_agg(json_build_object('userId', es.user_id, 'amount', es.amount)) as splits
       FROM expenses e
       LEFT JOIN expense_splits es ON e.id = es.expense_id
       WHERE e.group_id = $1
       GROUP BY e.id, e.amount, e.paid_by`,
      [groupId]
    );

    const expenses = expensesResult.rows.map(row => ({
      ...row,
      amount: parseFloat(row.amount),
      splits: row.splits
        .filter(s => s.userId !== null)
        .map(s => ({
          userId: s.userId,
          amount: parseFloat(s.amount)
        }))
    }));

    const balances = {};
    for (const expense of expenses) {
      if (!balances[expense.paid_by]) {
        balances[expense.paid_by] = 0;
      }
      balances[expense.paid_by] += parseFloat(expense.amount);

      for (const split of expense.splits) {
        if (!balances[split.userId]) {
          balances[split.userId] = 0;
        }
        balances[split.userId] -= parseFloat(split.amount);
      }
    }

    // Fetch completed settlements
    const completedSettlementsResult = await query(
      `SELECT from_user, to_user, amount 
       FROM settlements 
       WHERE group_id = $1 AND status = 'completed'`,
      [groupId]
    );

    // Subtract completed settlements from balances
    for (const settlement of completedSettlementsResult.rows) {
      const from = settlement.from_user;
      const to = settlement.to_user;
      const amount = parseFloat(settlement.amount);

      if (!balances[from]) balances[from] = 0;
      if (!balances[to]) balances[to] = 0;

      // When 'from' pays 'to', 'from''s balance increases (less debt)
      // and 'to''s balance decreases (less receivable)
      balances[from] += amount;
      balances[to] -= amount;
    }

    const cleanedBalances = {};
    for (const userId in balances) {
      const b = parseFloat(balances[userId].toFixed(2));
      if (Math.abs(b) > 0.01) { // Filter out dust balances
        cleanedBalances[userId] = b;
      }
    }

    const settlements = calculateOptimalSettlements(cleanedBalances);

    const membersResult = await query(
      `SELECT u.id, u.name FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = $1`,
      [groupId]
    );

    const memberMap = {};
    membersResult.rows.forEach(member => {
      memberMap[member.id] = member.name;
    });

    const enhancedSettlements = settlements.map(s => ({
      ...s,
      fromName: memberMap[s.from],
      toName: memberMap[s.to]
    }));

    const balanceArray = Object.entries(balances).map(([userId, balance]) => ({
      userId: parseInt(userId),
      name: memberMap[parseInt(userId)],
      balance: parseFloat(balance.toFixed(2))
    }));

    res.json({
      success: true,
      data: {
        balances: balanceArray,
        settlements: enhancedSettlements,
        transactionCount: enhancedSettlements.length,
        totalAmount: enhancedSettlements.reduce((sum, s) => sum + s.amount, 0)
      }
    });
  } catch (error) {
    console.error('Get settlements error:', error);
    res.status(500).json({
      success: false,
      error: 'Error calculating settlements'
    });
  }
});

router.post('/mark-paid', authMiddleware, async (req, res) => {
  try {
    const { groupId, fromUserId, toUserId, amount, paymentMethod } = req.body;
    const userId = req.user.userId;

    if (userId !== fromUserId && userId !== toUserId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to mark this settlement'
      });
    }

    const result = await query(
      `INSERT INTO settlements (group_id, from_user, to_user, amount, status, payment_method, settled_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, created_at`,
      [groupId, fromUserId, toUserId, amount, 'completed', paymentMethod || 'manual']
    );

    res.status(201).json({
      success: true,
      data: {
        settlementId: result.rows[0].id,
        status: 'completed',
        message: 'Settlement marked as paid'
      }
    });
  } catch (error) {
    console.error('Mark paid error:', error);
    res.status(500).json({
      success: false,
      error: 'Error marking settlement'
    });
  }
});

router.get('/history/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;

    const result = await query(
      `SELECT 
        s.id, s.from_user, s.to_user, s.amount, s.status, s.payment_method, s.settled_at, s.created_at,
        u1.name as from_name, u2.name as to_name
       FROM settlements s
       JOIN users u1 ON s.from_user = u1.id
       JOIN users u2 ON s.to_user = u2.id
       WHERE s.group_id = $1
       ORDER BY s.created_at DESC`,
      [groupId]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        amount: parseFloat(row.amount)
      }))
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching settlement history'
    });
  }
});

export default router;