import React, { useState } from 'react';
import Button from '../ui/Button';
import Icon from '../AppIcon';
import { useVariationFiles, useApproveVariation, useDeclineVariation } from '../../hooks/useVariationFiles';

const ClientVariationApproval = ({ variation, onDecisionComplete }) => {
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const { data: files = [], isLoading: filesLoading } = useVariationFiles(variation.id);
  const approveVariation = useApproveVariation();
  const declineVariation = useDeclineVariation();

  const formatCurrency = (amount) => {
    return `AED ${parseFloat(amount || 0).toLocaleString('en-AE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const parseCostBreakdown = (variation) => {
    try {
      // Handle both parsed objects and JSON strings
      const materialCosts = typeof variation.materialCosts === 'string' 
        ? JSON.parse(variation.materialCosts || '[]')
        : variation.materialCosts || [];
        
      const laborCosts = typeof variation.laborCosts === 'string'
        ? JSON.parse(variation.laborCosts || '[]') 
        : variation.laborCosts || [];
        
      const additionalCosts = typeof variation.additionalCosts === 'string'
        ? JSON.parse(variation.additionalCosts || '[]')
        : variation.additionalCosts || [];
      
      return { materialCosts, laborCosts, additionalCosts };
    } catch (error) {
      console.error('Error parsing cost breakdown:', error);
      return { materialCosts: [], laborCosts: [], additionalCosts: [] };
    }
  };

  const handleApprove = async () => {
    try {
      await approveVariation.mutateAsync({
        variationId: variation.id,
        comment: comment.trim()
      });
      
      setShowApprovalForm(false);
      setComment('');
      onDecisionComplete?.('approved');
    } catch (error) {
      console.error('Error approving variation:', error);
    }
  };

  const handleDecline = async () => {
    if (!comment.trim()) {
      alert('Please provide a reason for declining this variation.');
      return;
    }

    try {
      await declineVariation.mutateAsync({
        variationId: variation.id,
        comment: comment.trim()
      });
      
      setShowDeclineForm(false);
      setComment('');
      onDecisionComplete?.('declined');
    } catch (error) {
      console.error('Error declining variation:', error);
    }
  };

  const renderFilePreview = (file) => {
    const isImage = file.fileType?.includes('image');
    const isPDF = file.fileType?.includes('pdf');

    return (
      <div 
        key={file.id}
        className="bg-white rounded-lg border border-border p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedFile(file)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {isImage && file.previewUrl ? (
              <img
                src={file.previewUrl}
                alt={file.fileName}
                className="w-full h-full object-cover"
              />
            ) : isPDF ? (
              <Icon name="FileText" size={24} className="text-red-600" />
            ) : (
              <Icon name="File" size={24} className="text-text-secondary" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">
              {file.fileName}
            </p>
            <p className="text-xs text-text-secondary">
              {formatFileSize(file.size)}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <Icon name="Eye" size={12} className="text-accent" />
              <span className="text-xs text-accent">Click to preview</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const { materialCosts, laborCosts, additionalCosts } = parseCostBreakdown(variation);

  // Don't show approval interface if already decided
  const canApprove = variation.status === 'submitted';
  const isDecided = ['approved', 'declined'].includes(variation.status);

  return (
    <div className="client-variation-approval bg-white rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-primary">
              {variation.title || variation.changeDescription}
            </h2>
            <div className="flex items-center space-x-3 mt-2">
              <span className="text-sm text-text-secondary">
                {variation.number}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(variation.status)}`}>
                {variation.status.charAt(0).toUpperCase() + variation.status.slice(1)}
              </span>
              <span className="text-sm text-text-secondary">
                {new Date(variation.date).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(variation.priceImpact)}
            </div>
            <div className="text-sm text-text-secondary">
              {variation.timeImpact > 0 && `+${variation.timeImpact} days`}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-lg font-medium text-primary mb-2">Description</h3>
          <p className="text-text-secondary">{variation.changeDescription}</p>
          {variation.reasonDescription && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-primary mb-1">Justification</h4>
              <p className="text-sm text-text-secondary">{variation.reasonDescription}</p>
            </div>
          )}
        </div>

        {/* Cost Breakdown */}
        <div>
          <h3 className="text-lg font-medium text-primary mb-4">Cost Breakdown</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Material Costs */}
            {materialCosts.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Material Costs</h4>
                <div className="space-y-2">
                  {materialCosts.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-blue-800">{item.description}</span>
                      <span className="font-medium text-blue-900">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-blue-200 mt-2 pt-2">
                  <div className="flex justify-between font-medium text-blue-900">
                    <span>Subtotal</span>
                    <span>
                      {formatCurrency(materialCosts.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Labor Costs */}
            {laborCosts.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-3">Labor Costs</h4>
                <div className="space-y-2">
                  {laborCosts.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-green-800">{item.description}</span>
                      <span className="font-medium text-green-900">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-green-200 mt-2 pt-2">
                  <div className="flex justify-between font-medium text-green-900">
                    <span>Subtotal</span>
                    <span>
                      {formatCurrency(laborCosts.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Costs */}
            {additionalCosts.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-3">Additional Costs</h4>
                <div className="space-y-2">
                  {additionalCosts.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-orange-800">{item.description}</span>
                      <span className="font-medium text-orange-900">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-orange-200 mt-2 pt-2">
                  <div className="flex justify-between font-medium text-orange-900">
                    <span>Subtotal</span>
                    <span>
                      {formatCurrency(additionalCosts.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="mt-4 p-4 bg-accent/10 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-primary">Total Cost Impact</span>
              <span className="text-2xl font-bold text-accent">
                {formatCurrency(variation.priceImpact)}
              </span>
            </div>
          </div>
        </div>

        {/* Attached Files */}
        {files.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-primary mb-4">
              Attached Files ({files.length})
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map(renderFilePreview)}
            </div>
          </div>
        )}

        {/* Decision Status */}
        {isDecided && (
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-start space-x-3">
              <Icon 
                name={variation.status === 'approved' ? 'CheckCircle' : 'XCircle'} 
                size={24} 
                className={variation.status === 'approved' ? 'text-green-600' : 'text-red-600'} 
              />
              <div>
                <h4 className="font-medium text-primary">
                  {variation.status === 'approved' ? 'Approved' : 'Declined'}
                </h4>
                <p className="text-sm text-text-secondary mt-1">
                  Decision made on {new Date(variation.decidedAt).toLocaleDateString()}
                </p>
                {variation.clientComment && (
                  <p className="text-sm text-text-secondary mt-2 italic">
                    "{variation.clientComment}"
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Approval Actions */}
        {canApprove && !showApprovalForm && !showDeclineForm && (
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setShowDeclineForm(true)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Icon name="X" size={20} />
              Decline
            </Button>
            <Button
              onClick={() => setShowApprovalForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Icon name="Check" size={20} />
              Approve
            </Button>
          </div>
        )}

        {/* Approval Form */}
        {showApprovalForm && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-3">Approve Variation</h4>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional: Add comments about your approval..."
              className="w-full p-3 border border-green-300 rounded-lg resize-none"
              rows={3}
            />
            <div className="flex justify-end space-x-3 mt-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApprovalForm(false);
                  setComment('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={approveVariation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {approveVariation.isPending ? 'Approving...' : 'Confirm Approval'}
              </Button>
            </div>
          </div>
        )}

        {/* Decline Form */}
        {showDeclineForm && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-900 mb-3">Decline Variation</h4>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Please explain why you're declining this variation..."
              className="w-full p-3 border border-red-300 rounded-lg resize-none"
              rows={3}
              required
            />
            <div className="flex justify-end space-x-3 mt-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeclineForm(false);
                  setComment('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDecline}
                disabled={declineVariation.isPending || !comment.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {declineVariation.isPending ? 'Declining...' : 'Confirm Decline'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-medium text-primary">{selectedFile.fileName}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            
            <div className="p-4">
              {selectedFile.fileType?.includes('image') ? (
                <img
                  src={selectedFile.storageUrl}
                  alt={selectedFile.fileName}
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              ) : selectedFile.fileType?.includes('pdf') ? (
                <div className="text-center py-8">
                  <Icon name="FileText" size={64} className="text-red-600 mx-auto mb-4" />
                  <p className="text-text-secondary mb-4">PDF preview not available</p>
                  <Button
                    onClick={() => window.open(selectedFile.storageUrl, '_blank')}
                  >
                    <Icon name="ExternalLink" size={20} />
                    Open PDF
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon name="File" size={64} className="text-text-secondary mx-auto mb-4" />
                  <p className="text-text-secondary">Preview not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientVariationApproval;