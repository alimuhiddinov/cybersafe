import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { dismissNotification, Notification, UIState } from '../../store/slices/uiSlice';

const NotificationCenter: React.FC = () => {
  const dispatch = useDispatch();
  // Using type assertion to help TypeScript understand the state structure
  const notifications = useSelector((state: RootState) => (state as any).ui.notifications.notifications as Notification[]);
  
  // Active notifications are those that haven't been dismissed
  const activeNotifications = notifications.filter((n: Notification) => !n.dismissed);
  
  // Automatically dismiss notifications after 5 seconds
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    activeNotifications.forEach((notification: Notification) => {
      const timeout = setTimeout(() => {
        dispatch(dismissNotification(notification.id));
      }, 5000);
      
      timeouts.push(timeout);
    });
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [activeNotifications, dispatch]);
  
  if (activeNotifications.length === 0) {
    return null;
  }
  
  return (
    <div className="notification-center" aria-live="polite">
      {activeNotifications.map((notification: Notification) => (
        <div 
          key={notification.id}
          className={`notification notification-${notification.type}`}
          role="alert"
        >
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              )}
              {notification.type === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              )}
              {notification.type === 'warning' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              )}
              {notification.type === 'info' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              )}
            </div>
            <p className="notification-message">{notification.message}</p>
          </div>
          <button 
            className="notification-close" 
            onClick={() => dispatch(dismissNotification(notification.id))}
            aria-label="Close notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
