import React, { useState, useEffect } from 'react';
import ProfessionalSidebar from '../../components/ui/ProfessionalSidebar';
import NotificationCenter from '../../components/ui/NotificationCenter';

import Button from '../../components/ui/Button';
import TicketFilters from './components/TicketFilters';
import TicketMetrics from './components/TicketMetrics';
import TicketTable from './components/TicketTable';
import CreateTicketModal from './components/CreateTicketModal';
import TicketDetailModal from './components/TicketDetailModal';

const TicketingSystem = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState({});

  // Mock tickets data
  const mockTickets = [
    {
      id: 1,
      ticketNumber: 'TK-001234',
      title: 'Lighting fixture flickering in living room',
      description: 'The main chandelier in the living room has been flickering intermittently since yesterday. The issue seems to be getting worse and may be a safety concern.',
      priority: 'high',
      status: 'resolved',
      assignee: {
        id: 'john-doe',
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      },
      project: 'luxury-apartment',
      createdAt: '2025-01-06T08:30:00Z',
      updatedAt: '2025-01-06T14:20:00Z'
    },
    {
      id: 2,
      ticketNumber: 'TK-001235',
      title: 'Paint color mismatch in bedroom',
      description: 'The paint color applied to the master bedroom walls does not match the approved color sample. The current color appears to be significantly darker than expected.',
      priority: 'medium',
      status: 'in-progress',
      assignee: {
        id: 'sarah-wilson',
        name: 'Sarah Wilson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
      },
      project: 'luxury-apartment',
      createdAt: '2025-01-05T14:15:00Z',
      updatedAt: '2025-01-06T09:30:00Z'
    },
    {
      id: 3,
      ticketNumber: 'TK-001236',
      title: 'Kitchen cabinet door alignment issue',
      description: 'Several kitchen cabinet doors are not properly aligned and do not close flush. This affects both the appearance and functionality of the kitchen storage.',
      priority: 'medium',
      status: 'open',
      assignee: {
        id: 'mike-chen',
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
      },
      project: 'modern-office',
      createdAt: '2025-01-05T11:20:00Z',
      updatedAt: '2025-01-05T11:20:00Z'
    },
    {
      id: 4,
      ticketNumber: 'TK-001237',
      title: 'HVAC system not heating properly',
      description: 'The heating system is not maintaining the set temperature. The office space remains cold despite the thermostat being set to 72°F.',
      priority: 'critical',
      status: 'open',
      assignee: null,
      project: 'modern-office',
      createdAt: '2025-01-06T07:45:00Z',
      updatedAt: '2025-01-06T07:45:00Z'
    },
    {
      id: 5,
      ticketNumber: 'TK-001238',
      title: 'Bathroom tile grout discoloration',
      description: 'The grout between bathroom tiles is showing signs of discoloration and possible mold growth. This needs immediate attention for health and aesthetic reasons.',
      priority: 'high',
      status: 'pending',
      assignee: {
        id: 'emma-davis',
        name: 'Emma Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
      },
      project: 'boutique-hotel',
      createdAt: '2025-01-04T16:30:00Z',
      updatedAt: '2025-01-05T10:15:00Z'
    },
    {
      id: 6,
      ticketNumber: 'TK-001239',
      title: 'Window blinds installation incomplete',
      description: 'The window blinds in the conference room have been partially installed but several windows are still missing their blinds, affecting privacy and light control.',
      priority: 'low',
      status: 'closed',
      assignee: {
        id: 'john-doe',
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      },
      project: 'modern-office',
      createdAt: '2025-01-03T13:10:00Z',
      updatedAt: '2025-01-04T15:45:00Z'
    },
    {
      id: 7,
      ticketNumber: 'TK-001240',
      title: 'Electrical outlet not working in kitchen',
      description: 'One of the kitchen electrical outlets near the island is not providing power. This outlet is needed for small appliances and affects kitchen functionality.',
      priority: 'medium',
      status: 'in-progress',
      assignee: {
        id: 'mike-chen',
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
      },
      project: 'residential-villa',
      createdAt: '2025-01-06T10:20:00Z',
      updatedAt: '2025-01-06T11:30:00Z'
    },
    {
      id: 8,
      ticketNumber: 'TK-001241',
      title: 'Flooring scratch repair needed',
      description: 'There are several scratches on the hardwood flooring in the main hallway that occurred during furniture installation. These need professional repair.',
      priority: 'low',
      status: 'open',
      assignee: {
        id: 'sarah-wilson',
        name: 'Sarah Wilson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
      },
      project: 'residential-villa',
      createdAt: '2025-01-05T09:15:00Z',
      updatedAt: '2025-01-05T09:15:00Z'
    }
  ];

  useEffect(() => {
    setTickets(mockTickets);
    setFilteredTickets(mockTickets);
  }, []);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setFilteredTickets(tickets);
  };

  const applyFilters = (filterValues) => {
    let filtered = [...tickets];

    // Search filter
    if (filterValues?.search) {
      const searchTerm = filterValues?.search?.toLowerCase();
      filtered = filtered?.filter(ticket =>
        ticket?.title?.toLowerCase()?.includes(searchTerm) ||
        ticket?.description?.toLowerCase()?.includes(searchTerm) ||
        ticket?.ticketNumber?.toLowerCase()?.includes(searchTerm)
      );
    }

    // Priority filter
    if (filterValues?.priority) {
      filtered = filtered?.filter(ticket => ticket?.priority === filterValues?.priority);
    }

    // Status filter
    if (filterValues?.status) {
      filtered = filtered?.filter(ticket => ticket?.status === filterValues?.status);
    }

    // Assignee filter
    if (filterValues?.assignee) {
      if (filterValues?.assignee === 'unassigned') {
        filtered = filtered?.filter(ticket => !ticket?.assignee);
      } else {
        filtered = filtered?.filter(ticket => ticket?.assignee?.id === filterValues?.assignee);
      }
    }

    // Project filter
    if (filterValues?.project) {
      filtered = filtered?.filter(ticket => ticket?.project === filterValues?.project);
    }

    // Date range filter
    if (filterValues?.dateRange) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered?.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt);
        
        switch (filterValues?.dateRange) {
          case 'today':
            return ticketDate >= startOfDay;
          case 'week':
            const weekAgo = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000);
            return ticketDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(startOfDay.getFullYear(), startOfDay.getMonth() - 1, startOfDay.getDate());
            return ticketDate >= monthAgo;
          case 'quarter':
            const quarterAgo = new Date(startOfDay.getFullYear(), startOfDay.getMonth() - 3, startOfDay.getDate());
            return ticketDate >= quarterAgo;
          default:
            return true;
        }
      });
    }

    setFilteredTickets(filtered);
  };

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const handleStatusUpdate = (ticketId, newStatus) => {
    const updatedTickets = tickets?.map(ticket =>
      ticket?.id === ticketId
        ? { ...ticket, status: newStatus, updatedAt: new Date()?.toISOString() }
        : ticket
    );
    setTickets(updatedTickets);
    applyFilters(filters);
  };

  const handleAssignTicket = (ticketId, assigneeId) => {
    // Implementation for ticket assignment
    console.log('Assign ticket:', ticketId, 'to:', assigneeId);
  };

  const handleCreateTicket = (newTicket) => {
    const updatedTickets = [...tickets, newTicket];
    setTickets(updatedTickets);
    applyFilters(filters);
  };

  const handleUpdateTicket = (ticketId, updates) => {
    const updatedTickets = tickets?.map(ticket =>
      ticket?.id === ticketId
        ? { ...ticket, ...updates, updatedAt: new Date()?.toISOString() }
        : ticket
    );
    setTickets(updatedTickets);
    applyFilters(filters);
    
    // Update selected ticket if it's the one being updated
    if (selectedTicket && selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, ...updates });
    }
  };

  const notificationCounts = {
    tickets: filteredTickets?.filter(t => t?.status === 'open' || t?.status === 'critical')?.length,
    variations: 3
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
              <h1 className="text-2xl font-bold text-primary">Ticketing System</h1>
              <p className="text-text-secondary">Manage support requests and issue tracking</p>
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
                New Ticket
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="xl:col-span-3 space-y-6">
              <TicketFilters
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-primary">
                    All Tickets ({filteredTickets?.length})
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {filteredTickets?.filter(t => t?.status === 'open')?.length} open, {filteredTickets?.filter(t => t?.status === 'in-progress')?.length} in progress
                  </p>
                </div>
              </div>

              <TicketTable
                tickets={filteredTickets}
                onTicketSelect={handleTicketSelect}
                onStatusUpdate={handleStatusUpdate}
                onAssignTicket={handleAssignTicket}
              />
            </div>

            {/* Sidebar Metrics */}
            <div className="xl:col-span-1">
              <TicketMetrics />
            </div>
          </div>
        </div>
      </div>
      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTicket={handleCreateTicket}
      />
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdateTicket={handleUpdateTicket}
      />
    </div>
  );
};

export default TicketingSystem;