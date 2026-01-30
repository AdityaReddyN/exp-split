import express from 'express';
import Stripe from 'stripe';
import { query } from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent', authMiddleware, async (req, res) => {
  try {
    const { amount, toUserId, groupId } = req.body;
    let { settlementId } = req.body;

    if (!amount || !toUserId || !groupId) {
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

    const userId = req.user.userId;

    // If no settlementId exists, create a pending settlement record
    if (!settlementId) {
      const settlementResult = await query(
        `INSERT INTO settlements (group_id, from_user, to_user, amount, status, payment_method)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [groupId, userId, toUserId, parsedAmount, 'pending', 'stripe']
      );
      settlementId = settlementResult.rows[0].id;
    }

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parsedAmount * 100), // Stripe uses smallest currency unit (paise for INR)
      currency: 'inr',
      metadata: {
        settlementId: settlementId.toString(),
        fromUserId: userId.toString(),
        toUserId: toUserId.toString(),
        groupId: groupId.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update the settlement with the payment intent ID
    await query(
      `UPDATE settlements SET payment_id = $1 WHERE id = $2`,
      [paymentIntent.id, settlementId]
    );

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        settlementId,
        amount: parsedAmount,
        currency: 'INR'
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating payment intent'
    });
  }
});

router.post('/confirm-payment', authMiddleware, async (req, res) => {
  try {
    const { paymentIntentId, settlementId } = req.body;

    if (!paymentIntentId || !settlementId) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment details'
      });
    }

    // Retrieve the payment intent from Stripe to verify its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed'
      });
    }

    // Update settlement status in database
    const result = await query(
      `UPDATE settlements 
       SET status = 'completed', payment_method = 'stripe', settled_at = NOW()
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
        message: 'Payment confirmed successfully'
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Error confirming payment'
    });
  }
});

export default router;