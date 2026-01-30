import { useState } from 'react';
import { X } from 'lucide-react';
import './CreateGroupModal.css';
import './JoinGroupModal.css';

export default function JoinGroupModal({ onClose, onJoin }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      alert('Please enter a group code');
      return;
    }
    
    setLoading(true);
    try {
      await onJoin(code);
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Join Group</h2>
          <button onClick={onClose} className="modal-close-button">
            <X size={24} />
          </button>
        </div>

        <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>Enter the group code to join an existing group</p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-group">
            <label className="modal-label">Group Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              maxLength="6"
              className="join-modal-input"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="join-modal-button join-modal-button--cancel">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="join-modal-button join-modal-button--submit"
            >
              {loading ? 'Joining...' : 'Join'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}