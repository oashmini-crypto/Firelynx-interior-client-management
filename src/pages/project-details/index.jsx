import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useProject } from '../../hooks/useProjects';
import ProfessionalSidebar from '../../components/ui/ProfessionalSidebar';
import NotificationCenter from '../../components/ui/NotificationCenter';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

import Icon from '../../components/AppIcon';
import ProjectOverview from './components/ProjectOverview';
import ProjectMilestones from './components/ProjectMilestones';
import ProjectApprovals from './components/ProjectApprovals';
import ProjectInvoices from './components/ProjectInvoices';
import ProjectVariations from './components/ProjectVariations';
import ProjectTeam from './components/ProjectTeam';
import ProjectTickets from './components/ProjectTickets';
import ProjectFiles from './components/ProjectFiles';

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState(searchParams?.get('tab') || 'overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get project data from API
  const { 
    project: apiProject, 
    loading: projectLoading, 
    error: projectError 
  } = useProject(projectId);
  
  // Transform API data to match component expectations
  const project = apiProject ? {
    ...apiProject,
    client: { 
      name: apiProject.clientName || 'Unknown Client', 
      id: apiProject.clientId,
      company: apiProject.clientCompany,
      email: apiProject.clientEmail,
      phone: apiProject.clientPhone,
      address: apiProject.clientAddress
    }
  } : null;

  const [editForm, setEditForm] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || '',
    priority: project?.priority || '',
    budget: project?.budget || 0,
    startDate: project?.startDate || '',
    targetDate: project?.targetDate || '',
    progress: project?.progress || 0
  });

  // Mock notification counts
  const notificationCounts = {
    variations: 3,
    tickets: 7
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'milestones', label: 'Milestones', icon: 'Target' },
    { id: 'approvals', label: 'Approvals', icon: 'CheckCircle' },
    { id: 'invoices', label: 'Invoices', icon: 'FileText' },
    { id: 'variations', label: 'Variations', icon: 'GitBranch' },
    { id: 'team', label: 'Team', icon: 'Users' },
    { id: 'tickets', label: 'Tickets', icon: 'MessageSquare' },
    { id: 'files', label: 'Files', icon: 'Folder' }
  ];

  const statusOptions = [
    { value: 'Planned', label: 'Planned' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Completed', label: 'Completed' }
  ];

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' }
  ];

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Handle tab changes and URL updates
  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && tabs?.find(t => t?.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams, tabs]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleBackToProjects = () => {
    // Preserve filters/search state when going back
    navigate('/projects', { state: { preserveFilters: true } });
  };

  const handleEditProject = () => {
    setEditForm({
      title: project?.title || '',
      description: project?.description || '',
      status: project?.status || '',
      priority: project?.priority || '',
      budget: project?.budget || 0,
      startDate: project?.startDate || '',
      targetDate: project?.targetDate || '',
      progress: project?.progress || 0
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProject = async () => {
    try {
      // Update project with form data
      const updatedProject = {
        ...project,
        ...editForm,
        lastUpdated: new Date()?.toISOString()?.split('T')?.[0]
      };
      setProject(updatedProject);
      setIsEditModalOpen(false);
      
      // Show success toast
      console.log('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async () => {
    try {
      // Delete project logic here
      console.log('Project deleted successfully');
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Planned': 'text-gray-600 bg-gray-100',
      'In Progress': 'text-blue-600 bg-blue-100',
      'On Hold': 'text-yellow-600 bg-yellow-100',
      'Completed': 'text-green-600 bg-green-100'
    };
    return colors?.[status] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'text-green-600 bg-green-100',
      'Medium': 'text-yellow-600 bg-yellow-100',
      'High': 'text-orange-600 bg-orange-100',
      'Urgent': 'text-red-600 bg-red-100'
    };
    return colors?.[priority] || 'text-gray-600 bg-gray-100';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProjectOverview project={project} />;
      case 'milestones':
        return <ProjectMilestones projectId={project?.id} />;
      case 'approvals':
        return <ProjectApprovals projectId={project?.id} />;
      case 'invoices':
        return <ProjectInvoices projectId={project?.id} />;
      case 'variations':
        return <ProjectVariations projectId={project?.id} />;
      case 'team':
        return <ProjectTeam projectId={project?.id} />;
      case 'tickets':
        return <ProjectTickets projectId={project?.id} />;
      case 'files':
        return <ProjectFiles projectId={project?.id} />;
      default:
        return <ProjectOverview project={project} />;
    }
  };

  // Handle loading state
  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-foreground mb-2">Loading project...</h3>
          <p className="text-text-secondary">Please wait while we fetch your project data.</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (projectError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertTriangle" size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Error loading project</h3>
          <p className="text-text-secondary mb-4">{projectError}</p>
          <div className="space-x-3">
            <Button onClick={() => window.location.reload()} iconName="RefreshCw">
              Retry
            </Button>
            <Button variant="outline" onClick={() => navigate('/projects')}>
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle project not found
  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Project Not Found</h1>
          <p className="text-text-secondary mb-6">The project you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <ProfessionalSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
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
              <Button
                variant="ghost"
                onClick={handleBackToProjects}
                iconName="ArrowLeft"
                className="text-text-secondary hover:text-foreground"
              >
                Back to Projects
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationCenter 
                onMarkAsRead={(id) => console.log('Marking notification as read:', id)}
                onMarkAllAsRead={() => console.log('Marking all notifications as read')}
              />
            </div>
          </div>
        </header>

        {/* Project Header */}
        <div className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-semibold text-card-foreground">{project?.title}</h1>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(project?.status)}`}>
                  {project?.status}
                </span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(project?.priority)}`}>
                  {project?.priority}
                </span>
              </div>
              <p className="text-text-secondary mb-4">{project?.client?.name}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-text-secondary">Budget:</span>
                  <div className="font-medium">{formatCurrency(project?.budget)}</div>
                </div>
                <div>
                  <span className="text-text-secondary">Progress:</span>
                  <div className="font-medium">{project?.progress}%</div>
                </div>
                <div>
                  <span className="text-text-secondary">Start Date:</span>
                  <div className="font-medium">{formatDate(project?.startDate)}</div>
                </div>
                <div>
                  <span className="text-text-secondary">Target Date:</span>
                  <div className="font-medium">{formatDate(project?.targetDate)}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleEditProject}
                iconName="Edit"
              >
                Edit Project
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                iconName="Trash2"
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Overall Progress</span>
              <span className="text-sm font-medium">{project?.progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-smooth" 
                style={{ width: `${project?.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-card border-b border-border px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => handleTabChange(tab?.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 transition-smooth ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-foreground hover:border-muted'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {renderTabContent()}
        </main>
      </div>

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Edit Project</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditModalOpen(false)}
                  iconName="X"
                />
              </div>

              <div className="space-y-4">
                <Input
                  label="Project Title"
                  value={editForm?.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e?.target?.value })}
                  required
                />

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <textarea
                    value={editForm?.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e?.target?.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Project description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Status"
                    value={editForm?.status}
                    onChange={(value) => setEditForm({ ...editForm, status: value })}
                    options={statusOptions}
                  />

                  <Select
                    label="Priority"
                    value={editForm?.priority}
                    onChange={(value) => setEditForm({ ...editForm, priority: value })}
                    options={priorityOptions}
                  />
                </div>

                <Input
                  label="Budget"
                  type="number"
                  value={editForm?.budget}
                  onChange={(e) => setEditForm({ ...editForm, budget: parseFloat(e?.target?.value) })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    type="date"
                    value={editForm?.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e?.target?.value })}
                  />

                  <Input
                    label="Target Date"
                    type="date"
                    value={editForm?.targetDate}
                    onChange={(e) => setEditForm({ ...editForm, targetDate: e?.target?.value })}
                  />
                </div>

                <Input
                  label="Progress (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={editForm?.progress}
                  onChange={(e) => setEditForm({ ...editForm, progress: parseInt(e?.target?.value) })}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveProject}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Icon name="AlertTriangle" size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Delete Project</h3>
              <p className="text-text-secondary text-center mb-6">
                Are you sure you want to delete "{project?.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteProject}
                >
                  Delete Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;