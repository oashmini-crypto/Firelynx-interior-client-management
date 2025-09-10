import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const FileLibraryItem = ({ file, onApprove, onDecline }) => {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState(null);

  const handleAction = (type) => {
    setActionType(type);
    setShowCommentModal(true);
  };

  const handleSubmitAction = () => {
    if (actionType === 'approve') {
      onApprove(file?.id, comment);
    } else if (actionType === 'decline') {
      onDecline(file?.id, comment);
    }
    setShowCommentModal(false);
    setComment('');
    setActionType(null);
  };

  const getFileIcon = (type) => {
    if (type?.includes('image')) return 'Image';
    if (type?.includes('pdf')) return 'FileText';
    return 'File';
  };

  const isImage = file?.type?.includes('image');
  const isPDF = file?.type?.includes('pdf');

  return (
    <>
      <div className="bg-card rounded-lg border border-border shadow-subtle overflow-hidden">
        {/* File Preview */}
        <div className="aspect-video bg-muted flex items-center justify-center relative">
          {isImage ? (
            <Image
              src={file?.preview}
              alt={file?.name}
              className="w-full h-full object-cover"
            />
          ) : isPDF ? (
            <div className="flex flex-col items-center space-y-2">
              <Icon name="FileText" size={32} className="text-text-secondary" />
              <span className="text-xs text-text-secondary">PDF Document</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Icon name={getFileIcon(file?.type)} size={32} className="text-text-secondary" />
              <span className="text-xs text-text-secondary">{file?.type}</span>
            </div>
          )}
          
          {/* Status Badge */}
          {file?.status && (
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
              file?.status === 'approved' ? 'bg-success text-success-foreground' :
              file?.status === 'declined' ? 'bg-error text-error-foreground' :
              'bg-warning text-warning-foreground'
            }`}>
              {file?.status === 'approved' ? 'Approved' :
               file?.status === 'declined' ? 'Declined' : 'Pending Review'}
            </div>
          )}
        </div>
        
        {/* File Info */}
        <div className="p-4">
          <h4 className="font-medium text-primary mb-1 truncate">{file?.name}</h4>
          <p className="text-sm text-text-secondary mb-2">{file?.description}</p>
          
          <div className="flex items-center justify-between text-xs text-text-secondary mb-3">
            <span>Uploaded: {file?.uploadDate}</span>
            <span>{file?.size}</span>
          </div>
          
          {/* Action Buttons */}
          {file?.status === 'pending' && (
            <div className="flex space-x-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => handleAction('approve')}
                iconName="Check"
                iconPosition="left"
                className="flex-1"
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('decline')}
                iconName="X"
                iconPosition="left"
                className="flex-1"
              >
                Decline
              </Button>
            </div>
          )}
          
          {/* View Button */}
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              iconName="Eye"
              iconPosition="left"
              fullWidth
            >
              View Full Size
            </Button>
          </div>
        </div>
      </div>
      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-200 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border border-border shadow-modal w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">
                {actionType === 'approve' ? 'Approve File' : 'Decline File'}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-primary mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e?.target?.value)}
                  placeholder={`Add a comment about your ${actionType} decision...`}
                  className="w-full p-3 border border-border rounded-lg resize-none focus:ring-2 focus:ring-accent focus:border-accent"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCommentModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant={actionType === 'approve' ? 'success' : 'destructive'}
                  onClick={handleSubmitAction}
                  className="flex-1"
                >
                  {actionType === 'approve' ? 'Approve' : 'Decline'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileLibraryItem;