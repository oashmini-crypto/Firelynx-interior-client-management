import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const CreateUserModal = ({ isOpen, onClose, onCreateUser }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    department: '',
    skills: [],
    sendInvitation: true
  });

  const [errors, setErrors] = useState({});

  const roleOptions = [
    { value: 'manager', label: 'Manager' },
    { value: 'designer', label: 'Designer' },
    { value: 'client', label: 'Client' }
  ];

  const departmentOptions = [
    { value: 'design', label: 'Design' },
    { value: 'management', label: 'Management' },
    { value: 'operations', label: 'Operations' },
    { value: 'sales', label: 'Sales' }
  ];

  const skillOptions = [
    { value: 'interior-design', label: 'Interior Design' },
    { value: 'project-management', label: 'Project Management' },
    { value: '3d-modeling', label: '3D Modeling' },
    { value: 'client-relations', label: 'Client Relations' },
    { value: 'space-planning', label: 'Space Planning' },
    { value: 'color-theory', label: 'Color Theory' },
    { value: 'furniture-selection', label: 'Furniture Selection' },
    { value: 'lighting-design', label: 'Lighting Design' },
    { value: 'sustainable-design', label: 'Sustainable Design' },
    { value: 'cad', label: 'CAD' },
    { value: 'material-selection', label: 'Material Selection' },
    { value: 'business-development', label: 'Business Development' }
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

    if (!formData?.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData?.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData?.department) {
      newErrors.department = 'Department is required';
    }

    if (formData?.skills?.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (validateForm()) {
      const newUser = {
        id: Date.now(),
        name: `${formData?.firstName} ${formData?.lastName}`,
        email: formData?.email,
        role: formData?.role,
        department: formData?.department,
        skills: formData?.skills?.map(skillId => 
          skillOptions?.find(skill => skill?.value === skillId)?.label || skillId
        ),
        status: 'pending',
        utilization: 0,
        joinDate: new Date()?.toISOString()?.split('T')?.[0],
        lastActive: 'Never',
        avatar: `https://ui-avatars.com/api/?name=${formData?.firstName}+${formData?.lastName}&background=3182CE&color=fff`
      };

      if (onCreateUser) {
        onCreateUser(newUser);
      }

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        department: '',
        skills: [],
        sendInvitation: true
      });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      department: '',
      skills: [],
      sendInvitation: true
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-200 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-primary">Create New User</h2>
            <p className="text-sm text-text-secondary mt-1">Add a new team member or client to the system</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-primary mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                placeholder="Enter first name"
                value={formData?.firstName}
                onChange={(e) => handleInputChange('firstName', e?.target?.value)}
                error={errors?.firstName}
                required
              />
              <Input
                label="Last Name"
                type="text"
                placeholder="Enter last name"
                value={formData?.lastName}
                onChange={(e) => handleInputChange('lastName', e?.target?.value)}
                error={errors?.lastName}
                required
              />
            </div>
            <div className="mt-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter email address"
                value={formData?.email}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                error={errors?.email}
                description="User will receive login credentials at this email"
                required
              />
            </div>
          </div>

          {/* Role & Department */}
          <div>
            <h3 className="text-lg font-medium text-primary mb-4">Role & Department</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Role"
                placeholder="Select user role"
                options={roleOptions}
                value={formData?.role}
                onChange={(value) => handleInputChange('role', value)}
                error={errors?.role}
                required
              />
              <Select
                label="Department"
                placeholder="Select department"
                options={departmentOptions}
                value={formData?.department}
                onChange={(value) => handleInputChange('department', value)}
                error={errors?.department}
                required
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-medium text-primary mb-4">Skills & Expertise</h3>
            <Select
              label="Skills"
              placeholder="Select skills"
              description="Choose relevant skills for this user"
              options={skillOptions}
              value={formData?.skills}
              onChange={(value) => handleInputChange('skills', value)}
              error={errors?.skills}
              multiple
              searchable
              required
            />
          </div>

          {/* Settings */}
          <div>
            <h3 className="text-lg font-medium text-primary mb-4">Account Settings</h3>
            <Checkbox
              label="Send invitation email"
              description="User will receive an email with login instructions"
              checked={formData?.sendInvitation}
              onChange={(e) => handleInputChange('sendInvitation', e?.target?.checked)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              iconName="UserPlus"
              iconPosition="left"
            >
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;