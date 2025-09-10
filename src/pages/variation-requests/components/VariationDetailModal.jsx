import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const VariationDetailModal = ({ 
  isOpen, 
  onClose, 
  variation, 
  onApprove, 
  onDecline, 
  currentUserRole = 'MANAGER' 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [actionType, setActionType] = useState('');

  if (!isOpen || !variation) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-warning text-warning-foreground', icon: 'Clock' },
      'approved': { color: 'bg-success text-success-foreground', icon: 'CheckCircle' },
      'declined': { color: 'bg-error text-error-foreground', icon: 'XCircle' },
      'under_review': { color: 'bg-accent text-accent-foreground', icon: 'Eye' },
      'partial_approval': { color: 'bg-warning text-warning-foreground', icon: 'AlertCircle' }
    };

    const config = statusConfig?.[status] || statusConfig?.['pending'];
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config?.color}`}>
        <Icon name={config?.icon} size={14} className="mr-2" />
        {status?.replace('_', ' ')?.toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'high': { color: 'text-error', icon: 'ArrowUp' },
      'medium': { color: 'text-warning', icon: 'Minus' },
      'low': { color: 'text-success', icon: 'ArrowDown' }
    };

    const config = priorityConfig?.[priority] || priorityConfig?.['medium'];
    
    return (
      <div className={`flex items-center space-x-1 ${config?.color}`}>
        <Icon name={config?.icon} size={16} />
        <span className="text-sm font-medium capitalize">{priority} Priority</span>
      </div>
    );
  };

  const handleApprovalAction = (type) => {
    setActionType(type);
    setShowApprovalForm(true);
  };

  const handleSubmitApproval = async () => {
    setIsProcessing(true);
    
    try {
      const approvalData = {
        variationId: variation?.id,
        action: actionType,
        comment: approvalComment,
        approvedBy: currentUserRole,
        approvedAt: new Date()?.toISOString()
      };

      if (actionType === 'approve') {
        await onApprove(approvalData);
      } else {
        await onDecline(approvalData);
      }

      setShowApprovalForm(false);
      setApprovalComment('');
      onClose();
    } catch (error) {
      console.error('Error processing approval:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const canApprove = () => {
    if (currentUserRole === 'MANAGER') return true;
    if (currentUserRole === 'CLIENT' && variation?.requiresClientApproval) return true;
    return false;
  };

  const mockAttachments = [
    {
      id: 1,
      name: 'kitchen-cabinet-specs.pdf',
      size: 2.4,
      type: 'application/pdf',
      uploadedAt: '2025-01-05T10:30:00Z'
    },
    {
      id: 2,
      name: 'material-samples.jpg',
      size: 1.8,
      type: 'image/jpeg',
      uploadedAt: '2025-01-05T10:32:00Z'
    }
  ];

  const mockComments = [
    {
      id: 1,
      author: 'Sarah Johnson',
      role: 'Client',
      comment: 'I would like to upgrade the cabinet hardware to brushed gold finish.',
      timestamp: '2025-01-05T09:15:00Z'
    },
    {
      id: 2,
      author: 'Michael Rodriguez',
      role: 'Manager',
      comment: 'Reviewing the cost implications and timeline impact. Will provide update shortly.',
      timestamp: '2025-01-05T10:45:00Z'
    }
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-200 flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg border border-border shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-primary">
                {variation?.referenceNumber}
              </h2>
              <p className="text-sm text-text-secondary">
                Revision {variation?.revisionNumber} • Created {formatDate(variation?.createdAt)}
              </p>
            </div>
            {getStatusBadge(variation?.status)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">Project Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Project:</span>
                      <span className="text-sm font-medium text-primary">{variation?.projectName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Client:</span>
                      <span className="text-sm font-medium text-primary">{variation?.clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Requester:</span>
                      <span className="text-sm font-medium text-primary">{variation?.requesterName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Category:</span>
                      <span className="text-sm font-medium text-primary capitalize">
                        {variation?.category?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">Impact Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Icon name="DollarSign" size={16} className="text-text-secondary" />
                        <span className="text-sm text-text-secondary">Price Impact:</span>
                      </div>
                      <span className={`text-sm font-semibold ${
                        variation?.priceImpact > 0 ? 'text-error' : 
                        variation?.priceImpact < 0 ? 'text-success' : 'text-text-primary'
                      }`}>
                        {variation?.priceImpact > 0 ? '+' : ''}{formatCurrency(variation?.priceImpact)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Icon name="Calendar" size={16} className="text-text-secondary" />
                        <span className="text-sm text-text-secondary">Time Impact:</span>
                      </div>
                      <span className={`text-sm font-semibold ${
                        variation?.timeImpact > 0 ? 'text-error' : 
                        variation?.timeImpact < 0 ? 'text-success' : 'text-text-primary'
                      }`}>
                        {variation?.timeImpact > 0 ? '+' : ''}{variation?.timeImpact} days
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Icon name="Flag" size={16} className="text-text-secondary" />
                        <span className="text-sm text-text-secondary">Priority:</span>
                      </div>
                      {getPriorityBadge(variation?.priority)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">Description</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-primary whitespace-pre-wrap">
                      {variation?.description}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">Justification</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-primary whitespace-pre-wrap">
                      {variation?.justification || 'No justification provided.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {mockAttachments?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-primary mb-3">Attachments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockAttachments?.map((attachment) => (
                    <div
                      key={attachment?.id}
                      className="flex items-center space-x-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-smooth cursor-pointer"
                    >
                      <Icon 
                        name={attachment?.type?.includes('image') ? 'Image' : 'File'} 
                        size={20} 
                        className="text-text-secondary" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">
                          {attachment?.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {attachment?.size} MB • {formatDate(attachment?.uploadedAt)}
                        </p>
                      </div>
                      <Icon name="Download" size={16} className="text-text-secondary" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments/History */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Comments & History</h3>
              <div className="space-y-3">
                {mockComments?.map((comment) => (
                  <div key={comment?.id} className="flex space-x-3 p-4 bg-muted rounded-lg">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="User" size={14} color="var(--color-accent-foreground)" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-primary">{comment?.author}</span>
                        <span className="text-xs text-text-secondary">•</span>
                        <span className="text-xs text-text-secondary capitalize">{comment?.role}</span>
                        <span className="text-xs text-text-secondary">•</span>
                        <span className="text-xs text-text-secondary">{formatDate(comment?.timestamp)}</span>
                      </div>
                      <p className="text-sm text-primary">{comment?.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval Form */}
            {showApprovalForm && (
              <div className="border border-border rounded-lg p-4 bg-background">
                <h3 className="text-lg font-semibold text-primary mb-3">
                  {actionType === 'approve' ? 'Approve' : 'Decline'} Variation
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Comment (Optional)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                      rows={3}
                      placeholder={`Add a comment for this ${actionType}...`}
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e?.target?.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant={actionType === 'approve' ? 'success' : 'destructive'}
                      onClick={handleSubmitApproval}
                      loading={isProcessing}
                      iconName={actionType === 'approve' ? 'Check' : 'X'}
                      iconPosition="left"
                    >
                      Confirm {actionType === 'approve' ? 'Approval' : 'Decline'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowApprovalForm(false);
                        setApprovalComment('');
                      }}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/50">
          <div className="text-sm text-text-secondary">
            Last updated: {formatDate(variation?.updatedAt || variation?.createdAt)}
          </div>
          
          {canApprove() && variation?.status === 'pending' && !showApprovalForm && (
            <div className="flex items-center space-x-3">
              <Button
                variant="destructive"
                onClick={() => handleApprovalAction('decline')}
                iconName="X"
                iconPosition="left"
              >
                Decline
              </Button>
              <Button
                variant="success"
                onClick={() => handleApprovalAction('approve')}
                iconName="Check"
                iconPosition="left"
              >
                Approve
              </Button>
            </div>
          )}
          
          {!canApprove() || variation?.status !== 'pending' ? (
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default VariationDetailModal;