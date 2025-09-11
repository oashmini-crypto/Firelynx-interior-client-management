import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ProfessionalSidebar from '../../components/ui/ProfessionalSidebar';
import NotificationCenter from '../../components/ui/NotificationCenter';
import UserMetricsPanel from './components/UserMetricsPanel';
import UserFilters from './components/UserFilters';
import UserTable from './components/UserTable';
import CreateUserModal from './components/CreateUserModal';
import UserProfileModal from './components/UserProfileModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { 
  useUsers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser, 
  useActivateUser, 
  useDeactivateUser, 
  useChangeUserRole, 
  useResetUserPassword 
} from '../../hooks/useProjectData';

// Stable empty object reference to prevent re-renders
const EMPTY_FILTERS = {};

const UserManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);

  // API hooks for user management - with error fallback to mock data for development
  const { data: apiUsers = [], isLoading, error } = useUsers();
  
  // Stable mock data reference to prevent infinite loops
  const MOCK_USERS = useMemo(() => [
    {
      id: '1',
      name: "Sarah Johnson",
      email: "sarah.johnson@firelynx.com",
      role: "admin",
      status: "active",
      department: "management",
      createdAt: "2023-01-15T00:00:00.000Z"
    },
    {
      id: '2', 
      name: "Michael Rodriguez",
      email: "michael.rodriguez@firelynx.com", 
      role: "manager",
      status: "active", 
      department: "design",
      createdAt: "2023-03-22T00:00:00.000Z"
    },
    {
      id: '3',
      name: "Emily Chen",
      email: "emily.chen@firelynx.com",
      role: "designer", 
      status: "active",
      department: "design",
      createdAt: "2023-05-10T00:00:00.000Z" 
    }
  ], []);
  
  // Use API data if available, otherwise fall back to mock data (stable reference)
  const users = useMemo(() => {
    return (apiUsers.length > 0 || !error) ? apiUsers : MOCK_USERS;
  }, [apiUsers, error, MOCK_USERS]);
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const activateUserMutation = useActivateUser();
  const deactivateUserMutation = useDeactivateUser();
  const changeRoleMutation = useChangeUserRole();
  const resetPasswordMutation = useResetUserPassword();

  // Mock notification counts
  const notificationCounts = {
    variations: 3,
    tickets: 7
  };

  // Filter users based on search and filters using useMemo to prevent infinite loops
  const filteredUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) {
      return [];
    }

    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        user?.skills?.some(skill => skill?.toLowerCase()?.includes(searchTerm?.toLowerCase()))
      );
    }

    // Apply other filters
    if (activeFilters?.role) {
      filtered = filtered.filter(user => user?.role === activeFilters?.role);
    }

    if (activeFilters?.department) {
      filtered = filtered.filter(user => user?.department === activeFilters?.department);
    }

    if (activeFilters?.status) {
      filtered = filtered.filter(user => user?.status === activeFilters?.status);
    }

    if (activeFilters?.skill) {
      filtered = filtered.filter(user =>
        user?.skills?.some(skill => 
          skill?.toLowerCase()?.replace(/\s+/g, '-') === activeFilters?.skill
        )
      );
    }

    return filtered;
  }, [users, searchTerm, activeFilters]);

  const handleCreateUser = async (newUser) => {
    try {
      await createUserMutation.mutateAsync(newUser);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user?.name}?`)) {
      try {
        await deleteUserMutation.mutateAsync(user.id);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      if (user?.status === 'active') {
        await deactivateUserMutation.mutateAsync(user.id);
      } else {
        await activateUserMutation.mutateAsync(user.id);
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleChangeRole = async (user, newRole) => {
    try {
      await changeRoleMutation.mutateAsync({ userId: user.id, newRole });
    } catch (error) {
      console.error('Failed to change user role:', error);
    }
  };

  const handleFiltersChange = useCallback((filters) => {
    setActiveFilters(filters);
  }, []);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveFilters(EMPTY_FILTERS);
    setSearchTerm('');
  }, []);

  // Calculate metrics with useMemo to prevent recalculation on every render
  const metrics = useMemo(() => {
    if (!users || !Array.isArray(users)) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        roleDistribution: { managers: 0, designers: 0, clients: 0 },
        departmentAllocation: { design: 0, management: 0, operations: 0, sales: 0 },
        utilizationStats: { high: 0, medium: 0, low: 0 }
      };
    }

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u?.status === 'active').length,
      roleDistribution: {
        managers: users.filter(u => u?.role === 'manager').length,
        designers: users.filter(u => u?.role === 'designer').length,
        clients: users.filter(u => u?.role === 'client').length
      },
      departmentAllocation: {
        design: users.filter(u => u?.department === 'design').length,
        management: users.filter(u => u?.department === 'management').length,
        operations: users.filter(u => u?.department === 'operations').length,
        sales: users.filter(u => u?.department === 'sales').length
      },
      utilizationStats: {
        high: users.filter(u => u?.utilization >= 90).length,
        medium: users.filter(u => u?.utilization >= 70 && u?.utilization < 90).length,
        low: users.filter(u => u?.utilization < 70).length
      }
    };
  }, [users]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <ProfessionalSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        notificationCounts={notificationCounts}
      />
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-60'} pb-16 md:pb-0`}>
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border z-50 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-primary">User Management</h1>
              <p className="text-text-secondary mt-1">
                Manage team members, roles, and permissions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <NotificationCenter 
                onMarkAsRead={() => {}}
                onMarkAllAsRead={() => {}}
              />
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                iconName="UserPlus"
                iconPosition="left"
              >
                Add User
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Metrics Panel */}
          <div className="mb-8">
            <UserMetricsPanel metrics={metrics} />
          </div>

          {/* Filters */}
          <UserFilters
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            onClearFilters={handleClearFilters}
          />

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-text-secondary">
                Showing {filteredUsers?.length} of {users?.length} users
              </p>
              {(searchTerm || Object.values(activeFilters)?.some(v => v)) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  iconName="X"
                  iconPosition="left"
                >
                  Clear all filters
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                iconPosition="left"
              >
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Filter"
                iconPosition="left"
              >
                Advanced Filters
              </Button>
            </div>
          </div>

          {/* User Table */}
          <UserTable
            users={filteredUsers}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onToggleStatus={handleToggleStatus}
            onChangeRole={handleChangeRole}
          />

          {/* Empty State */}
          {filteredUsers?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Users" size={32} className="text-text-secondary" />
              </div>
              <h3 className="text-lg font-medium text-primary mb-2">No users found</h3>
              <p className="text-text-secondary mb-4">
                {searchTerm || Object.values(activeFilters)?.some(v => v)
                  ? "Try adjusting your search or filters" : "Get started by adding your first team member"
                }
              </p>
              {!searchTerm && !Object.values(activeFilters)?.some(v => v) && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  iconName="UserPlus"
                  iconPosition="left"
                >
                  Add First User
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateUser={handleCreateUser}
      />
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagement;