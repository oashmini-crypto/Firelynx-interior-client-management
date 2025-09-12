import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import ProfessionalSidebar from '../../components/ui/ProfessionalSidebar';
import NotificationCenter from '../../components/ui/NotificationCenter';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import Icon from '../../components/AppIcon';
import ProjectCard from './components/ProjectCard';
import CreateProjectModal from './components/CreateProjectModal';

const ProjectsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedTeamMember, setSelectedTeamMember] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Get projects from API - force reload
  const { 
    projects: apiProjects, 
    loading: projectsLoading, 
    error: projectsError, 
    refetch: refetchProjects,
    createProject: apiCreateProject, 
    updateProject: apiUpdateProject, 
    deleteProject: apiDeleteProject 
  } = useProjects();
  
  // Transform API data to match component expectations
  const projects = apiProjects.map(project => ({
    ...project,
    client: { 
      name: project.clientName || 'Unknown Client', 
      id: project.clientId,
      company: project.clientCompany 
    },
    teamMembers: [], // TODO: Load team members separately
    thumbnail: null,
    lastActivity: project.updatedAt || project.createdAt,
    milestones: { completed: 0, total: 0 }, // TODO: Load milestones separately
    approvals: { pending: 0, total: 0 }, // TODO: Load approvals separately
    tickets: { open: 0, total: 0 }, // TODO: Load tickets separately
    priority: project.priority || 'Medium'
  }));

  // Filter options based on actual project data
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Planning', label: 'Planning' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Completed', label: 'Completed' }
  ];

  const clientOptions = [
    { value: '', label: 'All Clients' },
    // Extract unique clients from projects
    ...projects.reduce((acc, project) => {
      if (project.client && !acc.find(c => c.value === project.client.id)) {
        acc.push({
          value: project.client.id,
          label: project.client.name
        });
      }
      return acc;
    }, [])
  ];

  const teamMemberOptions = [
    { value: '', label: 'All Team Members' },
    // TODO: Load team members from API
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'title', label: 'Project Name' },
    { value: 'targetDate', label: 'Deadline' },
    { value: 'budget', label: 'Budget' },
    { value: 'lastActivity', label: 'Last Activity' },
    { value: 'progress', label: 'Progress' }
  ];

  // Mock notification counts
  const notificationCounts = {
    variations: 3,
    tickets: 7
  };

  // Filter and sort projects - Move this before functions that use it
  const filteredProjects = projects?.filter(project => {
    // Text search
    if (searchTerm && !project?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) &&
        !project?.client?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) &&
        !project?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase())) {
      return false;
    }

    // Status filter
    if (selectedStatus && project?.status !== selectedStatus) {
      return false;
    }

    // Client filter
    if (selectedClient && project?.client?.id !== selectedClient) {
      return false;
    }

    // Team member filter
    if (selectedTeamMember && !project?.teamMembers?.some(tm => tm?.id === selectedTeamMember)) {
      return false;
    }

    // Date range filter
    if (dateRange?.start && new Date(project?.createdAt) < new Date(dateRange?.start)) {
      return false;
    }
    if (dateRange?.end && new Date(project?.createdAt) > new Date(dateRange?.end)) {
      return false;
    }

    return true;
  })?.sort((a, b) => {
    let aVal = a?.[sortBy];
    let bVal = b?.[sortBy];

    // Handle different data types
    if (sortBy === 'createdAt' || sortBy === 'targetDate' || sortBy === 'lastActivity') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else if (typeof aVal === 'string') {
      aVal = aVal?.toLowerCase();
      bVal = bVal?.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Restore filters from location state if coming back from project details
  useEffect(() => {
    if (location?.state?.preserveFilters && location?.state?.filters) {
      const filters = location?.state?.filters;
      setSearchTerm(filters?.searchTerm || '');
      setSelectedStatus(filters?.selectedStatus || '');
      setSelectedClient(filters?.selectedClient || '');
      setSelectedTeamMember(filters?.selectedTeamMember || '');
      setSortBy(filters?.sortBy || 'createdAt');
      setSortOrder(filters?.sortOrder || 'desc');
    }
  }, [location?.state]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleProjectClick = (project) => {
    // Save current filters in navigation state
    const currentFilters = {
      searchTerm,
      selectedStatus,
      selectedClient,
      selectedTeamMember,
      sortBy,
      sortOrder
    };
    
    navigate(`/projects/${project?.id}`, { 
      state: { 
        backFilters: currentFilters 
      } 
    });
  };

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await apiCreateProject({
        ...projectData,
        progress: 0,
        spent: '0',
        startDate: projectData.startDate || new Date().toISOString().split('T')[0],
        targetDate: projectData.targetDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days from now
      });
      
      setShowCreateModal(false);
      console.log('Project created successfully:', newProject);
      
      // Navigate to new project - transform to match expected structure
      const transformedProject = {
        ...newProject,
        client: { 
          name: newProject.clientName || 'Unknown Client', 
          id: newProject.clientId 
        },
        teamMembers: [],
        lastActivity: newProject.updatedAt || newProject.createdAt,
        milestones: { completed: 0, total: 0 },
        approvals: { pending: 0, total: 0 },
        tickets: { open: 0, total: 0 }
      };
      
      handleProjectClick(transformedProject);
    } catch (error) {
      console.error('Error creating project:', error);
      // TODO: Show error toast to user
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedProjects?.length === 0) return;
    
    try {
      // Update each selected project via API
      const updatePromises = selectedProjects.map(projectId => 
        apiUpdateProject(projectId, { 
          status, 
          lastActivity: new Date().toISOString()
        })
      );
      
      await Promise.all(updatePromises);
      
      // Clear selection and refetch to get updated data
      setSelectedProjects([]);
      refetchProjects();
      
      console.log(`Updated ${selectedProjects.length} projects to ${status}`);
    } catch (error) {
      console.error('Error updating projects:', error);
      // TODO: Show error toast to user
    }
  };

  const handleProjectToggle = (projectId) => {
    setSelectedProjects(prev => 
      prev?.includes(projectId) 
        ? prev?.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProjects?.length === filteredProjects?.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects?.map(p => p?.id));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedClient('');
    setSelectedTeamMember('');
    setDateRange({ start: '', end: '' });
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
              <div>
                <h1 className="text-xl font-semibold text-foreground">Projects</h1>
                <p className="text-sm text-text-secondary hidden sm:block">
                  {filteredProjects?.length} of {projects?.length} projects
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
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search projects, clients, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center space-x-2">
              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={statusOptions}
                placeholder="Status"
                className="min-w-32"
              />

              <Select
                value={selectedClient}
                onChange={setSelectedClient}
                options={clientOptions}
                placeholder="Client"
                className="min-w-36"
              />

              <Select
                value={selectedTeamMember}
                onChange={setSelectedTeamMember}
                options={teamMemberOptions}
                placeholder="Team"
                className="min-w-36"
              />

              <div className="flex items-center space-x-2">
                <Input
                  type="date"
                  placeholder="Start date"
                  value={dateRange?.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e?.target?.value })}
                  className="w-40"
                />
                <span className="text-text-secondary">to</span>
                <Input
                  type="date"
                  placeholder="End date"
                  value={dateRange?.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e?.target?.value })}
                  className="w-40"
                />
              </div>

              <Button variant="outline" onClick={clearFilters} iconName="X" size="sm">
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-card px-4 sm:px-6 lg:px-8 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Bulk Selection */}
              {filteredProjects?.length > 0 && (
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedProjects?.length === filteredProjects?.length}
                    onChange={handleSelectAll}
                    label={`Select all (${filteredProjects?.length})`}
                  />
                  
                  {selectedProjects?.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-text-secondary">
                        {selectedProjects?.length} selected
                      </span>
                      <Select
                        placeholder="Bulk Actions"
                        onChange={(value) => value && handleBulkStatusUpdate(value)}
                        options={[
                          { value: 'In Progress', label: 'Mark In Progress' },
                          { value: 'On Hold', label: 'Mark On Hold' },
                          { value: 'Completed', label: 'Mark Completed' }
                        ]}
                        className="min-w-32"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Sort */}
              <div className="flex items-center space-x-2">
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  options={sortOptions}
                  className="min-w-36"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  iconName={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'}
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-surface hover:bg-muted'} transition-smooth`}
                >
                  <Icon name="Grid3X3" size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-surface hover:bg-muted'} transition-smooth`}
                >
                  <Icon name="List" size={16} />
                </button>
              </div>

              {/* New Project Button */}
              <Button onClick={() => setShowCreateModal(true)} iconName="Plus">
                New Project
              </Button>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        <main className="p-4 sm:p-6 lg:px-8">
          {projectsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : projectsError ? (
            <div className="text-center py-12">
              <Icon name="AlertTriangle" size={48} className="text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Error loading projects
              </h3>
              <p className="text-text-secondary mb-4">
                {projectsError}
              </p>
              {projectsError.includes('Unable to connect') && (
                <p className="text-sm text-text-secondary mb-4">
                  Retrying automatically in 5 seconds...
                </p>
              )}
              <div className="space-x-3">
                <Button onClick={() => refetchProjects()} iconName="RefreshCw">
                  Retry Now
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              </div>
            </div>
          ) : filteredProjects?.length > 0 ? (
            <div className={`${
              viewMode === 'grid' ?'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' :'space-y-4'
            }`}>
              {filteredProjects?.map((project) => (
                <ProjectCard
                  key={project?.id}
                  project={project}
                  viewMode={viewMode}
                  isSelected={selectedProjects?.includes(project?.id)}
                  onToggleSelect={() => handleProjectToggle(project?.id)}
                  onClick={() => handleProjectClick(project)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="FolderOpen" size={48} className="text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {projects?.length === 0 ? 'No projects yet' : 'No projects match your filters'}
              </h3>
              <p className="text-text-secondary mb-4">
                {projects?.length === 0 
                  ? 'Create your first project to get started with managing interior design projects.' 
                  : 'Try adjusting your search criteria or clearing filters to see more projects.'
                }
              </p>
              {projects?.length === 0 ? (
                <Button onClick={() => setShowCreateModal(true)} iconName="Plus">
                  Create First Project
                </Button>
              ) : (
                <Button onClick={clearFilters} variant="outline" iconName="X">
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
        clients={clientOptions?.filter(c => c?.value)}
      />
    </div>
  );
};

export default ProjectsList;