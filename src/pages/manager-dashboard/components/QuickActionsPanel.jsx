import React from 'react';
import Button from '../../../components/ui/Button';

const QuickActionsPanel = ({ onNavigate }) => {
  const quickActions = [
    {
      title: 'New Project',
      description: 'Create a new interior design project',
      icon: 'Plus',
      variant: 'default',
      route: '/manager-dashboard'
    },
    {
      title: 'Add Employee',
      description: 'Onboard new team member',
      icon: 'UserPlus',
      variant: 'outline',
      route: '/user-management'
    },
    {
      title: 'Client Onboarding',
      description: 'Register new client',
      icon: 'Users',
      variant: 'outline',
      route: '/user-management'
    }
  ];

  return (
    <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
      <h3 className="text-lg font-semibold text-card-foreground mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions?.map((action, index) => (
          <div key={index} className="text-center">
            <Button
              variant={action?.variant}
              onClick={() => onNavigate(action?.route)}
              iconName={action?.icon}
              iconPosition="left"
              fullWidth
              className="mb-2"
            >
              {action?.title}
            </Button>
            <p className="text-xs text-text-secondary">
              {action?.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsPanel;