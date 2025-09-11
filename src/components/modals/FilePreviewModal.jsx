import React, { useState } from 'react';
import Button from '../ui/Button';
import Icon from '../AppIcon';

const FilePreviewModal = ({ 
  isOpen, 
  onClose, 
  file,
  onDelete,
  onDownload 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!isOpen || !file) return null;

  const fileType = file.contentType || file.fileType;
  const fileName = file.fileName || file.originalName || file.filename;
  
  const isImage = fileType?.startsWith('image/');
  const isPDF = fileType === 'application/pdf';
  const isDWG = fileName?.toLowerCase().endsWith('.dwg');
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (contentType, filename) => {
    const ext = filename?.toLowerCase().split('.').pop();
    
    if (contentType?.startsWith('image/')) return 'Image';
    if (contentType === 'application/pdf') return 'FileText';
    if (ext === 'dwg') return 'Layers';
    if (contentType?.includes('word') || ext === 'doc' || ext === 'docx') return 'FileText';
    if (contentType?.includes('excel') || ext === 'xls' || ext === 'xlsx') return 'FileSpreadsheet';
    if (contentType?.includes('powerpoint') || ext === 'ppt' || ext === 'pptx') return 'Presentation';
    return 'File';
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(file);
    } else {
      // Default download behavior
      const link = document.createElement('a');
      // Use the best available URL for download
      link.href = file.url || file.storageUrl || file.previewUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      if (onDelete) {
        await onDelete(file);
        onClose();
      }
    }
  };

  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="flex items-center justify-center bg-black/5 rounded-lg overflow-hidden">
          <img
            src={file.previewUrl || file.url || file.storageUrl}
            alt={fileName}
            className="max-w-full max-h-96 object-contain"
            onLoad={() => setLoading(false)}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px' }}>
          <iframe
            src={file.url || file.storageUrl || file.previewUrl}
            className="w-full h-full border-0"
            title={fileName}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
          />
        </div>
      );
    }

    if (isDWG) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
          <Icon name="Layers" size={64} className="text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Preview unavailable
          </h3>
          <p className="text-text-secondary text-center mb-4">
            DWG files cannot be previewed in the browser.
            <br />
            Download the original file to view in AutoCAD or compatible software.
          </p>
          <Button
            onClick={handleDownload}
            iconName="Download"
          >
            Download Original
          </Button>
        </div>
      );
    }

    // For other file types
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
        <Icon name={getFileIcon(fileType, fileName)} size={64} className="text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-card-foreground mb-2">
          Preview unavailable
        </h3>
        <p className="text-text-secondary text-center mb-4">
          This file type cannot be previewed in the browser.
          <br />
          Download the file to view it in the appropriate application.
        </p>
        <Button
          onClick={handleDownload}
          iconName="Download"
        >
          Download File
        </Button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Icon 
                name={getFileIcon(fileType, fileName)} 
                size={24} 
                className="text-muted-foreground" 
              />
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  {fileName}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-text-secondary">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>Uploaded by {file.uploadedByName || file.uploaderName || 'Unknown'}</span>
                  <span>•</span>
                  <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                iconName="Download"
              >
                Download
              </Button>
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  iconName="Trash2"
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                iconName="X"
              />
            </div>
          </div>

          {/* Preview Area */}
          <div className="relative">
            {loading && !error && (
              <div className="flex items-center justify-center p-8">
                <div className="flex items-center space-x-2 text-text-secondary">
                  <Icon name="Loader" size={20} className="animate-spin" />
                  <span>Loading preview...</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
                <Icon name="AlertCircle" size={48} className="text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">
                  Preview Error
                </h3>
                <p className="text-text-secondary text-center mb-4">
                  Unable to load preview for this file.
                  <br />
                  You can still download the original file.
                </p>
                <Button
                  onClick={handleDownload}
                  iconName="Download"
                >
                  Download File
                </Button>
              </div>
            )}

            {!error && renderPreview()}
          </div>

          {/* File Details */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium text-card-foreground mb-2">File Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-secondary">File Name:</span>
                <span className="ml-2 text-card-foreground font-medium">{fileName}</span>
              </div>
              <div>
                <span className="text-text-secondary">File Size:</span>
                <span className="ml-2 text-card-foreground font-medium">{formatFileSize(file.size)}</span>
              </div>
              <div>
                <span className="text-text-secondary">File Type:</span>
                <span className="ml-2 text-card-foreground font-medium">{fileType}</span>
              </div>
              <div>
                <span className="text-text-secondary">Visibility:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  file.visibility === 'client' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {file.visibility === 'client' ? 'Client' : 'Internal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;