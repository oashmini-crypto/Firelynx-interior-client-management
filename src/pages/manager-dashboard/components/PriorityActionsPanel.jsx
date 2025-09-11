import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useAllVariations } from '../../../hooks/useProjectData';
import { useAllTickets } from '../../../hooks/useProjectData';

const PriorityActionsPanel = ({ onNavigate }) => {
  // Fetch real data
  const { data: allVariations = [] } = useAllVariations();
  const { data: allTickets = [] } = useAllTickets();

  // Generate priority items from real data
  const priorityItems = React.useMemo(() => {
    const items = [];

    // Add pending variations
    const pendingVariations = allVariations
      .filter(v => v.status === 'Under Review' || v.status === 'Pending')
      .slice(0, 3)
      .map(variation => ({
        id: variation.id,
        type: 'variation',
        title: `Variation Request ${variation.number}`,
        description: `${variation.changeDescription} - ${variation.project?.title || 'Project'}`,
        urgency: (variation.priority || '').toLowerCase() === 'high' ? 'high' : 'medium',
        dueDate: new Date(variation.createdAt).toLocaleDateString(),
        action: 'Review & Approve',
        route: `/variations`,
        itemId: variation.id
      }));

    // Add open tickets with high priority
    const urgentTickets = allTickets
      .filter(t => t.status === 'Open' && t.priority === 'High')
      .slice(0, 2)
      .map(ticket => ({
        id: ticket.id,
        type: 'ticket',
        title: `Ticket ${ticket.number}`,
        description: `${ticket.subject} - ${ticket.project?.title || 'Project'}`,
        urgency: 'high',
        dueDate: new Date(ticket.createdAt).toLocaleDateString(),
        action: 'View Details',
        route: `/tickets`,
        itemId: ticket.id
      }));

    items.push(...pendingVariations, ...urgentTickets);

    // If no real items, show message
    if (items.length === 0) {
      items.push({
        id: 'no-items',
        type: 'info',
        title: 'All caught up!',
        description: 'No urgent items requiring immediate attention',
        urgency: 'low',
        dueDate: 'Now',
        action: 'View All',
        route: '/projects'
      });
    }

    return items.slice(0, 4); // Limit to 4 items
  }, [allVariations, allTickets]);

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