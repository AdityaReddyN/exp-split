import { useState } from 'react';
import { X, CreditCard, Smartphone } from 'lucide-react';
import QRCode from 'qrcode.react';
import apiClient from '../utils/api';
import toast from '../utils/toast';
import './CreateGroupModal.css';
import './PaymentModal.css';

export default function PaymentModal({ settlement, onClose, onPaid }) {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStripePayment = async () => {
    setLoading(true);
    try {
      // Create payment intent
      const response = await apiClient.post('/payments/create-payment-intent', {
        amount: settlement.amount,
        toUserId: settlement.to,
        groupId: settlement.groupId,
        settlementId: settlement.id // might be null if it's a proposal
      });

      const { clientSecret, paymentIntentId, settlementId } = response.data.data;

      // Initialize Stripe
      if (!window.Stripe) {
        toast.error('Stripe SDK not loaded. Please refresh.');
        setLoading(false);
        return;
      }

      const stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

      // Use Stripe's test card payment (tok_visa) for quick verification
      // With the actual keys provided, this will work in Test Mode
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            token: 'tok_visa'
          }
        }
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await apiClient.post('/payments/confirm-payment', {
          paymentIntentId: paymentIntentId,
          settlementId: settlementId
        });

        toast.success('Stripe payment successful!');
        onPaid();
        onClose();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.error || 'Failed to process Stripe payment');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    setLoading(true);
    try {
      await apiClient.post('/settlements/mark-paid', {
        groupId: settlement.groupId,
        fromUserId: settlement.from,
        toUserId: settlement.to,
        amount: settlement.amount,
        paymentMethod
      });

      toast.success('Marked as paid!');
      onPaid();
      onClose();
    } catch (error) {
      toast.error('Failed to mark payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Payment</h2>
          <button onClick={onClose} className="modal-close-button">
            <X size={24} />
          </button>
        </div>

        <div className="payment-modal-details">
          <p className="payment-modal-details-title">Payment Details</p>
          <div className="payment-modal-details-list">
            <div className="payment-modal-detail-row">
              <span className="payment-modal-detail-label">From:</span>
              <span className="payment-modal-detail-value">{settlement.fromName}</span>
            </div>
            <div className="payment-modal-detail-row">
              <span className="payment-modal-detail-label">To:</span>
              <span className="payment-modal-detail-value">{settlement.toName}</span>
            </div>
            <div className="payment-modal-detail-row payment-modal-detail-row--total">
              <span className="payment-modal-detail-label payment-modal-detail-label--total">Amount:</span>
              <span className="payment-modal-detail-value payment-modal-detail-value--total">₹{settlement.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="payment-modal-actions">
          <button
            onClick={() => {
              setPaymentMethod('stripe');
              handleStripePayment();
            }}
            disabled={loading}
            className="payment-modal-button payment-modal-button--razorpay"
          >
            <CreditCard size={20} />
            Pay with Stripe
          </button>

          <button
            onClick={() => setShowQR(!showQR)}
            className="payment-modal-button payment-modal-button--upi"
          >
            <Smartphone size={20} />
            {showQR ? 'Hide UPI QR' : 'UPI QR Code'}
          </button>

          {showQR && (
            <div className="payment-modal-qr-wrapper">
              <QRCode
                value={`upi://pay?pa=your_upi_id@bank&pn=${settlement.toName}&am=${settlement.amount}`}
                size={200}
              />
            </div>
          )}

          <button
            onClick={handleMarkPaid}
            disabled={loading}
            className="payment-modal-button payment-modal-button--cash"
          >
            Mark as Paid (Cash)
          </button>
        </div>

        <button onClick={onClose} className="payment-modal-button--close">
          Close
        </button>
      </div>
    </div>
  );
}