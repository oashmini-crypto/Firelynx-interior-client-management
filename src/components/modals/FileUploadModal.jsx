import React, { useState, useRef, useCallback } from 'react';
import { filesAPI } from '../../services/api';
import Button from '../ui/Button';
import Icon from '../AppIcon';

const FileUploadModal = ({ 
  isOpen, 
  onClose, 
  onUpload, 
  milestoneId, 
  projectId,
  maxFiles = 10,
  title = "Upload Files"
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'application/pdf', 
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType, fileName) => {
    const ext = fileName.toLowerCase().split('.').pop();
    
    if (fileType.startsWith('image/')) return 'Image';
    if (fileType === 'application/pdf') return 'FileText';
    if (ext === 'dwg') return 'Layers';
    if (fileType.includes('word') || ext === 'doc' || ext === 'docx') return 'FileText';
    if (fileType.includes('excel') || ext === 'xls' || ext === 'xlsx') return 'FileSpreadsheet';
    if (fileType.includes('powerpoint') || ext === 'ppt' || ext === 'pptx') return 'Presentation';
    return 'File';
  };

  const validateFile = (file) => {
    const errors = [];
    
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      errors.push('File size must be less than 50MB');
    }
    
    // Check file type - align with server validation
    const ext = file.name.toLowerCase().split('.').pop();
    const serverAllowedExtensions = ['jpeg', 'jpg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
    const isAllowedType = allowedTypes.includes(file.type) || serverAllowedExtensions.includes(ext);
    
    if (!isAllowedType) {
      errors.push(`File type '${ext}' not supported. Allowed: ${serverAllowedExtensions.join(', ')}`);
    }
    
    return errors;
  };

  const handleFiles = useCallback((files) => {
    const newFiles = Array.from(files).slice(0, maxFiles - selectedFiles.length);
    const newErrors = [];
    const validFiles = [];

    newFiles.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        newErrors.push(`${file.name}: ${fileErrors.join(', ')}`);
      } else {
        validFiles.push({
          file,
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0
        });
      }
    });

    setErrors(newErrors);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, [selectedFiles.length, maxFiles]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setErrors([]);
    
    try {
      const uploadedFiles = []; // Track all uploaded files for optimistic updates
      
      for (const fileItem of selectedFiles) {
        const formData = new FormData();
        formData.append('files', fileItem.file);
        formData.append('projectId', projectId);
        formData.append('uploadedByUserId', 'user_001'); // TODO: Get from auth context
        formData.append('visibility', 'Client');
        
        if (milestoneId) {
          formData.append('milestoneId', milestoneId);
        }

        // Update progress
        setUploadProgress(prev => ({ ...prev, [fileItem.id]: 0 }));

        console.log('📤 Uploading file via modal:', {
          fileName: fileItem.file.name,
          size: fileItem.file.size,
          projectId,
          milestoneId: milestoneId || 'none'
        });

        // Use the correct API service
        const response = await filesAPI.upload(formData);
        
        // Update progress to 100%
        setUploadProgress(prev => ({ ...prev, [fileItem.id]: 100 }));
        
        // Store the uploaded file data for optimistic updates
        if (response.data && response.data.uploadedFiles) {
          uploadedFiles.push(...response.data.uploadedFiles);
        }
        
        console.log('✅ File uploaded successfully via modal:', response.data);
        
        // Simulate progress animation
        for (let i = 10; i <= 100; i += 10) {
          setUploadProgress(prev => ({ ...prev, [fileItem.id]: i }));
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      // Call the onUpload callback with uploaded files for optimistic updates
      if (onUpload) {
        await onUpload(uploadedFiles);
      }

      // Reset form
      setSelectedFiles([]);
      setUploadProgress({});
      setUploading(false);
      onClose();
      
    } catch (error) {
      console.error('❌ Upload error via modal:', error);
      setErrors([error.message || 'Upload failed']);
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-card-foreground">{title}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={uploading}
              iconName="X"
            />
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Icon name="Upload" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-text-secondary mb-4">
              Support for images, PDFs, Word docs, Excel files, PowerPoint, and DWG files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.dwg,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              iconName="FolderOpen"
            >
              Browse Files
            </Button>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <Icon name="AlertCircle" size={16} className="text-red-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Upload Errors</h4>
                  <ul className="mt-1 text-sm text-red-700">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-card-foreground mb-3">
                Selected Files ({selectedFiles.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedFiles.map((fileItem) => (
                  <div key={fileItem.id} className="flex items-center p-3 bg-muted rounded-md">
                    <Icon 
                      name={getFileIcon(fileItem.type, fileItem.name)} 
                      size={20} 
                      className="text-muted-foreground mr-3" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-card-foreground truncate">
                          {fileItem.name}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-text-secondary">
                            {formatFileSize(fileItem.size)}
                          </span>
                          {!uploading && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(fileItem.id)}
                              className="h-6 w-6"
                              iconName="X"
                            />
                          )}
                        </div>
                      </div>
                      {uploading && uploadProgress[fileItem.id] !== undefined && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                            <span>Uploading...</span>
                            <span>{uploadProgress[fileItem.id]}%</span>
                          </div>
                          <div className="w-full bg-muted-foreground/20 rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress[fileItem.id]}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={selectedFiles.length === 0 || uploading}
              iconName={uploading ? "Loader" : "Upload"}
            >
              {uploading ? `Uploading... (${Object.keys(uploadProgress).length})` : `Upload ${selectedFiles.length} Files`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;