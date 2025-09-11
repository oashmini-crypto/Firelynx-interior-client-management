import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useCreateClient, useUpdateClient, useDeleteClient } from '../../hooks/useProjectData';
import ProfessionalSidebar from '../../components/ui/ProfessionalSidebar';
import NotificationCenter from '../../components/ui/NotificationCenter';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import ClientCard from './components/ClientCard';
import ClientProfileModal from './components/ClientProfileModal';
import CreateClientModal from './components/CreateClientModal';
import ClientFilters from './components/ClientFilters';

const ClientProfiles = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filters, setFilters] = useState({
    industry: '',
    projectStatus: '',
    contractValue: '',
    location: ''
  });

  // Mock notification counts for sidebar
  const notificationCounts = {
    variations: 3,
    tickets: 7
  };

  // Use React Query for real-time data synchronization
  const { data: projectsData = [], isLoading: loading, error } = useProjects();
  
  // Client mutation hooks
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();

  // Memoized client data derived from projects
  const clients = useMemo(() => {
    const clientMap = new Map();
    projectsData.forEach(project => {
      if (project.clientId) {
        if (!clientMap.has(project.clientId)) {
          clientMap.set(project.clientId, {
            id: project.clientId,
            name: project.clientName || 'Unknown Client',
            email: project.clientEmail || '',
            phone: project.clientPhone || '',
            company: project.clientCompany || '',
            address: project.clientAddress || '',
            createdAt: project.createdAt,
            projects: [],
            projectCount: 0,
            totalContractValue: 0,
            relationshipStatus: 'New'
          });
        }
        
        const client = clientMap.get(project.clientId);
        client.projects.push({
          id: project.id,
          title: project.title,
          status: project.status,
          progress: project.progress,
          value: project.budget
        });
        client.projectCount++;
        client.totalContractValue += parseFloat(project.budget || 0);
        
        // Update relationship status
        const activeProjects = client.projects.filter(p => p.status === 'In Progress').length;
        client.relationshipStatus = activeProjects > 0 ? 'Active' : 
                                  (client.projects.length > 0 ? 'Completed' : 'New');
        client.lastContact = client.createdAt;
        client.industry = client.company ? 'Commercial' : 'Residential';
        client.communicationHistory = [
          {
            date: client.createdAt,
            type: 'Initial Contact',
            subject: 'Client Onboarding',
            summary: 'Initial client consultation completed'
          }
        ];
      }
    });

    return Array.from(clientMap.values());
  }, [projectsData]);

  // Filter and sort clients
  const filteredAndSortedClients = clients
    ?.filter(client => {
      const matchesSearch = !searchTerm || 
        client?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        client?.company?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        client?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      
      const matchesIndustry = !filters?.industry || client?.industry === filters?.industry;
      const matchesProjectStatus = !filters?.projectStatus || 
        client?.projects?.some(project => project?.status === filters?.projectStatus);
      const matchesContractValue = !filters?.contractValue || 
        (filters?.contractValue === 'low' && client?.totalContractValue < 300000) ||
        (filters?.contractValue === 'medium' && client?.totalContractValue >= 300000 && client?.totalContractValue < 500000) ||
        (filters?.contractValue === 'high' && client?.totalContractValue >= 500000);
      const matchesLocation = !filters?.location || 
        client?.address?.toLowerCase()?.includes(filters?.location?.toLowerCase());

      return matchesSearch && matchesIndustry && matchesProjectStatus && matchesContractValue && matchesLocation;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a?.name?.localeCompare(b?.name);
        case 'company':
          return a?.company?.localeCompare(b?.company);
        case 'value':
          return b?.totalContractValue - a?.totalContractValue;
        case 'projects':
          return b?.projectCount - a?.projectCount;
        case 'lastContact':
          return new Date(b?.lastContact) - new Date(a?.lastContact);
        default:
          return 0;
      }
    });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Navigation handlers for client projects
  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setIsProfileModalOpen(true);
  };

  const handleCreateClient = () => {
    setIsCreateModalOpen(true);
  };

  const handleViewProjects = (client) => {
    // Navigate to projects list filtered by client
    navigate(`/projects-list?client=${client?.id}`);
  };

  const handleCreateProject = (client) => {
    // Navigate to project creation with pre-selected client
    navigate(`/project-details?new=true&client=${client?.id}`);
  };

  const handleSaveClient = async (clientData) => {
    try {
      if (selectedClient) {
        // Update existing client
        await updateClientMutation.mutateAsync({
          id: selectedClient.id,
          data: clientData
        });
      } else {
        // Create new client  
        await createClientMutation.mutateAsync(clientData);
      }
      
      // Close modals and reset state on success
      setIsCreateModalOpen(false);
      setIsProfileModalOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error saving client:', error);
      // Error handling is managed by React Query and UI components
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await deleteClientMutation.mutateAsync(clientId);
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'company', label: 'Company' },
    { value: 'value', label: 'Contract Value' },
    { value: 'projects', label: 'Project Count' },
    { value: 'lastContact', label: 'Last Contact' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-success';
      case 'On Hold': return 'text-warning';
      case 'Prospect': return 'text-primary';
      default: return 'text-text-secondary';
    }
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
        <header className="sticky top-0 bg-surface border-b border-border z-40 px-4 sm:px-6 lg:px-8">
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
                <h1 className="text-xl font-semibold text-foreground">Client Profiles</h1>
                <p className="text-sm text-text-secondary hidden sm:block">
                  Manage client relationships and project portfolios
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationCenter 
                onMarkAsRead={(id) => console.log('Marking notification as read:', id)}
                onMarkAllAsRead={() => console.log('Marking all notifications as read')}
              />
              <Button
                variant="default"
                iconName="Plus"
                onClick={handleCreateClient}
              >
                New Client
              </Button>
            </div>
          </div>
        </header>

        {/* Client Management Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total Clients</p>
                  <p className="text-2xl font-semibold text-card-foreground">{clients?.length}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon name="Users" size={24} className="text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Active Projects</p>
                  <p className="text-2xl font-semibold text-card-foreground">
                    {clients?.reduce((sum, client) => sum + client?.projectCount, 0)}
                  </p>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Icon name="Briefcase" size={24} className="text-accent" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total Contract Value</p>
                  <p className="text-2xl font-semibold text-card-foreground">
                    ${(clients?.reduce((sum, client) => sum + client?.totalContractValue, 0) / 1000)?.toFixed(0)}K
                  </p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <Icon name="DollarSign" size={24} className="text-success" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Active Relationships</p>
                  <p className="text-2xl font-semibold text-card-foreground">
                    {clients?.filter(c => c?.relationshipStatus === 'Active')?.length}
                  </p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <Icon name="Heart" size={24} className="text-warning" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                  <Input
                    placeholder="Search clients by name, company, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-3">
                <Select
                  placeholder="Sort by"
                  value={sortBy}
                  onChange={setSortBy}
                  options={sortOptions}
                  className="min-w-[140px]"
                />
                
                <div className="flex gap-2 border border-border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    iconName="Grid3X3"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                  />
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    iconName="List"
                    onClick={() => setViewMode('list')}
                    className="px-3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <ClientFilters
            filters={filters}
            onFiltersChange={setFilters}
          />

          {/* Client Grid/List */}
          <div className="space-y-6">
            {filteredAndSortedClients?.length === 0 ? (
              <div className="bg-card rounded-lg p-12 border border-border shadow-subtle text-center">
                <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">No clients found</h3>
                <p className="text-text-secondary mb-4">
                  {searchTerm || Object.values(filters)?.some(f => f) 
                    ? 'Try adjusting your search criteria or filters' :'Get started by adding your first client'
                  }
                </p>
                {!searchTerm && !Object.values(filters)?.some(f => f) && (
                  <Button
                    variant="default"
                    iconName="Plus"
                    onClick={handleCreateClient}
                  >
                    Add First Client
                  </Button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" :"space-y-4"
              }>
                {filteredAndSortedClients?.map((client) => (
                  <ClientCard
                    key={client?.id}
                    client={client}
                    viewMode={viewMode}
                    onClientClick={() => handleClientClick(client)}
                    onViewProjects={() => handleViewProjects(client)}
                    onCreateProject={() => handleCreateProject(client)}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      {/* Modals */}
      {isCreateModalOpen && (
        <CreateClientModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSaveClient}
          isLoading={createClientMutation.isPending}
        />
      )}
      {isProfileModalOpen && selectedClient && (
        <ClientProfileModal
          client={selectedClient}
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false);
            setSelectedClient(null);
          }}
          onSave={handleSaveClient}
          onDelete={() => handleDeleteClient(selectedClient.id)}
          onViewProjects={() => handleViewProjects(selectedClient)}
          onCreateProject={() => handleCreateProject(selectedClient)}
          isLoading={updateClientMutation.isPending}
          isDeleting={deleteClientMutation.isPending}
        />
      )}
    </div>
  );
};

export default ClientProfiles;