import React, { useState } from 'react';
import Button from './Button';
import Icon from '../AppIcon';
import FilePreviewModal from './FilePreviewModal';

const FileCard = ({ 
  file, 
  onApprove, 
  onDecline, 
  showActions = true,
  showStatus = true,
  className = "" 
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isImage = file.contentType?.includes('image') || file.type?.includes('image');
  const isPDF = file.contentType?.includes('pdf') || file.type?.includes('pdf');
  const isOfficeDoc = file.contentType?.includes('document') || file.contentType?.includes('spreadsheet') || 
                     file.type?.includes('document') || file.type?.includes('spreadsheet');

  const getFileIcon = () => {
    if (isImage) return 'Image';
    if (isPDF) return 'FileText';
    if (isOfficeDoc) return 'FileSpreadsheet';
    return 'File';
  };

  const getFileExtension = () => {
    const filename = file.filename || file.name || '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toUpperCase() : 'FILE';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url || '#';
    link.download = file.filename || file.name || 'download';
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-success text-success-foreground';
      case 'declined': return 'bg-error text-error-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-text-secondary';
    }
  };

  const renderThumbnail = () => {
    if (isImage && (file.url || file.preview)) {
      return (
        <img
          src={file.url || file.preview}
          alt={file.filename || file.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to icon if image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }

    return null;
  };

  return (
    <>
      <div className={`bg-card rounded-lg border border-border shadow-subtle overflow-hidden hover:shadow-md transition-shadow ${className}`}>
        {/* File Preview/Thumbnail */}
        <div 
          className="aspect-video bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center relative cursor-pointer hover:from-muted/60 hover:to-muted/80 transition-colors"
          onClick={() => setIsPreviewOpen(true)}
        >
          {renderThumbnail()}
          <div className="flex flex-col items-center space-y-2" style={{display: isImage && (file.url || file.preview) ? 'none' : 'flex'}}>
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
              isPDF ? 'bg-gradient-to-br from-red-100 to-red-200' :
              isImage ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
              isOfficeDoc ? 'bg-gradient-to-br from-green-100 to-green-200' :
              'bg-gradient-to-br from-gray-100 to-gray-200'
            }`}>
              <Icon 
                name={getFileIcon()} 
                size={32} 
                className={`${
                  isPDF ? 'text-red-600' :
                  isImage ? 'text-blue-600' :
                  isOfficeDoc ? 'text-green-600' :
                  'text-gray-600'
                }`} 
              />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              isPDF ? 'bg-red-100 text-red-700' :
              isImage ? 'bg-blue-100 text-blue-700' :
              isOfficeDoc ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {getFileExtension()}
            </span>
          </div>

          {/* Preview Overlay */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="bg-white/90 rounded-full p-2">
              <Icon name="Eye" size={20} className="text-gray-700" />
            </div>
          </div>

          {/* Status Badge */}
          {showStatus && file.status && (
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
              {file.status === 'approved' ? 'Approved' :
               file.status === 'declined' ? 'Declined' :
               file.status === 'pending' ? 'Pending' : 
               file.status}
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="p-4">
          <h4 className="font-semibold text-primary mb-1 truncate">
            {file.filename || file.name}
          </h4>
          {file.description && (
            <p className="text-sm text-text-secondary mb-2 line-clamp-2">
              {file.description}
            </p>
          )}
          
          {/* File Metadata */}
          <div className="flex items-center justify-between text-xs text-text-secondary mb-3">
            <span>{formatFileSize(file.size)}</span>
            <span>{file.createdAt || file.uploadDate}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsPreviewOpen(true)}
              className="flex-1"
            >
              <Icon name="Eye" size={14} />
              <span>Preview</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              className="flex-1"
            >
              <Icon name="Download" size={14} />
              <span>Download</span>
            </Button>
          </div>

          {/* Approval Actions */}
          {showActions && file.status === 'pending' && onApprove && onDecline && (
            <div className="flex space-x-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onApprove(file.id)}
                className="flex-1 text-success border-success hover:bg-success hover:text-success-foreground"
              >
                <Icon name="Check" size={14} />
                <span>Approve</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDecline(file.id)}
                className="flex-1 text-error border-error hover:bg-error hover:text-error-foreground"
              >
                <Icon name="X" size={14} />
                <span>Decline</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={file}
      />
    </>
  );
};

export default FileCard;