import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const UserProfileModal = ({ isOpen, onClose, user }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !user) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'projects', label: 'Projects', icon: 'FolderOpen' },
    { id: 'activity', label: 'Activity', icon: 'Activity' },
    { id: 'settings', label: 'Settings', icon: 'Settings' }
  ];

  const mockProjects = [
    {
      id: 1,
      name: "Luxury Apartment Renovation",
      status: "in-progress",
      role: "Lead Designer",
      progress: 75,
      startDate: "2024-11-15",
      endDate: "2025-02-28"
    },
    {
      id: 2,
      name: "Corporate Office Design",
      status: "completed",
      role: "Designer",
      progress: 100,
      startDate: "2024-08-01",
      endDate: "2024-10-30"
    },
    {
      id: 3,
      name: "Restaurant Interior",
      status: "planning",
      role: "Consultant",
      progress: 25,
      startDate: "2025-01-10",
      endDate: "2025-04-15"
    }
  ];

  const mockActivity = [
    {
      id: 1,
      type: "project_update",
      message: "Updated design concepts for Luxury Apartment Renovation",
      timestamp: "2025-01-06 14:30",
      icon: "FileEdit"
    },
    {
      id: 2,
      type: "file_upload",
      message: "Uploaded 3D renderings for client review",
      timestamp: "2025-01-06 11:15",
      icon: "Upload"
    },
    {
      id: 3,
      type: "meeting",
      message: "Attended client presentation meeting",
      timestamp: "2025-01-05 16:00",
      icon: "Users"
    },
    {
      id: 4,
      type: "approval",
      message: "Approved material selection for Restaurant Interior",
      timestamp: "2025-01-05 09:45",
      icon: "CheckCircle"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'in-progress':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'planning':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-text-secondary border-border';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'project_update':
        return 'FileEdit';
      case 'file_upload':
        return 'Upload';
      case 'meeting':
        return 'Users';
      case 'approval':
        return 'CheckCircle';
      default:
        return 'Activity';
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-secondary">Full Name</label>
            <p className="text-primary font-medium">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Email</label>
            <p className="text-primary">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Role</label>
            <p className="text-primary capitalize">{user?.role}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Department</label>
            <p className="text-primary capitalize">{user?.department}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-secondary">Join Date</label>
            <p className="text-primary">{user?.joinDate}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Last Active</label>
            <p className="text-primary">{user?.lastActive}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Status</label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user?.status)}`}>
              {user?.status?.charAt(0)?.toUpperCase() + user?.status?.slice(1)}
            </span>
          </div>
          {user?.role !== 'client' && (
            <div>
              <label className="text-sm font-medium text-text-secondary">Utilization</label>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      user?.utilization >= 90 ? 'bg-error' :
                      user?.utilization >= 70 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${user?.utilization}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-primary">{user?.utilization}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="text-sm font-medium text-text-secondary">Skills & Expertise</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {user?.skills?.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary border border-secondary/20"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const ProjectsTab = () => (
    <div className="space-y-4">
      {mockProjects?.map((project) => (
        <div key={project?.id} className="bg-muted/30 rounded-lg p-4 border border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-primary">{project?.name}</h4>
              <p className="text-sm text-text-secondary mt-1">Role: {project?.role}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-text-secondary">
                <span>Start: {project?.startDate}</span>
                <span>End: {project?.endDate}</span>
              </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project?.status)}`}>
              {project?.status?.replace('-', ' ')}
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Progress</span>
              <span className="text-primary font-medium">{project?.progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-1">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${project?.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ActivityTab = () => (
    <div className="space-y-4">
      {mockActivity?.map((activity) => (
        <div key={activity?.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg border border-border">
          <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
            <Icon name={getActivityIcon(activity?.type)} size={16} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-primary">{activity?.message}</p>
            <p className="text-xs text-text-secondary mt-1">{activity?.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-lg p-4 border border-border">
        <h4 className="text-sm font-medium text-primary mb-3">Account Actions</h4>
        <div className="space-y-3">
          <Button variant="outline" size="sm" iconName="Mail" iconPosition="left" fullWidth>
            Send Password Reset
          </Button>
          <Button variant="outline" size="sm" iconName="UserX" iconPosition="left" fullWidth>
            Deactivate Account
          </Button>
          <Button variant="outline" size="sm" iconName="Shield" iconPosition="left" fullWidth>
            Change Role
          </Button>
        </div>
      </div>
      
      <div className="bg-error/5 rounded-lg p-4 border border-error/20">
        <h4 className="text-sm font-medium text-error mb-2">Danger Zone</h4>
        <p className="text-xs text-text-secondary mb-3">
          This action cannot be undone. This will permanently delete the user account.
        </p>
        <Button variant="destructive" size="sm" iconName="Trash2" iconPosition="left">
          Delete User
        </Button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'projects':
        return <ProjectsTab />;
      case 'activity':
        return <ActivityTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-200 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <Image
              src={user?.avatar}
              alt={user?.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold text-primary">{user?.name}</h2>
              <p className="text-sm text-text-secondary">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab?.id
                    ? 'border-accent text-accent' :'border-transparent text-text-secondary hover:text-primary hover:border-border'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;