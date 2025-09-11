import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAllVariations } from '../../hooks/useProjectData';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';

const VariationsGlobal = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  // Use React Query for real-time data synchronization
  const { data: allVariations = [], isLoading: loading, error } = useAllVariations();

  // Filter variations
  const filteredVariations = allVariations.filter(variation => {
    if (statusFilter !== 'All' && variation.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && variation.priority !== priorityFilter) return false;
    return true;
  });

  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Deferred', label: 'Deferred' }
  ];

  const priorityOptions = [
    { value: 'All', label: 'All Priorities' },
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-700';
      case 'Submitted': return 'bg-blue-100 text-blue-700';
      case 'Under Review': return 'bg-yellow-100 text-yellow-700';
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Deferred': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'text-error';
      case 'High': return 'text-warning';
      case 'Medium': return 'text-primary';
      case 'Low': return 'text-success';
      default: return 'text-text-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return 'CheckCircle';
      case 'Rejected': return 'XCircle';
      case 'Under Review': return 'Clock';
      case 'Submitted': return 'Send';
      case 'Deferred': return 'Pause';
      default: return 'FileText';
    }
  };

  // Stats calculations
  const totalVariations = allVariations.length;
  const pendingVariations = allVariations.filter(v => ['Submitted', 'Under Review'].includes(v.status)).length;
  const approvedVariations = allVariations.filter(v => v.status === 'Approved').length;
  const rejectedVariations = allVariations.filter(v => v.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">All Variation Requests</h1>
          <p className="text-text-secondary">Manage variation requests across all projects</p>
        </div>
        <Button as={Link} to="/projects" variant="outline">
          <Icon name="ArrowLeft" size={16} />
          <span>Back to Projects</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={24} className="text-accent" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary">{totalVariations}</h3>
              <p className="text-sm text-text-secondary">Total Variations</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary">{pendingVariations}</h3>
              <p className="text-sm text-text-secondary">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary">{approvedVariations}</h3>
              <p className="text-sm text-text-secondary">Approved</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Icon name="XCircle" size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary">{rejectedVariations}</h3>
              <p className="text-sm text-text-secondary">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center space-x-4 bg-muted p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={16} className="text-text-secondary" />
          <span className="text-sm font-medium text-primary">Filters:</span>
        </div>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          className="min-w-[150px]"
        />
        <Select
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={priorityOptions}
          className="min-w-[150px]"
        />
        <div className="text-sm text-text-secondary">
          Showing {filteredVariations.length} of {totalVariations} variations
        </div>
      </div>

      {/* Variations List */}
      <div className="space-y-4">
        {filteredVariations.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <Icon name="FileText" size={48} className="mx-auto text-text-secondary mb-4" />
            <h4 className="font-medium text-primary mb-2">No Variations Found</h4>
            <p className="text-text-secondary">No variation requests match your current filters</p>
          </div>
        ) : (
          filteredVariations.map(variation => (
            <div key={variation.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Link 
                      to={`/projects/${variation.projectId}?tab=variations&vr=${variation.id}`}
                      className="font-semibold text-primary hover:text-accent transition-colors"
                    >
                      {variation.number}
                    </Link>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(variation.status)}`}>
                      {variation.status}
                    </span>
                  </div>
                  <h4 className="font-medium text-primary mb-1">{variation.changeReference}</h4>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{variation.changeDescription}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-text-secondary">
                    <Link 
                      to={`/projects/${variation.projectId}`}
                      className="flex items-center space-x-1 hover:text-primary transition-colors"
                    >
                      <Icon name="Home" size={12} />
                      <span>{variation.project?.title}</span>
                    </Link>
                    <div className="flex items-center space-x-1">
                      <Icon name="MapPin" size={12} />
                      <span>{variation.changeArea}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="User" size={12} />
                      <span>{variation.changeRequestor}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={12} />
                      <span>{variation.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name={getStatusIcon(variation.status)} size={20} className={`${
                    variation.status === 'Approved' ? 'text-success' :
                    variation.status === 'Rejected' ? 'text-error' :
                    variation.status === 'Under Review' ? 'text-warning' :
                    'text-text-secondary'
                  }`} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="font-medium text-sm text-primary mb-2">Work Types</h5>
                  <div className="flex flex-wrap gap-1">
                    {variation.workTypes?.map(type => (
                      <span key={type} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-sm text-primary mb-2">Categories</h5>
                  <div className="flex flex-wrap gap-1">
                    {variation.categories?.map(category => (
                      <span key={category} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center space-x-2 text-sm text-text-secondary">
                  <span>Reason: {variation.reasonDescription?.slice(0, 100)}{variation.reasonDescription?.length > 100 ? '...' : ''}</span>
                </div>
                <Link 
                  to={`/projects/${variation.projectId}?tab=variations&vr=${variation.id}`}
                  className="flex items-center space-x-2 text-sm text-accent hover:text-accent-foreground transition-colors"
                >
                  <span>View Details</span>
                  <Icon name="ArrowRight" size={14} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VariationsGlobal;