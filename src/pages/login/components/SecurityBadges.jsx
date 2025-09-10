import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      title: 'SSL Secured',
      description: '256-bit encryption'
    },
    {
      icon: 'Lock',
      title: 'SOC 2 Compliant',
      description: 'Enterprise security'
    },
    {
      icon: 'CheckCircle',
      title: 'GDPR Ready',
      description: 'Privacy protected'
    }
  ];

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex items-center justify-center space-x-6">
        {securityFeatures?.map((feature, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center mb-2">
              <Icon name={feature?.icon} size={16} className="text-success" />
            </div>
            <p className="text-xs font-medium text-primary">{feature?.title}</p>
            <p className="text-xs text-text-secondary">{feature?.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityBadges;