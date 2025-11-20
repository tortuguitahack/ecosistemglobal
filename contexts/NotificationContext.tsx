
import React, { createContext, useState, useCallback } from 'react';
import { Notification } from '../types';

interface NotificationContextProps {
  notifications: Notification[];
  showNotification: (message: string, type: Notification['type']) => void;
  removeNotification: (id: number) => void;
}

export const NotificationContext = createContext<NotificationContextProps>({} as NotificationContextProps);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  const showNotification = useCallback((message: string, type: Notification['type']) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
