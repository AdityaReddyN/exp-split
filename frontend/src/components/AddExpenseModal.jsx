import { useState } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import toast from '../utils/toast';
import './CreateGroupModal.css';
import './AddExpenseModal.css';

export default function AddExpenseModal({ onClose, onAdd, members }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: '',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
    splitType: 'equal'
  });

  const [scanning, setScanning] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [customSplits, setCustomSplits] = useState({});
  const [percentageSplits, setPercentageSplits] = useState({});

  const categories = ['Food', 'Travel', 'Accommodation', 'Entertainment', 'Utilities', 'Other'];

  const handleScanReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    toast.info('Scanning receipt, please wait...');

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');

      // Simple logic to find amount (looking for things like "Total: 123.45" or just numbers)
      const lines = text.split('\n');
      let foundAmount = null;
      let foundDescription = '';

      // Try to find the largest number which is often the total
      const amountRegex = /(\d+\.\d{2})/g;
      const allMatches = text.match(amountRegex);
      if (allMatches) {
        const numbers = allMatches.map(m => parseFloat(m));
        foundAmount = Math.max(...numbers).toString();
      }

      // Try to find a description from common keywords
      const commonKeywords = ['lunch', 'dinner', 'coffee', 'grocery', 'uber', 'taxi', 'fuel', 'petrol', 'hotel', 'flight'];
      const words = text.toLowerCase().split(/\s+/);
      const keywordMatch = words.find(w => commonKeywords.includes(w));
      if (keywordMatch) {
        foundDescription = keywordMatch.charAt(0).toUpperCase() + keywordMatch.slice(1);
      } else if (lines.length > 0) {
        // Fallback to the first line as description
        foundDescription = lines[0].trim().substring(0, 30);
      }

      setFormData(prev => ({
        ...prev,
        amount: foundAmount || prev.amount,
        description: foundDescription || prev.description
      }));

      toast.success('Receipt scanned successfully!');
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Failed to scan receipt. Please enter details manually.');
    } finally {
      setScanning(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleMember = (memberId) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
      const newCustom = { ...customSplits };
      delete newCustom[memberId];
      setCustomSplits(newCustom);
      const newPercentage = { ...percentageSplits };
      delete newPercentage[memberId];
      setPercentageSplits(newPercentage);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const validateSplits = () => {
    const amount = parseFloat(formData.amount);
    let total = 0;

    if (formData.splitType === 'equal') {
      total = (amount / selectedMembers.size) * selectedMembers.size;
    } else if (formData.splitType === 'custom') {
      for (const memberId of selectedMembers) {
        total += parseFloat(customSplits[memberId] || 0);
      }
    } else if (formData.splitType === 'percentage') {
      for (const memberId of selectedMembers) {
        const pct = parseFloat(percentageSplits[memberId] || 0);
        total += (amount * pct) / 100;
      }
    }

    return Math.abs(total - amount) < 0.01;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      alert('Description is required');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      alert('Valid amount is required');
      return;
    }

    if (!formData.paidBy) {
      alert('Please select who paid');
      return;
    }

    if (selectedMembers.size === 0) {
      alert('Select at least one member to split between');
      return;
    }

    if (!validateSplits()) {
      alert('Split amounts must equal total amount');
      return;
    }

    // Build splits array
    const splits = [];
    if (formData.splitType === 'equal') {
      const perPerson = amount / selectedMembers.size;
      for (const memberId of selectedMembers) {
        splits.push({ userId: memberId, amount: parseFloat(perPerson.toFixed(2)) });
      }
    } else if (formData.splitType === 'custom') {
      for (const memberId of selectedMembers) {
        splits.push({ userId: memberId, amount: parseFloat(customSplits[memberId] || 0) });
      }
    } else if (formData.splitType === 'percentage') {
      for (const memberId of selectedMembers) {
        const pct = parseFloat(percentageSplits[memberId] || 0);
        const splitAmount = (amount * pct) / 100;
        splits.push({ userId: memberId, amount: parseFloat(splitAmount.toFixed(2)) });
      }
    }

    onAdd({
      description: formData.description,
      amount: parseFloat(formData.amount),
      paidBy: parseInt(formData.paidBy),
      category: formData.category,
      date: formData.date,
      splits
    });
  };

  const amount = parseFloat(formData.amount) || 0;

  return (
    <div className="modal-overlay" style={{ overflowY: 'auto' }}>
      <div className="modal-content" style={{ margin: '2rem 0' }}>
        <div className="modal-header">
          <h2 className="modal-title">Add Expense</h2>
          <button onClick={onClose} className="modal-close-button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="expense-modal-form">
          <div className="modal-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="modal-label" style={{ marginBottom: 0 }}>Description *</label>
              <label className="scan-button" style={{
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: scanning ? 'not-allowed' : 'pointer',
                color: '#93A87E',
                fontWeight: '600',
                padding: '0.4rem 0.8rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(147, 168, 126, 0.1)',
                transition: 'all 0.2s ease'
              }}>
                {scanning ? <Loader2 size={14} className="spin" /> : <Camera size={14} />}
                {scanning ? 'Scanning...' : 'Scan Receipt'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScanReceipt}
                  style={{ display: 'none' }}
                  disabled={scanning}
                />
              </label>
            </div>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Lunch"
              className="modal-input"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-label">Amount *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="modal-input"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-label">Paid By *</label>
            <select
              name="paidBy"
              value={formData.paidBy}
              onChange={handleChange}
              className="modal-select"
            >
              <option value="">Select person</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="modal-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-label">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="modal-input"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-label">Split Type</label>
            <div className="modal-radio-group">
              {['equal', 'custom', 'percentage'].map(type => (
                <label key={type} className="modal-radio-label">
                  <input
                    type="radio"
                    name="splitType"
                    value={type}
                    checked={formData.splitType === type}
                    onChange={handleChange}
                    className="modal-radio-input"
                  />
                  <span className="modal-radio-text" style={{ textTransform: 'capitalize' }}>{type} Split</span>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-label">Split Between</label>
            <div className="expense-modal-checkbox-group">
              {members.map(member => (
                <div key={member.id} className="expense-modal-member-item">
                  <label className="expense-modal-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedMembers.has(member.id)}
                      onChange={() => toggleMember(member.id)}
                      className="expense-modal-checkbox"
                    />
                    <span className="expense-modal-member-name">{member.name}</span>
                  </label>

                  {selectedMembers.has(member.id) && formData.splitType === 'custom' && (
                    <input
                      type="number"
                      placeholder="Amount"
                      step="0.01"
                      value={customSplits[member.id] || ''}
                      onChange={(e) => setCustomSplits({
                        ...customSplits,
                        [member.id]: e.target.value
                      })}
                      className="expense-modal-split-input"
                    />
                  )}

                  {selectedMembers.has(member.id) && formData.splitType === 'percentage' && (
                    <input
                      type="number"
                      placeholder="%"
                      max="100"
                      value={percentageSplits[member.id] || ''}
                      onChange={(e) => setPercentageSplits({
                        ...percentageSplits,
                        [member.id]: e.target.value
                      })}
                      className="expense-modal-split-input"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="modal-button modal-button--cancel">
              Cancel
            </button>
            <button type="submit" className="modal-button modal-button--submit">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}