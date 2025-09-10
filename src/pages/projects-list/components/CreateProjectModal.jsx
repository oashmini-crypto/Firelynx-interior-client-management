import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const CreateProjectModal = ({ isOpen, onClose, onSubmit, clients = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    description: '',
    budget: '',
    startDate: '',
    targetDate: '',
    status: 'Planned',
    priority: 'Medium'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: 'Planned', label: 'Planned' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Completed', label: 'Completed' }
  ];

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' }
  ];

  const clientOptions = clients?.map(client => ({
    value: client?.value,
    label: client?.label
  }));

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.title?.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!formData?.clientId) {
      newErrors.clientId = 'Client selection is required';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'Project description is required';
    }

    if (!formData?.budget || parseFloat(formData?.budget) <= 0) {
      newErrors.budget = 'Valid budget amount is required';
    }

    if (!formData?.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData?.targetDate) {
      newErrors.targetDate = 'Target date is required';
    }

    if (formData?.startDate && formData?.targetDate) {
      const startDate = new Date(formData?.startDate);
      const targetDate = new Date(formData?.targetDate);
      
      if (targetDate <= startDate) {
        newErrors.targetDate = 'Target date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Find selected client
      const selectedClient = clients?.find(c => c?.value === formData?.clientId);
      
      const projectData = {
        title: formData?.title?.trim(),
        client: {
          id: formData?.clientId,
          name: selectedClient?.label || 'Unknown Client'
        },
        description: formData?.description?.trim(),
        budget: parseFloat(formData?.budget),
        startDate: formData?.startDate,
        targetDate: formData?.targetDate,
        status: formData?.status,
        priority: formData?.priority
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSubmit?.(projectData);
      handleReset();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      clientId: '',
      description: '',
      budget: '',
      startDate: '',
      targetDate: '',
      status: 'Planned',
      priority: 'Medium'
    });
    setErrors({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      handleReset();
      onClose?.();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="Plus" size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">Create New Project</h2>
                <p className="text-text-secondary text-sm">Set up a new interior design project</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={isSubmitting}
              iconName="X"
            />
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-card-foreground">Basic Information</h3>
              
              <Input
                label="Project Title"
                value={formData?.title}
                onChange={(e) => handleInputChange('title', e?.target?.value)}
                error={errors?.title}
                required
                placeholder="Enter project title..."
                disabled={isSubmitting}
              />

              <Select
                label="Client"
                value={formData?.clientId}
                onChange={(value) => handleInputChange('clientId', value)}
                options={clientOptions}
                error={errors?.clientId}
                required
                placeholder="Select a client..."
                disabled={isSubmitting}
              />

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={formData?.description}
                  onChange={(e) => handleInputChange('description', e?.target?.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe the project scope, requirements, and objectives..."
                  disabled={isSubmitting}
                />
                {errors?.description && (
                  <p className="text-sm text-destructive mt-1">{errors?.description}</p>
                )}
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-card-foreground">Project Details</h3>
              
              <Input
                label="Budget (USD)"
                type="number"
                min="0"
                step="1000"
                value={formData?.budget}
                onChange={(e) => handleInputChange('budget', e?.target?.value)}
                error={errors?.budget}
                required
                placeholder="Enter project budget..."
                disabled={isSubmitting}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData?.startDate}
                  onChange={(e) => handleInputChange('startDate', e?.target?.value)}
                  error={errors?.startDate}
                  required
                  disabled={isSubmitting}
                />

                <Input
                  label="Target Completion Date"
                  type="date"
                  value={formData?.targetDate}
                  onChange={(e) => handleInputChange('targetDate', e?.target?.value)}
                  error={errors?.targetDate}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Initial Status"
                  value={formData?.status}
                  onChange={(value) => handleInputChange('status', value)}
                  options={statusOptions}
                  disabled={isSubmitting}
                />

                <Select
                  label="Priority"
                  value={formData?.priority}
                  onChange={(value) => handleInputChange('priority', value)}
                  options={priorityOptions}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Project Summary */}
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-medium text-card-foreground mb-3">Project Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Title:</span>
                  <span className="font-medium">{formData?.title || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Client:</span>
                  <span className="font-medium">
                    {clientOptions?.find(c => c?.value === formData?.clientId)?.label || 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Budget:</span>
                  <span className="font-medium">
                    {formData?.budget ? `$${parseFloat(formData?.budget)?.toLocaleString()}` : 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Duration:</span>
                  <span className="font-medium">
                    {formData?.startDate && formData?.targetDate 
                      ? `${Math.ceil((new Date(formData?.targetDate) - new Date(formData?.startDate)) / (1000 * 60 * 60 * 24))} days`
                      : 'Not specified'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              iconName="Plus"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;