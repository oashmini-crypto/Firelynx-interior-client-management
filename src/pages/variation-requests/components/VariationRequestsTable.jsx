import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const VariationRequestsTable = ({ 
  variations = [], 
  onView, 
  onApprove, 
  onDecline, 
  onEdit,
  currentUserRole = 'MANAGER' 
}) => {
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status, approvalStatus) => {
    const statusConfig = {
      'pending': { color: 'bg-warning text-warning-foreground', icon: 'Clock' },
      'approved': { color: 'bg-success text-success-foreground', icon: 'CheckCircle' },
      'declined': { color: 'bg-error text-error-foreground', icon: 'XCircle' },
      'under_review': { color: 'bg-accent text-accent-foreground', icon: 'Eye' },
      'partial_approval': { color: 'bg-warning text-warning-foreground', icon: 'AlertCircle' }
    };

    const config = statusConfig?.[status] || statusConfig?.['pending'];
    
    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
          <Icon name={config?.icon} size={12} className="mr-1" />
          {status?.replace('_', ' ')?.toUpperCase()}
        </span>
        {approvalStatus && (
          <span className="text-xs text-text-secondary">
            {approvalStatus}
          </span>
        )}
      </div>
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
        <Icon name={config?.icon} size={14} />
        <span className="text-xs font-medium capitalize">{priority}</span>
      </div>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const canApprove = (variation) => {
    if (currentUserRole === 'MANAGER') return true;
    if (currentUserRole === 'CLIENT' && variation?.requiresClientApproval) return true;
    return false;
  };

  const sortedVariations = [...variations]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];
    
    if (sortField === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('referenceNumber')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-primary hover:text-primary"
                >
                  <span>Reference</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('projectName')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-primary hover:text-primary"
                >
                  <span>Project</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                Requester
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                Description
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('priceImpact')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-primary hover:text-primary"
                >
                  <span>Price Impact</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                Time Impact
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                Status
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-primary hover:text-primary"
                >
                  <span>Created</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-text-primary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedVariations?.map((variation) => (
              <tr key={variation?.id} className="hover:bg-muted/50 transition-smooth">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-primary">
                      {variation?.referenceNumber}
                    </span>
                    <span className="text-xs text-text-secondary">
                      Rev. {variation?.revisionNumber}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-primary">
                      {variation?.projectName}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {variation?.clientName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Icon name="User" size={14} color="var(--color-accent-foreground)" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-primary">
                        {variation?.requesterName}
                      </span>
                      <span className="text-xs text-text-secondary capitalize">
                        {variation?.requesterRole}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <p className="text-sm text-primary line-clamp-2">
                      {variation?.description}
                    </p>
                    {variation?.category && (
                      <span className="inline-block mt-1 px-2 py-1 bg-muted text-xs text-text-secondary rounded">
                        {variation?.category}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${
                      variation?.priceImpact > 0 ? 'text-error' : 
                      variation?.priceImpact < 0 ? 'text-success' : 'text-text-primary'
                    }`}>
                      {variation?.priceImpact > 0 ? '+' : ''}{formatCurrency(variation?.priceImpact)}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {((variation?.priceImpact / variation?.originalBudget) * 100)?.toFixed(1)}% of budget
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${
                      variation?.timeImpact > 0 ? 'text-error' : 
                      variation?.timeImpact < 0 ? 'text-success' : 'text-text-primary'
                    }`}>
                      {variation?.timeImpact > 0 ? '+' : ''}{variation?.timeImpact} days
                    </span>
                    {variation?.newDeadline && (
                      <span className="text-xs text-text-secondary">
                        New: {formatDate(variation?.newDeadline)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getPriorityBadge(variation?.priority)}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(variation?.status, variation?.approvalStatus)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-primary">
                      {formatDate(variation?.createdAt)}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {variation?.createdBy}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(variation)}
                      iconName="Eye"
                      iconPosition="left"
                    >
                      View
                    </Button>
                    {canApprove(variation) && variation?.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => onApprove(variation)}
                          iconName="Check"
                          iconPosition="left"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDecline(variation)}
                          iconName="X"
                          iconPosition="left"
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    {currentUserRole === 'MANAGER' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(variation)}
                        iconName="Edit"
                        iconPosition="left"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-border">
        {sortedVariations?.map((variation) => (
          <div key={variation?.id} className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-primary">
                  {variation?.referenceNumber}
                </span>
                <span className="text-xs text-text-secondary">
                  Rev. {variation?.revisionNumber} • {formatDate(variation?.createdAt)}
                </span>
              </div>
              {getPriorityBadge(variation?.priority)}
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-xs text-text-secondary">Project:</span>
                <p className="text-sm font-medium text-primary">{variation?.projectName}</p>
              </div>
              <div>
                <span className="text-xs text-text-secondary">Requester:</span>
                <p className="text-sm text-primary">{variation?.requesterName}</p>
              </div>
              <div>
                <span className="text-xs text-text-secondary">Description:</span>
                <p className="text-sm text-primary line-clamp-2">{variation?.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-text-secondary">Price Impact:</span>
                <p className={`text-sm font-medium ${
                  variation?.priceImpact > 0 ? 'text-error' : 
                  variation?.priceImpact < 0 ? 'text-success' : 'text-text-primary'
                }`}>
                  {variation?.priceImpact > 0 ? '+' : ''}{formatCurrency(variation?.priceImpact)}
                </p>
              </div>
              <div>
                <span className="text-xs text-text-secondary">Time Impact:</span>
                <p className={`text-sm font-medium ${
                  variation?.timeImpact > 0 ? 'text-error' : 
                  variation?.timeImpact < 0 ? 'text-success' : 'text-text-primary'
                }`}>
                  {variation?.timeImpact > 0 ? '+' : ''}{variation?.timeImpact} days
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {getStatusBadge(variation?.status, variation?.approvalStatus)}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(variation)}
                  iconName="Eye"
                />
                {canApprove(variation) && variation?.status === 'pending' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => onApprove(variation)}
                      iconName="Check"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDecline(variation)}
                      iconName="X"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {variations?.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="FileEdit" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary mb-2">No Variation Requests</h3>
          <p className="text-text-secondary">
            No variation requests found matching your current filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default VariationRequestsTable;