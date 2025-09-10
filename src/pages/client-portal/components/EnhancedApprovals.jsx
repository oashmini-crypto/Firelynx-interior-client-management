// Enhanced Approvals Section with Interactive Approval Workflow
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import TextArea from '../../../components/ui/TextArea';
import Input from '../../../components/ui/Input';

const EnhancedApprovals = ({ approvals, loading, onApprovalUpdate }) => {
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [comment, setComment] = useState('');
  const [signatureName, setSignatureName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'Sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleApprovalDecision = async (approval, decision) => {
    try {
      const updateData = {
        status: decision,
        clientComment: comment,
        signatureName: signatureName,
        decidedAt: new Date().toISOString()
      };
      
      if (onApprovalUpdate) {
        await onApprovalUpdate(approval.id, updateData);
      }
      
      setSelectedApproval(null);
      setComment('');
      setSignatureName('');
    } catch (error) {
      console.error('Error updating approval:', error);
    }
  };

  const handleFilePreview = (file) => {
    if (file.contentType?.startsWith('image/') || file.contentType?.includes('pdf')) {
      window.open(file.url, '_blank');
    }
  };

  const handleFileDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName || file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredApprovals = approvals.filter(approval =>
    approval.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approval.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search approvals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Approvals List */}
      {filteredApprovals.length > 0 ? (
        <div className="grid gap-6">
          {filteredApprovals.map((approval) => (
            <div key={approval.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Approval Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{approval.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(approval.status)}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          approval.status === 'Approved' ? 'bg-green-400' :
                          approval.status === 'Rejected' ? 'bg-red-400' :
                          approval.status === 'Sent' ? 'bg-blue-400' :
                          'bg-yellow-400'
                        }`}></div>
                        {approval.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{approval.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>Due: {new Date(approval.dueDate).toLocaleDateString()}</span>
                      {approval.sentAt && (
                        <span>Sent: {new Date(approval.sentAt).toLocaleDateString()}</span>
                      )}
                      {approval.decidedAt && (
                        <span>Decided: {new Date(approval.decidedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {approval.status === 'Sent' && (
                    <div className="ml-6 flex space-x-3">
                      <Button
                        onClick={() => setSelectedApproval(approval)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Icon name="Check" size={16} className="mr-1" />
                        Review & Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Items */}
              {approval.items && approval.items.length > 0 && (
                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">
                    Items for Review ({approval.items.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {approval.items.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden group">
                        {/* File Preview */}
                        <div className="h-32 bg-gray-100 relative">
                          {item.contentType?.startsWith('image/') ? (
                            <img
                              src={item.url}
                              alt={item.filename}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => handleFilePreview(item)}
                            />
                          ) : (
                            <div 
                              className="w-full h-full flex items-center justify-center cursor-pointer"
                              onClick={() => handleFilePreview(item)}
                            >
                              <Icon name="FileText" size={32} className="text-gray-400" />
                            </div>
                          )}
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleFilePreview(item)}
                              className="bg-white text-gray-900"
                            >
                              <Icon name="Eye" size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleFileDownload(item)}
                              className="bg-white text-gray-900"
                            >
                              <Icon name="Download" size={14} />
                            </Button>
                          </div>
                        </div>

                        {/* File Info */}
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-900 truncate" title={item.filename}>
                            {item.filename}
                          </p>
                          {item.decision && (
                            <div className={`mt-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              item.decision === 'Approved' ? 'bg-green-100 text-green-800' :
                              item.decision === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.decision}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Client Comment */}
              {approval.clientComment && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Your Comment</h5>
                  <p className="text-sm text-gray-700">{approval.clientComment}</p>
                  {approval.signatureName && (
                    <p className="text-xs text-gray-500 mt-2">Signed by: {approval.signatureName}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="CheckCircle" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No approvals found' : 'No approvals pending'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : 'Approval requests will appear here when they require your review.'
            }
          </p>
        </div>
      )}

      {/* Approval Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Review Approval</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedApproval(null)}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{selectedApproval.title}</h4>
                <p className="text-sm text-gray-600">{selectedApproval.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Optional)
                </label>
                <TextArea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add any comments about this approval..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name for Digital Signature *
                </label>
                <Input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => handleApprovalDecision(selectedApproval, 'Approved')}
                  disabled={!signatureName}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Icon name="Check" size={16} className="mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleApprovalDecision(selectedApproval, 'Rejected')}
                  disabled={!signatureName}
                  variant="outline"
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Icon name="X" size={16} className="mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedApprovals;