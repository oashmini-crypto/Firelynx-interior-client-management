import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LogoManager = ({ 
  logoUrl, 
  appName, 
  onLogoUpload, 
  onLogoDelete, 
  onAppNameChange, 
  isUploading, 
  isDeleting 
}) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type. Please upload JPEG, PNG, or SVG.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large. Please upload a file smaller than 5MB.');
      return;
    }

    onLogoUpload(file);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center mb-6">
        <Icon name="image" className="w-5 h-5 text-accent mr-2" />
        <h3 className="text-lg font-semibold text-foreground">Brand Identity</h3>
      </div>

      {/* App Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Company Name
        </label>
        <input
          type="text"
          value={appName}
          onChange={(e) => onAppNameChange(e.target.value)}
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Enter your company name"
        />
      </div>

      {/* Logo Upload Area */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          Company Logo
        </label>
        
        {logoUrl ? (
          /* Logo Preview */
          <div className="bg-muted rounded-lg p-4 border-2 border-dashed border-border">
            <div className="flex items-center justify-center mb-4">
              <img
                src={logoUrl}
                alt="Company Logo"
                className="max-w-full max-h-32 object-contain"
              />
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                disabled={isUploading}
              >
                <Icon name="upload" className="w-4 h-4 mr-1" />
                Replace
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogoDelete}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                <Icon name="trash-2" className="w-4 h-4 mr-1" />
                {isDeleting ? 'Deleting...' : 'Remove'}
              </Button>
            </div>
          </div>
        ) : (
          /* Upload Drop Zone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              bg-muted rounded-lg p-8 border-2 border-dashed cursor-pointer transition-colors
              ${dragOver 
                ? 'border-accent bg-accent/5' 
                : 'border-border hover:border-accent/50'
              }
            `}
            onClick={openFileDialog}
          >
            <div className="text-center">
              <Icon 
                name={isUploading ? "loader-2" : "upload-cloud"} 
                className={`w-12 h-12 text-muted-foreground mx-auto mb-4 ${
                  isUploading ? 'animate-spin' : ''
                }`} 
              />
              <p className="text-sm font-medium text-foreground mb-2">
                {isUploading ? 'Uploading logo...' : 'Upload your company logo'}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Drag and drop your logo here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPEG, PNG, SVG • Max 5MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Logo Guidelines */}
      <div className="bg-muted/30 rounded-md p-4">
        <h4 className="text-sm font-medium text-foreground mb-2">Logo Guidelines</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Use high-resolution images for best quality</li>
          <li>• SVG format recommended for scalability</li>
          <li>• Horizontal logos work best (up to 400x200px)</li>
          <li>• Transparent backgrounds recommended</li>
        </ul>
      </div>
    </div>
  );
};

export default LogoManager;