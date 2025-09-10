import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const UserFilters = ({ onFiltersChange, onSearch, onClearFilters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'manager', label: 'Manager' },
    { value: 'designer', label: 'Designer' },
    { value: 'client', label: 'Client' }
  ];

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    { value: 'design', label: 'Design' },
    { value: 'management', label: 'Management' },
    { value: 'operations', label: 'Operations' },
    { value: 'sales', label: 'Sales' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' }
  ];

  const skillOptions = [
    { value: '', label: 'All Skills' },
    { value: 'interior-design', label: 'Interior Design' },
    { value: 'project-management', label: 'Project Management' },
    { value: '3d-modeling', label: '3D Modeling' },
    { value: 'client-relations', label: 'Client Relations' },
    { value: 'space-planning', label: 'Space Planning' },
    { value: 'color-theory', label: 'Color Theory' }
  ];

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleFilterChange = (filterType, value) => {
    const filters = {
      role: selectedRole,
      department: selectedDepartment,
      status: selectedStatus,
      skill: selectedSkill
    };

    filters[filterType] = value;

    switch (filterType) {
      case 'role':
        setSelectedRole(value);
        break;
      case 'department':
        setSelectedDepartment(value);
        break;
      case 'status':
        setSelectedStatus(value);
        break;
      case 'skill':
        setSelectedSkill(value);
        break;
    }

    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
    setSelectedDepartment('');
    setSelectedStatus('');
    setSelectedSkill('');

    if (onClearFilters) {
      onClearFilters();
    }
  };

  const hasActiveFilters = selectedRole || selectedDepartment || selectedStatus || selectedSkill || searchTerm;

  return (
    <div className="bg-card rounded-lg p-6 border border-border mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary">Filter Users</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            iconName="X"
            iconPosition="left"
          >
            Clear Filters
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            type="search"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>

        {/* Role Filter */}
        <Select
          placeholder="Filter by role"
          options={roleOptions}
          value={selectedRole}
          onChange={(value) => handleFilterChange('role', value)}
        />

        {/* Department Filter */}
        <Select
          placeholder="Filter by department"
          options={departmentOptions}
          value={selectedDepartment}
          onChange={(value) => handleFilterChange('department', value)}
        />

        {/* Status Filter */}
        <Select
          placeholder="Filter by status"
          options={statusOptions}
          value={selectedStatus}
          onChange={(value) => handleFilterChange('status', value)}
        />

        {/* Skill Filter */}
        <Select
          placeholder="Filter by skill"
          options={skillOptions}
          value={selectedSkill}
          onChange={(value) => handleFilterChange('skill', value)}
          searchable
        />
      </div>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="text-sm text-text-secondary">Active filters:</span>
            
            {searchTerm && (
              <div className="flex items-center space-x-1 bg-accent/10 text-accent px-2 py-1 rounded-md text-sm">
                <Icon name="Search" size={12} />
                <span>"{searchTerm}"</span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    if (onSearch) onSearch('');
                  }}
                  className="ml-1 hover:text-accent-foreground"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
            )}

            {selectedRole && (
              <div className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                <Icon name="Shield" size={12} />
                <span>{roleOptions?.find(r => r?.value === selectedRole)?.label}</span>
                <button
                  onClick={() => handleFilterChange('role', '')}
                  className="ml-1 hover:text-primary-foreground"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
            )}

            {selectedDepartment && (
              <div className="flex items-center space-x-1 bg-success/10 text-success px-2 py-1 rounded-md text-sm">
                <Icon name="Building" size={12} />
                <span>{departmentOptions?.find(d => d?.value === selectedDepartment)?.label}</span>
                <button
                  onClick={() => handleFilterChange('department', '')}
                  className="ml-1 hover:text-success-foreground"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
            )}

            {selectedStatus && (
              <div className="flex items-center space-x-1 bg-warning/10 text-warning px-2 py-1 rounded-md text-sm">
                <Icon name="Activity" size={12} />
                <span>{statusOptions?.find(s => s?.value === selectedStatus)?.label}</span>
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-1 hover:text-warning-foreground"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
            )}

            {selectedSkill && (
              <div className="flex items-center space-x-1 bg-secondary/10 text-secondary px-2 py-1 rounded-md text-sm">
                <Icon name="Award" size={12} />
                <span>{skillOptions?.find(s => s?.value === selectedSkill)?.label}</span>
                <button
                  onClick={() => handleFilterChange('skill', '')}
                  className="ml-1 hover:text-secondary-foreground"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFilters;