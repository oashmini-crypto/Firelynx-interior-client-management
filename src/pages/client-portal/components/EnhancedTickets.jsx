// Enhanced Support Tickets with File Attachments and Status Tracking
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import TextArea from '../../../components/ui/TextArea';

const EnhancedTickets = ({ tickets, loading, onCreateTicket, projectId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  
  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'Medium',
    category: 'Support',
    attachments: []
  });

  // Filter and sort tickets
  const filteredAndSortedTickets = React.useMemo(() => {
    let filtered = tickets.filter(ticket => {
      const matchesSearch = 
        (ticket.title || ticket.subject)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'updated':
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        default:
          return 0;
      }
    });
  }, [tickets, searchTerm, filterStatus, sortBy]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      if (onCreateTicket) {
        await onCreateTicket({
          ...newTicket,
          projectId,
          requesterUserId: 'client-user' // TODO: Get actual client user ID
        });
      }
      
      // Reset form
      setNewTicket({
        subject: '',
        description: '',
        priority: 'Medium',
        category: 'Support',
        attachments: []
      });
      setShowNewTicketForm(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewTicket(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setNewTicket(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
            className="w-full sm:w-48"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </Select>
          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value)}
            className="w-full sm:w-48"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">By Priority</option>
            <option value="updated">Recently Updated</option>
          </Select>
        </div>
        <Button
          onClick={() => setShowNewTicketForm(true)}
          className="ml-4"
        >
          <Icon name="Plus" size={16} className="mr-2" />
          New Ticket
        </Button>
      </div>

      {/* New Ticket Form Modal */}
      {showNewTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Create Support Ticket</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewTicketForm(false)}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <Input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <Select
                    value={newTicket.priority}
                    onChange={(value) => setNewTicket(prev => ({ ...prev, priority: value }))}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select
                    value={newTicket.category}
                    onChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}
                  >
                    <option value="Support">General Support</option>
                    <option value="Technical">Technical Issue</option>
                    <option value="Design">Design Request</option>
                    <option value="Content">Content Update</option>
                    <option value="Feature">Feature Request</option>
                    <option value="Access">Access Issue</option>
                    <option value="Performance">Performance Issue</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <TextArea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Please provide detailed information about your request or issue..."
                  rows={5}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                
                {/* Show attached files */}
                {newTicket.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {newTicket.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <div className="flex items-center space-x-2">
                          <Icon name="Paperclip" size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-900">{file.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Icon name="X" size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={!newTicket.title || !newTicket.description}
                  className="flex-1"
                >
                  <Icon name="Send" size={16} className="mr-2" />
                  Create Ticket
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewTicketForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tickets List */}
      {filteredAndSortedTickets.length > 0 ? (
        <div className="grid gap-6">
          {filteredAndSortedTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Ticket Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          ticket.status === 'Resolved' ? 'bg-green-400' :
                          ticket.status === 'In Progress' ? 'bg-yellow-400' :
                          ticket.status === 'Closed' ? 'bg-gray-400' :
                          'bg-blue-400'
                        }`}></div>
                        {ticket.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                      <span>#{ticket.ticketId || ticket.id}</span>
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      {ticket.category && <span>Category: {ticket.category}</span>}
                      <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                        Priority: {ticket.priority}
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm">{ticket.description}</p>
                  </div>
                </div>
              </div>

              {/* Response/Updates */}
              {ticket.responses && ticket.responses.length > 0 && (
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Recent Updates</h4>
                  <div className="space-y-3">
                    {ticket.responses.slice(-2).map((response, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{response.author || 'Support Team'}</span>
                          <span className="text-gray-500">{new Date(response.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="p-6">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">
                    Attachments ({ticket.attachments.length})
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {ticket.attachments.map((attachment, index) => (
                      <div key={index} className="border border-gray-200 rounded p-3 hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Icon name="Paperclip" size={16} className="text-gray-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 truncate" title={attachment.filename}>
                              {attachment.filename}
                            </p>
                            <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="MessageSquare" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No tickets found' : 'No support tickets yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Create a support ticket when you need assistance with your project.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Button
              onClick={() => setShowNewTicketForm(true)}
              className="mx-auto"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Create Your First Ticket
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedTickets;