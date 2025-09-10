import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const UserTable = ({ users = [], onEditUser, onDeleteUser, onChangeRole, onToggleStatus }) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

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

  const userData = users?.length > 0 ? users : defaultUsers;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedUsers = [...userData]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];

    if (typeof aValue === 'string') {
      aValue = aValue?.toLowerCase();
      bValue = bValue?.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'manager':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'designer':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'client':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-text-secondary border-border';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'inactive':
        return 'bg-error/10 text-error border-error/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-text-secondary border-border';
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return 'text-error';
    if (utilization >= 70) return 'text-warning';
    return 'text-success';
  };

  const SortableHeader = ({ field, children }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-smooth"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <div className="flex flex-col">
          <Icon
            name="ChevronUp"
            size={12}
            className={`${sortField === field && sortDirection === 'asc' ? 'text-primary' : 'text-text-secondary/50'}`}
          />
          <Icon
            name="ChevronDown"
            size={12}
            className={`${sortField === field && sortDirection === 'desc' ? 'text-primary' : 'text-text-secondary/50'} -mt-1`}
          />
        </div>
      </div>
    </th>
  );

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/30">
            <tr>
              <SortableHeader field="name">User</SortableHeader>
              <SortableHeader field="role">Role</SortableHeader>
              <SortableHeader field="department">Department</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Skills
              </th>
              <SortableHeader field="utilization">Utilization</SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader field="lastActive">Last Active</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {sortedUsers?.map((user) => (
              <tr key={user?.id} className="hover:bg-muted/30 transition-smooth">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Image
                        src={user?.avatar}
                        alt={user?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-primary">{user?.name}</div>
                      <div className="text-sm text-text-secondary">{user?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-primary capitalize">{user?.department}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user?.skills?.slice(0, 2)?.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary/10 text-secondary"
                      >
                        {skill}
                      </span>
                    ))}
                    {user?.skills?.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-text-secondary">
                        +{user?.skills?.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user?.role !== 'client' ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            user?.utilization >= 90 ? 'bg-error' :
                            user?.utilization >= 70 ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${user?.utilization}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getUtilizationColor(user?.utilization)}`}>
                        {user?.utilization}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-text-secondary">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(user?.status)}`}>
                    {user?.status?.charAt(0)?.toUpperCase() + user?.status?.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {user?.lastActive}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditUser && onEditUser(user)}
                      iconName="Edit"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus && onToggleStatus(user)}
                      iconName={user?.status === 'active' ? 'UserX' : 'UserCheck'}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteUser && onDeleteUser(user)}
                      iconName="Trash2"
                      className="text-error hover:text-error"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-border">
        {sortedUsers?.map((user) => (
          <div key={user?.id} className="p-4">
            <div className="flex items-start space-x-3">
              <Image
                src={user?.avatar}
                alt={user?.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-primary">{user?.name}</h3>
                    <p className="text-sm text-text-secondary">{user?.email}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditUser && onEditUser(user)}
                      iconName="Edit"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus && onToggleStatus(user)}
                      iconName={user?.status === 'active' ? 'UserX' : 'UserCheck'}
                    />
                  </div>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(user?.status)}`}>
                    {user?.status?.charAt(0)?.toUpperCase() + user?.status?.slice(1)}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-text-secondary">
                    {user?.department}
                  </span>
                </div>

                {user?.role !== 'client' && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs text-text-secondary">Utilization:</span>
                    <div className="flex-1 bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          user?.utilization >= 90 ? 'bg-error' :
                          user?.utilization >= 70 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${user?.utilization}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${getUtilizationColor(user?.utilization)}`}>
                      {user?.utilization}%
                    </span>
                  </div>
                )}

                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {user?.skills?.slice(0, 3)?.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary/10 text-secondary"
                      >
                        {skill}
                      </span>
                    ))}
                    {user?.skills?.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-text-secondary">
                        +{user?.skills?.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserTable;