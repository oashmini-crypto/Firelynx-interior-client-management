import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const CreateClientModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    industry: '',
    relationshipStatus: 'Prospect'
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const industryOptions = [
    { value: '', label: 'Select Industry' },
    { value: 'Residential', label: 'Residential' },
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Hospitality', label: 'Hospitality' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Education', label: 'Education' },
    { value: 'Government', label: 'Government' }
  ];

  const relationshipStatusOptions = [
    { value: 'Prospect', label: 'Prospect' },
    { value: 'Active', label: 'Active' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData?.company?.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData?.industry) {
      newErrors.industry = 'Please select an industry';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(formData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        industry: '',
        relationshipStatus: 'Prospect'
      });
    } catch (error) {
      console.error('Error saving client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        industry: '',
        relationshipStatus: 'Prospect'
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name="UserPlus" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Create New Client</h2>
              <p className="text-text-secondary">Add a new client to your portfolio</p>
            </div>
          </div>

          <Button
            variant="ghost"
            iconName="X"
            onClick={handleClose}
            disabled={isLoading}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Enter client's full name"
                  value={formData?.name}
                  onChange={(e) => handleInputChange('name', e?.target?.value)}
                  error={errors?.name}
                  required
                />

                <Input
                  label="Company"
                  placeholder="Enter company name"
                  value={formData?.company}
                  onChange={(e) => handleInputChange('company', e?.target?.value)}
                  error={errors?.company}
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter email address"
                  value={formData?.email}
                  onChange={(e) => handleInputChange('email', e?.target?.value)}
                  error={errors?.email}
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData?.phone}
                  onChange={(e) => handleInputChange('phone', e?.target?.value)}
                  error={errors?.phone}
                  required
                />
              </div>

              <div className="mt-4">
                <Input
                  label="Address"
                  placeholder="Enter full address"
                  value={formData?.address}
                  onChange={(e) => handleInputChange('address', e?.target?.value)}
                  error={errors?.address}
                  description="Street address, city, state, zip code"
                />
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Industry"
                  placeholder="Select industry"
                  value={formData?.industry}
                  onChange={(value) => handleInputChange('industry', value)}
                  options={industryOptions}
                  error={errors?.industry}
                  required
                />

                <Select
                  label="Relationship Status"
                  value={formData?.relationshipStatus}
                  onChange={(value) => handleInputChange('relationshipStatus', value)}
                  options={relationshipStatusOptions}
                  description="Current relationship with the client"
                />
              </div>
            </div>

            {/* Project Planning */}
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Icon name="Lightbulb" size={20} className="text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground">Ready to start a project?</h4>
                  <p className="text-sm text-text-secondary mt-1">
                    After creating this client, you can immediately start a new project with pre-filled client information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            iconName="Plus"
            loading={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? 'Creating...' : 'Create Client'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateClientModal;