import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TeamMemberCard = ({ member }) => {
  return (
    <div className="bg-card rounded-lg p-4 border border-border shadow-subtle">
      <div className="flex items-center space-x-3 mb-3">
        <div className="relative">
          <Image
            src={member?.avatar}
            alt={member?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
            member?.isOnline ? 'bg-success' : 'bg-muted'
          }`}></div>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-primary">{member?.name}</h4>
          <p className="text-sm text-text-secondary">{member?.role}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <Icon name="Mail" size={14} />
          <span>{member?.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <Icon name="Phone" size={14} />
          <span>{member?.phone}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Specialization</span>
          <span className="font-medium text-primary">{member?.specialization}</span>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;