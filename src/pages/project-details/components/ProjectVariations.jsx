import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../data/api';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ProjectVariations = ({ projectId }) => {
  const [project, setProject] = useState(null);
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectName: project?.title || '',
    date: new Date().toISOString().split('T')[0],
    changeRequestor: '',
    changeReference: '',
    changeArea: '',
    workTypes: [],
    categories: [],
    changeDescription: '',
    reasonDescription: '',
    technicalChanges: '',
    resourcesAndCosts: '',
    disposition: 'Approve',
    dispositionReason: '',
    // Enhanced cost structure for Dubai projects
    materialCosts: [{ description: '', quantity: 1, unitRate: 0, total: 0 }],
    laborCosts: [{ description: '', hours: 0, hourlyRate: 0, total: 0 }],
    additionalCosts: [{ category: '', description: '', amount: 0 }],
    currency: 'AED'
  });
  
  const [showCostBreakdown, setShowCostBreakdown] = useState(true);

  // Work Types as per specification
  const workTypes = ['Civil', 'HVAC', 'Joinery', 'Electrical', 'Plumbing', 'General'];
  
  // Categories as per specification  
  const categories = ['Schedule', 'Cost', 'Scope', 'Quality', 'Resources', 'Deliverables'];

  const dispositionOptions = [
    { value: 'Approve', label: 'Approve' },
    { value: 'Reject', label: 'Reject' },
    { value: 'Defer', label: 'Defer' }
  ];

  const statusColors = {
    'Draft': 'bg-gray-100 text-gray-700',
    'Submitted': 'bg-blue-100 text-blue-700',
    'Under Review': 'bg-yellow-100 text-yellow-700',
    'Approved': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700',
    'Deferred': 'bg-orange-100 text-orange-700'
  };

  const handleCreateVariation = () => {
    setFormData({
      projectName: project?.title || '',
      date: new Date().toISOString().split('T')[0],
      changeRequestor: '',
      changeReference: '',
      changeArea: '',
      workTypes: [],
      categories: [],
      changeDescription: '',
      reasonDescription: '',
      technicalChanges: '',
      resourcesAndCosts: '',
      disposition: 'Approve',
      dispositionReason: '',
      materialCosts: [{ description: '', quantity: 1, unitRate: 0, total: 0 }],
      laborCosts: [{ description: '', hours: 0, hourlyRate: 0, total: 0 }],
      additionalCosts: [{ category: '', description: '', amount: 0 }],
      currency: 'AED'
    });
    setShowCostBreakdown(true);
    setIsCreateModalOpen(true);
  };

  const handleWorkTypeChange = (workType) => {
    setFormData(prev => ({
      ...prev,
      workTypes: prev.workTypes.includes(workType)
        ? prev.workTypes.filter(type => type !== workType)
        : [...prev.workTypes, workType]
    }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(cat => cat !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSaveVariation = async (status = 'Draft') => {
    if (!formData.changeRequestor || !formData.changeDescription || !formData.reasonDescription) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Structure API payload as requested
      const apiPayload = {
        projectId,
        title: formData.changeDescription.substring(0, 100), // Short title
        description: formData.changeDescription,
        category: formData.categories[0] || 'Scope',
        priority: 'medium',
        changeRequestor: formData.changeRequestor,
        justification: formData.reasonDescription,
        
        // Cost data in requested format
        materialCosts: formData.materialCosts.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitRate: item.unitRate,
          total: item.total
        })),
        
        laborCosts: formData.laborCosts.map(item => ({
          description: item.description,
          hours: item.hours,
          hourlyRate: item.hourlyRate,
          total: item.total
        })),
        
        additionalCosts: formData.additionalCosts.map(item => ({
          category: item.category,
          description: item.description,
          amount: parseFloat(item.amount) || 0
        })),
        
        priceImpact: calculateTotalCosts(),
        timeImpact: 0,
        status: status.toLowerCase().replace(' ', '_'),
        currency: formData.currency,
        
        // Additional fields for compatibility
        changeReference: formData.changeReference,
        changeArea: formData.changeArea,
        workTypes: formData.workTypes,
        categories: formData.categories,
        technicalChanges: formData.technicalChanges,
        disposition: formData.disposition,
        dispositionReason: formData.dispositionReason
      };

      // Save via API
      const result = await apiClient.createVariation(apiPayload);
      
      if (result.success) {
        // Update local state with new variation
        setVariations(prev => [...prev, result.data]);
        setIsCreateModalOpen(false);
        
        // Reset form
        setFormData({
          projectName: project?.title || '',
          date: new Date().toISOString().split('T')[0],
          changeRequestor: '',
          changeReference: '',
          changeArea: '',
          workTypes: [],
          categories: [],
          changeDescription: '',
          reasonDescription: '',
          technicalChanges: '',
          resourcesAndCosts: '',
          disposition: 'Approve',
          dispositionReason: '',
          materialCosts: [{ description: '', quantity: 1, unitRate: 0, total: 0 }],
          laborCosts: [{ description: '', hours: 0, hourlyRate: 0, total: 0 }],
          additionalCosts: [{ category: '', description: '', amount: 0 }],
          currency: 'AED'
        });
        
        console.log(`Variation ${status === 'Draft' ? 'saved as draft' : 'submitted'}`);
      } else {
        throw new Error(result.error || 'Failed to save variation');
      }
      
    } catch (error) {
      console.error('Error saving variation:', error);
      alert('Failed to save variation. Please try again.');
    }
  };

  const handleSubmitVariation = () => {
    handleSaveVariation('Under Review');
  };

  // AED Currency formatting
  const formatAED = (amount) => {
    return `AED ${parseFloat(amount || 0).toLocaleString('en-AE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const handleDownloadVariationPDF = async (variationId, variationNumber) => {
    try {
      console.log('🔄 PDF Request for variation:', variationId, 'Number:', variationNumber);
      
      // CRITICAL FIX: Check if variation exists in current database
      const checkResponse = await fetch(`/api/variations/${variationId}`);
      if (!checkResponse.ok) {
        console.error('❌ Variation not found in database:', variationId);
        alert(`This variation (${variationNumber || 'ID: ' + variationId}) no longer exists in the database. Please refresh the page to load current variations with valid database IDs.`);
        return;
      }
      
      // Variation exists - proceed with PDF
      const printWindow = window.open(`/api/pdf/variation/${variationId}/preview`, '_blank');
      
      if (printWindow) {
        console.log('✅ PDF opened for variation:', variationId);
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 1000);
        };
      } else {
        alert('Please allow pop-ups for this site to download PDFs. You can also right-click the Preview button and select "Open in new tab" to print.');
      }
      
    } catch (error) {
      console.error('❌ PDF Error:', error);
      alert('Failed to open PDF preview. The variation may not exist in the current database. Please refresh the page to get updated data.');
    }
  };

  // Material Costs Management
  const addMaterialCost = () => {
    setFormData(prev => ({
      ...prev,
      materialCosts: [...prev.materialCosts, { description: '', quantity: 1, unitRate: 0, total: 0 }]
    }));
  };

  const removeMaterialCost = (index) => {
    setFormData(prev => ({
      ...prev,
      materialCosts: prev.materialCosts.filter((_, i) => i !== index)
    }));
  };

  const updateMaterialCost = (index, field, value) => {
    setFormData(prev => {
      const newMaterialCosts = [...prev.materialCosts];
      newMaterialCosts[index] = { ...newMaterialCosts[index], [field]: value };
      
      // Auto-calculate total for material costs
      if (field === 'quantity' || field === 'unitRate') {
        const quantity = field === 'quantity' ? parseFloat(value) || 0 : newMaterialCosts[index].quantity;
        const unitRate = field === 'unitRate' ? parseFloat(value) || 0 : newMaterialCosts[index].unitRate;
        newMaterialCosts[index].total = quantity * unitRate;
      }
      
      return { ...prev, materialCosts: newMaterialCosts };
    });
  };

  // Labor Costs Management
  const addLaborCost = () => {
    setFormData(prev => ({
      ...prev,
      laborCosts: [...prev.laborCosts, { description: '', hours: 0, hourlyRate: 0, total: 0 }]
    }));
  };

  const removeLaborCost = (index) => {
    setFormData(prev => ({
      ...prev,
      laborCosts: prev.laborCosts.filter((_, i) => i !== index)
    }));
  };

  const updateLaborCost = (index, field, value) => {
    setFormData(prev => {
      const newLaborCosts = [...prev.laborCosts];
      newLaborCosts[index] = { ...newLaborCosts[index], [field]: value };
      
      // Auto-calculate total for labor costs
      if (field === 'hours' || field === 'hourlyRate') {
        const hours = field === 'hours' ? parseFloat(value) || 0 : newLaborCosts[index].hours;
        const hourlyRate = field === 'hourlyRate' ? parseFloat(value) || 0 : newLaborCosts[index].hourlyRate;
        newLaborCosts[index].total = hours * hourlyRate;
      }
      
      return { ...prev, laborCosts: newLaborCosts };
    });
  };

  // Additional Costs Management
  const addAdditionalCost = () => {
    setFormData(prev => ({
      ...prev,
      additionalCosts: [...prev.additionalCosts, { category: '', description: '', amount: 0 }]
    }));
  };

  const removeAdditionalCost = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalCosts: prev.additionalCosts.filter((_, i) => i !== index)
    }));
  };

  const updateAdditionalCost = (index, field, value) => {
    setFormData(prev => {
      const newAdditionalCosts = [...prev.additionalCosts];
      newAdditionalCosts[index] = { ...newAdditionalCosts[index], [field]: value };
      return { ...prev, additionalCosts: newAdditionalCosts };
    });
  };

  // Calculate total costs
  const calculateTotalCosts = () => {
    const materialTotal = formData.materialCosts.reduce((sum, item) => sum + (item.total || 0), 0);
    const laborTotal = formData.laborCosts.reduce((sum, item) => sum + (item.total || 0), 0);
    const additionalTotal = formData.additionalCosts.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    return materialTotal + laborTotal + additionalTotal;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return 'CheckCircle';
      case 'Rejected': return 'XCircle';
      case 'Under Review': return 'Clock';
      case 'Submitted': return 'Send';
      case 'Deferred': return 'Pause';
      default: return 'FileText';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">Variation Requests</h3>
          <p className="text-sm text-text-secondary">Manage change orders for this project</p>
        </div>
        <Button onClick={handleCreateVariation} className="flex items-center space-x-2">
          <Icon name="Plus" size={16} />
          <span>Create Variation Request</span>
        </Button>
      </div>

      {/* Variations List */}
      <div className="space-y-4">
        {variations.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <Icon name="FileText" size={48} className="mx-auto text-text-secondary mb-4" />
            <h4 className="font-medium text-primary mb-2">No Variation Requests</h4>
            <p className="text-text-secondary mb-4">Create your first variation request to track project changes</p>
            <Button onClick={handleCreateVariation} variant="outline">
              Create Variation Request
            </Button>
          </div>
        ) : (
          variations.map(variation => (
            <div key={variation.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-primary">{variation.number}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[variation.status] || 'bg-gray-100 text-gray-700'}`}>
                      {variation.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{variation.changeReference}</p>
                  <div className="flex items-center space-x-4 text-xs text-text-secondary">
                    <span>Area: {variation.changeArea}</span>
                    <span>•</span>
                    <span>Requestor: {variation.changeRequestor}</span>
                    <span>•</span>
                    <span>Date: {variation.date}</span>
                  </div>
                </div>
                <Icon name={getStatusIcon(variation.status)} size={20} className={`${
                  variation.status === 'Approved' ? 'text-success' :
                  variation.status === 'Rejected' ? 'text-error' :
                  variation.status === 'Under Review' ? 'text-warning' :
                  'text-text-secondary'
                }`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="font-medium text-sm text-primary mb-2">Work Types</h5>
                  <div className="flex flex-wrap gap-1">
                    {variation.workTypes.map(type => (
                      <span key={type} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-sm text-primary mb-2">Categories</h5>
                  <div className="flex flex-wrap gap-1">
                    {variation.categories.map(category => (
                      <span key={category} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-sm text-primary mb-1">Change Description</h5>
                  <p className="text-sm text-text-secondary">{variation.changeDescription}</p>
                </div>
                <div>
                  <h5 className="font-medium text-sm text-primary mb-1">Reason</h5>
                  <p className="text-sm text-text-secondary">{variation.reasonDescription}</p>
                </div>
                {variation.technicalChanges && (
                  <div>
                    <h5 className="font-medium text-sm text-primary mb-1">Technical Changes</h5>
                    <p className="text-sm text-text-secondary">{variation.technicalChanges}</p>
                  </div>
                )}
                {(variation.resourcesAndCosts || variation.materialCosts || variation.laborCosts || variation.additionalCosts) && (
                  <div>
                    <h5 className="font-medium text-sm text-primary mb-1">Resources & Costs</h5>
                    {variation.materialCosts || variation.laborCosts || variation.additionalCosts ? (
                      <div className="space-y-2">
                        {/* Enhanced Cost Display for Manager */}
                        {variation.materialCosts && variation.materialCosts.length > 0 && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <h6 className="font-medium text-xs text-primary mb-2">Material Costs:</h6>
                            {variation.materialCosts.map((material, index) => (
                              <div key={index} className="text-xs text-text-secondary flex justify-between">
                                <span>{material.description} ({material.quantity} × {formatAED(material.unitRate)})</span>
                                <span className="font-medium">{formatAED(material.total)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {variation.laborCosts && variation.laborCosts.length > 0 && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <h6 className="font-medium text-xs text-primary mb-2">Labor Costs:</h6>
                            {variation.laborCosts.map((labor, index) => (
                              <div key={index} className="text-xs text-text-secondary flex justify-between">
                                <span>{labor.description} ({labor.hours}hrs × {formatAED(labor.hourlyRate)}/hr)</span>
                                <span className="font-medium">{formatAED(labor.total)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {variation.additionalCosts && variation.additionalCosts.length > 0 && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <h6 className="font-medium text-xs text-primary mb-2">Additional Costs:</h6>
                            {variation.additionalCosts.map((cost, index) => (
                              <div key={index} className="text-xs text-text-secondary flex justify-between">
                                <span>{cost.category}: {cost.description}</span>
                                <span className="font-medium">{formatAED(cost.amount)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {variation.totalCost && (
                          <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-sm text-primary">Total Cost:</span>
                              <span className="font-bold text-accent">{formatAED(variation.totalCost)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-text-secondary">{variation.resourcesAndCosts}</p>
                    )}
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
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface border-b border-border p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary">Create Variation Request</h2>
                <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                  <Icon name="X" size={20} />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.projectName}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Change/s Requestor <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.changeRequestor}
                    onChange={(e) => setFormData(prev => ({ ...prev, changeRequestor: e.target.value }))}
                    placeholder="e.g., Client Request, Design Team, Site Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Change Reference
                  </label>
                  <Input
                    value={formData.changeReference}
                    onChange={(e) => setFormData(prev => ({ ...prev, changeReference: e.target.value }))}
                    placeholder="Reference or title for this change"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Change Area
                </label>
                <Input
                  value={formData.changeArea}
                  onChange={(e) => setFormData(prev => ({ ...prev, changeArea: e.target.value }))}
                  placeholder="Area or location of the change"
                />
              </div>

              {/* Work Types */}
              <div>
                <label className="block text-sm font-medium text-primary mb-3">
                  Work Type (Multi-select)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {workTypes.map(workType => (
                    <label key={workType} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={formData.workTypes.includes(workType)}
                        onChange={() => handleWorkTypeChange(workType)}
                      />
                      <span className="text-sm text-primary">{workType}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-primary mb-3">
                  Change/s Category (Multi-select)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map(category => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={formData.categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                      />
                      <span className="text-sm text-primary">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Describe the Change/s to be Implemented <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Detailed description of the changes required"
                  value={formData.changeDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, changeDescription: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Describe the Reason/s for the Change/s <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Explanation of why this change is needed"
                  value={formData.reasonDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, reasonDescription: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Describe Required Technical Change/s for Change/s Implementation
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Technical specifications and implementation details"
                  value={formData.technicalChanges}
                  onChange={(e) => setFormData(prev => ({ ...prev, technicalChanges: e.target.value }))}
                />
              </div>

              {/* Enhanced Cost Breakdown Section */}
              <div className="border border-border rounded-lg p-6 bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary">Estimated Resources and Costs for the Change/s (AED)</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                  >
                    <Icon name={showCostBreakdown ? "ChevronUp" : "ChevronDown"} size={16} />
                  </Button>
                </div>

                {showCostBreakdown && (
                  <div className="space-y-6">
                    {/* Material Costs */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-primary">Material Costs</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addMaterialCost}
                        >
                          <Icon name="Plus" size={14} className="mr-1" />
                          Add Material
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {formData.materialCosts.map((material, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 bg-surface rounded-lg border">
                            <div className="md:col-span-2">
                              <Input
                                placeholder="Material description"
                                value={material.description}
                                onChange={(e) => updateMaterialCost(index, 'description', e.target.value)}
                                size="sm"
                              />
                            </div>
                            <Input
                              type="number"
                              placeholder="Qty"
                              value={material.quantity}
                              onChange={(e) => updateMaterialCost(index, 'quantity', e.target.value)}
                              size="sm"
                            />
                            <Input
                              type="number"
                              placeholder="Unit Rate (AED)"
                              value={material.unitRate}
                              onChange={(e) => updateMaterialCost(index, 'unitRate', e.target.value)}
                              size="sm"
                            />
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-primary">
                                {formatAED(material.total)}
                              </span>
                            </div>
                            <div className="flex justify-end">
                              {formData.materialCosts.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMaterialCost(index)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Icon name="Trash2" size={14} />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Labor Costs */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-primary">Labor Costs</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addLaborCost}
                        >
                          <Icon name="Plus" size={14} className="mr-1" />
                          Add Labor
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {formData.laborCosts.map((labor, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 bg-surface rounded-lg border">
                            <div className="md:col-span-2">
                              <Input
                                placeholder="Labor description"
                                value={labor.description}
                                onChange={(e) => updateLaborCost(index, 'description', e.target.value)}
                                size="sm"
                              />
                            </div>
                            <Input
                              type="number"
                              placeholder="Hours"
                              value={labor.hours}
                              onChange={(e) => updateLaborCost(index, 'hours', e.target.value)}
                              size="sm"
                            />
                            <Input
                              type="number"
                              placeholder="Rate/Hour (AED)"
                              value={labor.hourlyRate}
                              onChange={(e) => updateLaborCost(index, 'hourlyRate', e.target.value)}
                              size="sm"
                            />
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-primary">
                                {formatAED(labor.total)}
                              </span>
                            </div>
                            <div className="flex justify-end">
                              {formData.laborCosts.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLaborCost(index)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Icon name="Trash2" size={14} />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Costs */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-primary">Additional Costs</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addAdditionalCost}
                        >
                          <Icon name="Plus" size={14} className="mr-1" />
                          Add Cost Category
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {formData.additionalCosts.map((cost, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 bg-surface rounded-lg border">
                            <Input
                              placeholder="Cost category (e.g., Equipment)"
                              value={cost.category}
                              onChange={(e) => updateAdditionalCost(index, 'category', e.target.value)}
                              size="sm"
                            />
                            <div className="md:col-span-2">
                              <Input
                                placeholder="Description"
                                value={cost.description}
                                onChange={(e) => updateAdditionalCost(index, 'description', e.target.value)}
                                size="sm"
                              />
                            </div>
                            <Input
                              type="number"
                              placeholder="Amount (AED)"
                              value={cost.amount}
                              onChange={(e) => updateAdditionalCost(index, 'amount', e.target.value)}
                              size="sm"
                            />
                            <div className="flex justify-end">
                              {formData.additionalCosts.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAdditionalCost(index)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Icon name="Trash2" size={14} />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Cost Summary */}
                    <div className="border-t border-border pt-4">
                      <div className="bg-gradient-to-r from-accent/5 to-accent/10 rounded-lg p-6 space-y-4">
                        <h4 className="text-lg font-semibold text-primary mb-4">Cost Summary</h4>
                        
                        {/* Individual Cost Totals */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-surface rounded-lg p-4 border border-border">
                            <div className="text-center">
                              <p className="text-sm text-text-secondary mb-1">Material Costs</p>
                              <p className="text-lg font-semibold text-primary">
                                {formatAED(formData.materialCosts.reduce((sum, item) => sum + (item.total || 0), 0))}
                              </p>
                            </div>
                          </div>
                          <div className="bg-surface rounded-lg p-4 border border-border">
                            <div className="text-center">
                              <p className="text-sm text-text-secondary mb-1">Labor Costs</p>
                              <p className="text-lg font-semibold text-primary">
                                {formatAED(formData.laborCosts.reduce((sum, item) => sum + (item.total || 0), 0))}
                              </p>
                            </div>
                          </div>
                          <div className="bg-surface rounded-lg p-4 border border-border">
                            <div className="text-center">
                              <p className="text-sm text-text-secondary mb-1">Additional Costs</p>
                              <p className="text-lg font-semibold text-primary">
                                {formatAED(formData.additionalCosts.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0))}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Grand Total */}
                        <div className="border-t border-border pt-4">
                          <div className="bg-accent/10 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-xl font-bold text-primary">TOTAL VARIATION COST:</span>
                              <span className="text-2xl font-bold text-accent">
                                {formatAED(calculateTotalCosts())}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Disposition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Disposition
                  </label>
                  <Select
                    value={formData.disposition}
                    onChange={(value) => setFormData(prev => ({ ...prev, disposition: value }))}
                    options={dispositionOptions}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Reason for the Approval, Rejection, or Deferral
                  </label>
                  <Input
                    value={formData.dispositionReason}
                    onChange={(e) => setFormData(prev => ({ ...prev, dispositionReason: e.target.value }))}
                    placeholder="Explanation for disposition decision"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-surface border-t border-border p-6">
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={() => handleSaveVariation('Draft')}>
                  Save as Draft
                </Button>
                <Button onClick={handleSubmitVariation}>
                  Submit for Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectVariations;
