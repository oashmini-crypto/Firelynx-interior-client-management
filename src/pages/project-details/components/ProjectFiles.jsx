import React, { useState } from 'react';
import { getFilesByProjectId, getMilestonesByProjectId, entities } from '../../../data/store';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ProjectFiles = ({ projectId }) => {
  const [files, setFiles] = useState(() => getFilesByProjectId(projectId));
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    filename: '',
    visibility: 'Client',
    milestoneId: ''
  });

  const milestones = getMilestonesByProjectId(projectId);
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

  const handleFileUpload = () => {
    if (!uploadFormData.filename) {
      alert('Please enter a filename');
      return;
    }

    // Simulate file upload
    const newFile = {
      id: `file_${Date.now()}`,
      projectId,
      milestoneId: uploadFormData.milestoneId || null,
      uploadedByUserId: 'user_001',
      filename: uploadFormData.filename,
      url: '#', // In real app, this would be the actual file URL
      contentType: 'application/pdf', // Default for demo
      size: Math.floor(Math.random() * 5000000) + 1000000, // Random size between 1-5MB
      visibility: uploadFormData.visibility,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Add to store
    entities.fileAssets.push(newFile);
    setFiles(getFilesByProjectId(projectId));
    setIsUploadModalOpen(false);
    setUploadFormData({
      filename: '',
      visibility: 'Client',
      milestoneId: ''
    });

    console.log('File uploaded successfully');
  };

  const handleDeleteFile = (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      const index = entities.fileAssets.findIndex(file => file.id === fileId);
      if (index !== -1) {
        entities.fileAssets.splice(index, 1);
        setFiles(getFilesByProjectId(projectId));
        console.log('File deleted successfully');
      }
    }
  };

  const handleVisibilityChange = (fileId, newVisibility) => {
    const fileIndex = entities.fileAssets.findIndex(file => file.id === fileId);
    if (fileIndex !== -1) {
      entities.fileAssets[fileIndex].visibility = newVisibility;
      setFiles(getFilesByProjectId(projectId));
      console.log('File visibility updated successfully');
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
        {Object.keys(groupedFiles).length === 0 ? (
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
                  <Icon name="Upload" size={32} className="mx-auto text-text-secondary mb-2" />
                  <p className="text-sm text-text-secondary mb-2">Drag & drop files here or click to browse</p>
                  <Input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    multiple={false}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" as="span">
                      Choose File
                    </Button>
                  </label>
                </div>
              </div>

              {/* Filename Override */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Filename <span className="text-red-500">*</span>
                </label>
                <Input
                  value={uploadFormData.filename}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, filename: e.target.value }))}
                  placeholder="Enter filename (e.g., floor_plans_v2.pdf)"
                />
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
                <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleFileUpload} disabled={!uploadFormData.filename}>
                  Upload File
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