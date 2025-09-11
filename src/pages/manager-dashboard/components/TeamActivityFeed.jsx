import React from 'react';
import Icon from '../../../components/AppIcon';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const TeamActivityFeed = () => {
  // Fetch real activity logs
  const { data: activityData, isLoading } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const response = await axios.get('/api/activity-logs', {
        params: { limit: 10 }
      });
      return response.data.success ? response.data.data : [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Transform real activity data to UI format
  const activities = React.useMemo(() => {
    if (!activityData || activityData.length === 0) {
      return [{
        id: 'no-activity',
        user: 'System',
        action: 'No recent activity',
        target: 'Get started by creating projects and managing tasks',
        project: 'FireLynx',
        timestamp: 'Now',
        type: 'info'
      }];
    }

    return activityData.map(log => ({
      id: log.id,
      user: log.userName || 'User',
      action: getActionDescription(log.actionType),
      target: log.description,
      project: log.projectTitle || 'Unknown Project',
      timestamp: formatRelativeTime(new Date(log.createdAt)),
      type: mapActionTypeToUIType(log.actionType)
    }));
  }, [activityData]);

  // Helper functions
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const getActionDescription = (actionType) => {
    if (!actionType || typeof actionType !== 'string') return 'performed action';
    
    const actionMap = {
      'PROJECT_CREATED': 'created',
      'PROJECT_UPDATED': 'updated',
      'MILESTONE_CREATED': 'created milestone',
      'MILESTONE_UPDATED': 'updated milestone',
      'VARIATION_CREATED': 'submitted variation',
      'VARIATION_APPROVED': 'approved variation',
      'TICKET_CREATED': 'created ticket',
      'TICKET_RESOLVED': 'resolved ticket',
      'FILE_UPLOADED': 'uploaded file',
      'INVOICE_CREATED': 'created invoice',
      'INVOICE_SENT': 'sent invoice'
    };
    return actionMap[actionType] || actionType.toLowerCase();
  };

  const mapActionTypeToUIType = (actionType) => {
    if (!actionType || typeof actionType !== 'string') return 'activity';
    
    if (actionType.includes('PROJECT')) return 'project';
    if (actionType.includes('MILESTONE')) return 'milestone';
    if (actionType.includes('VARIATION')) return 'variation';
    if (actionType.includes('TICKET')) return 'ticket';
    if (actionType.includes('FILE')) return 'file';
    if (actionType.includes('INVOICE')) return 'invoice';
    return 'activity';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'approval': return 'CheckCircle';
      case 'milestone': return 'Target';
      case 'variation': return 'FileEdit';
      case 'ticket': return 'MessageSquare';
      case 'file': return 'Upload';
      default: return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'approval': return 'text-success';
      case 'milestone': return 'text-accent';
      case 'variation': return 'text-warning';
      case 'ticket': return 'text-error';
      case 'file': return 'text-primary';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Team Activity</h3>
        <button className="text-sm text-accent hover:text-accent/80 transition-smooth">
          View All
        </button>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities?.map((activity, index) => (
          <div key={activity?.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-xs font-medium text-accent">
                  {activity?.user?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-card-foreground">
                  {activity?.user}
                </span>
                <span className="text-sm text-text-secondary">
                  {activity?.action}
                </span>
                <div className={`${getActivityColor(activity?.type)}`}>
                  <Icon name={getActivityIcon(activity?.type)} size={14} />
                </div>
              </div>
              
              <p className="text-sm text-text-secondary mb-1">
                <span className="font-medium text-card-foreground">
                  {activity?.target}
                </span>
                {' in '}
                <span className="text-accent">
                  {activity?.project}
                </span>
              </p>
              
              <p className="text-xs text-text-secondary">
                {activity?.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-center space-x-2 text-sm text-text-secondary">
          <Icon name="Clock" size={16} />
          <span>Last updated: {new Date()?.toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default TeamActivityFeed;