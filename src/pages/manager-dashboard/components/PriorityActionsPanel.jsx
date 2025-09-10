import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PriorityActionsPanel = ({ onNavigate }) => {
  const priorityItems = [
    {
      id: 1,
      type: 'variation',
      title: 'Variation Request #VR-2025-001',
      description: 'Kitchen cabinet modification - Luxury Apartment Renovation',
      urgency: 'high',
      dueDate: '2 hours ago',
      action: 'Review & Approve',
      route: '/variation-requests'
    },
    {
      id: 2,
      type: 'milestone',
      title: 'Overdue Milestone',
      description: 'Living room design completion - Modern Office Redesign',
      urgency: 'high',
      dueDate: '1 day overdue',
      action: 'Update Status',
      route: '/manager-dashboard'
    },
    {
      id: 3,
      type: 'ticket',
      title: 'High Priority Ticket #TK-2025-015',
      description: 'Lighting fixture installation issue - Boutique Hotel Lobby',
      urgency: 'medium',
      dueDate: '4 hours ago',
      action: 'Assign Team',
      route: '/ticketing-system'
    },
    {
      id: 4,
      type: 'approval',
      title: 'File Approval Pending',
      description: 'Final design renders - Residential Villa Project',
      urgency: 'medium',
      dueDate: '6 hours ago',
      action: 'Review Files',
      route: '/manager-dashboard'
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'variation': return 'FileEdit';
      case 'milestone': return 'Target';
      case 'ticket': return 'MessageSquare';
      case 'approval': return 'CheckCircle';
      default: return 'AlertCircle';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-text-secondary';
    }
  };

  const getUrgencyBg = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-error/10';
      case 'medium': return 'bg-warning/10';
      case 'low': return 'bg-success/10';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Priority Actions</h3>
        <span className="text-sm text-text-secondary">
          {priorityItems?.filter(item => item?.urgency === 'high')?.length} urgent items
        </span>
      </div>
      <div className="space-y-4">
        {priorityItems?.map((item) => (
          <div 
            key={item?.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-smooth"
          >
            <div className="flex items-start space-x-4 flex-1">
              <div className={`p-2 rounded-lg ${getUrgencyBg(item?.urgency)}`}>
                <Icon 
                  name={getTypeIcon(item?.type)} 
                  size={20} 
                  className={getUrgencyColor(item?.urgency)}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-card-foreground truncate">
                    {item?.title}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyBg(item?.urgency)} ${getUrgencyColor(item?.urgency)}`}>
                    {item?.urgency}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mb-2 line-clamp-1">
                  {item?.description}
                </p>
                <p className="text-xs text-text-secondary">
                  {item?.dueDate}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(item?.route)}
              className="ml-4 flex-shrink-0"
            >
              {item?.action}
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <Button
          variant="ghost"
          fullWidth
          onClick={() => onNavigate('/manager-dashboard')}
          iconName="ArrowRight"
          iconPosition="right"
        >
          View All Actions
        </Button>
      </div>
    </div>
  );
};

export default PriorityActionsPanel;