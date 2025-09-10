import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ProjectTickets = ({ projectId }) => {
  const [tickets, setTickets] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'General',
    priority: 'Medium',
    assigneeUserId: ''
  });

  const categoryOptions = [
    { value: 'General', label: 'General' },
    { value: 'Design', label: 'Design' },
    { value: 'Site', label: 'Site' },
    { value: 'Billing', label: 'Billing' },
    { value: 'Other', label: 'Other' }
  ];

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' }
  ];

  const statusOptions = [
    { value: 'Open', label: 'Open' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Awaiting Client', label: 'Awaiting Client' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Closed', label: 'Closed' }
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

  // Load project tickets and team members on component mount
  useEffect(() => {
    fetchTickets();
    fetchTeamMembers();
  }, [projectId]);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`/api/tickets/project/${projectId}`);
      if (response.data.success) {
        setTickets(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`/api/team/project/${projectId}`);
      if (response.data.success) {
        setTeamMembers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateTicket = async () => {
    if (!formData.subject || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Upload files first if any
      let attachmentIds = [];
      if (attachedFiles.length > 0) {
        const formDataFiles = new FormData();
        attachedFiles.forEach((file, index) => {
          formDataFiles.append(`files`, file);
        });
        formDataFiles.append('projectId', projectId);
        
        const uploadResponse = await axios.post('/api/files/upload', formDataFiles, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (uploadResponse.data.success) {
          attachmentIds = uploadResponse.data.data.map(file => file.id);
        }
      }

      // Create the ticket
      const ticketData = {
        projectId,
        subject: formData.subject,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        requesterUserId: 'user_001', // Would come from auth context
        assigneeUserId: formData.assigneeUserId || null,
        attachments: attachmentIds
      };

      const response = await axios.post('/api/tickets', ticketData);
      
      if (response.data.success) {
        await fetchTickets(); // Refresh the tickets list
        setIsCreateModalOpen(false);
        setFormData({
          subject: '',
          description: '',
          category: 'General',
          priority: 'Medium',
          assigneeUserId: ''
        });
        setAttachedFiles([]);
      } else {
        alert('Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (ticketId, newStatus) => {
    // Update in store
    const ticketIndex = entities.tickets.findIndex(ticket => ticket.id === ticketId);
    if (ticketIndex !== -1) {
      entities.tickets[ticketIndex].status = newStatus;
      entities.tickets[ticketIndex].updatedAt = new Date().toISOString().split('T')[0];
      setTickets(getTicketsByProjectId(projectId));
      console.log('Ticket status updated successfully');
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTicket) return;

    const comment = {
      id: `comment_${Date.now()}`,
      ticketId: selectedTicket.id,
      authorUserId: 'user_001', // Current user
      body: newComment,
      attachments: [],
      createdAt: new Date().toISOString()
    };

    // Add to store
    entities.ticketComments.push(comment);
    
    // Update ticket's updatedAt
    const ticketIndex = entities.tickets.findIndex(ticket => ticket.id === selectedTicket.id);
    if (ticketIndex !== -1) {
      entities.tickets[ticketIndex].updatedAt = new Date().toISOString().split('T')[0];
    }

    // Refresh tickets and selected ticket
    const updatedTickets = getTicketsByProjectId(projectId);
    const updatedSelectedTicket = updatedTickets.find(t => t.id === selectedTicket.id);
    setTickets(updatedTickets);
    setSelectedTicket(updatedSelectedTicket);
    setNewComment('');

    console.log('Comment added successfully');
  };

  const openTicketDetail = (ticket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">Project Tickets</h3>
          <p className="text-sm text-text-secondary">Client-raised issues and requests</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center space-x-2">
          <Icon name="Plus" size={16} />
          <span>New Ticket</span>
        </Button>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <Icon name="MessageSquare" size={48} className="mx-auto text-text-secondary mb-4" />
            <h4 className="font-medium text-primary mb-2">No Tickets</h4>
            <p className="text-text-secondary mb-4">No issues or requests have been submitted for this project</p>
            <Button onClick={() => setIsCreateModalOpen(true)} variant="outline">
              Create Ticket
            </Button>
          </div>
        ) : (
          tickets.map(ticket => (
            <div 
              key={ticket.id} 
              className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openTicketDetail(ticket)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-primary">{ticket.number}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority} Priority
                    </span>
                  </div>
                  <h5 className="font-medium text-primary mb-2">{ticket.subject}</h5>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-text-secondary">
                    <div className="flex items-center space-x-1">
                      <Icon name="Tag" size={12} />
                      <span>{ticket.category}</span>
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
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <Select
                  value={ticket.status}
                  onChange={(newStatus) => {
                    handleStatusChange(ticket.id, newStatus);
                    // Prevent event bubbling to avoid opening modal
                    event?.stopPropagation();
                  }}
                  options={statusOptions}
                  className="w-40"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary">Create New Ticket</h2>
                <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                  <Icon name="X" size={20} />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Detailed description of the issue or request"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Category
                  </label>
                  <Select
                    value={formData.category}
                    onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    options={categoryOptions}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Priority
                  </label>
                  <Select
                    value={formData.priority}
                    onChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                    options={priorityOptions}
                  />
                </div>
              </div>

              {/* Team Assignment */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Assign to Team Member
                </label>
                <Select
                  value={formData.assigneeUserId}
                  onChange={(value) => setFormData(prev => ({ ...prev, assigneeUserId: value }))}
                  options={[
                    { value: '', label: 'Auto-assign' },
                    ...teamMembers.map(member => ({
                      value: member.userId,
                      label: `${member.userName} (${member.role})`
                    }))
                  ]}
                  placeholder="Select team member"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Attach Evidence Files
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6">
                  <input
                    type="file"
                    id="ticket-files"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <label
                    htmlFor="ticket-files"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Icon name="Upload" size={32} className="text-text-secondary" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-primary">
                        Click to upload evidence files
                      </p>
                      <p className="text-xs text-text-secondary">
                        Support images, PDFs, documents up to 10MB each
                      </p>
                    </div>
                  </label>
                </div>
                
                {/* File Preview */}
                {attachedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-primary">Attached Files:</p>
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted rounded p-3">
                        <div className="flex items-center space-x-3">
                          <Icon name="File" size={16} className="text-text-secondary" />
                          <div>
                            <p className="text-sm font-medium text-primary">{file.name}</p>
                            <p className="text-xs text-text-secondary">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <Icon name="X" size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-border">
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTicket} loading={isLoading}>
                  Create Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {isDetailModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface border-b border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-primary">{selectedTicket.number}</h2>
                  <p className="text-text-secondary">{selectedTicket.subject}</p>
                </div>
                <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)}>
                  <Icon name="X" size={20} />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Ticket Details */}
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                  <span className={`text-sm font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority} Priority
                  </span>
                  <span className="text-sm text-text-secondary">{selectedTicket.category}</span>
                </div>
                <p className="text-sm text-text-secondary">{selectedTicket.description}</p>
              </div>

              {/* Attached Evidence Files */}
              {selectedTicket.attachments && JSON.parse(selectedTicket.attachments || '[]').length > 0 && (
                <div>
                  <h3 className="font-semibold text-primary mb-4">Attached Evidence Files</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {JSON.parse(selectedTicket.attachments).map((fileId, index) => (
                      <div key={index} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <Icon name="File" size={24} className="text-text-secondary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-primary">Evidence File {index + 1}</p>
                            <p className="text-xs text-text-secondary">Uploaded by client</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/api/files/${fileId}/download`, '_blank')}
                            >
                              <Icon name="Download" size={14} />
                              <span className="ml-1">Download</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/api/files/${fileId}`, '_blank')}
                            >
                              <Icon name="Eye" size={14} />
                              <span className="ml-1">View</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assignment Information */}
              <div>
                <h3 className="font-semibold text-primary mb-4">Assignment Details</h3>
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-primary">Requested by</label>
                      <p className="text-sm text-text-secondary mt-1">
                        {selectedTicket.requesterName || 'Client'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-primary">Assigned to</label>
                      <p className="text-sm text-text-secondary mt-1">
                        {selectedTicket.assigneeName || 'Auto-assign'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Thread */}
              <div>
                <h3 className="font-semibold text-primary mb-4">Comments ({selectedTicket.comments?.length || 0})</h3>
                <div className="space-y-4">
                  {selectedTicket.comments?.map(comment => (
                    <div key={comment.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon name="User" size={16} className="text-text-secondary" />
                        <span className="font-medium text-primary">Team Member</span>
                        <span className="text-xs text-text-secondary">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">{comment.body}</p>
                    </div>
                  ))}

                  {/* Add Comment */}
                  <div className="bg-muted rounded-lg p-4">
                    <textarea
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none bg-surface"
                      rows={3}
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex justify-end mt-3">
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTickets;