import { useState } from 'react';
import { X } from 'lucide-react';
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

  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [customSplits, setCustomSplits] = useState({});
  const [percentageSplits, setPercentageSplits] = useState({});

  const categories = ['Food', 'Travel', 'Accommodation', 'Entertainment', 'Utilities', 'Other'];

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
            <label className="modal-label">Description *</label>
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