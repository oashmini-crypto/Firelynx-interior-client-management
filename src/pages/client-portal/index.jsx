import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../data/api';

// Modern Components
import ModernLayout from './components/ModernLayout';
import FileLibrary from './components/FileLibrary';
import EnhancedInvoices from './components/EnhancedInvoices';
import EnhancedApprovals from './components/EnhancedApprovals';
import EnhancedVariations from './components/EnhancedVariations';
import EnhancedTickets from './components/EnhancedTickets';

// Legacy Components  
import ClientPortalHeader from '../../components/ui/ClientPortalHeader';
import ProjectOverviewCard from './components/ProjectOverviewCard';
import TeamMemberCard from './components/TeamMemberCard';
import MilestoneTimeline from './components/MilestoneTimeline';
import MilestoneCard from './components/MilestoneCard';
import FileLibraryItem from './components/FileLibraryItem';
import VariationRequestCard from './components/VariationRequestCard';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';

const ClientPortal = () => {
  const { id: projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(searchParams.get('tab') || 'overview');

  // Sync activeSection with URL changes
  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'overview';
    setActiveSection(currentTab);
    console.log('🔄 Client Portal: Tab changed to:', currentTab);
  }, [searchParams]);
  
  // State for real API data
  const [project, setProject] = useState(null);
  const [variations, setVariations] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [files, setFiles] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch all project data from API
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        console.log('🔄 Client Portal: Starting comprehensive data fetch for project:', projectId);
        setLoading(true);
        
        if (projectId) {
          // Fetch all project-related data in parallel
          const [
            projectResponse,
            variationsResponse,
            milestonesResponse,
            invoicesResponse,
            ticketsResponse,
            filesResponse,
            approvalsResponse,
            teamResponse
          ] = await Promise.all([
            apiClient.getProject(projectId),
            apiClient.getProjectVariations(projectId).catch(() => []),
            apiClient.getProjectMilestones(projectId).catch(() => []),
            apiClient.getProjectInvoices(projectId).catch(() => []),
            apiClient.getProjectTickets(projectId).catch(() => []),
            apiClient.getProjectFiles(projectId).catch(() => []),
            apiClient.getProjectApprovals(projectId).catch(() => []),
            apiClient.getProjectTeam(projectId).catch(() => [])
          ]);
          
          console.log('✅ Client Portal: All data loaded:', {
            project: projectResponse,
            variations: variationsResponse?.length || 0,
            milestones: milestonesResponse?.length || 0,
            invoices: invoicesResponse?.length || 0,
            tickets: ticketsResponse?.length || 0,
            files: filesResponse?.length || 0,
            approvals: approvalsResponse?.length || 0,
            team: teamResponse?.length || 0
          });
          
          setProject(projectResponse);
          setVariations(variationsResponse || []);
          setMilestones(milestonesResponse || []);
          setInvoices(invoicesResponse || []);
          setTickets(ticketsResponse || []);
          setFiles(filesResponse || []);
          setApprovals(approvalsResponse || []);
          setTeamMembers(teamResponse || []);
        } else {
          // Get first project if no specific project ID
          const projectsResponse = await apiClient.getProjects();
          if (projectsResponse && projectsResponse.length > 0) {
            const firstProject = projectsResponse[0];
            setProject(firstProject);
            // Redirect to specific project URL
            navigate(`/client/${firstProject.id}`);
          }
        }
      } catch (error) {
        console.error('❌ Client Portal: Error fetching project data:', error);
      } finally {
        console.log('🏁 Client Portal: Data fetch complete');
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [projectId, navigate]);

  // Handle logout
  const handleLogout = () => {
    console.log('🔓 Client logout');
    navigate('/login');
  };

  // Navigation items for client portal
  const navigationItems = [
    { id: 'overview', label: 'Project Overview', icon: 'Home' },
    { id: 'milestones', label: 'Timeline & Milestones', icon: 'Calendar' },
    { id: 'files', label: 'File Library', icon: 'FolderOpen' },
    { id: 'variations', label: 'Change Requests', icon: 'RefreshCw' },
    { id: 'approvals', label: 'Approvals', icon: 'CheckCircle' },
    { id: 'invoices', label: 'Invoices & Billing', icon: 'Receipt' },
    { id: 'tickets', label: 'Support Tickets', icon: 'MessageSquare' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Your Project</h2>
          <p className="text-gray-600">Fetching project details, milestones, and documents...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The requested project could not be loaded.</p>
          <Button onClick={() => navigate('/projects')}>View All Projects</Button>
        </div>
      </div>
    );
  }

  const projectData = {
    name: project.title,
    client: project.clientName || "Client",
    status: project.status,
    progress: project.progress,
    budget: parseFloat(project.budget || 0),
    spent: parseFloat(project.spent || 0),
    startDate: project.startDate,
    expectedCompletion: project.targetDate,
    address: project.address,
    description: project.description
  };

  // Handle approval updates
  const handleApprovalUpdate = async (approvalId, updateData) => {
    try {
      await apiClient.updateApproval(approvalId, updateData);
      // Refresh approvals data
      const approvalsResponse = await apiClient.getProjectApprovals(projectId);
      setApprovals(approvalsResponse || []);
    } catch (error) {
      console.error('Error updating approval:', error);
    }
  };

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'files':
        return <FileLibrary files={files} loading={loading} />;
      
      case 'invoices':
        return (
          <EnhancedInvoices 
            invoices={invoices} 
            loading={loading}
            projectId={projectId}
          />
        );
      
      case 'approvals':
        return (
          <EnhancedApprovals 
            approvals={approvals} 
            loading={loading}
            onApprovalUpdate={handleApprovalUpdate}
          />
        );
      
      case 'milestones':
        return (
          <div className="space-y-6">
            <div className="grid gap-6">
              {milestones.map((milestone) => (
                <MilestoneCard key={milestone.id} milestone={milestone} />
              ))}
            </div>
            {milestones.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Calendar" size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No milestones yet</h3>
                <p className="text-gray-500">Project milestones will appear here as they are created.</p>
              </div>
            )}
          </div>
        );
      
      case 'variations':
        return (
          <EnhancedVariations 
            variations={variations} 
            loading={loading}
          />
        );
      
      case 'tickets':
        return (
          <EnhancedTickets 
            tickets={tickets} 
            loading={loading}
            projectId={projectId}
          />
        );
      
      default: // overview
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProjectOverviewCard project={projectData} />
              </div>
              
              {/* Team Members */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Team</h3>
                  <div className="space-y-4">
                    {teamMembers && teamMembers.length > 0 ? (
                      teamMembers.map((member) => (
                        <TeamMemberCard 
                          key={member.id}
                          name={member.userName || member.userEmail}
                          role={member.role || member.userRole}
                          email={member.userEmail}
                          phone={member.userPhone}
                          specialization={member.specialization}
                          isOnline={member.isOnline}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Icon name="Users" size={48} className="text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No team members assigned</h4>
                        <p className="text-gray-500">Team members will appear here once assigned to your project.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <ModernLayout 
      project={project} 
      loading={loading} 
      onLogout={handleLogout}
    >
      {renderContent()}
    </ModernLayout>
  );

  // OLD LAYOUT - Keeping as backup
  const renderOldLayout = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Client Portal Header */}
      <ClientPortalHeader 
        clientName={projectData.client}
        projectName={projectData.name}
      />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar Navigation */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
          {/* Project Info */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate">{projectData.name}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${
                project.status === 'In Progress' ? 'bg-blue-500' :
                project.status === 'Completed' ? 'bg-green-500' :
                project.status === 'On Hold' ? 'bg-yellow-500' : 'bg-gray-400'
              }`}></div>
              <span>{project.status}</span>
              <span>•</span>
              <span>{project.progress}% Complete</span>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveSection(item.id);
                      setSearchParams({ tab: item.id });
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon name={item.icon} size={16} />
                    <span>{item.label}</span>
                    {item.id === 'variations' && variations.length > 0 && (
                      <span className="ml-auto bg-red-100 text-red-800 text-xs rounded-full px-2 py-0.5">
                        {variations.length}
                      </span>
                    )}
                    {item.id === 'tickets' && tickets.length > 0 && (
                      <span className="ml-auto bg-orange-100 text-orange-800 text-xs rounded-full px-2 py-0.5">
                        {tickets.length}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-center"
            >
              <Icon name="LogOut" size={14} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <main className="p-8">
            {/* Project Overview */}
            {activeSection === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{projectData.name}</h1>
                  <p className="text-gray-600">{projectData.description}</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Project Status Card */}
                  <div className="lg:col-span-2">
                    <ProjectOverviewCard project={projectData} />
                  </div>
                  
                  {/* Team Members */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Team</h3>
                      <div className="space-y-4">
                        {teamMembers && teamMembers.length > 0 ? (
                          teamMembers.map((member) => (
                            <TeamMemberCard 
                              key={member.id}
                              name={member.userName || member.userEmail}
                              role={member.role || member.userRole}
                              email={member.userEmail}
                              phone={member.userPhone}
                              specialization={member.specialization}
                              isOnline={member.isOnline}
                            />
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Icon name="Users" size={48} className="text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">No team members assigned</h4>
                            <p className="text-gray-500">Team members will appear here once assigned to your project.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline & Milestones */}
            {activeSection === 'milestones' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Timeline</h1>
                  <p className="text-gray-600">Track progress and upcoming milestones for your project</p>
                </div>
                
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <MilestoneTimeline milestones={milestones} projectId={project.id} />
                  </div>
                </div>
              </div>
            )}

            {/* File Library */}
            {activeSection === 'files' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">File Library</h1>
                  <p className="text-gray-600">Access project files, drawings, and documentation</p>
                </div>
                
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    {files.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map((file) => (
                          <FileLibraryItem key={file.id} file={file} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Icon name="FolderOpen" size={48} className="text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded yet</h3>
                        <p className="text-gray-500">Files and documents will appear here once uploaded by your project team.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Change Requests (Variations) */}
            {activeSection === 'variations' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Change Requests</h1>
                    <p className="text-gray-600">Review and track project variations</p>
                  </div>
                  <Button onClick={() => {/* TODO: Implement create variation */}}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Request Change
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {variations.length > 0 ? (
                    variations.map((variation) => (
                      <VariationRequestCard 
                        key={variation.id} 
                        variation={{
                          ...variation,
                          title: variation.changeDescription,
                          description: variation.reasonDescription,
                          requestDate: new Date(variation.date).toLocaleDateString(),
                          requestedBy: variation.changeRequestor,
                          priority: variation.priority || 'medium',
                          costImpact: parseFloat(variation.priceImpact || 0),
                          timeImpact: variation.timeImpact || 0,
                          requestId: variation.number
                        }}
                      />
                    ))
                  ) : (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                      <Icon name="RefreshCw" size={48} className="text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No change requests yet</h3>
                      <p className="text-gray-500 mb-6">Request changes or modifications to your project scope.</p>
                      <Button variant="outline">
                        <Icon name="Plus" size={16} className="mr-2" />
                        Create First Request
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Approvals Section */}
            {activeSection === 'approvals' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Approvals</h1>
                  <p className="text-gray-600">Review and approve project documents and design changes</p>
                </div>
                
                <div className="space-y-4">
                  {approvals.length > 0 ? (
                    approvals.map((approval) => (
                      <div key={approval.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{approval.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{approval.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Submitted: {new Date(approval.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>Due: {new Date(approval.dueDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            approval.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            approval.status === 'approved' ? 'bg-green-100 text-green-800' :
                            approval.status === 'declined' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {approval.status?.charAt(0)?.toUpperCase() + approval.status?.slice(1)}
                          </span>
                        </div>
                        
                        {approval.attachmentUrl && (
                          <div className="mb-4">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <Icon name="FileText" size={20} className="text-gray-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Document Preview</p>
                                <p className="text-xs text-gray-500">{approval.filename}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Icon name="Download" size={14} className="mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {approval.status === 'pending' && (
                          <div className="flex space-x-3">
                            <Button 
                              onClick={() => {/* TODO: Implement approval */}}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Icon name="Check" size={16} className="mr-2" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => {/* TODO: Implement decline */}}
                              className="border-red-300 text-red-700 hover:bg-red-50"
                            >
                              <Icon name="X" size={16} className="mr-2" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                      <Icon name="CheckCircle" size={48} className="text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
                      <p className="text-gray-500">Documents requiring your approval will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Invoices & Billing Section */}
            {activeSection === 'invoices' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoices & Billing</h1>
                  <p className="text-gray-600">View and download project invoices</p>
                </div>
                
                <div className="space-y-4">
                  {invoices.length > 0 ? (
                    invoices.map((invoice) => (
                      <div key={invoice.id} className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">Invoice {invoice.number}</h3>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                <span>Issued: {new Date(invoice.issueDate).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: invoice.currency || 'USD'
                                }).format(parseFloat(invoice.total))}
                              </p>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {invoice.status?.charAt(0)?.toUpperCase() + invoice.status?.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          {invoice.lineItems && invoice.lineItems.map((item, index) => (
                            <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.description}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.rate}</p>
                              </div>
                              <p className="text-sm font-semibold text-gray-900">
                                ${parseFloat(item.amount).toLocaleString()}
                              </p>
                            </div>
                          ))}
                          
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-medium">${parseFloat(invoice.subtotal).toLocaleString()}</span>
                            </div>
                            {invoice.taxTotal && parseFloat(invoice.taxTotal) > 0 && (
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-600">Tax:</span>
                                <span className="font-medium">${parseFloat(invoice.taxTotal).toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-lg font-semibold mt-2 pt-2 border-t border-gray-200">
                              <span>Total:</span>
                              <span>${parseFloat(invoice.total).toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-3 mt-6">
                            <Button 
                              onClick={() => {
                                // Use API client method for PDF download
                                const downloadInvoicePdf = async () => {
                                  try {
                                    const pdfBlob = await apiClient.generateInvoicePdf(invoice.id);
                                    const url = window.URL.createObjectURL(pdfBlob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `${invoice.number}_Invoice.pdf`;
                                    document.body.appendChild(link);
                                    link.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(link);
                                  } catch (error) {
                                    console.error('Error downloading PDF:', error);
                                  }
                                };
                                downloadInvoicePdf();
                              }}
                            >
                              <Icon name="Download" size={16} className="mr-2" />
                              Download PDF
                            </Button>
                            {invoice.status !== 'paid' && (
                              <Button variant="outline">
                                <Icon name="CreditCard" size={16} className="mr-2" />
                                Pay Now
                              </Button>
                            )}
                          </div>
                          
                          {invoice.notes && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">{invoice.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                      <Icon name="Receipt" size={48} className="text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
                      <p className="text-gray-500">Project invoices will appear here when issued.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Support Tickets Section */}
            {activeSection === 'tickets' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Support Tickets</h1>
                    <p className="text-gray-600">Get help and support from your project team</p>
                  </div>
                  <Button onClick={() => {/* TODO: Implement create ticket */}}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Create Ticket
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <div key={ticket.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>#{ticket.number}</span>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status?.replace('_', ' ')?.charAt(0)?.toUpperCase() + ticket.status?.replace('_', ' ')?.slice(1)}
                          </span>
                        </div>
                        
                        {ticket.attachments && ticket.attachments.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {ticket.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                  <Icon name="Paperclip" size={14} className="text-gray-500" />
                                  <span className="text-sm text-gray-700 truncate">{attachment.filename}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Icon name="User" size={14} />
                            <span>Assigned to: {ticket.assignedTo || 'Project Team'}</span>
                          </div>
                          <Button variant="outline" size="sm">
                            <Icon name="MessageSquare" size={14} className="mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                      <Icon name="MessageSquare" size={48} className="text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets</h3>
                      <p className="text-gray-500 mb-6">Need help? Create a ticket to get support from your project team.</p>
                      <Button variant="outline">
                        <Icon name="Plus" size={16} className="mr-2" />
                        Create Your First Ticket
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;