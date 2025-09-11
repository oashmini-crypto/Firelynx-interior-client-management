import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAllTickets } from '../../hooks/useProjectData';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';

const TicketsGlobal = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  // Use React Query for real-time data synchronization
  const { data: allTickets = [], isLoading: loading, error } = useAllTickets();

  // Filter tickets
  const filteredTickets = allTickets.filter(ticket => {
    if (statusFilter !== 'All' && ticket.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && ticket.priority !== priorityFilter) return false;
    if (categoryFilter !== 'All' && ticket.category !== categoryFilter) return false;
    return true;
  });

  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    { value: 'Open', label: 'Open' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Awaiting Client', label: 'Awaiting Client' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Closed', label: 'Closed' }
  ];

  const priorityOptions = [
    { value: 'All', label: 'All Priorities' },
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' }
  ];

  const categoryOptions = [
    { value: 'All', label: 'All Categories' },
    { value: 'General', label: 'General' },
    { value: 'Design', label: 'Design' },
    { value: 'Site', label: 'Site' },
    { value: 'Billing', label: 'Billing' },
    { value: 'Other', label: 'Other' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Awaiting Client': return 'bg-yellow-100 text-yellow-700';
      case 'Resolved': return 'bg-green-100 text-green-700';
      case 'Closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'text-error';
      case 'High': return 'text-warning';
      case 'Medium': return 'text-primary';
      case 'Low': return 'text-success';
      default: return 'text-text-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return 'AlertCircle';
      case 'In Progress': return 'Clock';
      case 'Awaiting Client': return 'User';
      case 'Resolved': return 'CheckCircle';
      case 'Closed': return 'Archive';
      default: return 'MessageSquare';
    }
  };

  // Stats calculations
  const totalTickets = allTickets.length;
  const openTickets = allTickets.filter(t => t.status === 'Open').length;
  const inProgressTickets = allTickets.filter(t => t.status === 'In Progress').length;
  const resolvedTickets = allTickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">All Project Tickets</h1>
          <p className="text-text-secondary">Manage client-raised tickets across all projects</p>
        </div>
        <Button as={Link} to="/projects" variant="outline">
          <Icon name="ArrowLeft" size={16} />
          <span>Back to Projects</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="MessageSquare" size={24} className="text-accent" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary">{totalTickets}</h3>
              <p className="text-sm text-text-secondary">Total Tickets</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Icon name="AlertCircle" size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary">{openTickets}</h3>
              <p className="text-sm text-text-secondary">Open</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary">{inProgressTickets}</h3>
              <p className="text-sm text-text-secondary">In Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary">{resolvedTickets}</h3>
              <p className="text-sm text-text-secondary">Resolved</p>
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
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={priorityOptions}
          className="min-w-[150px]"
        />
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categoryOptions}
          className="min-w-[150px]"
        />
        <div className="text-sm text-text-secondary">
          Showing {filteredTickets.length} of {totalTickets} tickets
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <Icon name="MessageSquare" size={48} className="mx-auto text-text-secondary mb-4" />
            <h4 className="font-medium text-primary mb-2">No Tickets Found</h4>
            <p className="text-text-secondary">No tickets match your current filters</p>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <div key={ticket.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Link 
                      to={`/projects/${ticket.projectId}?tab=tickets&tk=${ticket.id}`}
                      className="font-semibold text-primary hover:text-accent transition-colors"
                    >
                      {ticket.number}
                    </Link>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority} Priority
                    </span>
                  </div>
                  <h4 className="font-medium text-primary mb-1">{ticket.subject}</h4>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{ticket.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-text-secondary">
                    <Link 
                      to={`/projects/${ticket.projectId}`}
                      className="flex items-center space-x-1 hover:text-primary transition-colors"
                    >
                      <Icon name="Home" size={12} />
                      <span>{ticket.project?.title}</span>
                    </Link>
                    <div className="flex items-center space-x-1">
                      <Icon name="Tag" size={12} />
                      <span>{ticket.category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="User" size={12} />
                      <span>Assigned: {ticket.assignee?.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={12} />
                      <span>Created: {ticket.createdAt}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="MessageSquare" size={12} />
                      <span>{ticket.comments?.length || 0} comments</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name={getStatusIcon(ticket.status)} size={20} className={`${
                    ticket.status === 'Resolved' ? 'text-success' :
                    ticket.status === 'Open' ? 'text-error' :
                    ticket.status === 'In Progress' ? 'text-primary' :
                    'text-text-secondary'
                  }`} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center space-x-4 text-sm text-text-secondary">
                  <span>Requester: {ticket.requester?.name || 'Client'}</span>
                  <span>•</span>
                  <span>Last Updated: {ticket.updatedAt}</span>
                </div>
                <Link 
                  to={`/projects/${ticket.projectId}?tab=tickets&tk=${ticket.id}`}
                  className="flex items-center space-x-2 text-sm text-accent hover:text-accent-foreground transition-colors"
                >
                  <span>View Details</span>
                  <Icon name="ArrowRight" size={14} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TicketsGlobal;