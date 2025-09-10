import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const VariationFilters = ({ 
  onFiltersChange, 
  projects = [], 
  requesters = [],
  totalCount = 0,
  filteredCount = 0 
}) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    project: '',
    requester: '',
    priority: '',
    dateRange: '',
    priceImpactMin: '',
    priceImpactMax: '',
    timeImpactMin: '',
    timeImpactMax: ''
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'declined', label: 'Declined' },
    { value: 'partial_approval', label: 'Partial Approval' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const projectOptions = [
    { value: '', label: 'All Projects' },
    ...projects?.map(project => ({
      value: project?.id,
      label: project?.name
    }))
  ];

  const requesterOptions = [
    { value: '', label: 'All Requesters' },
    ...requesters?.map(requester => ({
      value: requester?.id,
      label: requester?.name
    }))
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      project: '',
      requester: '',
      priority: '',
      dateRange: '',
      priceImpactMin: '',
      priceImpactMax: '',
      timeImpactMin: '',
      timeImpactMax: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-surface rounded-lg border border-border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-primary">Filter Variations</h2>
          {filteredCount !== totalCount && (
            <span className="text-sm text-text-secondary">
              Showing {filteredCount} of {totalCount} variations
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            iconName={isAdvancedOpen ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
          >
            Advanced Filters
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              iconName="X"
              iconPosition="left"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          type="search"
          placeholder="Search variations..."
          value={filters?.search}
          onChange={(e) => handleFilterChange('search', e?.target?.value)}
          className="col-span-1 md:col-span-2"
        />

        <Select
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
          placeholder="Filter by status"
        />

        <Select
          options={priorityOptions}
          value={filters?.priority}
          onChange={(value) => handleFilterChange('priority', value)}
          placeholder="Filter by priority"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select
          options={projectOptions}
          value={filters?.project}
          onChange={(value) => handleFilterChange('project', value)}
          placeholder="Filter by project"
          searchable
        />

        <Select
          options={requesterOptions}
          value={filters?.requester}
          onChange={(value) => handleFilterChange('requester', value)}
          placeholder="Filter by requester"
          searchable
        />

        <Select
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
          placeholder="Filter by date"
        />
      </div>
      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="border-t border-border pt-6 space-y-4">
          <h3 className="text-sm font-medium text-primary">Advanced Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Impact Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-primary">Price Impact Range</label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Min amount"
                  value={filters?.priceImpactMin}
                  onChange={(e) => handleFilterChange('priceImpactMin', e?.target?.value)}
                />
                <Input
                  type="number"
                  placeholder="Max amount"
                  value={filters?.priceImpactMax}
                  onChange={(e) => handleFilterChange('priceImpactMax', e?.target?.value)}
                />
              </div>
            </div>

            {/* Time Impact Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-primary">Time Impact Range (Days)</label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Min days"
                  value={filters?.timeImpactMin}
                  onChange={(e) => handleFilterChange('timeImpactMin', e?.target?.value)}
                />
                <Input
                  type="number"
                  placeholder="Max days"
                  value={filters?.timeImpactMax}
                  onChange={(e) => handleFilterChange('timeImpactMax', e?.target?.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <span className="text-sm text-text-secondary">Active filters:</span>
            {filters?.search && (
              <span className="inline-flex items-center px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">
                Search: "{filters?.search}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1 hover:bg-accent-foreground/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={10} />
                </button>
              </span>
            )}
            {filters?.status && (
              <span className="inline-flex items-center px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">
                Status: {statusOptions?.find(opt => opt?.value === filters?.status)?.label}
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-1 hover:bg-accent-foreground/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={10} />
                </button>
              </span>
            )}
            {filters?.priority && (
              <span className="inline-flex items-center px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">
                Priority: {priorityOptions?.find(opt => opt?.value === filters?.priority)?.label}
                <button
                  onClick={() => handleFilterChange('priority', '')}
                  className="ml-1 hover:bg-accent-foreground/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={10} />
                </button>
              </span>
            )}
            {filters?.project && (
              <span className="inline-flex items-center px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">
                Project: {projectOptions?.find(opt => opt?.value === filters?.project)?.label}
                <button
                  onClick={() => handleFilterChange('project', '')}
                  className="ml-1 hover:bg-accent-foreground/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={10} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VariationFilters;