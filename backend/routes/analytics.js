import express from 'express';
import { query } from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get analytics for a specific group
router.get('/:groupId', authMiddleware, async (req, res) => {
    try {
        const { groupId } = req.params;

        // 1. Expenses by Category
        const categoryResult = await query(
            `SELECT category, SUM(amount) as total
       FROM expenses
       WHERE group_id = $1
       GROUP BY category`,
            [groupId]
        );

        // 2. Expenses Trends (Daily for last 30 days)
        const trendsResult = await query(
            `SELECT date, SUM(amount) as total
       FROM expenses
       WHERE group_id = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY date
       ORDER BY date ASC`,
            [groupId]
        );

        // 3. Member Contribution (Total Paid by each)
        const memberResult = await query(
            `SELECT u.name, SUM(e.amount) as total
       FROM expenses e
       JOIN users u ON e.paid_by = u.id
       WHERE e.group_id = $1
       GROUP BY u.name`,
            [groupId]
        );

        // 4. Category count over time (Daily for last 30 days)
        const categoryTrendsResult = await query(
            `SELECT date, category, SUM(amount) as total
       FROM expenses
       WHERE group_id = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY date, category
       ORDER BY date ASC`,
            [groupId]
        );

        res.json({
            success: true,
            data: {
                byCategory: categoryResult.rows.map(r => ({ ...r, total: parseFloat(r.total) })),
                trends: trendsResult.rows.map(r => ({ ...r, total: parseFloat(r.total) })),
                memberContribution: memberResult.rows.map(r => ({ ...r, total: parseFloat(r.total) })),
                categoryTrends: categoryTrendsResult.rows.map(r => ({ ...r, total: parseFloat(r.total) }))
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching analytics data'
        });
    }
});

export default router;
