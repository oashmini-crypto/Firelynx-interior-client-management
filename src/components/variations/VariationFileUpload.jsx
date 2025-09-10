import React, { useState, useRef, useCallback } from 'react';
import Button from '../ui/Button';
import Icon from '../AppIcon';

const VariationFileUpload = ({ 
  variationId, 
  onUploadComplete,
  maxFiles = 10,
  className = ""
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Restricted to images and PDFs only for client approval
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf'
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType, fileName) => {
    if (fileType.startsWith('image/')) return 'Image';
    if (fileType === 'application/pdf') return 'FileText';
    return 'File';
  };

  const validateFile = (file) => {
    const errors = [];
    
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      errors.push('File size must be less than 50MB');
    }
    
    // Check file type - only images and PDFs
    if (!allowedTypes.includes(file.type)) {
      errors.push('Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed');
    }
    
    return errors;
  };

  const handleFiles = useCallback((fileList) => {
    const files = Array.from(fileList);
    const newFiles = [];
    const newErrors = [];

    // Check total file count
    if (selectedFiles.length + files.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`);
    }

    files.forEach((file, index) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        newErrors.push(`${file.name}: ${fileErrors.join(', ')}`);
      } else {
        newFiles.push({
          id: Date.now() + index,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        });
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
    } else {
      setErrors([]);
      setSelectedFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
    }
  }, [selectedFiles, maxFiles]);

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

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (fileId) => {
    setSelectedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // Revoke object URL to prevent memory leaks
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
    setErrors([]);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setErrors([]);

    try {
      const formData = new FormData();
      selectedFiles.forEach(fileObj => {
        formData.append('files', fileObj.file);
      });
      formData.append('uploadedBy', 'manager-001'); // Default manager user

      // Track upload progress
      const progressTracker = {};
      selectedFiles.forEach((file, index) => {
        progressTracker[file.id] = 0;
      });
      setUploadProgress(progressTracker);

      const response = await fetch(`/api/variations/${variationId}/files`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Mark all files as 100% complete
      selectedFiles.forEach(file => {
        progressTracker[file.id] = 100;
      });
      setUploadProgress({ ...progressTracker });

      // Clean up object URLs
      selectedFiles.forEach(fileObj => {
        if (fileObj.preview) {
          URL.revokeObjectURL(fileObj.preview);
        }
      });

      // Clear selected files and call completion callback
      setSelectedFiles([]);
      onUploadComplete?.(result.data);

    } catch (error) {
      console.error('Upload error:', error);
      setErrors([error.message || 'Upload failed. Please try again.']);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  return (
    <div className={`variation-file-upload ${className}`}>
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-accent bg-accent/5'
            : 'border-border hover:border-accent/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
            <Icon name="Upload" size={32} className="text-accent" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-primary">Upload Variation Files</h3>
            <p className="text-sm text-text-secondary mt-1">
              Images and PDF files only • Max 50MB per file
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Icon name="FolderOpen" size={20} />
            Choose Files
          </Button>
          
          <p className="text-xs text-text-secondary">
            or drag and drop files here
          </p>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="AlertCircle" size={20} className="text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">Upload Errors</h4>
              <ul className="mt-1 text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-primary mb-3">
            Selected Files ({selectedFiles.length})
          </h4>
          
          <div className="space-y-2">
            {selectedFiles.map((fileObj) => (
              <div
                key={fileObj.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    {fileObj.preview ? (
                      <img
                        src={fileObj.preview}
                        alt={fileObj.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : (
                      <Icon
                        name={getFileIcon(fileObj.type, fileObj.name)}
                        size={20}
                        className="text-text-secondary"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {fileObj.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatFileSize(fileObj.size)}
                    </p>
                  </div>
                  
                  {uploading && uploadProgress[fileObj.id] !== undefined && (
                    <div className="w-20">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress[fileObj.id]}%` }}
                        />
                      </div>
                      <p className="text-xs text-text-secondary mt-1 text-center">
                        {uploadProgress[fileObj.id]}%
                      </p>
                    </div>
                  )}
                </div>
                
                {!uploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileObj.id)}
                    className="text-text-secondary hover:text-red-600"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={uploadFiles}
              disabled={uploading || selectedFiles.length === 0}
              className="min-w-[120px]"
            >
              <Icon 
                name={uploading ? "Loader" : "Upload"} 
                size={20}
                className={uploading ? "animate-spin" : ""}
              />
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Files`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariationFileUpload;