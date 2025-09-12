import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessionalSidebar from '../../components/ui/ProfessionalSidebar';
import NotificationCenter from '../../components/ui/NotificationCenter';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import { useProjects } from '../../hooks/useProjects';
import { useNotificationCounts } from '../../hooks/useNotificationCounts';
import { activityLogsAPI } from '../../services/api';

const ActivityLog = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Data states
  const [activityLogs, setActivityLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedActionType, setSelectedActionType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  });

  const { projects } = useProjects();
  const { notificationCounts } = useNotificationCounts();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Format helper functions
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatActivityTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    }
  };

  // Fetch activity logs with filters
  const fetchActivityLogs = async (resetPagination = true) => {
    try {
      setLoading(true);
      
      const params = {
        limit: pagination.limit,
        offset: resetPagination ? 0 : pagination.offset
      };

      // Apply filters
      if (selectedProject !== 'all') params.projectId = selectedProject;
      if (selectedUser !== 'all') params.userId = selectedUser;
      if (selectedActionType !== 'all') params.actionType = selectedActionType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await activityLogsAPI.getActivityLogs(params);
      
      if (response.success) {
        if (resetPagination) {
          setActivityLogs(response.data);
        } else {
          setActivityLogs(prev => [...prev, ...response.data]);
        }
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('❌ Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for filter dropdown
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/team');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
    }
  };

  // Load data on component mount and filter changes
  useEffect(() => {
    fetchActivityLogs(true);
  }, [selectedProject, selectedUser, selectedActionType, startDate, endDate]);

  // Load users once
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle sidebar toggle
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Load more activities (pagination)
  const loadMore = () => {
    setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
    fetchActivityLogs(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedProject('all');
    setSelectedUser('all');
    setSelectedActionType('all');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  // Export to CSV
  const exportToCSV = async () => {
    try {
      setExportLoading(true);
      
      const params = new URLSearchParams();
      if (selectedProject !== 'all') params.append('projectId', selectedProject);
      if (selectedUser !== 'all') params.append('userId', selectedUser);
      if (selectedActionType !== 'all') params.append('actionType', selectedActionType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/activity-logs/export/csv?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('❌ Failed to export activity logs:', error);
    } finally {
      setExportLoading(false);
    }
  };

  // Filter options
  const projectOptions = [
    { value: 'all', label: 'All Projects' },
    ...(projects?.map(project => ({
      value: project.id,
      label: project.title
    })) || [])
  ];

  const userOptions = [
    { value: 'all', label: 'All Users' },
    ...users.map(user => ({
      value: user.id,
      label: user.name
    }))
  ];

  const actionTypeOptions = [
    { value: 'all', label: 'All Actions' },
    { value: 'file_upload', label: 'File Upload' },
    { value: 'milestone_create', label: 'Milestone Created' },
    { value: 'milestone_update', label: 'Milestone Updated' },
    { value: 'milestone_complete', label: 'Milestone Completed' },
    { value: 'approval_create', label: 'Approval Created' },
    { value: 'approval_send', label: 'Approval Sent' },
    { value: 'variation_create', label: 'Variation Created' },
    { value: 'variation_submit', label: 'Variation Submitted' },
    { value: 'invoice_create', label: 'Invoice Created' },
    { value: 'invoice_send', label: 'Invoice Sent' },
    { value: 'ticket_create', label: 'Ticket Created' },
    { value: 'team_add_member', label: 'Team Member Added' },
    { value: 'project_create', label: 'Project Created' },
    { value: 'project_update', label: 'Project Updated' }
  ];

  // Get action type display name
  const getActionTypeDisplay = (actionType) => {
    const option = actionTypeOptions.find(opt => opt.value === actionType);
    return option ? option.label : actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get action type icon
  const getActionTypeIcon = (actionType) => {
    if (actionType.includes('file')) return 'File';
    if (actionType.includes('milestone')) return 'Target';
    if (actionType.includes('approval')) return 'CheckCircle';
    if (actionType.includes('variation')) return 'GitBranch';
    if (actionType.includes('invoice')) return 'Receipt';
    if (actionType.includes('ticket')) return 'MessageSquare';
    if (actionType.includes('team')) return 'Users';
    if (actionType.includes('project')) return 'Folder';
    return 'Activity';
  };

  // Filter activities based on search term
  const filteredActivities = activityLogs.filter(activity => 
    searchTerm === '' || 
    activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Sidebar */}
      <ProfessionalSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
        notificationCounts={notificationCounts}
      />

      {/* Main Content */}
      <div className={`transition-smooth ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-60'} pb-16 md:pb-0`}>
        {/* Header */}
        <header className="sticky top-0 bg-surface border-b border-border z-50 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="md:hidden">
                <button
                  onClick={handleToggleSidebar}
                  className="p-2 rounded-lg hover:bg-muted transition-smooth"
                >
                  <Icon name="Menu" size={20} />
                </button>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Activity Log</h1>
                <p className="text-sm text-text-secondary hidden sm:block">
                  {filteredActivities?.length} activities • {formatDate(currentTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationCenter 
                onMarkAsRead={(id) => console.log('Marking notification as read:', id)}
                onMarkAllAsRead={() => console.log('Marking all notifications as read')}
              />
              <div className="hidden sm:flex items-center space-x-2 text-sm text-text-secondary">
                <Icon name="Clock" size={16} />
                <span>{formatTime(currentTime)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Filters and Search */}
        <div className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-4">
          <div className="space-y-4">
            {/* Search and Export */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  iconName="X"
                  size="sm"
                >
                  Clear Filters
                </Button>
                <Button
                  onClick={exportToCSV}
                  loading={exportLoading}
                  iconName="Download"
                  size="sm"
                >
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select
                value={selectedProject}
                onChange={setSelectedProject}
                options={projectOptions}
                placeholder="All Projects"
              />
              
              <Select
                value={selectedUser}
                onChange={setSelectedUser}
                options={userOptions}
                placeholder="All Users"
              />
              
              <Select
                value={selectedActionType}
                onChange={setSelectedActionType}
                options={actionTypeOptions}
                placeholder="All Actions"
              />
              
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />
              
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
              />
            </div>
          </div>
        </div>

        {/* Activity List */}
        <main className="p-4 sm:p-6 lg:p-8">
          {loading && filteredActivities.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Icon name="Loader" size={32} className="text-muted-foreground animate-spin mx-auto mb-4" />
                <p className="text-text-secondary">Loading activity logs...</p>
              </div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Icon name="Activity" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Activities Found</h3>
                <p className="text-text-secondary">Try adjusting your filters or search terms.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Activity Items */}
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="divide-y divide-border">
                  {filteredActivities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-muted/50 transition-smooth">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Icon 
                              name={getActionTypeIcon(activity.actionType)} 
                              size={20} 
                              className="text-primary" 
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-foreground">
                                {activity.userName || 'Unknown User'}
                              </p>
                              <span className="text-text-secondary">•</span>
                              <p className="text-sm text-text-secondary">
                                {activity.projectTitle || 'Unknown Project'}
                              </p>
                            </div>
                            <p className="text-xs text-text-secondary">
                              {formatActivityTime(activity.createdAt)}
                            </p>
                          </div>
                          
                          <p className="text-sm text-foreground mt-1">
                            {activity.description}
                          </p>
                          
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                              {getActionTypeDisplay(activity.actionType)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Load More Button */}
              {pagination.hasMore && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    loading={loading}
                    iconName="ChevronDown"
                  >
                    Load More Activities
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ActivityLog;