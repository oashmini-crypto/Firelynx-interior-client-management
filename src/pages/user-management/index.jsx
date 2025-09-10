import React, { useState, useEffect } from 'react';
import ProfessionalSidebar from '../../components/ui/ProfessionalSidebar';
import NotificationCenter from '../../components/ui/NotificationCenter';
import UserMetricsPanel from './components/UserMetricsPanel';
import UserFilters from './components/UserFilters';
import UserTable from './components/UserTable';
import CreateUserModal from './components/CreateUserModal';
import UserProfileModal from './components/UserProfileModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const UserManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  // Mock notification counts
  const notificationCounts = {
    variations: 3,
    tickets: 7
  };

  // Initialize with default users
  useEffect(() => {
    const defaultUsers = [
      {
        id: 1,
        name: "Sarah Johnson",
        email: "sarah.johnson@firelynx.com",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        role: "manager",
        department: "management",
        skills: ["Project Management", "Client Relations", "Team Leadership"],
        utilization: 85,
        status: "active",
        joinDate: "2023-01-15",
        lastActive: "2025-01-06"
      },
      {
        id: 2,
        name: "Michael Rodriguez",
        email: "michael.rodriguez@firelynx.com",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        role: "designer",
        department: "design",
        skills: ["Interior Design", "3D Modeling", "Space Planning"],
        utilization: 92,
        status: "active",
        joinDate: "2023-03-22",
        lastActive: "2025-01-06"
      },
      {
        id: 3,
        name: "Emily Chen",
        email: "emily.chen@firelynx.com",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        role: "designer",
        department: "design",
        skills: ["Color Theory", "Furniture Selection", "Lighting Design"],
        utilization: 78,
        status: "active",
        joinDate: "2023-05-10",
        lastActive: "2025-01-05"
      },
      {
        id: 4,
        name: "David Thompson",
        email: "david.thompson@client.com",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        role: "client",
        department: "external",
        skills: ["Business Development", "Real Estate"],
        utilization: 0,
        status: "active",
        joinDate: "2024-02-18",
        lastActive: "2025-01-04"
      },
      {
        id: 5,
        name: "Lisa Wang",
        email: "lisa.wang@firelynx.com",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        role: "designer",
        department: "design",
        skills: ["Sustainable Design", "Material Selection", "CAD"],
        utilization: 88,
        status: "active",
        joinDate: "2023-08-14",
        lastActive: "2025-01-06"
      },
      {
        id: 6,
        name: "James Wilson",
        email: "james.wilson@firelynx.com",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        role: "manager",
        department: "operations",
        skills: ["Operations Management", "Quality Control", "Process Optimization"],
        utilization: 75,
        status: "inactive",
        joinDate: "2022-11-30",
        lastActive: "2024-12-20"
      }
    ];

    setUsers(defaultUsers);
    setFilteredUsers(defaultUsers);
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered?.filter(user =>
        user?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        user?.skills?.some(skill => skill?.toLowerCase()?.includes(searchTerm?.toLowerCase()))
      );
    }

    // Apply other filters
    if (activeFilters?.role) {
      filtered = filtered?.filter(user => user?.role === activeFilters?.role);
    }

    if (activeFilters?.department) {
      filtered = filtered?.filter(user => user?.department === activeFilters?.department);
    }

    if (activeFilters?.status) {
      filtered = filtered?.filter(user => user?.status === activeFilters?.status);
    }

    if (activeFilters?.skill) {
      filtered = filtered?.filter(user =>
        user?.skills?.some(skill => 
          skill?.toLowerCase()?.replace(/\s+/g, '-') === activeFilters?.skill
        )
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, activeFilters]);

  const handleCreateUser = (newUser) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user?.name}?`)) {
      setUsers(prev => prev?.filter(u => u?.id !== user?.id));
    }
  };

  const handleToggleStatus = (user) => {
    const newStatus = user?.status === 'active' ? 'inactive' : 'active';
    setUsers(prev => prev?.map(u => 
      u?.id === user?.id ? { ...u, status: newStatus } : u
    ));
  };

  // Add this block - missing handler for role changes
  const handleChangeRole = (user, newRole) => {
    setUsers(prev => prev?.map(u => 
      u?.id === user?.id ? { ...u, role: newRole } : u
    ));
  };

  const handleFiltersChange = (filters) => {
    setActiveFilters(filters);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
  };

  // Calculate metrics
  const metrics = {
    totalUsers: users?.length,
    activeUsers: users?.filter(u => u?.status === 'active')?.length,
    roleDistribution: {
      managers: users?.filter(u => u?.role === 'manager')?.length,
      designers: users?.filter(u => u?.role === 'designer')?.length,
      clients: users?.filter(u => u?.role === 'client')?.length
    },
    departmentAllocation: {
      design: users?.filter(u => u?.department === 'design')?.length,
      management: users?.filter(u => u?.department === 'management')?.length,
      operations: users?.filter(u => u?.department === 'operations')?.length,
      sales: users?.filter(u => u?.department === 'sales')?.length
    },
    utilizationStats: {
      high: users?.filter(u => u?.utilization >= 90)?.length,
      medium: users?.filter(u => u?.utilization >= 70 && u?.utilization < 90)?.length,
      low: users?.filter(u => u?.utilization < 70)?.length
    }
  };

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