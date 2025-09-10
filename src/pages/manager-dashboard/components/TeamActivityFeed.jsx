import React from 'react';
import Icon from '../../../components/AppIcon';

const TeamActivityFeed = () => {
  const activities = [
    {
      id: 1,
      user: 'Sarah Johnson',
      action: 'approved',
      target: 'Kitchen design renders',
      project: 'Luxury Apartment Renovation',
      timestamp: '5 minutes ago',
      type: 'approval',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: 2,
      user: 'Michael Chen',
      action: 'completed',
      target: 'Living room milestone',
      project: 'Modern Office Redesign',
      timestamp: '12 minutes ago',
      type: 'milestone',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: 3,
      user: 'Emily Rodriguez',
      action: 'submitted',
      target: 'Variation request VR-2025-002',
      project: 'Boutique Hotel Lobby',
      timestamp: '25 minutes ago',
      type: 'variation',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: 4,
      user: 'David Park',
      action: 'resolved',
      target: 'Lighting fixture ticket',
      project: 'Residential Villa Project',
      timestamp: '1 hour ago',
      type: 'ticket',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: 5,
      user: 'Lisa Thompson',
      action: 'uploaded',
      target: '15 new design files',
      project: 'Corporate Headquarters',
      timestamp: '2 hours ago',
      type: 'file',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: 6,
      user: 'James Wilson',
      action: 'created',
      target: 'New project milestone',
      project: 'Restaurant Interior',
      timestamp: '3 hours ago',
      type: 'milestone',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face'
    }
  ];

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
              <img
                src={activity?.avatar}
                alt={activity?.user}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/assets/images/no_image.png';
                }}
              />
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