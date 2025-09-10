import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ClientCard = ({ 
  client, 
  viewMode, 
  onClientClick, 
  onViewProjects, 
  onCreateProject,
  getStatusColor 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-card rounded-lg p-4 border border-border shadow-subtle hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {client?.avatar ? (
                <img 
                  src={client?.avatar} 
                  alt={client?.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-primary font-semibold text-lg">
                  {client?.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>

            {/* Client Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <h3 
                  className="font-semibold text-card-foreground cursor-pointer hover:text-primary transition-colors truncate"
                  onClick={onClientClick}
                >
                  {client?.name}
                </h3>
                <span className={`text-sm font-medium px-2 py-1 rounded-full bg-opacity-10 ${getStatusColor(client?.relationshipStatus)?.replace('text-', 'bg-')}`}>
                  {client?.relationshipStatus}
                </span>
              </div>
              <p className="text-sm text-text-secondary truncate">{client?.company}</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-text-secondary">
                  <Icon name="Mail" size={14} className="inline mr-1" />
                  {client?.email}
                </span>
                <span className="text-sm text-text-secondary">
                  <Icon name="Phone" size={14} className="inline mr-1" />
                  {client?.phone}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden lg:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <p className="font-semibold text-card-foreground">{client?.projectCount}</p>
                <p className="text-text-secondary">Projects</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-card-foreground">
                  {formatCurrency(client?.totalContractValue)}
                </p>
                <p className="text-text-secondary">Value</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-card-foreground">
                  {formatDate(client?.lastContact)}
                </p>
                <p className="text-text-secondary">Last Contact</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              iconName="Eye"
              onClick={onClientClick}
              className="hidden sm:flex"
            >
              View
            </Button>
            {client?.projectCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                iconName="Briefcase"
                onClick={onViewProjects}
                className="hidden md:flex"
              >
                Projects
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              iconName="Plus"
              onClick={onCreateProject}
            >
              New Project
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-card rounded-lg p-6 border border-border shadow-subtle hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {client?.avatar ? (
              <img 
                src={client?.avatar} 
                alt={client?.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-primary font-semibold text-lg">
                {client?.name?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-card-foreground cursor-pointer hover:text-primary transition-colors truncate"
              onClick={onClientClick}
            >
              {client?.name}
            </h3>
            <p className="text-sm text-text-secondary truncate">{client?.company}</p>
          </div>
        </div>

        <span className={`text-xs font-medium px-2 py-1 rounded-full bg-opacity-10 ${getStatusColor(client?.relationshipStatus)?.replace('text-', 'bg-')}`}>
          {client?.relationshipStatus}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-text-secondary">
          <Icon name="Mail" size={14} className="mr-2 flex-shrink-0" />
          <span className="truncate">{client?.email}</span>
        </div>
        <div className="flex items-center text-sm text-text-secondary">
          <Icon name="Phone" size={14} className="mr-2 flex-shrink-0" />
          <span>{client?.phone}</span>
        </div>
        <div className="flex items-center text-sm text-text-secondary">
          <Icon name="MapPin" size={14} className="mr-2 flex-shrink-0" />
          <span className="truncate">{client?.address}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-border">
        <div className="text-center">
          <p className="text-lg font-semibold text-card-foreground">{client?.projectCount}</p>
          <p className="text-xs text-text-secondary">Projects</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-card-foreground">
            {client?.totalContractValue > 0 ? formatCurrency(client?.totalContractValue) : '$0'}
          </p>
          <p className="text-xs text-text-secondary">Total Value</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-card-foreground">
            {client?.projects?.filter(p => p?.status === 'In Progress')?.length || 0}
          </p>
          <p className="text-xs text-text-secondary">Active</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          iconName="Eye"
          onClick={onClientClick}
          fullWidth
        >
          View Profile
        </Button>
        {client?.projectCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            iconName="Briefcase"
            onClick={onViewProjects}
            fullWidth
          >
            Projects
          </Button>
        )}
      </div>
      
      <div className="mt-2">
        <Button
          variant="default"
          size="sm"
          iconName="Plus"
          onClick={onCreateProject}
          fullWidth
        >
          Create Project
        </Button>
      </div>

      {/* Last Contact */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Last Contact:</span>
          <span>{formatDate(client?.lastContact)}</span>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;