// Simple toast notification system
let toastId = 0;
const toasts = new Map();
const subscribers = new Set();

export const toast = {
  notify: (message, type = 'info') => {
    const id = toastId++;
    toasts.set(id, { message, type, id });
    subscribers.forEach(callback => callback(Array.from(toasts.values())));

    setTimeout(() => {
      toasts.delete(id);
      subscribers.forEach(callback => callback(Array.from(toasts.values())));
    }, 4000);

    return id;
  },

  success: (message) => toast.notify(message, 'success'),
  error: (message) => toast.notify(message, 'error'),
  info: (message) => toast.notify(message, 'info'),

  subscribe: (callback) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }
};

export default toast;