import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { query } from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * POST /create-order
 * Create Razorpay order for payment
 */
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { amount, settlementId, toUserId } = req.body;

    if (!amount || !settlementId || !toUserId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    // Create Razorpay order (amount in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(parsedAmount * 100),
      currency: 'INR',
      receipt: `settlement_${settlementId}`,
      notes: {
        settlementId,
        toUserId
      }
    });

    // Store order in database
    await query(
      `UPDATE settlements SET payment_id = $1 WHERE id = $2`,
      [razorpayOrder.id, settlementId]
    );

    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: parsedAmount,
        currency: 'INR'
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating payment order'
    });
  }
});

/**
 * POST /verify
 * Verify Razorpay payment signature
 */
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, settlementId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment details'
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    // Update settlement status
    const result = await query(
      `UPDATE settlements 
       SET status = 'completed', payment_method = 'razorpay', settled_at = NOW()
       WHERE id = $1
       RETURNING id, amount, status`,
      [settlementId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Settlement not found'
      });
    }

    res.json({
      success: true,
      data: {
        settlementId: result.rows[0].id,
        amount: parseFloat(result.rows[0].amount),
        status: result.rows[0].status,
        message: 'Payment verified successfully'
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Error verifying payment'
    });
  }
});

export default router;