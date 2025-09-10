import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Icon from '../AppIcon';
import FileUploadModal from '../modals/FileUploadModal';
import FilePreviewModal from '../modals/FilePreviewModal';

const EnhancedMilestoneCard = ({ 
  milestone, 
  onEdit, 
  onDelete, 
  projectId,
  onFileListUpdate 
}) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const getStatusColor = (status) => {
    const colors = {
      'Planned': 'text-gray-600 bg-gray-100',
      'Pending': 'text-gray-600 bg-gray-100',
      'In Progress': 'text-blue-600 bg-blue-100',
      'Completed': 'text-green-600 bg-green-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return 'CheckCircle';
      case 'In Progress':
        return 'Clock';
      default:
        return 'Circle';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No date set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType, fileName) => {
    const ext = fileName?.toLowerCase().split('.').pop();
    
    if (fileType?.startsWith('image/')) return 'Image';
    if (fileType === 'application/pdf') return 'FileText';
    if (ext === 'dwg') return 'Layers';
    if (fileType?.includes('word') || ext === 'doc' || ext === 'docx') return 'FileText';
    if (fileType?.includes('excel') || ext === 'xls' || ext === 'xlsx') return 'FileSpreadsheet';
    if (fileType?.includes('powerpoint') || ext === 'ppt' || ext === 'pptx') return 'Presentation';
    return 'File';
  };

  const fetchFiles = async () => {
    if (!milestone?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/milestone-files/${milestone.id}`);
      if (response.ok) {
        const result = await response.json();
        setFiles(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching milestone files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [milestone?.id]);

  const handleFileUpload = async (uploadedFiles = []) => {
    // Optimistic update: immediately add uploaded files to state
    if (uploadedFiles && uploadedFiles.length > 0) {
      setFiles(prevFiles => {
        // Add new files to the beginning of the list (most recent first)
        const newFiles = [...uploadedFiles, ...prevFiles];
        // Remove duplicates by ID in case the same file exists
        const uniqueFiles = newFiles.filter((file, index, self) => 
          index === self.findIndex(f => f.id === file.id)
        );
        return uniqueFiles;
      });
    } else {
      // Fallback: fetch files from server if no uploaded files provided
      await fetchFiles();
    }
    
    if (onFileListUpdate) {
      onFileListUpdate();
    }
  };

  const handleFilePreview = (file) => {
    setSelectedFile(file);
    setShowPreviewModal(true);
  };

  const handleFileDelete = async (file) => {
    try {
      const response = await fetch(`/api/milestone-files/${file.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchFiles();
        if (onFileListUpdate) {
          onFileListUpdate();
        }
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const handleFileDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.storageUrl;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileStatusUpdate = async (file, newStatus) => {
    try {
      const response = await fetch(`/api/milestone-files/${file.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Update file status optimistically
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.id === file.id ? { ...f, status: newStatus } : f
          )
        );
        
        // Show success message
        console.log(`File ${newStatus} successfully`);
      } else {
        throw new Error(`Failed to ${newStatus} file`);
      }
    } catch (error) {
      console.error(`Error updating file status:`, error);
      alert(`Failed to ${newStatus} file. Please try again.`);
    }
  };

  const getFileStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'accepted': 'bg-green-100 text-green-700', 
      'declined': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getFileStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return 'CheckCircle';
      case 'declined':
        return 'XCircle';
      case 'pending':
      default:
        return 'Clock';
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg p-6 border border-border shadow-subtle hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(milestone?.status)}`}>
              <Icon name={getStatusIcon(milestone?.status)} size={16} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-card-foreground">{milestone?.title}</h3>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(milestone?.status)}`}>
                  {milestone?.status}
                </span>
              </div>
              
              <p className="text-text-secondary mb-3 line-clamp-2">{milestone?.description}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Progress</span>
            <span className="text-sm font-medium text-card-foreground">{milestone?.progress || 0}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${milestone?.progress || 0}%` }}
            />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="Calendar" size={16} className="text-muted-foreground" />
            <div>
              <span className="text-text-secondary text-sm">Due Date</span>
              <div className="font-medium text-sm">{formatDate(milestone?.expectedDate)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="FileText" size={16} className="text-muted-foreground" />
            <div>
              <span className="text-text-secondary text-sm">Files</span>
              <div className="font-medium text-sm">
                {loading ? '...' : `${files.length} documents`}
              </div>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-card-foreground mb-2 flex items-center">
              <Icon name="Paperclip" size={14} className="mr-1" />
              Attached Files ({files.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Icon 
                      name={getFileIcon(file.fileType, file.fileName)} 
                      size={16} 
                      className="text-muted-foreground flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-card-foreground truncate">
                          {file.fileName}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          file.visibility === 'client' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {file.visibility}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex items-center space-x-1 ${
                          getFileStatusColor(file.status || 'pending')
                        }`}>
                          <Icon name={getFileStatusIcon(file.status || 'pending')} size={10} />
                          <span>{file.status || 'pending'}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-text-secondary">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    {/* Accept/Decline buttons for pending files */}
                    {file.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleFileStatusUpdate(file, 'accepted')}
                          className="h-6 w-6 text-green-600 hover:text-green-700"
                          title="Accept File"
                        >
                          <Icon name="Check" size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleFileStatusUpdate(file, 'declined')}
                          className="h-6 w-6 text-red-600 hover:text-red-700"
                          title="Decline File"
                        >
                          <Icon name="X" size={12} />
                        </Button>
                      </>
                    )}
                    
                    {/* Standard file actions */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFilePreview(file)}
                      className="h-6 w-6"
                      title="Preview"
                    >
                      <Icon name="Eye" size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFileDownload(file)}
                      className="h-6 w-6"
                      title="Download"
                    >
                      <Icon name="Download" size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFileDelete(file)}
                      className="h-6 w-6 text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Icon name="Trash2" size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUploadModal(true)}
              iconName="Upload"
            >
              Add Files
            </Button>
            {files.length === 0 && (
              <span className="text-xs text-text-secondary">No files uploaded yet</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(milestone)}
              iconName="Edit"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(milestone)}
              iconName="Trash2"
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleFileUpload}
        milestoneId={milestone?.id}
        projectId={projectId}
        title={`Upload Files to ${milestone?.title}`}
      />

      <FilePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        file={selectedFile}
        onDelete={handleFileDelete}
        onDownload={handleFileDownload}
      />
    </>
  );
};

export default EnhancedMilestoneCard;