// Modern File Library Component with Thumbnails and Filtering
import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FileLibrary = ({ files, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Filter and sort files
  const filteredAndSortedFiles = useMemo(() => {
    let filtered = files.filter(file => {
      const matchesSearch = file.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.filename?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || 
                         (filterType === 'images' && file.contentType?.startsWith('image/')) ||
                         (filterType === 'documents' && file.contentType?.includes('pdf')) ||
                         (filterType === 'other' && !file.contentType?.startsWith('image/') && !file.contentType?.includes('pdf'));
      
      return matchesSearch && matchesType;
    });

    // Sort files
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return (a.originalName || a.filename).localeCompare(b.originalName || b.filename);
        case 'size':
          return (b.size || 0) - (a.size || 0);
        default:
          return 0;
      }
    });
  }, [files, searchTerm, filterType, sortBy]);

  const getFileIcon = (contentType) => {
    if (contentType?.startsWith('image/')) return 'Image';
    if (contentType?.includes('pdf')) return 'FileText';
    if (contentType?.includes('video/')) return 'Video';
    return 'File';
  };

  const getFileTypeLabel = (contentType) => {
    if (contentType?.startsWith('image/')) return 'Image';
    if (contentType?.includes('pdf')) return 'PDF';
    if (contentType?.includes('video/')) return 'Video';
    if (contentType?.includes('document')) return 'Document';
    return 'File';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = async (file) => {
    try {
      const link = document.createElement('a');
      // Use the best available URL for download
      link.href = file.url || file.storageUrl || file.previewUrl;
      link.download = file.originalName || file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handlePreview = (file) => {
    if (file.contentType?.startsWith('image/') || file.contentType?.includes('pdf')) {
      // Use preview URL if available, fallback to url or storageUrl
      const previewUrl = file.previewUrl || file.url || file.storageUrl;
      window.open(previewUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select
            value={filterType}
            onChange={(value) => setFilterType(value)}
            className="w-full sm:w-48"
          >
            <option value="all">All Files</option>
            <option value="images">Images</option>
            <option value="documents">Documents</option>
            <option value="other">Other</option>
          </Select>
          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value)}
            className="w-full sm:w-48"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="size">Largest First</option>
          </Select>
        </div>
      </div>

      {/* Files Grid */}
      {filteredAndSortedFiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedFiles.map((file) => (
            <div key={file.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* File Thumbnail/Preview */}
              <div className="h-48 bg-gray-100 relative group">
                {file.contentType?.startsWith('image/') ? (
                  <img
                    src={file.previewUrl || file.url || file.storageUrl}
                    alt={file.originalName || file.filename}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handlePreview(file)}
                    onError={(e) => {
                      // Fallback to main URL if preview fails
                      if (e.target.src !== (file.url || file.storageUrl)) {
                        e.target.src = file.url || file.storageUrl;
                      }
                    }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => handlePreview(file)}
                  >
                    <Icon name={getFileIcon(file.contentType)} size={48} className="text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 font-medium">{getFileTypeLabel(file.contentType)}</span>
                  </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePreview(file)}
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <Icon name="Eye" size={16} className="mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <Icon name="Download" size={16} className="mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              {/* File Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 text-sm truncate" title={file.originalName || file.filename}>
                  {file.originalName || file.filename}
                </h3>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {getFileTypeLabel(file.contentType)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Uploaded {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                  {file.uploadedByName && (
                    <p className="text-xs text-gray-500">
                      by {file.uploadedByName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="FileText" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterType !== 'all' ? 'No files found' : 'No files uploaded yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Files shared with you will appear here as they become available.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default FileLibrary;