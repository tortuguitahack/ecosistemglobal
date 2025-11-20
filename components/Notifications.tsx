
import React, { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationToast: React.FC<{ notification: { id: number; message: string; type: 'success' | 'error' | 'info' }; onDismiss: (id: number) => void; }> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  const baseClasses = "flex items-center w-full max-w-xs p-4 my-2 text-gray-200 bg-gray-800 rounded-lg shadow-lg border";
  const typeClasses = {
    success: 'border-green-600',
    error: 'border-red-600',
    info: 'border-blue-600',
  };
  const iconClasses = {
      success: 'fas fa-check-circle text-green-400',
      error: 'fas fa-exclamation-circle text-red-400',
      info: 'fas fa-info-circle text-blue-400',
  }

  return (
    <div className={`${baseClasses} ${typeClasses[notification.type]}`} role="alert">
        <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg`}>
             <i className={iconClasses[notification.type]}></i>
        </div>
        <div className="ml-3 text-sm font-normal">{notification.message}</div>
        <button type="button" className="ml-auto -mx-1.5 -my-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-700 inline-flex h-8 w-8" onClick={() => onDismiss(notification.id)}>
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
    </div>
  );
};

const Notifications: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-5 right-5 z-50">
      {notifications.map(notification => (
        <NotificationToast key={notification.id} notification={notification} onDismiss={removeNotification} />
      ))}
    </div>
  );
};

export default Notifications;
