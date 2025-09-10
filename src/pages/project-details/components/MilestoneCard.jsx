import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const MilestoneCard = ({ milestone, projectId, isManager = true }) => {
  const [milestoneFiles, setMilestoneFiles] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filePreviewModal, setFilePreviewModal] = useState({ open: false, file: null });
  const [uploading, setUploading] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    files: null,
    visibility: 'Client'
  });

  const visibilityOptions = [
    { value: 'Client', label: 'Client Visible' },
    { value: 'Internal', label: 'Internal Only' }
  ];

  const getFileIcon = (contentType) => {
    if (contentType?.includes('image')) return 'Image';
    if (contentType?.includes('pdf')) return 'FileText';
    if (contentType?.includes('document')) return 'FileText';
    if (contentType?.includes('spreadsheet')) return 'Table';
    return 'File';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Fetch files on component mount and when milestone changes
  useEffect(() => {
    fetchMilestoneFiles();
  }, [milestone.id]);

  const fetchMilestoneFiles = async () => {
    try {
      const response = await axios.get(`/api/files/milestone/${milestone.id}`);
      if (response.data.success) {
        setMilestoneFiles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching milestone files:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFormData.files || uploadFormData.files.length === 0) {
      alert('Please select files to upload');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      
      // Add files to FormData
      Array.from(uploadFormData.files).forEach(file => {
        formData.append('files', file);
      });
      
      // Add metadata
      formData.append('projectId', projectId);
      formData.append('milestoneId', milestone.id);
      formData.append('uploadedByUserId', 'd9eb3fb5-4d74-4d15-b65e-801d0bd0eadf'); // Alice Cooper ID
      formData.append('visibility', uploadFormData.visibility);

      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        await fetchMilestoneFiles(); // Refresh file list
        setIsUploadModalOpen(false);
        setUploadFormData({
          files: null,
          visibility: 'Client'
        });
        console.log('Files uploaded successfully');
      } else {
        alert('Upload failed: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        const response = await axios.delete(`/api/files/${fileId}`);
        if (response.data.success) {
          await fetchMilestoneFiles(); // Refresh file list
          console.log('File deleted successfully');
        } else {
          alert('Delete failed: ' + response.data.error);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Delete failed: ' + error.message);
      }
    }
  };

  const handleFilePreview = (file) => {
    setFilePreviewModal({ open: true, file });
  };

  const handleFileDownload = async (file) => {
    try {
      const response = await axios.get(`/api/files/${file.id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Download failed: ' + error.message);
    }
  };

  const generateThumbnail = (file) => {
    // For images, show actual thumbnail if available, otherwise placeholder
    if (file.contentType?.includes('image')) {
      if (file.url) {
        return (
          <img 
            src={file.url} 
            alt={file.filename}
            className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleFilePreview(file)}
          />
        );
      }
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleFilePreview(file)}>
          <Icon name="Image" size={20} className="text-blue-600" />
        </div>
      );
    }
    
    // For PDFs
    if (file.contentType?.includes('pdf')) {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleFilePreview(file)}>
          <Icon name="FileText" size={20} className="text-red-600" />
        </div>
      );
    }
    
    // For other files
    return (
      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleFilePreview(file)}>
        <Icon name="File" size={20} className="text-gray-600" />
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      {/* Milestone Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            milestone.status === 'Completed' 
              ? 'bg-success text-success-foreground' 
              : milestone.status === 'In Progress' 
              ? 'bg-warning text-warning-foreground' 
              : 'bg-muted text-text-secondary'
          }`}>
            <Icon 
              name={milestone.status === 'Completed' ? 'Check' : milestone.status === 'In Progress' ? 'Clock' : 'Circle'} 
              size={20} 
            />
          </div>
          <div>
            <h4 className="font-semibold text-primary">{milestone.title}</h4>
            <p className="text-sm text-text-secondary">{milestone.description}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          milestone.status === 'Completed' ? 'bg-success/10 text-success' :
          milestone.status === 'In Progress' ? 'bg-warning/10 text-warning' : 
          'bg-muted text-text-secondary'
        }`}>
          {milestone.status}
        </span>
      </div>

      {/* Milestone Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-text-secondary">Expected Date:</span>
          <span className="ml-2 font-medium text-primary">{milestone.expectedDate}</span>
        </div>
        <div>
          <span className="text-text-secondary">Progress:</span>
          <span className="ml-2 font-medium text-primary">{milestone.progress}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-text-secondary">
          <span>Completion</span>
          <span>{milestone.progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              milestone.progress === 100 ? 'bg-success' : 'bg-accent'
            }`}
            style={{ width: `${milestone.progress}%` }}
          />
        </div>
      </div>

      {/* Files Section */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="FolderOpen" size={16} className="text-text-secondary" />
            <span className="font-medium text-primary">Files</span>
            <span className="text-sm text-text-secondary">({milestoneFiles.length})</span>
          </div>
          {isManager && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center space-x-1"
            >
              <Icon name="Upload" size={14} />
              <span>Upload Document</span>
            </Button>
          )}
        </div>

        {/* File Thumbnails */}
        {milestoneFiles.length > 0 ? (
          <div className="space-y-3">
            {milestoneFiles.slice(0, 3).map(file => (
              <div key={file.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                {generateThumbnail(file)}
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-primary truncate">{file.filename}</h5>
                  <div className="flex items-center space-x-2 text-xs text-text-secondary">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span className={file.visibility === 'Client' ? 'text-success' : 'text-warning'}>
                      {file.visibility}
                    </span>
                    <span>•</span>
                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleFilePreview(file)}
                    title="Preview file"
                  >
                    <Icon name="Eye" size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleFileDownload(file)}
                    title="Download file"
                  >
                    <Icon name="Download" size={14} />
                  </Button>
                  {isManager && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      title="Delete file"
                      className="text-destructive hover:text-destructive"
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {milestoneFiles.length > 3 && (
              <div className="text-center py-2">
                <Button variant="ghost" size="sm" className="text-text-secondary">
                  View {milestoneFiles.length - 3} more files
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 bg-muted/20 rounded-lg border border-dashed border-border">
            <Icon name="FileText" size={32} className="mx-auto text-text-secondary mb-3" />
            <h6 className="font-medium text-primary mb-2">
              {isManager ? 'No documents uploaded' : 'No documents available'}
            </h6>
            <p className="text-sm text-text-secondary max-w-sm mx-auto">
              {isManager 
                ? 'Upload milestone documents, images, or files to share with your client'
                : 'Your project team will upload milestone documents here as they become available. Check back later for updates.'
              }
            </p>
            {!isManager && (
              <div className="mt-4 inline-flex items-center px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <Icon name="Info" size={14} className="text-blue-600 mr-2" />
                <span className="text-xs text-blue-700">
                  Documents will appear here when uploaded by your team
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary">Upload Document</h2>
                <Button variant="ghost" onClick={() => setIsUploadModalOpen(false)}>
                  <Icon name="X" size={20} />
                </Button>
              </div>
              <p className="text-sm text-text-secondary mt-1">Upload file for {milestone.title}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  File Upload
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/30">
                  <Icon name="Upload" size={32} className="mx-auto text-text-secondary mb-2" />
                  <p className="text-sm text-text-secondary mb-2">Drag & drop files here or click to browse</p>
                  <input 
                    type="file" 
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx,.ppt,.pptx"
                    className="hidden" 
                    id="milestone-file-upload"
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, files: e.target.files }))}
                  />
                  <label htmlFor="milestone-file-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" as="span">
                      Choose Files
                    </Button>
                  </label>
                  {uploadFormData.files && uploadFormData.files.length > 0 && (
                    <div className="mt-3 text-sm text-primary">
                      {Array.from(uploadFormData.files).map((file, index) => (
                        <div key={index} className="bg-surface border border-border rounded p-2 mt-1">
                          {file.name} ({Math.round(file.size / 1024)} KB)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Visibility
                </label>
                <Select
                  value={uploadFormData.visibility}
                  onChange={(value) => setUploadFormData(prev => ({ ...prev, visibility: value }))}
                  options={visibilityOptions}
                />
              </div>
            </div>

            <div className="p-6 border-t border-border">
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleFileUpload} 
                  disabled={!uploadFormData.files || uploadFormData.files.length === 0 || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {filePreviewModal.open && filePreviewModal.file && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary">{filePreviewModal.file.filename}</h3>
                <p className="text-sm text-text-secondary">
                  {formatFileSize(filePreviewModal.file.size)} • {filePreviewModal.file.visibility}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleFileDownload(filePreviewModal.file)}
                >
                  <Icon name="Download" size={16} className="mr-2" />
                  Download
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setFilePreviewModal({ open: false, file: null })}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
            </div>
            
            <div className="p-4 max-h-[70vh] overflow-auto">
              {filePreviewModal.file.contentType?.includes('image') ? (
                <div className="text-center">
                  <img 
                    src={filePreviewModal.file.url} 
                    alt={filePreviewModal.file.filename}
                    className="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg"
                  />
                </div>
              ) : filePreviewModal.file.contentType?.includes('pdf') ? (
                <div className="text-center">
                  <div className="bg-muted/30 rounded-lg p-8">
                    <Icon name="FileText" size={64} className="mx-auto text-text-secondary mb-4" />
                    <h4 className="text-lg font-medium text-primary mb-2">PDF Preview</h4>
                    <p className="text-text-secondary mb-4">
                      PDF files cannot be previewed directly. Click download to view the file.
                    </p>
                    <Button 
                      onClick={() => handleFileDownload(filePreviewModal.file)}
                      className="mt-2"
                    >
                      <Icon name="Download" size={16} className="mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-muted/30 rounded-lg p-8">
                    <Icon name="File" size={64} className="mx-auto text-text-secondary mb-4" />
                    <h4 className="text-lg font-medium text-primary mb-2">File Preview</h4>
                    <p className="text-text-secondary mb-4">
                      This file type cannot be previewed. Click download to view the file.
                    </p>
                    <Button 
                      onClick={() => handleFileDownload(filePreviewModal.file)}
                      className="mt-2"
                    >
                      <Icon name="Download" size={16} className="mr-2" />
                      Download File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneCard;