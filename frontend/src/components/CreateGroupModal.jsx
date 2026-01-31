import { useState } from 'react';
import { X } from 'lucide-react';
import './CreateGroupModal.css';

export default function CreateGroupModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other',
    type: 'private'
  });

  const categories = ['Trip', 'Home', 'Food', 'Utilities', 'Entertainment', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Group name is required');
      return;
    }
    onCreate({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      type: formData.type
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Create Flow</h2>
          <button onClick={onClose} className="modal-close-button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-group">
            <label className="modal-label">Flow Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Weekend Trip"
              className="modal-input"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about this group..."
              rows="3"
              className="modal-textarea"
            ></textarea>
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
                <option key={cat} value={cat.toLowerCase()}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-label">Flow Type</label>
            <div className="modal-radio-group">
              <label className="modal-radio-label">
                <input
                  type="radio"
                  name="type"
                  value="private"
                  checked={formData.type === 'private'}
                  onChange={handleChange}
                  className="modal-radio-input"
                />
                <span className="modal-radio-text">Private - Only invited members</span>
              </label>
              <label className="modal-radio-label">
                <input
                  type="radio"
                  name="type"
                  value="public"
                  checked={formData.type === 'public'}
                  onChange={handleChange}
                  className="modal-radio-input"
                />
                <span className="modal-radio-text">Public - Anyone can join</span>
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="modal-button modal-button--cancel">
              Cancel
            </button>
            <button type="submit" className="modal-button modal-button--submit">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}