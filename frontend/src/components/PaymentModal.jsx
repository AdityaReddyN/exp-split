import { useState } from 'react';
import { X, CreditCard, Smartphone } from 'lucide-react';
import QRCode from 'qrcode.react';
import apiClient from '../utils/api';
import toast from '../utils/toast';

export default function PaymentModal({ settlement, onClose, onPaid }) {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      // Create order
      const orderResponse = await apiClient.post('/payments/create-order', {
        amount: settlement.amount,
        settlementId: settlement.id,
        toUserId: settlement.to
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_xxxxx',
        amount: settlement.amount * 100,
        currency: 'INR',
        order_id: orderResponse.data.data.orderId,
        name: 'Expense Split',
        description: `Payment to ${settlement.toName}`,
        handler: async (response) => {
          try {
            // Verify payment
            await apiClient.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              settlementId: settlement.id
            });

            toast.success('Payment successful!');
            onPaid();
            onClose();
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          contact: '',
          email: ''
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Failed to initialize payment');
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-white/20 animate-slide-in-right">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 mb-6 border-2 border-indigo-200">
          <p className="text-gray-600 text-sm font-semibold mb-4">Payment Details</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">From:</span>
              <span className="font-bold text-gray-900">{settlement.fromName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">To:</span>
              <span className="font-bold text-gray-900">{settlement.toName}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-indigo-200">
              <span className="font-bold text-gray-900 text-lg">Amount:</span>
              <span className="font-bold text-indigo-600 text-2xl">₹{settlement.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => {
              setPaymentMethod('razorpay');
              handleRazorpayPayment();
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            <CreditCard size={20} />
            Pay with Razorpay
          </button>

          <button
            onClick={() => setShowQR(!showQR)}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Smartphone size={20} />
            {showQR ? 'Hide UPI QR' : 'UPI QR Code'}
          </button>

          {showQR && (
            <div className="flex justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200 animate-fade-in">
              <QRCode
                value={`upi://pay?pa=your_upi_id@bank&pn=${settlement.toName}&am=${settlement.amount}`}
                size={200}
              />
            </div>
          )}

          <button
            onClick={handleMarkPaid}
            disabled={loading}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            Mark as Paid (Cash)
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}