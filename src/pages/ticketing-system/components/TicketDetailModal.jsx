import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

import Select from '../../../components/ui/Select';

const TicketDetailModal = ({ ticket, isOpen, onClose, onUpdateTicket }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

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

  // Mock comments data
  const comments = [
    {
      id: 1,
      author: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
        role: 'Client'
      },
      content: `The lighting fixture in the living room is flickering intermittently. This started happening yesterday evening and seems to be getting worse. The fixture was installed last week as part of the renovation.`,
      timestamp: '2025-01-06T08:30:00Z',
      attachments: [
        { name: 'lighting-issue.jpg', size: '2.3 MB', type: 'image/jpeg' }
      ]
    },
    {
      id: 2,
      author: {
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        role: 'Designer'
      },
      content: `Thank you for reporting this issue. I've reviewed the installation photos and it appears there might be a loose connection. I'll schedule an electrician to inspect the fixture tomorrow morning.`,
      timestamp: '2025-01-06T09:15:00Z',
      attachments: []
    },
    {
      id: 3,
      author: {
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        role: 'Electrician'
      },
      content: `I've inspected the fixture and found a loose neutral wire connection. The issue has been resolved and I've tested the fixture multiple times. Everything is working properly now.`,
      timestamp: '2025-01-06T14:20:00Z',
      attachments: [
        { name: 'repair-completion.pdf', size: '1.1 MB', type: 'application/pdf' }
      ]
    }
  ];

  const statusHistory = [
    { status: 'open', timestamp: '2025-01-06T08:30:00Z', user: 'Sarah Johnson' },
    { status: 'in-progress', timestamp: '2025-01-06T09:15:00Z', user: 'John Doe' },
    { status: 'resolved', timestamp: '2025-01-06T14:20:00Z', user: 'Mike Chen' }
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

  const handleStatusChange = (newStatus) => {
    onUpdateTicket(ticket?.id, { status: newStatus });
  };

  const handleAssigneeChange = (newAssignee) => {
    const assigneeData = assigneeOptions?.find(a => a?.value === newAssignee);
    onUpdateTicket(ticket?.id, { 
      assignee: newAssignee === 'unassigned' ? null : {
        id: newAssignee,
        name: assigneeData?.label || 'Unknown',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      }
    });
  };

  const handleAddComment = async (e) => {
    e?.preventDefault();
    if (!newComment?.trim()) return;

    setIsSubmittingComment(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date?.toLocaleDateString(),
      time: date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-200 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-primary">{ticket?.title}</h2>
              <p className="text-sm text-text-secondary">Ticket #{ticket?.ticketNumber}</p>
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket?.priority)}`}>
              {ticket?.priority?.charAt(0)?.toUpperCase() + ticket?.priority?.slice(1)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Ticket Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-primary mb-3">Description</h3>
              <p className="text-text-secondary leading-relaxed">{ticket?.description}</p>
            </div>

            {/* Comments Thread */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Comments</h3>
              <div className="space-y-4">
                {comments?.map((comment) => {
                  const { date, time } = formatTimestamp(comment?.timestamp);
                  return (
                    <div key={comment?.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={comment?.author?.avatar}
                            alt={comment?.author?.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/assets/images/no_image.png';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-primary">{comment?.author?.name}</span>
                            <span className="text-xs text-text-secondary">({comment?.author?.role})</span>
                            <span className="text-xs text-text-secondary">•</span>
                            <span className="text-xs text-text-secondary">{date} at {time}</span>
                          </div>
                          <p className="text-text-secondary mb-3">{comment?.content}</p>
                          
                          {/* Attachments */}
                          {comment?.attachments?.length > 0 && (
                            <div className="space-y-2">
                              {comment?.attachments?.map((attachment, index) => (
                                <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                                  <Icon name="Paperclip" size={16} className="text-text-secondary" />
                                  <span className="text-sm text-primary">{attachment?.name}</span>
                                  <span className="text-xs text-text-secondary">({attachment?.size})</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    iconName="Download"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="border border-border rounded-lg p-4">
              <h4 className="font-medium text-primary mb-3">Add Comment</h4>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none mb-3"
                rows={3}
                placeholder="Type your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e?.target?.value)}
              />
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  iconName="Paperclip"
                  iconPosition="left"
                >
                  Attach File
                </Button>
                <Button
                  type="submit"
                  loading={isSubmittingComment}
                  iconName="Send"
                  iconPosition="left"
                >
                  Add Comment
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-border p-6 bg-muted/30">
            {/* Ticket Info */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-primary">Status</label>
                <Select
                  options={statusOptions}
                  value={ticket?.status}
                  onChange={handleStatusChange}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-primary">Assignee</label>
                <Select
                  options={assigneeOptions}
                  value={ticket?.assignee?.id || 'unassigned'}
                  onChange={handleAssigneeChange}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-primary">Created</label>
                <p className="text-sm text-text-secondary mt-1">
                  {new Date(ticket.createdAt)?.toLocaleDateString()} at {new Date(ticket.createdAt)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-primary">Project</label>
                <p className="text-sm text-text-secondary mt-1">Luxury Apartment Renovation</p>
              </div>
            </div>

            {/* Status History */}
            <div>
              <h4 className="font-medium text-primary mb-3">Status History</h4>
              <div className="space-y-3">
                {statusHistory?.map((entry, index) => {
                  const { date, time } = formatTimestamp(entry?.timestamp);
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium text-primary">
                          {entry?.status?.replace('-', ' ')?.replace(/\b\w/g, l => l?.toUpperCase())}
                        </p>
                        <p className="text-xs text-text-secondary">
                          by {entry?.user} on {date} at {time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;