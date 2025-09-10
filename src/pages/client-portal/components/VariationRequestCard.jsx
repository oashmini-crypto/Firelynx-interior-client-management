import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const VariationRequestCard = ({ variation, onApprove, onDecline }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-success/10 text-success border-success/20';
      case 'declined':
        return 'bg-error/10 text-error border-error/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-text-secondary border-border';
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

  return (
    <div className="bg-card rounded-lg border border-border shadow-subtle p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-semibold text-primary">{variation?.title}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(variation?.status)}`}>
              {variation?.status?.charAt(0)?.toUpperCase() + variation?.status?.slice(1)}
            </span>
          </div>
          <p className="text-sm text-text-secondary mb-2">{variation?.description}</p>
          <div className="flex items-center space-x-4 text-xs text-text-secondary">
            <div className="flex items-center space-x-1">
              <Icon name="Calendar" size={12} />
              <span>Requested: {variation?.requestDate}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="User" size={12} />
              <span>By: {variation?.requestedBy}</span>
            </div>
            <div className={`flex items-center space-x-1 ${getPriorityColor(variation?.priority)}`}>
              <Icon name="AlertCircle" size={12} />
              <span>{variation?.priority} Priority</span>
            </div>
          </div>
        </div>
      </div>
      {/* Impact Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="DollarSign" size={14} className="text-success" />
            <span className="text-xs font-medium text-text-secondary">Cost Impact</span>
          </div>
          <p className={`text-sm font-semibold ${
            (variation?.costImpact || 0) > 0 ? 'text-error' : (variation?.costImpact || 0) < 0 ? 'text-success' : 'text-text-secondary'
          }`}>
            {(variation?.costImpact || 0) > 0 ? '+' : ''}${(variation?.costImpact || 0).toLocaleString()}
          </p>
        </div>
        
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Clock" size={14} className="text-warning" />
            <span className="text-xs font-medium text-text-secondary">Time Impact</span>
          </div>
          <p className={`text-sm font-semibold ${
            (variation?.timeImpact || 0) > 0 ? 'text-error' : (variation?.timeImpact || 0) < 0 ? 'text-success' : 'text-text-secondary'
          }`}>
            {(variation?.timeImpact || 0) > 0 ? '+' : ''}{variation?.timeImpact || 0} days
          </p>
        </div>
        
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Hash" size={14} className="text-accent" />
            <span className="text-xs font-medium text-text-secondary">Request ID</span>
          </div>
          <p className="text-sm font-semibold text-primary">{variation?.requestId}</p>
        </div>
      </div>
      {/* Detailed Description */}
      {variation?.detailedDescription && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-primary mb-2">Detailed Description</h5>
          <p className="text-sm text-text-secondary bg-muted rounded-lg p-3">
            {variation?.detailedDescription}
          </p>
        </div>
      )}
      {/* Attachments */}
      {variation?.attachments && variation?.attachments?.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-primary mb-2">Attachments</h5>
          <div className="flex flex-wrap gap-2">
            {variation?.attachments?.map((attachment, index) => (
              <div key={index} className="flex items-center space-x-2 bg-muted rounded-lg px-3 py-2">
                <Icon name="Paperclip" size={14} />
                <span className="text-sm">{attachment?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Action Buttons */}
      {variation?.status === 'pending' && (
        <div className="flex space-x-3 pt-4 border-t border-border">
          <Button
            variant="success"
            onClick={() => onApprove(variation?.id)}
            iconName="Check"
            iconPosition="left"
            className="flex-1"
          >
            Approve Request
          </Button>
          <Button
            variant="outline"
            onClick={() => onDecline(variation?.id)}
            iconName="X"
            iconPosition="left"
            className="flex-1"
          >
            Decline Request
          </Button>
        </div>
      )}
      {/* Manager Approval Status */}
      {variation?.managerApproval && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Manager Approval:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              variation?.managerApproval?.status === 'approved' ? 'bg-success/10 text-success' :
              variation?.managerApproval?.status === 'declined'? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'
            }`}>
              {variation?.managerApproval?.status?.charAt(0)?.toUpperCase() + variation?.managerApproval?.status?.slice(1)}
            </span>
          </div>
          {variation?.managerApproval?.comment && (
            <p className="text-sm text-text-secondary mt-2 italic">
              "{variation?.managerApproval?.comment}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VariationRequestCard;