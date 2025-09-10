import React, { useState } from 'react';
import Button from './Button';
import Icon from '../AppIcon';

const FilePreviewModal = ({ isOpen, onClose, file }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [embedError, setEmbedError] = useState(false);

  if (!isOpen || !file) return null;

  const isImage = file.contentType?.includes('image') || file.type?.includes('image');
  const isPDF = file.contentType?.includes('pdf') || file.type?.includes('pdf');
  const isOfficeDoc = file.contentType?.includes('document') || file.contentType?.includes('spreadsheet') || 
                     file.type?.includes('document') || file.type?.includes('spreadsheet');

  const handleDownload = () => {
    // Create a temporary download link
    const link = document.createElement('a');
    link.href = file.url || '#';
    link.download = file.filename || file.name || 'download';
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = () => {
    window.open(file.url || '#', '_blank', 'noopener,noreferrer');
  };

  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="flex items-center justify-center min-h-[400px] bg-muted/30 rounded-lg overflow-hidden">
          <img
            src={file.url || file.preview}
            alt={file.filename || file.name}
            className="max-w-full max-h-[70vh] object-contain"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setEmbedError(true);
            }}
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="min-h-[500px] bg-muted/30 rounded-lg overflow-hidden">
          <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mb-2">
              <Icon name="FileText" size={32} className="text-red-600" />
            </div>
            <h4 className="font-medium text-primary">PDF Document</h4>
            <p className="text-sm text-text-secondary text-center max-w-md">
              {file.filename || file.name}
            </p>
            <p className="text-xs text-text-secondary text-center max-w-md">
              Preview unavailable. Download to view the complete document.
            </p>
            <div className="flex space-x-2">
              <Button onClick={handleOpenNewTab} variant="outline">
                <Icon name="ExternalLink" size={16} />
                <span>Open in New Tab</span>
              </Button>
              <Button onClick={handleDownload} className="bg-red-600 hover:bg-red-700">
                <Icon name="Download" size={16} />
                <span>Download PDF</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Generic file preview
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-muted/30 rounded-lg space-y-4">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
          <Icon name="File" size={32} className="text-gray-600" />
        </div>
        <div className="text-center">
          <h4 className="font-medium text-primary mb-2">{file.filename || file.name}</h4>
          <p className="text-sm text-text-secondary">
            {file.contentType || file.type || 'Unknown file type'}
          </p>
          {file.size && (
            <p className="text-xs text-text-secondary mt-1">
              {formatFileSize(file.size)}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleOpenNewTab} variant="outline">
            <Icon name="ExternalLink" size={16} />
            <span>Open in New Tab</span>
          </Button>
          <Button onClick={handleDownload}>
            <Icon name="Download" size={16} />
            <span>Download</span>
          </Button>
        </div>
      </div>
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-primary truncate">
              {file.filename || file.name}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-text-secondary mt-1">
              <span>{file.contentType || file.type}</span>
              {file.size && (
                <>
                  <span>•</span>
                  <span>{formatFileSize(file.size)}</span>
                </>
              )}
              {(file.createdAt || file.uploadDate) && (
                <>
                  <span>•</span>
                  <span>Uploaded: {file.createdAt || file.uploadDate}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {!embedError && (
              <Button onClick={handleDownload} variant="outline">
                <Icon name="Download" size={16} />
                <span>Download</span>
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading && !embedError && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex items-center space-x-2 text-text-secondary">
                <div className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full"></div>
                <span>Loading preview...</span>
              </div>
            </div>
          )}
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;