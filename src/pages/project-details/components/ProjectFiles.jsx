import React, { useState, useEffect } from 'react';
import { filesAPI, milestonesAPI } from '../../../services/api';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ProjectFiles = ({ projectId }) => {
  const [files, setFiles] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadFormData, setUploadFormData] = useState({
    visibility: 'Client',
    milestoneId: ''
  });

  // Fetch files and milestones on component mount
  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [filesResponse, milestonesResponse] = await Promise.all([
        filesAPI.getByProject(projectId),
        milestonesAPI.getAll(projectId)
      ]);
      
      setFiles(filesResponse.data.data || []);
      setMilestones(milestonesResponse.data.data || []);
      console.log('✅ Files and milestones loaded:', {
        files: filesResponse.data.data?.length || 0,
        milestones: milestonesResponse.data.data?.length || 0
      });
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const milestoneOptions = [
    { value: '', label: 'General Project Files' },
    ...milestones.map(milestone => ({
      value: milestone.id,
      label: milestone.title
    }))
  ];

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

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('files', selectedFile);
      formData.append('projectId', projectId);
      formData.append('uploadedByUserId', 'd9eb3fb5-4d74-4d15-b65e-801d0bd0eadf'); // Alice Cooper ID
      formData.append('visibility', uploadFormData.visibility);
      
      if (uploadFormData.milestoneId) {
        formData.append('milestoneId', uploadFormData.milestoneId);
      }

      console.log('📤 Uploading file:', {
        fileName: selectedFile.name,
        size: selectedFile.size,
        visibility: uploadFormData.visibility,
        milestoneId: uploadFormData.milestoneId || 'none'
      });

      // Upload file using real API
      const response = await filesAPI.upload(formData);
      
      console.log('✅ File uploaded successfully:', response.data);
      
      // Refresh files list to show the new file
      await fetchData();
      
      // Reset form and close modal
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setUploadFormData({
        visibility: 'Client',
        milestoneId: ''
      });
      
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        console.log('🗑️ Deleting file:', fileId);
        await filesAPI.delete(fileId);
        console.log('✅ File deleted successfully');
        
        // Refresh files list
        await fetchData();
      } catch (error) {
        console.error('❌ Error deleting file:', error);
        alert('Failed to delete file. Please try again.');
      }
    }
  };

  const handleVisibilityChange = async (fileId, newVisibility) => {
    try {
      console.log('👁️ Updating file visibility:', { fileId, newVisibility });
      
      // Find the file to determine if it's a milestone file
      const file = files.find(f => f.id === fileId);
      
      if (file && file.milestoneId) {
        // This is a milestone file - use milestone API
        console.log('🎯 Updating milestone file visibility');
        await filesAPI.updateMilestoneVisibility(fileId, newVisibility);
      } else {
        // This is a general project file - use regular API
        console.log('📁 Updating general file visibility');
        await filesAPI.updateVisibility(fileId, newVisibility);
      }
      
      console.log('✅ File visibility updated successfully');
      
      // Refresh files list
      await fetchData();
    } catch (error) {
      console.error('❌ Error updating file visibility:', error);
      alert('Failed to update file visibility. Please try again.');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log('📁 File selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
    }
  };

  const getMilestoneTitle = (milestoneId) => {
    if (!milestoneId) return 'General Files';
    const milestone = milestones.find(m => m.id === milestoneId);
    return milestone ? milestone.title : 'Unknown Milestone';
  };

  // Group files by milestone
  const groupedFiles = files.reduce((groups, file) => {
    const key = file.milestoneId || 'general';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(file);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">Project Files</h3>
          <p className="text-sm text-text-secondary">Manage files with client visibility controls</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} className="flex items-center space-x-2">
          <Icon name="Upload" size={16} />
          <span>Upload File</span>
        </Button>
      </div>

      {/* Files by Category */}
      <div className="space-y-8">
        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader" size={48} className="mx-auto text-text-secondary mb-4 animate-spin" />
            <p className="text-text-secondary">Loading files and milestones...</p>
          </div>
        ) : Object.keys(groupedFiles).length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <Icon name="FolderOpen" size={48} className="mx-auto text-text-secondary mb-4" />
            <h4 className="font-medium text-primary mb-2">No Files Uploaded</h4>
            <p className="text-text-secondary mb-4">Upload files to share with your team and clients</p>
            <Button onClick={() => setIsUploadModalOpen(true)} variant="outline">
              Upload First File
            </Button>
          </div>
        ) : (
          Object.entries(groupedFiles).map(([groupKey, groupFiles]) => (
            <div key={groupKey} className="space-y-4">
              <h4 className="font-semibold text-primary border-b border-border pb-2">
                {getMilestoneTitle(groupKey === 'general' ? null : groupKey)}
                <span className="ml-2 text-sm font-normal text-text-secondary">
                  ({groupFiles.length} file{groupFiles.length !== 1 ? 's' : ''})
                </span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupFiles.map(file => (
                  <div key={file.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* File Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <Icon name={getFileIcon(file.contentType)} size={20} className="text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-primary truncate">{file.filename}</h5>
                          <p className="text-xs text-text-secondary">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-error hover:text-error"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>

                    {/* File Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">Visibility</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          file.visibility === 'Client' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {file.visibility === 'Client' ? 'Client Visible' : 'Internal Only'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">Uploaded</span>
                        <span className="text-primary">{file.createdAt}</span>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center space-x-2 pt-2 border-t border-border">
                        <Select
                          value={file.visibility}
                          onChange={(newVisibility) => handleVisibilityChange(file.id, newVisibility)}
                          options={visibilityOptions}
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm">
                          <Icon name="Download" size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload File Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary">Upload File</h2>
                <Button variant="ghost" onClick={() => setIsUploadModalOpen(false)}>
                  <Icon name="X" size={20} />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/50">
                  {selectedFile ? (
                    <div className="space-y-3">
                      <Icon name="CheckCircle" size={32} className="mx-auto text-green-600" />
                      <div>
                        <p className="font-medium text-primary">{selectedFile.name}</p>
                        <p className="text-sm text-text-secondary">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedFile(null)}
                      >
                        Choose Different File
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Icon name="Upload" size={32} className="mx-auto text-text-secondary mb-2" />
                      <p className="text-sm text-text-secondary mb-2">Drag & drop files here or click to browse</p>
                      <Input
                        type="file"
                        className="hidden"
                        id="file-upload"
                        multiple={false}
                        onChange={handleFileSelect}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" as="span">
                          Choose File
                        </Button>
                      </label>
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
                <p className="text-xs text-text-secondary mt-1">
                  {uploadFormData.visibility === 'Client' 
                    ? 'File will be visible to clients in their portal'
                    : 'File will only be visible to team members'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Associate with Milestone (Optional)
                </label>
                <Select
                  value={uploadFormData.milestoneId}
                  onChange={(value) => setUploadFormData(prev => ({ ...prev, milestoneId: value }))}
                  options={milestoneOptions}
                />
              </div>
            </div>

            <div className="p-6 border-t border-border">
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setSelectedFile(null);
                    setUploadFormData({ visibility: 'Client', milestoneId: '' });
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleFileUpload} 
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? (
                    <>
                      <Icon name="Loader" size={16} className="animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Upload File'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFiles;