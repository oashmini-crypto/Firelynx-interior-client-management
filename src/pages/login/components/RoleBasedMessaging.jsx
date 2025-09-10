import React from 'react';
import Icon from '../../../components/AppIcon';

const RoleBasedMessaging = () => {
  const portalInfo = [
    {
      role: 'Manager',
      icon: 'LayoutDashboard',
      description: 'Access comprehensive project management, team oversight, and client coordination tools',
      features: ['Project Dashboard', 'Team Management', 'Client Portal Access', 'Variation Approvals']
    },
    {
      role: 'Designer',
      icon: 'Palette',
      description: 'Collaborate on assigned projects with milestone tracking and file management',
      features: ['Project Access', 'File Management', 'Milestone Tracking', 'Client Communication']
    },
    {
      role: 'Client',
      icon: 'Users',
      description: 'View project progress, approve designs, and communicate with your design team',
      features: ['Project Overview', 'File Approvals', 'Milestone Tracking', 'Direct Messaging']
    }
  ];

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-primary mb-4 text-center">
        Role-Based Portal Access
      </h3>
      <div className="space-y-4">
        {portalInfo?.map((portal, index) => (
          <div key={index} className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={portal?.icon} size={16} className="text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-primary mb-1">
                  {portal?.role} Portal
                </h4>
                <p className="text-xs text-text-secondary mb-2">
                  {portal?.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {portal?.features?.map((feature, featureIndex) => (
                    <span
                      key={featureIndex}
                      className="inline-flex items-center px-2 py-1 bg-background rounded text-xs text-text-secondary"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleBasedMessaging;