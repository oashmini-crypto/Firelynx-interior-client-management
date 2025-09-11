import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

// Sample notifications for demonstration - moved outside component to prevent recreation on every render
const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    type: 'variation',
    title: 'New Variation Request',
    message: 'Kitchen cabinet modification requires approval',
    timestamp: '2 minutes ago',
    isRead: false,
    priority: 'high'
  },
  {
    id: 2,
    type: 'ticket',
    title: 'Support Ticket Updated',
    message: 'Lighting fixture issue has been resolved',
    timestamp: '15 minutes ago',
    isRead: false,
    priority: 'medium'
  },
  {
    id: 3,
    type: 'system',
    title: 'Project Milestone',
    message: 'Living room design phase completed',
    timestamp: '1 hour ago',
    isRead: true,
    priority: 'low'
  },
  {
    id: 4,
    type: 'variation',
    title: 'Variation Approved',
    message: 'Bathroom tile selection has been approved',
    timestamp: '2 hours ago',
    isRead: true,
    priority: 'medium'
  }
];

const NotificationCenter = ({ notifications = [], onMarkAsRead, onMarkAllAsRead, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Use useMemo to prevent unnecessary recalculations and ensure stable reference
  const allNotifications = useMemo(() => {
    return notifications?.length > 0 ? notifications : DEFAULT_NOTIFICATIONS;
  }, [notifications]);

  useEffect(() => {
    const count = allNotifications?.filter(notification => !notification?.isRead)?.length || 0;
    setUnreadCount(count);
  }, [allNotifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'variation':
        return 'FileEdit';
      case 'ticket':
        return 'MessageSquare';
      case 'system':
        return 'Bell';
      default:
        return 'Info';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-text-secondary';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification?.isRead && onMarkAsRead) {
      onMarkAsRead(notification?.id);
    }
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Icon name="Bell" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
      {/* Notification Dropdown */}
      {isOpen && (
        <>
          <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-modal z-110 animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-popover-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {allNotifications?.length === 0 ? (
                <div className="p-8 text-center">
                  <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {allNotifications?.map((notification) => (
                    <button
                      key={notification?.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`
                        w-full p-4 text-left hover:bg-muted transition-smooth
                        ${!notification?.isRead ? 'bg-accent/5' : ''}
                      `}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 mt-0.5 ${getPriorityColor(notification?.priority)}`}>
                          <Icon name={getNotificationIcon(notification?.type)} size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${!notification?.isRead ? 'text-popover-foreground' : 'text-text-secondary'}`}>
                              {notification?.title}
                            </p>
                            {!notification?.isRead && (
                              <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 ml-2"></div>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                            {notification?.message}
                          </p>
                          <p className="text-xs text-text-secondary mt-2">
                            {notification?.timestamp}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {allNotifications?.length > 0 && (
              <div className="p-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  fullWidth
                  className="text-xs"
                >
                  View All Notifications
                </Button>
              </div>
            )}
          </div>

          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-100" 
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default NotificationCenter;