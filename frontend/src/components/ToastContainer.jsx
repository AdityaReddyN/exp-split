import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import toast from '../utils/toast';

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

  const getColors = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50/95 border-green-300 text-green-900';
      case 'error':
        return 'bg-red-50/95 border-red-300 text-red-900';
      default:
        return 'bg-blue-50/95 border-blue-300 text-blue-900';
    }
  };

  return (
    <div className="fixed top-4 right-4 space-y-3 z-50 max-w-md">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 ${getColors(t.type)} shadow-2xl animate-slide-in-right backdrop-blur-sm`}
        >
          <div className="flex-shrink-0">
            {getIcon(t.type)}
          </div>
          <span className="flex-1 font-medium">{t.message}</span>
          <button
            onClick={() => {}}
            className="text-current opacity-60 hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}