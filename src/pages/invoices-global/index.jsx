import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAllInvoices } from '../../hooks/useProjectData';
import ProfessionalSidebar from '../../components/ui/ProfessionalSidebar';
import NotificationCenter from '../../components/ui/NotificationCenter';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';

const InvoicesGlobal = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  // Use React Query for real-time data synchronization
  const { data: allInvoices = [], isLoading: loading, error } = useAllInvoices();

  // Filter invoices
  const filteredInvoices = allInvoices.filter(invoice => {
    if (statusFilter !== 'All' && invoice.status !== statusFilter) return false;
    if (projectFilter !== 'All' && invoice.projectId !== projectFilter) return false;
    return true;
  });

  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Sent', label: 'Sent' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Overdue', label: 'Overdue' }
  ];

  // Extract unique projects from invoices for filter
  const uniqueProjects = [...new Set(allInvoices.map(inv => inv.projectId))];
  const projectOptions = [
    { value: 'All', label: 'All Projects' },
    ...uniqueProjects.map(projectId => {
      const invoice = allInvoices.find(inv => inv.projectId === projectId);
      return {
        value: projectId,
        label: invoice?.project?.title || 'Unknown Project'
      };
    })
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-700';
      case 'Sent': return 'bg-blue-100 text-blue-700';
      case 'Paid': return 'bg-green-100 text-green-700';
      case 'Overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Draft': return 'FileText';
      case 'Sent': return 'Send';
      case 'Paid': return 'CheckCircle';
      case 'Overdue': return 'AlertCircle';
      default: return 'File';
    }
  };

  const formatCurrency = (amount, currency = 'AED') => {
    return `${currency} ${parseFloat(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Stats calculations
  const totalInvoices = allInvoices.length;
  const totalAmount = allInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.total || 0), 0);
  const paidAmount = allInvoices
    .filter(invoice => invoice.status === 'Paid')
    .reduce((sum, invoice) => sum + parseFloat(invoice.total || 0), 0);
  const outstandingAmount = totalAmount - paidAmount;
  const draftInvoices = allInvoices.filter(inv => inv.status === 'Draft').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <ProfessionalSidebar />
        
        <main className="flex-1 ml-64">
          <div className="sticky top-0 z-10 bg-background border-b border-border">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">All Project Invoices</h1>
                <p className="text-text-secondary">Manage invoices and payments across all projects</p>
              </div>
              <div className="flex items-center space-x-4">
                <NotificationCenter />
                <Button as={Link} to="/projects" variant="outline">
                  <Icon name="ArrowLeft" size={16} />
                  <span>Back to Projects</span>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Icon name="FileText" size={24} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary">{totalInvoices}</h3>
                    <p className="text-sm text-text-secondary">Total Invoices</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon name="DollarSign" size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</h3>
                    <p className="text-sm text-text-secondary">Total Value</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon name="CheckCircle" size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary">{formatCurrency(paidAmount)}</h3>
                    <p className="text-sm text-text-secondary">Paid Amount</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Icon name="Clock" size={24} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary">{formatCurrency(outstandingAmount)}</h3>
                    <p className="text-sm text-text-secondary">Outstanding</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center space-x-4 bg-muted p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="Filter" size={16} className="text-text-secondary" />
                <span className="text-sm font-medium text-primary">Filters:</span>
              </div>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                className="min-w-[150px]"
              />
              <Select
                value={projectFilter}
                onChange={setProjectFilter}
                options={projectOptions}
                className="min-w-[150px]"
              />
              <div className="text-sm text-text-secondary">
                Showing {filteredInvoices.length} of {totalInvoices} invoices
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12 bg-muted rounded-lg">
                  <Icon name="FileText" size={48} className="mx-auto text-text-secondary mb-4" />
                  <h4 className="font-medium text-primary mb-2">No Invoices Found</h4>
                  <p className="text-text-secondary">No invoices match your current filters</p>
                </div>
              ) : (
                filteredInvoices.map(invoice => (
                  <div key={invoice.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Link 
                            to={`/projects/${invoice.projectId}?tab=invoices&inv=${invoice.id}`}
                            className="font-semibold text-primary hover:text-accent transition-colors"
                          >
                            {invoice.number}
                          </Link>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </div>
                        <h4 className="font-medium text-primary mb-1">{invoice.description || 'Invoice'}</h4>
                        <p className="text-sm text-text-secondary mb-3">
                          Amount: <span className="font-medium text-primary">{formatCurrency(invoice.total, invoice.currency)}</span>
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-text-secondary">
                          <Link 
                            to={`/projects/${invoice.projectId}`}
                            className="flex items-center space-x-1 hover:text-primary transition-colors"
                          >
                            <Icon name="Home" size={12} />
                            <span>{invoice.project?.title || 'Unknown Project'}</span>
                          </Link>
                          <div className="flex items-center space-x-1">
                            <Icon name="Calendar" size={12} />
                            <span>Issue: {formatDate(invoice.issueDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name="Clock" size={12} />
                            <span>Due: {formatDate(invoice.dueDate)}</span>
                          </div>
                          {invoice.paymentDate && (
                            <div className="flex items-center space-x-1">
                              <Icon name="CheckCircle" size={12} />
                              <span>Paid: {formatDate(invoice.paymentDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Icon name={getStatusIcon(invoice.status)} size={20} className={`${
                          invoice.status === 'Paid' ? 'text-success' :
                          invoice.status === 'Overdue' ? 'text-error' :
                          invoice.status === 'Sent' ? 'text-primary' :
                          'text-text-secondary'
                        }`} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center space-x-4 text-sm text-text-secondary">
                        <span>Created: {formatDate(invoice.createdAt)}</span>
                        <span>•</span>
                        <span>Updated: {formatDate(invoice.updatedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // TODO: Download PDF functionality
                            console.log('Download PDF for invoice:', invoice.id);
                          }}
                        >
                          <Icon name="Download" size={14} />
                          <span>PDF</span>
                        </Button>
                        <Link 
                          to={`/projects/${invoice.projectId}?tab=invoices&inv=${invoice.id}`}
                          className="flex items-center space-x-2 text-sm text-accent hover:text-accent-foreground transition-colors"
                        >
                          <span>View Details</span>
                          <Icon name="ArrowRight" size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvoicesGlobal;