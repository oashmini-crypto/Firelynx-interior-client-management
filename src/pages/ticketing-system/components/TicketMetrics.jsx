import React from 'react';
import Icon from '../../../components/AppIcon';

const TicketMetrics = () => {
  const metrics = [
    {
      id: 1,
      title: 'Open Tickets',
      value: 23,
      change: '+3',
      changeType: 'increase',
      icon: 'MessageSquare',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      id: 2,
      title: 'Overdue',
      value: 5,
      change: '-2',
      changeType: 'decrease',
      icon: 'AlertTriangle',
      color: 'text-error',
      bgColor: 'bg-error/10'
    },
    {
      id: 3,
      title: 'Critical Priority',
      value: 8,
      change: '+1',
      changeType: 'increase',
      icon: 'AlertCircle',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      id: 4,
      title: 'Resolved Today',
      value: 12,
      change: '+4',
      changeType: 'increase',
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ];

  const teamWorkload = [
    { name: 'John Doe', assigned: 8, completed: 15, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
    { name: 'Sarah Wilson', assigned: 6, completed: 12, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face' },
    { name: 'Mike Chen', assigned: 5, completed: 9, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' },
    { name: 'Emma Davis', assigned: 4, completed: 7, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics?.map((metric) => (
          <div key={metric?.id} className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${metric?.bgColor}`}>
                <Icon name={metric?.icon} size={20} className={metric?.color} />
              </div>
              <div className={`text-xs font-medium ${
                metric?.changeType === 'increase' ? 'text-success' : 'text-error'
              }`}>
                {metric?.change}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-primary">{metric?.value}</p>
              <p className="text-sm text-text-secondary">{metric?.title}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Team Workload */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Team Workload</h3>
        <div className="space-y-3">
          {teamWorkload?.map((member, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src={member?.avatar}
                    alt={member?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/images/no_image.png';
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-primary">{member?.name}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-warning">{member?.assigned}</p>
                  <p className="text-text-secondary">Active</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-success">{member?.completed}</p>
                  <p className="text-text-secondary">Completed</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Priority Distribution */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Priority Distribution</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-error rounded-full"></div>
              <span className="text-sm text-primary">Critical</span>
            </div>
            <span className="text-sm font-semibold text-primary">8</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span className="text-sm text-primary">High</span>
            </div>
            <span className="text-sm font-semibold text-primary">12</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="text-sm text-primary">Medium</span>
            </div>
            <span className="text-sm font-semibold text-primary">15</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-sm text-primary">Low</span>
            </div>
            <span className="text-sm font-semibold text-primary">7</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketMetrics;