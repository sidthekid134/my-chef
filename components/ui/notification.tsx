import React from 'react';
import { cn } from '../../lib/utils';
import { useNotificationStore, Notification as NotificationType } from '../../store/notificationStore';

export function Notifications() {
  const { notifications, removeNotification } = useNotificationStore();
  
  if (notifications.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
          onClose={() => removeNotification(notification.id)} 
        />
      ))}
    </div>
  );
}

interface NotificationItemProps {
  notification: NotificationType;
  onClose: () => void;
}

function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { type, message } = notification;
  
  const bgColor = React.useMemo(() => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-500 text-blue-800';
    }
  }, [type]);
  
  return (
    <div 
      className={cn(
        'p-4 rounded-md shadow-lg border-l-4 flex justify-between items-center',
        bgColor
      )}
    >
      <p className="text-sm">{message}</p>
      <button 
        onClick={onClose} 
        className="ml-4 text-gray-500 hover:text-gray-700"
        aria-label="Close notification"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>
    </div>
  );
}