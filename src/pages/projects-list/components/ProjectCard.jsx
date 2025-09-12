import React from 'react';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const ProjectCard = ({ 
  project, 
  viewMode = 'grid', 
  isSelected = false, 
  onToggleSelect, 
  onClick 
}) => {
  const getStatusColor = (status) => {
    const colors = {
      'Planned': 'text-gray-600 bg-gray-100',
      'In Progress': 'text-blue-600 bg-blue-100',
      'On Hold': 'text-yellow-600 bg-yellow-100',
      'Completed': 'text-green-600 bg-green-100'
    };
    return colors?.[status] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'text-green-600 bg-green-100',
      'Medium': 'text-yellow-600 bg-yellow-100',
      'High': 'text-orange-600 bg-orange-100',
      'Urgent': 'text-red-600 bg-red-100'
    };
    return colors?.[priority] || 'text-gray-600 bg-gray-100';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDeadline = () => {
    const today = new Date();
    const deadline = new Date(project?.targetDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-red-600' };
    if (diffDays <= 7) return { text: `${diffDays} days left`, color: 'text-yellow-600' };
    return { text: `${diffDays} days left`, color: 'text-green-600' };
  };

  const deadline = getDaysUntilDeadline();

  const handleCardClick = (e) => {
    // Prevent navigation when clicking on checkbox or action buttons
    if (e?.target?.closest('input[type="checkbox"]') || 
        e?.target?.closest('button') || 
        e?.target?.closest('[data-action]')) {
      return;
    }
    onClick?.(project);
  };

  const handleSelectClick = (e) => {
    e?.stopPropagation();
    onToggleSelect?.(project?.id);
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`bg-card rounded-lg p-4 border hover:border-primary/50 hover:shadow-md transition-smooth cursor-pointer ${
          isSelected ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onClick={handleCardClick}
      >
        <div className="flex items-center space-x-4">
          {/* Selection Checkbox */}
          <div onClick={handleSelectClick}>
            <Checkbox
              checked={isSelected}
              onChange={handleSelectClick}
            />
          </div>

          {/* Project Thumbnail */}
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
            {project?.thumbnail ? (
              <img 
                src={project?.thumbnail} 
                alt={project?.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Icon name="Building" size={24} className="text-muted-foreground" />
            )}
          </div>

          {/* Project Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold text-card-foreground truncate">
                    {project?.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(project?.status)}`}>
                    {project?.status}
                  </span>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(project?.priority)}`}>
                    {project?.priority}
                  </span>
                </div>
                <p className="text-text-secondary text-sm mb-2">{project?.client?.name}</p>
                <p className="text-text-secondary text-sm line-clamp-2">{project?.description}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden lg:flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="font-medium">{formatCurrency(project?.budget)}</div>
              <div className="text-text-secondary text-xs">Budget</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{project?.progress}%</div>
              <div className="text-text-secondary text-xs">Progress</div>
            </div>
            <div className="text-center">
              <div className={`font-medium ${deadline?.color}`}>{deadline?.text}</div>
              <div className="text-text-secondary text-xs">Deadline</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{project?.teamMembers?.length}</div>
              <div className="text-text-secondary text-xs">Team</div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            <Button 
              variant="ghost" 
              size="icon"
              iconName="ChevronRight"
              data-action="view"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-text-secondary">Progress</span>
            <span className="text-sm font-medium">{project?.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-smooth" 
              style={{ width: `${project?.progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div 
      className={`bg-card rounded-lg p-6 border hover:border-primary/50 hover:shadow-md transition-smooth cursor-pointer ${
        isSelected ? 'border-primary bg-primary/5' : 'border-border'
      }`}
      onClick={handleCardClick}
    >
      {/* Header with selection and thumbnail */}
      <div className="flex items-start justify-between mb-4">
        <div onClick={handleSelectClick}>
          <Checkbox
            checked={isSelected}
            onChange={handleSelectClick}
          />
        </div>
        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
          {project?.thumbnail ? (
            <img 
              src={project?.thumbnail} 
              alt={project?.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Icon name="Building" size={24} className="text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Project Title and Status */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-card-foreground line-clamp-1">
            {project?.title}
          </h3>
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(project?.status)}`}>
            {project?.status}
          </span>
        </div>
        <p className="text-text-secondary text-sm mb-1">{project?.client?.name}</p>
        <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(project?.priority)}`}>
          {project?.priority}
        </span>
      </div>

      {/* Description */}
      <p className="text-text-secondary text-sm mb-4 line-clamp-2">
        {project?.description}
      </p>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="text-xs text-text-secondary mb-1">Budget</div>
          <div className="font-medium text-sm">{formatCurrency(project?.budget)}</div>
        </div>
        <div>
          <div className="text-xs text-text-secondary mb-1">Deadline</div>
          <div className={`font-medium text-sm ${deadline?.color}`}>{deadline?.text}</div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-secondary">Progress</span>
          <span className="text-sm font-medium">{project?.progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-smooth" 
            style={{ width: `${project?.progress}%` }}
          />
        </div>
      </div>

      {/* Team and Quick Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {project?.teamMembers?.slice(0, 3)?.map((member, index) => (
            <div
              key={member?.id}
              className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium"
              title={member?.name}
            >
              {member?.avatar ? (
                <img 
                  src={member?.avatar} 
                  alt={member?.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                member?.name?.charAt(0)?.toUpperCase()
              )}
            </div>
          ))}
          {project?.teamMembers?.length > 3 && (
            <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs">
              +{project?.teamMembers?.length - 3}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 text-xs text-text-secondary">
          <div className="flex items-center space-x-1">
            <Icon name="Target" size={12} />
            <span>{project?.milestones?.completed}/{project?.milestones?.total}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="CheckCircle" size={12} />
            <span>{project?.approvals?.pending}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="MessageSquare" size={12} />
            <span>{project?.tickets?.open}</span>
          </div>
        </div>
      </div>

      {/* Last Activity */}
      <div className="mt-4 pt-3 border-t border-border text-xs text-text-secondary">
        Last updated {formatDate(project?.lastActivity)}
      </div>
    </div>
  );
};

export default ProjectCard;