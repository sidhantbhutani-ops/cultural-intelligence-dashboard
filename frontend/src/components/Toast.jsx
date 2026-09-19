import { useState, useEffect } from 'react';

const toastStore = {
  listeners: [],
  toasts: [],
  subscribe(listener) {
    this.listeners.push(listener);
    return () => this.listeners = this.listeners.filter(l => l !== listener);
  },
  notify(type, message, duration = 3000) {
    const id = Date.now();
    this.toasts.push({ id, type, message });
    this.listeners.forEach(l => l());
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
      this.listeners.forEach(l => l());
    }, duration);
  }
};

export const Toast = {
  success: (msg) => toastStore.notify('success', msg),
  error: (msg) => toastStore.notify('error', msg, 5000),
  info: (msg) => toastStore.notify('info', msg),
  warning: (msg) => toastStore.notify('warning', msg, 5000),
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return toastStore.subscribe(() => setToasts([...toastStore.toasts]));
  }, []);

  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
  };

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map(toast => (
        <div key={toast.id} className={`${typeStyles[toast.type]} text-white px-4 py-3 rounded-md shadow-md animate-in fade-in slide-in-from-right`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
};
