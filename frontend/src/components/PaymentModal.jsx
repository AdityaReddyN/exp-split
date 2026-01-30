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
      // Create checkout session
      const response = await apiClient.post('/payments/create-checkout-session', {
        amount: settlement.amount,
        toUserId: settlement.to,
        groupId: settlement.groupId,
        settlementId: settlement.id
      });

      const { url } = response.data.data;

      if (url) {
        // Redirect to Stripe Hosted Checkout
        window.location.href = url;
      } else {
        throw new Error('Failed to get checkout URL');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.error || 'Failed to redirect to Stripe');
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