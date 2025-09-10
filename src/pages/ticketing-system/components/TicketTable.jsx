import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const TicketTable = ({ tickets, onTicketSelect, onStatusUpdate, onAssignTicket }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const assigneeOptions = [
    { value: 'john-doe', label: 'John Doe' },
    { value: 'sarah-wilson', label: 'Sarah Wilson' },
    { value: 'mike-chen', label: 'Mike Chen' },
    { value: 'emma-davis', label: 'Emma Davis' },
    { value: 'unassigned', label: 'Unassigned' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-error text-error-foreground';
      case 'high':
        return 'bg-warning text-warning-foreground';
      case 'medium':
        return 'bg-accent text-accent-foreground';
      case 'low':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'in-progress':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'pending':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'resolved':
        return 'bg-success/10 text-success border-success/20';
      case 'closed':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getSLAStatus = (ticket) => {
    const now = new Date();
    const created = new Date(ticket.createdAt);
    const hoursElapsed = (now - created) / (1000 * 60 * 60);
    
    let slaHours = 24; // Default SLA
    if (ticket?.priority === 'critical') slaHours = 4;
    else if (ticket?.priority === 'high') slaHours = 8;
    else if (ticket?.priority === 'medium') slaHours = 16;

    const isOverdue = hoursElapsed > slaHours;
    const isNearDue = hoursElapsed > slaHours * 0.8;

    return {
      isOverdue,
      isNearDue,
      hoursRemaining: Math.max(0, slaHours - hoursElapsed)
    };
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTickets = React.useMemo(() => {
    let sortableTickets = [...tickets];
    if (sortConfig?.key) {
      sortableTickets?.sort((a, b) => {
        if (a?.[sortConfig?.key] < b?.[sortConfig?.key]) {
          return sortConfig?.direction === 'asc' ? -1 : 1;
        }
        if (a?.[sortConfig?.key] > b?.[sortConfig?.key]) {
          return sortConfig?.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTickets;
  }, [tickets, sortConfig]);

  const SortButton = ({ column, children }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center space-x-1 text-left font-medium text-text-secondary hover:text-primary transition-smooth"
    >
      <span>{children}</span>
      <Icon 
        name={sortConfig?.key === column && sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
        size={14} 
      />
    </button>
  );

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left">
                <SortButton column="ticketNumber">Ticket #</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton column="title">Title</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton column="priority">Priority</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton column="assignee">Assignee</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton column="status">Status</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton column="createdAt">Created</SortButton>
              </th>
              <th className="px-6 py-3 text-left">SLA</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedTickets?.map((ticket) => {
              const slaStatus = getSLAStatus(ticket);
              return (
                <tr key={ticket?.id} className="hover:bg-muted/50 transition-smooth">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-accent">#{ticket?.ticketNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onTicketSelect(ticket)}
                      className="text-left hover:text-accent transition-smooth"
                    >
                      <p className="font-medium text-primary">{ticket?.title}</p>
                      <p className="text-sm text-text-secondary line-clamp-1">{ticket?.description}</p>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket?.priority)}`}>
                      {ticket?.priority?.charAt(0)?.toUpperCase() + ticket?.priority?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {ticket?.assignee ? (
                        <>
                          <div className="w-6 h-6 rounded-full overflow-hidden">
                            <img
                              src={ticket?.assignee?.avatar}
                              alt={ticket?.assignee?.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = '/assets/images/no_image.png';
                              }}
                            />
                          </div>
                          <span className="text-sm text-primary">{ticket?.assignee?.name}</span>
                        </>
                      ) : (
                        <span className="text-sm text-text-secondary">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket?.status)}`}>
                      {ticket?.status?.replace('-', ' ')?.replace(/\b\w/g, l => l?.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-primary">{new Date(ticket.createdAt)?.toLocaleDateString()}</p>
                      <p className="text-text-secondary">{new Date(ticket.createdAt)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      <Icon 
                        name={slaStatus?.isOverdue ? 'AlertTriangle' : slaStatus?.isNearDue ? 'Clock' : 'CheckCircle'} 
                        size={14} 
                        className={slaStatus?.isOverdue ? 'text-error' : slaStatus?.isNearDue ? 'text-warning' : 'text-success'} 
                      />
                      <span className={`text-xs ${slaStatus?.isOverdue ? 'text-error' : slaStatus?.isNearDue ? 'text-warning' : 'text-success'}`}>
                        {slaStatus?.isOverdue ? 'Overdue' : `${Math.round(slaStatus?.hoursRemaining)}h`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTicketSelect(ticket)}
                        iconName="Eye"
                      />
                      <Select
                        options={statusOptions}
                        value={ticket?.status}
                        onChange={(value) => onStatusUpdate(ticket?.id, value)}
                        className="w-32"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-border">
        {sortedTickets?.map((ticket) => {
          const slaStatus = getSLAStatus(ticket);
          return (
            <div key={ticket?.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-sm text-accent">#{ticket?.ticketNumber}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket?.priority)}`}>
                      {ticket?.priority?.charAt(0)?.toUpperCase() + ticket?.priority?.slice(1)}
                    </span>
                  </div>
                  <button
                    onClick={() => onTicketSelect(ticket)}
                    className="text-left"
                  >
                    <h3 className="font-medium text-primary mb-1">{ticket?.title}</h3>
                    <p className="text-sm text-text-secondary line-clamp-2">{ticket?.description}</p>
                  </button>
                </div>
                <div className="flex items-center space-x-1 ml-3">
                  <Icon 
                    name={slaStatus?.isOverdue ? 'AlertTriangle' : slaStatus?.isNearDue ? 'Clock' : 'CheckCircle'} 
                    size={14} 
                    className={slaStatus?.isOverdue ? 'text-error' : slaStatus?.isNearDue ? 'text-warning' : 'text-success'} 
                  />
                  <span className={`text-xs ${slaStatus?.isOverdue ? 'text-error' : slaStatus?.isNearDue ? 'text-warning' : 'text-success'}`}>
                    {slaStatus?.isOverdue ? 'Overdue' : `${Math.round(slaStatus?.hoursRemaining)}h`}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {ticket?.assignee ? (
                    <>
                      <div className="w-6 h-6 rounded-full overflow-hidden">
                        <img
                          src={ticket?.assignee?.avatar}
                          alt={ticket?.assignee?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/assets/images/no_image.png';
                          }}
                        />
                      </div>
                      <span className="text-sm text-primary">{ticket?.assignee?.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-text-secondary">Unassigned</span>
                  )}
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket?.status)}`}>
                  {ticket?.status?.replace('-', ' ')?.replace(/\b\w/g, l => l?.toUpperCase())}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">
                  {new Date(ticket.createdAt)?.toLocaleDateString()} at {new Date(ticket.createdAt)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTicketSelect(ticket)}
                  iconName="Eye"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TicketTable;