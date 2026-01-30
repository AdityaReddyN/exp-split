import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import toast from '../utils/toast';
import './ToastContainer.css';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return toast.subscribe(setToasts);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getToastClass = (type) => {
    switch (type) {
      case 'success':
        return 'toast--success';
      case 'error':
        return 'toast--error';
      default:
        return 'toast--info';
    }
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${getToastClass(t.type)}`}>
          <div className="toast-icon">
            {getIcon(t.type)}
          </div>
          <span className="toast-message">{t.message}</span>
          <button onClick={() => {}} className="toast-close">
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}