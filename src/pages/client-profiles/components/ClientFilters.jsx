import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const ClientFilters = ({ filters, onFiltersChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const industryOptions = [
    { value: '', label: 'All Industries' },
    { value: 'Residential', label: 'Residential' },
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Hospitality', label: 'Hospitality' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Education', label: 'Education' },
    { value: 'Government', label: 'Government' }
  ];

  const projectStatusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Planned', label: 'Planned' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Completed', label: 'Completed' }
  ];

  const contractValueOptions = [
    { value: '', label: 'All Values' },
    { value: 'low', label: 'Under $300K' },
    { value: 'medium', label: '$300K - $500K' },
    { value: 'high', label: 'Over $500K' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      industry: '',
      projectStatus: '',
      contractValue: '',
      location: ''
    });
  };

  const hasActiveFilters = Object.values(filters)?.some(filter => filter !== '');

  return (
    <div className="bg-card rounded-lg border border-border shadow-subtle">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="Filter" size={20} className="text-text-secondary" />
          <h3 className="font-medium text-card-foreground">Filters</h3>
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Industry Filter */}
            <div>
              <Select
                label="Industry"
                placeholder="Select industry"
                value={filters?.industry}
                onChange={(value) => handleFilterChange('industry', value)}
                options={industryOptions}
              />
            </div>

            {/* Project Status Filter */}
            <div>
              <Select
                label="Project Status"
                placeholder="Select status"
                value={filters?.projectStatus}
                onChange={(value) => handleFilterChange('projectStatus', value)}
                options={projectStatusOptions}
              />
            </div>

            {/* Contract Value Filter */}
            <div>
              <Select
                label="Contract Value"
                placeholder="Select range"
                value={filters?.contractValue}
                onChange={(value) => handleFilterChange('contractValue', value)}
                options={contractValueOptions}
              />
            </div>

            {/* Location Filter */}
            <div>
              <Input
                label="Location"
                placeholder="Enter city or state"
                value={filters?.location}
                onChange={(e) => handleFilterChange('location', e?.target?.value)}
              />
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <span className="text-sm text-text-secondary mr-2">Quick filters:</span>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleFilterChange('industry', 'Residential')}
              className={filters?.industry === 'Residential' ? 'bg-primary text-primary-foreground' : ''}
            >
              Residential
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleFilterChange('industry', 'Commercial')}
              className={filters?.industry === 'Commercial' ? 'bg-primary text-primary-foreground' : ''}
            >
              Commercial
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleFilterChange('projectStatus', 'In Progress')}
              className={filters?.projectStatus === 'In Progress' ? 'bg-primary text-primary-foreground' : ''}
            >
              Active Projects
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleFilterChange('contractValue', 'high')}
              className={filters?.contractValue === 'high' ? 'bg-primary text-primary-foreground' : ''}
            >
              High Value
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientFilters;