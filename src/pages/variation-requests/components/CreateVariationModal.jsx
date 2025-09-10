import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import apiClient from '../../../data/api';

const CreateVariationModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  projects = [],
  currentUserRole = 'MANAGER',
  currentProjectId = null,
  currentProjectName = null 
}) => {
  const [formData, setFormData] = useState({
    projectId: currentProjectId || '',
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    changeRequestor: '',
    priceImpact: '',
    timeImpact: '',
    justification: '',
    attachments: [],
    // Enhanced cost structure
    materialCosts: [{ description: '', quantity: 1, unitRate: 0, total: 0 }],
    laborCosts: [{ description: '', hours: 0, hourlyRate: 0, total: 0 }],
    additionalCosts: [{ category: '', description: '', amount: 0 }],
    currency: 'AED',
    generateInvoice: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCostBreakdown, setShowCostBreakdown] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);

  const categoryOptions = [
    { value: '', label: 'Select Category' },
    { value: 'design_change', label: 'Design Change' },
    { value: 'material_upgrade', label: 'Material Upgrade' },
    { value: 'scope_addition', label: 'Scope Addition' },
    { value: 'scope_reduction', label: 'Scope Reduction' },
    { value: 'timeline_adjustment', label: 'Timeline Adjustment' },
    { value: 'budget_reallocation', label: 'Budget Reallocation' },
    { value: 'client_request', label: 'Client Request' },
    { value: 'technical_requirement', label: 'Technical Requirement' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  // Team member options for change requestor dropdown
  const requestorOptions = [
    { value: '', label: 'Select Change Requestor' },
    ...teamMembers.map(member => ({
      value: member.userName || member.userEmail,
      label: `${member.userName || member.userEmail} (${member.role || member.userRole})`,
      description: member.specialization
    }))
  ];

  const projectOptions = [
    { value: '', label: 'Select Project' },
    ...projects?.map(project => ({
      value: project?.id,
      label: project?.name || project?.title,
      description: project?.clientName
    }))
  ];

  // Fetch team members when project is selected
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (formData.projectId) {
        setLoadingTeamMembers(true);
        try {
          const response = await apiClient.request(`/team/project/${formData.projectId}`);
          if (response.success) {
            setTeamMembers(response.data || []);
          }
        } catch (error) {
          console.error('Error fetching team members:', error);
          setTeamMembers([]);
        } finally {
          setLoadingTeamMembers(false);
        }
      } else {
        setTeamMembers([]);
      }
    };

    fetchTeamMembers();
  }, [formData.projectId]);

  // Auto-populate project when provided
  useEffect(() => {
    if (currentProjectId && currentProjectName) {
      setFormData(prev => ({
        ...prev,
        projectId: currentProjectId
      }));
    }
  }, [currentProjectId, currentProjectName]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event?.target?.files);
    const newAttachments = files?.map(file => ({
      id: Date.now() + Math.random(),
      name: file?.name,
      size: file?.size,
      type: file?.type,
      file: file
    }));
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev?.attachments, ...newAttachments]
    }));
  };

  const removeAttachment = (attachmentId) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev?.attachments?.filter(att => att?.id !== attachmentId)
    }));
  };

  // AED Currency formatting
  const formatAED = (amount) => {
    return `AED ${parseFloat(amount || 0).toLocaleString('en-AE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
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

  // Calculate individual cost totals
  const calculateMaterialTotal = () => {
    return formData.materialCosts.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const calculateLaborTotal = () => {
    return formData.laborCosts.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const calculateAdditionalTotal = () => {
    return formData.additionalCosts.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  // Calculate total costs
  const calculateTotalCosts = () => {
    return calculateMaterialTotal() + calculateLaborTotal() + calculateAdditionalTotal();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.projectId) {
      newErrors.projectId = 'Project selection is required';
    }
    if (!formData?.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData?.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData?.category) {
      newErrors.category = 'Category selection is required';
    }
    if (!formData?.justification?.trim()) {
      newErrors.justification = 'Justification is required';
    }
    if (!formData?.changeRequestor?.trim()) {
      newErrors.changeRequestor = 'Change requestor is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmitBase = async (status = 'pending') => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const totalCost = calculateTotalCosts();
      const variationData = {
        ...formData,
        priceImpact: totalCost,
        timeImpact: parseInt(formData?.timeImpact) || 0,
        referenceNumber: `VAR-${Date.now()}`,
        revisionNumber: 1,
        status: status,
        createdAt: new Date()?.toISOString(),
        createdBy: currentUserRole === 'CLIENT' ? 'Client' : 'Manager'
      };

      const variationResult = await onSubmit(variationData);
      
      // Generate invoice if requested and status is for review
      if (formData.generateInvoice && totalCost > 0 && status === 'pending') {
        try {
          const invoiceData = {
            projectId: formData.projectId,
            issueDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            currency: formData.currency,
            lineItems: [
              ...formData.materialCosts.filter(item => item.total > 0).map(item => ({
                description: item.description || 'Material costs',
                quantity: item.quantity || 1,
                rate: item.total / (item.quantity || 1),
                amount: item.total,
                taxPercent: 5 // UAE VAT
              })),
              ...formData.laborCosts.filter(item => item.total > 0).map(item => ({
                description: item.description || 'Labor costs',
                quantity: item.hours || 1,
                rate: item.hourlyRate || 0,
                amount: item.total,
                taxPercent: 5 // UAE VAT
              })),
              ...formData.additionalCosts.filter(item => parseFloat(item.amount) > 0).map(item => ({
                description: `${item.category}: ${item.description}` || 'Additional costs',
                quantity: 1,
                rate: parseFloat(item.amount) || 0,
                amount: parseFloat(item.amount) || 0,
                taxPercent: 5 // UAE VAT
              }))
            ],
            notes: `Invoice generated from Variation Request: ${formData.title}`,
            variationRequestId: variationResult?.data?.id
          };
          
          await apiClient.createInvoice(invoiceData);
        } catch (invoiceError) {
          console.error('Error generating invoice:', invoiceError);
          // Don't fail the variation creation if invoice fails
        }
      }
      
      // Reset form
      setFormData({
        projectId: currentProjectId || '',
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        changeRequestor: '',
        priceImpact: '',
        timeImpact: '',
        justification: '',
        attachments: [],
        materialCosts: [{ description: '', quantity: 1, unitRate: 0, total: 0 }],
        laborCosts: [{ description: '', hours: 0, hourlyRate: 0, total: 0 }],
        additionalCosts: [{ category: '', description: '', amount: 0 }],
        currency: 'AED',
        generateInvoice: false
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating variation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    await handleSubmitBase('pending');
  };

  const handleSaveAsDraft = async () => {
    await handleSubmitBase('draft');
  };

  const handleSubmitForReview = async () => {
    await handleSubmitBase('pending');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-200 flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg border border-border shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-primary">Create Variation Request</h2>
            <p className="text-sm text-text-secondary mt-1">
              Submit a new variation request for project scope changes
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Project Selection */}
            <div>
              {currentProjectId && currentProjectName ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-primary">
                    Project
                  </label>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border">
                    <p className="font-medium text-primary">{currentProjectName}</p>
                    <p className="text-sm text-text-secondary">Auto-selected (current project)</p>
                  </div>
                </div>
              ) : (
                <Select
                  label="Project"
                  description="Select the project for this variation request"
                  options={projectOptions}
                  value={formData?.projectId}
                  onChange={(value) => handleInputChange('projectId', value)}
                  error={errors?.projectId}
                  required
                  searchable
                />
              )}
            </div>

            {/* Title and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Variation Title"
                type="text"
                placeholder="Brief title for the variation"
                value={formData?.title}
                onChange={(e) => handleInputChange('title', e?.target?.value)}
                error={errors?.title}
                required
              />

              <Select
                label="Category"
                options={categoryOptions}
                value={formData?.category}
                onChange={(value) => handleInputChange('category', value)}
                error={errors?.category}
                required
              />
            </div>

            {/* Change Requestor */}
            <Select
              label="Change Requestor"
              description={loadingTeamMembers ? "Loading team members..." : "Select who is requesting this change"}
              options={requestorOptions}
              value={formData?.changeRequestor}
              onChange={(value) => handleInputChange('changeRequestor', value)}
              error={errors?.changeRequestor}
              required
              disabled={loadingTeamMembers || teamMembers.length === 0}
              placeholder={teamMembers.length === 0 ? "No team members found" : "Select requestor"}
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Description <span className="text-error">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                rows={4}
                placeholder="Detailed description of the variation request..."
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
              />
              {errors?.description && (
                <p className="text-sm text-error mt-1">{errors?.description}</p>
              )}
            </div>

            {/* Cost Breakdown Section */}
            <div className="border border-border rounded-lg p-6 bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">Cost Breakdown (AED)</h3>
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
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-primary">Material Costs</h4>
                        <span className="text-sm font-semibold text-accent bg-accent/10 px-2 py-1 rounded">
                          {formatAED(calculateMaterialTotal())}
                        </span>
                      </div>
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
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-primary">Labor Costs</h4>
                        <span className="text-sm font-semibold text-accent bg-accent/10 px-2 py-1 rounded">
                          {formatAED(calculateLaborTotal())}
                        </span>
                      </div>
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
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-primary">Additional Costs</h4>
                        <span className="text-sm font-semibold text-accent bg-accent/10 px-2 py-1 rounded">
                          {formatAED(calculateAdditionalTotal())}
                        </span>
                      </div>
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
                              {formatAED(calculateMaterialTotal())}
                            </p>
                          </div>
                        </div>
                        <div className="bg-surface rounded-lg p-4 border border-border">
                          <div className="text-center">
                            <p className="text-sm text-text-secondary mb-1">Labor Costs</p>
                            <p className="text-lg font-semibold text-primary">
                              {formatAED(calculateLaborTotal())}
                            </p>
                          </div>
                        </div>
                        <div className="bg-surface rounded-lg p-4 border border-border">
                          <div className="text-center">
                            <p className="text-sm text-text-secondary mb-1">Additional Costs</p>
                            <p className="text-lg font-semibold text-primary">
                              {formatAED(calculateAdditionalTotal())}
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
                      
                      {/* Invoice Generation Option */}
                      <div className="border-t border-border pt-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="generateInvoice"
                            checked={formData.generateInvoice}
                            onChange={(e) => handleInputChange('generateInvoice', e.target.checked)}
                            className="h-4 w-4 text-accent focus:ring-accent border-border rounded"
                          />
                          <label htmlFor="generateInvoice" className="text-sm font-medium text-primary">
                            Generate invoice for this variation request
                          </label>
                        </div>
                        {formData.generateInvoice && (
                          <p className="text-xs text-text-secondary mt-2 ml-7">
                            An invoice will be automatically created and sent to the client upon variation approval.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Impact Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Time Impact (Days)"
                type="number"
                placeholder="0"
                value={formData?.timeImpact}
                onChange={(e) => handleInputChange('timeImpact', e?.target?.value)}
                description="Positive for delay, negative for acceleration"
              />

              <Select
                label="Priority"
                options={priorityOptions}
                value={formData?.priority}
                onChange={(value) => handleInputChange('priority', value)}
              />
            </div>

            {/* Justification */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Justification <span className="text-error">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                rows={3}
                placeholder="Explain why this variation is necessary..."
                value={formData?.justification}
                onChange={(e) => handleInputChange('justification', e?.target?.value)}
              />
              {errors?.justification && (
                <p className="text-sm text-error mt-1">{errors?.justification}</p>
              )}
            </div>

            {/* File Attachments */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Attachments
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Icon name="Upload" size={32} className="text-text-secondary mx-auto mb-2" />
                  <p className="text-sm text-primary font-medium">
                    Click to upload files
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    PDF, DOC, DOCX, JPG, PNG, GIF up to 10MB each
                  </p>
                </label>
              </div>

              {/* Attachment List */}
              {formData?.attachments?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData?.attachments?.map((attachment) => (
                    <div
                      key={attachment?.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon name="File" size={16} className="text-text-secondary" />
                        <div>
                          <p className="text-sm font-medium text-primary">
                            {attachment?.name}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {formatFileSize(attachment?.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment?.id)}
                        iconName="X"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted/50">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveAsDraft}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Save as Draft
            </Button>
            <Button
              onClick={handleSubmitForReview}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Submit for Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVariationModal;