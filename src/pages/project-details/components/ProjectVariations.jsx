import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../data/api';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import CreateVariationModal from '../../variation-requests/components/CreateVariationModal';

const ProjectVariations = ({ projectId }) => {
  const [project, setProject] = useState(null);
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch project and variations from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectResponse, variationsResponse] = await Promise.all([
          apiClient.getProject(projectId),
          apiClient.getProjectVariations(projectId)
        ]);
        setProject(projectResponse);
        setVariations(variationsResponse);
      } catch (err) {
        setError('Failed to load project data');
        console.error('Error fetching project data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const statusColors = {
    'Under Review': 'bg-yellow-100 text-yellow-700',
    'Pending': 'bg-blue-100 text-blue-700',
    'Approved': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700',
    'Deferred': 'bg-orange-100 text-orange-700'
  };

  const handleCreateVariation = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateVariationSubmit = async (variationData) => {
    try {
      // Create the variation using the API
      const result = await apiClient.createVariation(variationData);
      
      if (result.success) {
        // Refresh the variations list
        const variationsResponse = await apiClient.getProjectVariations(projectId);
        setVariations(variationsResponse);
        
        // Close modal
        setIsCreateModalOpen(false);
        
        console.log('Variation created successfully:', result.data);
      }
    } catch (error) {
      console.error('Error creating variation:', error);
      throw error; // Let the modal handle the error display
    }
  };

  const handleDownloadVariationPDF = async (variationId, variationNumber) => {
    try {
      const response = await fetch(`/api/pdf/variation/${variationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${variationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary">Variation Requests</h2>
        <Button onClick={handleCreateVariation}>
          <Icon name="Plus" size={16} className="mr-2" />
          Create Variation Request
        </Button>
      </div>

      {/* Variations List */}
      <div className="space-y-4">
        {variations.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg border border-border">
            <Icon name="FileText" size={48} className="mx-auto text-text-secondary mb-4" />
            <h3 className="text-lg font-medium text-primary mb-2">No Variation Requests</h3>
            <p className="text-text-secondary mb-4">Get started by creating your first variation request for this project.</p>
            <Button onClick={handleCreateVariation}>
              <Icon name="Plus" size={16} className="mr-2" />
              Create First Variation
            </Button>
          </div>
        ) : (
          variations.map((variation) => (
            <div key={variation.id} className="bg-surface border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-primary">{variation.number}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[variation.status] || 'bg-gray-100 text-gray-700'}`}>
                      {variation.status}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm">
                    {variation.title || 'No title'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary">Price Impact</p>
                  <p className="text-lg font-semibold text-primary">
                    {variation.currency} {parseFloat(variation.priceImpact || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-primary mb-1">Description</p>
                  <p className="text-sm text-text-secondary">
                    {variation.changeDescription || variation.description || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">Requestor</p>
                    <p className="text-sm text-text-secondary">{variation.changeRequestor || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">Date</p>
                    <p className="text-sm text-text-secondary">
                      {new Date(variation.date || variation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {variation.workTypes && variation.workTypes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">Work Types</p>
                    <div className="flex flex-wrap gap-1">
                      {variation.workTypes.map((type, index) => (
                        <span key={index} className="px-2 py-1 bg-muted text-xs rounded">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {variation.reasonDescription && (
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">Justification</p>
                    <p className="text-sm text-text-secondary">{variation.reasonDescription}</p>
                  </div>
                )}

                {variation.resourcesAndCosts && (
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">Cost Breakdown</p>
                    <p className="text-sm text-text-secondary">{variation.resourcesAndCosts}</p>
                  </div>
                )}
              </div>
              
              {/* Variation Actions */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`/api/pdf/variation/${variation.id}/preview`, '_blank')}
                >
                  <Icon name="Eye" size={14} className="mr-2" />
                  Preview
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadVariationPDF(variation.id, variation.number)}
                >
                  <Icon name="Download" size={14} className="mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Variation Modal */}
      <CreateVariationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateVariationSubmit}
        projects={[]} // Not needed since we're in project context
        currentUserRole="MANAGER"
        currentProjectId={projectId}
        currentProjectName={project?.title}
      />
    </div>
  );
};

export default ProjectVariations;