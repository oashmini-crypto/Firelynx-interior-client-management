import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TicketFilters = ({ onFiltersChange, onClearFilters }) => {
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    status: '',
    assignee: '',
    project: '',
    dateRange: ''
  });

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const assigneeOptions = [
    { value: '', label: 'All Assignees' },
    { value: 'john-doe', label: 'John Doe' },
    { value: 'sarah-wilson', label: 'Sarah Wilson' },
    { value: 'mike-chen', label: 'Mike Chen' },
    { value: 'emma-davis', label: 'Emma Davis' },
    { value: 'unassigned', label: 'Unassigned' }
  ];

  const projectOptions = [
    { value: '', label: 'All Projects' },
    { value: 'luxury-apartment', label: 'Luxury Apartment Renovation' },
    { value: 'modern-office', label: 'Modern Office Design' },
    { value: 'boutique-hotel', label: 'Boutique Hotel Lobby' },
    { value: 'residential-villa', label: 'Residential Villa' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = {
      search: '',
      priority: '',
      status: '',
      assignee: '',
      project: '',
      dateRange: ''
    };
    setFilters(clearedFilters);
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-surface border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary">Filter Tickets</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            iconName="X"
            iconPosition="left"
          >
            Clear All
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className="xl:col-span-2">
          <Input
            type="search"
            placeholder="Search tickets..."
            value={filters?.search}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
            className="w-full"
          />
        </div>

        {/* Priority Filter */}
        <Select
          placeholder="Priority"
          options={priorityOptions}
          value={filters?.priority}
          onChange={(value) => handleFilterChange('priority', value)}
        />

        {/* Status Filter */}
        <Select
          placeholder="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
        />

        {/* Assignee Filter */}
        <Select
          placeholder="Assignee"
          options={assigneeOptions}
          value={filters?.assignee}
          onChange={(value) => handleFilterChange('assignee', value)}
        />

        {/* Project Filter */}
        <Select
          placeholder="Project"
          options={projectOptions}
          value={filters?.project}
          onChange={(value) => handleFilterChange('project', value)}
        />
      </div>
      {/* Date Range Filter */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          placeholder="Date Range"
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
        />
      </div>
    </div>
  );
};

export default TicketFilters;