import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessionalSidebar from '../../components/ui/ProfessionalSidebar';
import NotificationCenter from '../../components/ui/NotificationCenter';

import Button from '../../components/ui/Button';
import VariationRequestsTable from './components/VariationRequestsTable';
import VariationFilters from './components/VariationFilters';
import VariationSummaryMetrics from './components/VariationSummaryMetrics';
import CreateVariationModal from './components/CreateVariationModal';
import VariationDetailModal from './components/VariationDetailModal';

const VariationRequestsPage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [filters, setFilters] = useState({});
  const [filteredVariations, setFilteredVariations] = useState([]);
  const [currentUserRole] = useState('MANAGER'); // Mock user role

  // Mock data for variations
  const mockVariations = [
    {
      id: 1,
      referenceNumber: 'VAR-2025-001',
      revisionNumber: 1,
      projectName: 'Luxury Apartment Renovation',
      clientName: 'Sarah Johnson',
      requesterName: 'Sarah Johnson',
      requesterRole: 'client',
      description: 'Upgrade kitchen cabinet hardware from standard brushed nickel to premium brushed gold finish. This includes all cabinet pulls, knobs, and hinges throughout the kitchen area.',
      category: 'material_upgrade',
      priority: 'medium',
      priceImpact: 2500,
      timeImpact: 3,
      originalBudget: 85000,
      newDeadline: '2025-02-15',
      status: 'pending',
      approvalStatus: 'Awaiting Manager Approval',
      requiresClientApproval: false,
      createdAt: '2025-01-05T09:15:00Z',
      updatedAt: '2025-01-05T09:15:00Z',
      createdBy: 'Sarah Johnson',
      justification: `The client has requested an upgrade to the cabinet hardware to better match the overall luxury aesthetic of the renovation. The brushed gold finish will complement the selected light fixtures and faucets, creating a cohesive design theme throughout the space.`
    },
    {
      id: 2,
      referenceNumber: 'VAR-2025-002',
      revisionNumber: 2,
      projectName: 'Modern Office Redesign',
      clientName: 'TechCorp Inc.',
      requesterName: 'Michael Rodriguez',
      requesterRole: 'manager',
      description: 'Add acoustic panels to conference room walls to improve sound quality for video conferences and meetings.',
      category: 'scope_addition',
      priority: 'high',
      priceImpact: 4200,
      timeImpact: 5,
      originalBudget: 120000,
      newDeadline: '2025-03-01',
      status: 'approved',
      approvalStatus: 'Approved by Manager & Client',
      requiresClientApproval: true,
      createdAt: '2025-01-03T14:30:00Z',
      updatedAt: '2025-01-04T11:20:00Z',
      createdBy: 'Michael Rodriguez',
      justification: `Post-construction testing revealed that the conference room has poor acoustics, which is affecting the quality of client meetings and video conferences. Adding acoustic panels is essential for the functionality of this space.`
    },
    {
      id: 3,
      referenceNumber: 'VAR-2025-003',
      revisionNumber: 1,
      projectName: 'Boutique Hotel Lobby',
      clientName: 'Grand Vista Hotels',
      requesterName: 'Emma Thompson',
      requesterRole: 'designer',
      description: 'Replace marble flooring with sustainable bamboo flooring in the main lobby area due to client sustainability requirements.',
      category: 'design_change',
      priority: 'high',
      priceImpact: -8500,
      timeImpact: -2,
      originalBudget: 200000,
      newDeadline: '2025-02-28',
      status: 'under_review',
      approvalStatus: 'Under Manager Review',
      requiresClientApproval: true,
      createdAt: '2025-01-04T16:45:00Z',
      updatedAt: '2025-01-05T08:30:00Z',
      createdBy: 'Emma Thompson',
      justification: `The client has updated their brand guidelines to emphasize sustainability and environmental responsibility. The bamboo flooring aligns with their new corporate values while providing cost savings and faster installation.`
    },
    {
      id: 4,
      referenceNumber: 'VAR-2025-004',
      revisionNumber: 1,
      projectName: 'Residential Kitchen Remodel',
      clientName: 'David & Lisa Chen',
      requesterName: 'David Chen',
      requesterRole: 'client',
      description: 'Remove planned kitchen island and extend counter space along the wall instead to accommodate wheelchair accessibility.',
      category: 'design_change',
      priority: 'high',
      priceImpact: -3200,
      timeImpact: 0,
      originalBudget: 65000,
      newDeadline: '2025-02-20',
      status: 'declined',
      approvalStatus: 'Declined - Alternative Proposed',
      requiresClientApproval: false,
      createdAt: '2025-01-02T11:20:00Z',
      updatedAt: '2025-01-03T09:15:00Z',
      createdBy: 'David Chen',
      justification: `Family member will be using a wheelchair and the current kitchen island design would create accessibility challenges. The extended counter design provides better mobility while maintaining functionality.`
    },
    {
      id: 5,
      referenceNumber: 'VAR-2025-005',
      revisionNumber: 1,
      projectName: 'Corporate Headquarters Renovation',
      clientName: 'InnovateTech Solutions',
      requesterName: 'Jennifer Walsh',
      requesterRole: 'manager',
      description: 'Add smart lighting system with automated controls throughout all office floors to improve energy efficiency.',
      category: 'scope_addition',
      priority: 'medium',
      priceImpact: 15000,
      timeImpact: 7,
      originalBudget: 350000,
      newDeadline: '2025-04-15',
      status: 'partial_approval',
      approvalStatus: 'Manager Approved - Awaiting Client',
      requiresClientApproval: true,
      createdAt: '2025-01-01T13:45:00Z',
      updatedAt: '2025-01-04T15:30:00Z',
      createdBy: 'Jennifer Walsh',
      justification: `The smart lighting system will provide significant long-term energy savings and align with the company's sustainability goals. The initial investment will be recovered within 18 months through reduced electricity costs.`
    }
  ];

  // Mock projects for filters and creation
  const mockProjects = [
    { id: 1, name: 'Luxury Apartment Renovation', clientName: 'Sarah Johnson' },
    { id: 2, name: 'Modern Office Redesign', clientName: 'TechCorp Inc.' },
    { id: 3, name: 'Boutique Hotel Lobby', clientName: 'Grand Vista Hotels' },
    { id: 4, name: 'Residential Kitchen Remodel', clientName: 'David & Lisa Chen' },
    { id: 5, name: 'Corporate Headquarters Renovation', clientName: 'InnovateTech Solutions' }
  ];

  // Mock requesters for filters
  const mockRequesters = [
    { id: 1, name: 'Sarah Johnson' },
    { id: 2, name: 'Michael Rodriguez' },
    { id: 3, name: 'Emma Thompson' },
    { id: 4, name: 'David Chen' },
    { id: 5, name: 'Jennifer Walsh' }
  ];

  // Calculate summary metrics
  const calculateMetrics = (variations) => {
    const total = variations?.length;
    const pending = variations?.filter(v => v?.status === 'pending')?.length;
    const approved = variations?.filter(v => v?.status === 'approved')?.length;
    const declined = variations?.filter(v => v?.status === 'declined')?.length;
    const totalBudgetImpact = variations?.reduce((sum, v) => sum + v?.priceImpact, 0);
    const totalTimeImpact = variations?.reduce((sum, v) => sum + v?.timeImpact, 0);
    const averageApprovalTime = 3; // Mock average

    return {
      totalVariations: total,
      pendingApprovals: pending,
      approvedVariations: approved,
      declinedVariations: declined,
      totalBudgetImpact,
      totalTimeImpact,
      averageApprovalTime
    };
  };

  // Filter variations based on current filters
  useEffect(() => {
    let filtered = [...mockVariations];

    if (filters?.search) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter(variation =>
        variation?.referenceNumber?.toLowerCase()?.includes(searchTerm) ||
        variation?.projectName?.toLowerCase()?.includes(searchTerm) ||
        variation?.description?.toLowerCase()?.includes(searchTerm) ||
        variation?.requesterName?.toLowerCase()?.includes(searchTerm)
      );
    }

    if (filters?.status) {
      filtered = filtered?.filter(variation => variation?.status === filters?.status);
    }

    if (filters?.priority) {
      filtered = filtered?.filter(variation => variation?.priority === filters?.priority);
    }

    if (filters?.project) {
      filtered = filtered?.filter(variation => variation?.projectName === filters?.project);
    }

    if (filters?.requester) {
      filtered = filtered?.filter(variation => variation?.requesterName === filters?.requester);
    }

    if (filters?.priceImpactMin) {
      filtered = filtered?.filter(variation => variation?.priceImpact >= parseFloat(filters?.priceImpactMin));
    }

    if (filters?.priceImpactMax) {
      filtered = filtered?.filter(variation => variation?.priceImpact <= parseFloat(filters?.priceImpactMax));
    }

    if (filters?.timeImpactMin) {
      filtered = filtered?.filter(variation => variation?.timeImpact >= parseInt(filters?.timeImpactMin));
    }

    if (filters?.timeImpactMax) {
      filtered = filtered?.filter(variation => variation?.timeImpact <= parseInt(filters?.timeImpactMax));
    }

    setFilteredVariations(filtered);
  }, [filters]);

  // Initialize with all variations
  useEffect(() => {
    setFilteredVariations(mockVariations);
  }, []);

  const handleViewVariation = (variation) => {
    setSelectedVariation(variation);
    setIsDetailModalOpen(true);
  };

  const handleApproveVariation = async (approvalData) => {
    console.log('Approving variation:', approvalData);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update variation status in real app
    setIsDetailModalOpen(false);
  };

  const handleDeclineVariation = async (approvalData) => {
    console.log('Declining variation:', approvalData);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update variation status in real app
    setIsDetailModalOpen(false);
  };

  const handleEditVariation = (variation) => {
    console.log('Editing variation:', variation);
    // Navigate to edit form or open edit modal
  };

  const handleCreateVariation = async (variationData) => {
    console.log('Creating variation:', variationData);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add to variations list in real app
  };

  const metrics = calculateMetrics(filteredVariations);

  const notificationCounts = {
    variations: metrics?.pendingApprovals,
    tickets: 3
  };

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        notificationCounts={notificationCounts}
      />
      {/* Main Content */}
      <div className={`transition-smooth ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-60'} pb-16 md:pb-0`}>
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border z-50 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-primary">Variation Requests</h1>
              <p className="text-sm text-text-secondary mt-1">
                Manage project scope changes and approval workflows
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <NotificationCenter 
                onMarkAsRead={() => {}}
                onMarkAllAsRead={() => {}}
              />
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                iconName="Plus"
                iconPosition="left"
              >
                New Variation
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Summary Metrics */}
          <VariationSummaryMetrics {...metrics} />

          {/* Filters */}
          <VariationFilters
            onFiltersChange={setFilters}
            projects={mockProjects}
            requesters={mockRequesters}
            totalCount={mockVariations?.length}
            filteredCount={filteredVariations?.length}
          />

          {/* Variations Table */}
          <VariationRequestsTable
            variations={filteredVariations}
            onView={handleViewVariation}
            onApprove={handleApproveVariation}
            onDecline={handleDeclineVariation}
            onEdit={handleEditVariation}
            currentUserRole={currentUserRole}
          />
        </div>
      </div>
      {/* Modals */}
      <CreateVariationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateVariation}
        projects={mockProjects}
        currentUserRole={currentUserRole}
      />
      <VariationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        variation={selectedVariation}
        onApprove={handleApproveVariation}
        onDecline={handleDeclineVariation}
        currentUserRole={currentUserRole}
      />
    </div>
  );
};

export default VariationRequestsPage;