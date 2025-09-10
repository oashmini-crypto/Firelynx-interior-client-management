import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { api } from '../../../services/api';

const CreateTicketModal = ({ isOpen, onClose, onCreateTicket, projectId = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: '',
    project: projectId || '',
    assignee: '',
    attachments: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dynamic options from API
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [assigneeOptions, setAssigneeOptions] = useState([]);

  // Fetch dropdown options when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDropdownOptions();
    }
  }, [isOpen]);

  const fetchDropdownOptions = async () => {
    setIsLoading(true);
    try {
      // Fetch priorities, categories, projects, and users in parallel
      const [prioritiesRes, categoriesRes, projectsRes, usersRes] = await Promise.all([
        api.get('/tickets/priorities'),
        api.get('/tickets/categories'),
        api.get('/projects'),
        api.get('/team/users')
      ]);

      setPriorityOptions(prioritiesRes.data.data || []);
      setCategoryOptions(categoriesRes.data.data || []);
      
      // Transform projects for dropdown
      const projects = projectsRes.data.data?.map(project => ({
        value: project.id,
        label: project.title,
        description: project.description
      })) || [];
      setProjectOptions(projects);

      // Transform users for dropdown (add auto-assign option)
      const users = usersRes.data.data?.map(user => ({
        value: user.id,
        label: user.name,
        description: user.email
      })) || [];
      setAssigneeOptions([
        { value: '', label: 'Auto-assign', description: 'System will assign automatically' },
        ...users
      ]);

    } catch (error) {
      console.error('Error fetching dropdown options:', error);
      // Set fallback options if API fails
      setPriorityOptions([
        { value: 'Low', label: 'Low', description: 'Minor issues' },
        { value: 'Medium', label: 'Medium', description: 'Standard priority' },
        { value: 'High', label: 'High', description: 'Important issues' },
        { value: 'Critical', label: 'Critical', description: 'Urgent issues' }
      ]);
      setCategoryOptions([
        { value: 'Technical', label: 'Technical Issue', description: 'Software bugs or technical problems' },
        { value: 'Support', label: 'General Support', description: 'Questions or assistance' },
        { value: 'Other', label: 'Other', description: 'Other issues' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e?.target?.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev?.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev?.attachments?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category || !formData.project) {
        console.error('Missing required fields');
        return;
      }

      // Prepare ticket data for API
      const ticketData = {
        projectId: formData.project,
        subject: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        requesterUserId: '4b659f80-7909-48c4-a64b-f32bbec2077b', // Alice Cooper (for demo)
        assigneeUserId: formData.assignee || null,
        attachments: formData.attachments?.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        })) || []
      };

      // Create ticket via API
      const response = await api.post('/tickets', ticketData);
      
      if (response.data.success) {
        console.log('✅ Ticket created successfully:', response.data.data);
        
        // Call parent callback if provided
        if (onCreateTicket) {
          onCreateTicket(response.data.data);
        }
        
        // Close modal and reset form
        onClose();
        resetForm();
      }
    } catch (error) {
      console.error('❌ Error creating ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      category: '',
      project: projectId || '',
      assignee: '',
      attachments: []
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-200 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-primary">Create New Ticket</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <Input
            label="Ticket Title"
            type="text"
            placeholder="Brief description of the issue"
            value={formData?.title}
            onChange={(e) => handleInputChange('title', e?.target?.value)}
            required
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              rows={4}
              placeholder="Detailed description of the issue..."
              value={formData?.description}
              onChange={(e) => handleInputChange('description', e?.target?.value)}
              required
            />
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Priority Level"
              options={priorityOptions}
              value={formData?.priority}
              onChange={(value) => handleInputChange('priority', value)}
              placeholder={isLoading ? "Loading priorities..." : "Select priority"}
              disabled={isLoading}
              required
            />

            <Select
              label="Category"
              placeholder={isLoading ? "Loading categories..." : "Select category"}
              options={categoryOptions}
              value={formData?.category}
              onChange={(value) => handleInputChange('category', value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Project */}
          <Select
            label="Related Project"
            placeholder={isLoading ? "Loading projects..." : "Select project"}
            options={projectOptions}
            value={formData?.project}
            onChange={(value) => handleInputChange('project', value)}
            disabled={isLoading || !!projectId}
            required
          />

          {/* Assignee */}
          <Select
            label="Assign To"
            placeholder={isLoading ? "Loading team members..." : "Auto-assign based on priority"}
            options={assigneeOptions}
            value={formData?.assignee}
            onChange={(value) => handleInputChange('assignee', value)}
            disabled={isLoading}
          />

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Attachments
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Icon name="Upload" size={24} className="text-text-secondary mb-2" />
                <p className="text-sm text-text-secondary">
                  Click to upload files or drag and drop
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  PNG, JPG, PDF up to 10MB each
                </p>
              </label>
            </div>

            {/* Attachment List */}
            {formData?.attachments?.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData?.attachments?.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="flex items-center space-x-2">
                      <Icon name="Paperclip" size={16} className="text-text-secondary" />
                      <span className="text-sm text-primary">{file?.name}</span>
                      <span className="text-xs text-text-secondary">
                        ({(file?.size / 1024 / 1024)?.toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      iconName="X"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              iconName="Plus"
              iconPosition="left"
            >
              Create Ticket
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;