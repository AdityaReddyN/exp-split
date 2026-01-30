import { useState } from 'react';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 my-8 border border-white/20 animate-slide-in-right">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Expense</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Lunch"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Paid By *</label>
            <select
              name="paidBy"
              value={formData.paidBy}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="">Select person</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Split Type</label>
            <div className="space-y-2 bg-gray-50 p-4 rounded-xl">
              {['equal', 'custom', 'percentage'].map(type => (
                <label key={type} className="flex items-center cursor-pointer hover:bg-white p-2 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name="splitType"
                    value={type}
                    checked={formData.splitType === type}
                    onChange={handleChange}
                    className="mr-3 w-4 h-4 text-indigo-600"
                  />
                  <span className="text-gray-700 font-medium capitalize">{type} Split</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Split Between</label>
            <div className="space-y-3 max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-xl">
              {members.map(member => (
                <div key={member.id} className="bg-white p-3 rounded-lg border-2 border-gray-200">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMembers.has(member.id)}
                      onChange={() => toggleMember(member.id)}
                      className="mr-3 w-4 h-4 text-indigo-600"
                    />
                    <span className="text-gray-700 font-medium">{member.name}</span>
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
                      className="ml-7 mt-2 w-32 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                      className="ml-7 mt-2 w-32 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}