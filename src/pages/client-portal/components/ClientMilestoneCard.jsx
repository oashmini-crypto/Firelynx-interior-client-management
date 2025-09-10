import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import FilePreviewModal from '../../../components/modals/FilePreviewModal';
import { useClientMilestoneFiles } from '../../../hooks/useMilestoneFiles';

const ClientMilestoneCard = ({ milestone, projectId }) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  
  // Use React Query hooks for data fetching (RESTORED - working now!)
  const { data: files = [], isLoading: loading, error } = useClientMilestoneFiles(milestone?.id);



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
      month: 'long',
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


  const handleFilePreview = (file) => {
    setSelectedFile(file);
    setShowPreviewModal(true);
  };

  const handleFileDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.storageUrl;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Approval functionality removed for debugging

  return (
    <>
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(milestone?.status)}`}>
            <Icon name={getStatusIcon(milestone?.status)} size={18} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{milestone?.title}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(milestone?.status)}`}>
                {milestone?.status}
              </span>
            </div>
            
            <p className="text-gray-600 mb-3 leading-relaxed">{milestone?.description}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-gray-900">{milestone?.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${milestone?.progress || 0}%` }}
            />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Icon name="Calendar" size={18} className="text-gray-500" />
            <div>
              <span className="text-gray-600 text-sm">Due Date</span>
              <div className="font-medium text-gray-900">{formatDate(milestone?.expectedDate)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Icon name="FileText" size={18} className="text-gray-500" />
            <div>
              <span className="text-gray-600 text-sm">Shared Files</span>
              <div className="font-medium text-gray-900">
                {loading ? 'Loading...' : `${files.length} documents`}
              </div>
            </div>
          </div>
        </div>

        {/* Client Files */}
        {files.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Icon name="Share" size={16} className="mr-2 text-blue-600" />
              Shared with You ({files.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 border-gray-200 hover:bg-gray-100">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Icon 
                      name={getFileIcon(file.fileType, file.fileName)} 
                      size={18} 
                      className={file.status === 'pending' ? 'text-amber-600 flex-shrink-0' : 'text-blue-600 flex-shrink-0'}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-gray-900 truncate">
                          {file.fileName}
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Status: {file.status || 'unknown'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                        {file.uploaderName && (
                          <>
                            <span>•</span>
                            <span>Shared by {file.uploaderName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilePreview(file)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      iconName="Eye"
                    >
                      View
                    </Button>
                    {file.status === 'accepted' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileDownload(file)}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                        iconName="Download"
                      >
                        Download
                      </Button>
                    )}
                    {/* Approval buttons removed for debugging */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Files Message */}
        {files.length === 0 && !loading && (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Icon name="FileText" size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">
              No files have been shared for this milestone yet.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Your project team will share relevant documents here as they become available.
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-gray-600">
              <span>Updated {new Date(milestone?.updatedAt || milestone?.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              {milestone?.progress === 100 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Icon name="CheckCircle" size={12} className="mr-1" />
                  Completed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <FilePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        file={selectedFile}
        onDownload={handleFileDownload}
        // No onDelete prop for clients - they can only view and download
      />
    </>
  );
};

export default ClientMilestoneCard;