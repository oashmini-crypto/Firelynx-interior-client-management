import React, { useState, useEffect } from 'react';
import { approvalsAPI, filesAPI } from '../../../services/api';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const ProjectApprovals = ({ projectId }) => {
  const [approvals, setApprovals] = useState([]);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: ''
  });

  // Load approvals and files on component mount
  useEffect(() => {
    loadApprovals();
    loadFiles();
  }, [projectId]);

  const loadApprovals = async () => {
    try {
      const response = await approvalsAPI.getAll(projectId);
      if (response.data?.success) {
        setApprovals(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading approvals:', error);
      setError('Failed to load approvals');
    }
  };

  const loadFiles = async () => {
    try {
      // Use the correct endpoint for fetching files by project
      const response = await filesAPI.getByProject(projectId);
      if (response.data?.success) {
        const files = response.data.data || [];
        setAvailableFiles(files.map(file => ({
          id: file.id,
          name: file.filename || file.originalName || file.name,
          url: file.url,
          type: file.contentType?.includes('image') ? 'image' : 'document'
        })));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading files:', error);
      setError('Failed to load files');
      setLoading(false);
    }
  };

  const handleCreateApproval = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: ''
    });
    setSelectedFiles([]);
    setShowCreateModal(true);
  };

  const handleFileToggle = (file) => {
    setSelectedFiles(prev => {
      const isSelected = prev?.some(f => f?.id === file?.id);
      if (isSelected) {
        return prev?.filter(f => f?.id !== file?.id);
      } else {
        return [...prev, file];
      }
    });
  };

  const handleCreateApprovalPacket = async () => {
    if (!formData?.title?.trim()) {
      alert('Please enter an approval title');
      return;
    }
    
    if (!formData?.dueDate) {
      alert('Please select a due date');
      return;
    }

    try {
      const approvalData = {
        projectId,
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        fileAssetIds: selectedFiles.map(file => file.id)
      };

      const response = await approvalsAPI.create(approvalData);
      
      if (response.data?.success) {
        // Refresh the approvals list
        await loadApprovals();
        setShowCreateModal(false);
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          dueDate: ''
        });
        setSelectedFiles([]);
        
        alert(`Approval packet ${response.data.data.number} created successfully!`);
      } else {
        throw new Error(response.data?.error || 'Failed to create approval packet');
      }
    } catch (error) {
      console.error('Error creating approval packet:', error);
      alert(error.message || 'Failed to create approval packet. Please try again.');
    }
  };

  const handleSendApproval = (approval) => {
    setApprovals(approvals?.map(a =>
      a?.id === approval?.id
        ? { ...a, status: 'Sent', sentAt: new Date()?.toISOString()?.split('T')?.[0] }
        : a
    ));
    console.log('Approval sent successfully');
  };

  const handleViewApproval = (approval) => {
    setSelectedApproval(approval);
    setShowDetailModal(true);
  };

  const handleDeleteApproval = (approval) => {
    if (window.confirm(`Are you sure you want to delete approval "${approval?.title}"?`)) {
      setApprovals(approvals?.filter(a => a?.id !== approval?.id));
      console.log('Approval deleted successfully');
    }
  };

  const handleDownloadCertificate = (approval) => {
    // Mock PDF generation
    console.log('Generating certificate PDF for:', approval?.title);
    alert('Certificate PDF would be generated and downloaded here');
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'text-gray-600 bg-gray-100',
      'Sent': 'text-blue-600 bg-blue-100',
      'Approved': 'text-green-600 bg-green-100',
      'Declined': 'text-red-600 bg-red-100',
      'Expired': 'text-orange-600 bg-orange-100'
    };
    return colors?.[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Draft':
        return 'FileText';
      case 'Sent':
        return 'Send';
      case 'Approved':
        return 'CheckCircle';
      case 'Declined':
        return 'XCircle';
      case 'Expired':
        return 'Clock';
      default:
        return 'FileText';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Approvals</h2>
            <p className="text-text-secondary">Loading approvals...</p>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Approvals</h2>
            <p className="text-text-secondary text-red-600">{error}</p>
          </div>
          <Button onClick={() => { loadApprovals(); loadFiles(); }} iconName="RefreshCw">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Approvals</h2>
          <p className="text-text-secondary">Manage client approvals for designs and specifications</p>
        </div>
        <Button onClick={handleCreateApproval} iconName="Plus">
          Create Approval
        </Button>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {approvals?.map((approval) => (
          <div key={approval?.id} className="bg-card rounded-lg p-6 border border-border shadow-subtle">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-card-foreground">{approval?.title}</h3>
                  <span className="text-sm font-medium text-text-secondary">#{approval?.number}</span>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(approval?.status)}`}>
                    <Icon name={getStatusIcon(approval?.status)} size={12} className="inline mr-1" />
                    {approval?.status}
                  </span>
                </div>
                
                <p className="text-text-secondary mb-4">{approval?.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-text-secondary text-sm">Due Date:</span>
                    <div className="font-medium">{formatDate(approval?.dueDate)}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary text-sm">Items:</span>
                    <div className="font-medium">{approval?.items?.length} files</div>
                  </div>
                  <div>
                    <span className="text-text-secondary text-sm">Sent:</span>
                    <div className="font-medium">{formatDate(approval?.sentAt)}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary text-sm">Decided:</span>
                    <div className="font-medium">{formatDate(approval?.decidedAt)}</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-2">
                  {approval?.status === 'Draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendApproval(approval)}
                      iconName="Send"
                    >
                      Send
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewApproval(approval)}
                    iconName="Eye"
                  >
                    View
                  </Button>
                  {approval?.status === 'Approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadCertificate(approval)}
                      iconName="Download"
                    >
                      Certificate
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteApproval(approval)}
                    iconName="Trash2"
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {approvals?.length === 0 && (
          <div className="text-center py-12">
            <Icon name="CheckCircle" size={48} className="text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground mb-2">No approvals yet</h3>
            <p className="text-text-secondary mb-4">Create your first approval packet to get client feedback.</p>
            <Button onClick={handleCreateApproval} iconName="Plus">
              Create First Approval
            </Button>
          </div>
        )}
      </div>

      {/* Create Approval Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Create Approval Packet</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreateModal(false)}
                  iconName="X"
                />
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <Input
                    label="Approval Title"
                    value={formData?.title}
                    onChange={(e) => setFormData({ ...formData, title: e?.target?.value })}
                    required
                    placeholder="Enter approval title..."
                  />

                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <textarea
                      value={formData?.description}
                      onChange={(e) => setFormData({ ...formData, description: e?.target?.value })}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Describe what needs to be approved..."
                    />
                  </div>

                  <Input
                    label="Due Date"
                    type="date"
                    value={formData?.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e?.target?.value })}
                  />
                </div>

                {/* File Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Files to Include</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border border-border rounded-lg p-4">
                    {availableFiles?.map((file) => (
                      <div key={file?.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md">
                        <Checkbox
                          checked={selectedFiles?.some(f => f?.id === file?.id)}
                          onChange={() => handleFileToggle(file)}
                        />
                        <Icon name={file?.type === 'image' ? 'Image' : 'FileText'} size={16} />
                        <span className="text-sm">{file?.name}</span>
                      </div>
                    ))}
                    {availableFiles?.length === 0 && (
                      <div className="col-span-2 text-center py-4 text-gray-500 text-sm">
                        No existing files available. Upload files to the approval after creation.
                      </div>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm mt-2">
                    Selected: {selectedFiles?.length} files • You can upload additional files after creating the approval
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateApprovalPacket}
                  disabled={!formData?.title?.trim() || !formData?.dueDate}
                >
                  Create Approval Packet
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Detail Modal */}
      {showDetailModal && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{selectedApproval?.title}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDetailModal(false)}
                  iconName="X"
                />
              </div>

              <div className="space-y-6">
                {/* Approval Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <span className="text-text-secondary text-sm">Number:</span>
                    <div className="font-medium">{selectedApproval?.number}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary text-sm">Status:</span>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ml-2 ${getStatusColor(selectedApproval?.status)}`}>
                      {selectedApproval?.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary text-sm">Due Date:</span>
                    <div className="font-medium">{formatDate(selectedApproval?.dueDate)}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary text-sm">Sent:</span>
                    <div className="font-medium">{formatDate(selectedApproval?.sentAt)}</div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Approval Items</h3>
                  <div className="space-y-3">
                    {selectedApproval?.items?.map((item) => (
                      <div key={item?.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Icon name="FileText" size={16} />
                            <span className="font-medium">{item?.fileName}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                            item?.decision === 'Approved' ? 'text-green-600 bg-green-100' :
                            item?.decision === 'Declined'? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100'
                          }`}>
                            {item?.decision}
                          </span>
                        </div>
                        {item?.comment && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <strong>Comment:</strong> {item?.comment}
                          </div>
                        )}
                        {item?.decidedAt && (
                          <div className="text-text-secondary text-xs mt-2">
                            Decided on {formatDate(item?.decidedAt)}
                          </div>
                        )}
                      </div>
                    ))}
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

export default ProjectApprovals;