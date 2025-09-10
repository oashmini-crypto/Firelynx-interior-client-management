import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ClientProfileModal = ({ 
  client, 
  isOpen, 
  onClose, 
  onSave, 
  onViewProjects, 
  onCreateProject 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (client) {
      setFormData({ ...client });
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const industryOptions = [
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ ...client });
    setIsEditing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-success bg-success/10';
      case 'On Hold': return 'text-warning bg-warning/10';
      case 'Prospect': return 'text-primary bg-primary/10';
      case 'Inactive': return 'text-text-secondary bg-muted/10';
      default: return 'text-text-secondary bg-muted/10';
    }
  };

  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-success';
      case 'In Progress': return 'text-primary';
      case 'On Hold': return 'text-warning';
      case 'Planned': return 'text-text-secondary';
      default: return 'text-text-secondary';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'projects', label: 'Projects', icon: 'Briefcase' },
    { id: 'communication', label: 'Communication', icon: 'MessageSquare' },
    { id: 'notes', label: 'Notes', icon: 'FileText' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {client?.avatar ? (
                <img 
                  src={client?.avatar} 
                  alt={client?.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-primary font-semibold text-2xl">
                  {client?.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{client?.name}</h2>
              <p className="text-text-secondary">{client?.company}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(client?.relationshipStatus)}`}>
                  {client?.relationshipStatus}
                </span>
                <span className="text-sm text-text-secondary">
                  Industry: {client?.industry}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              iconName="Briefcase"
              onClick={onViewProjects}
              className="hidden sm:flex"
            >
              View Projects
            </Button>
            <Button
              variant="default"
              iconName="Plus"
              onClick={onCreateProject}
            >
              New Project
            </Button>
            <Button
              variant="ghost"
              iconName="X"
              onClick={onClose}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab?.id
                  ? 'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab?.id)}
            >
              <Icon name={tab?.icon} size={16} />
              <span>{tab?.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Edit Toggle */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Client Information</h3>
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button variant="default" onClick={handleSave}>
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      iconName="Edit"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={formData?.name || ''}
                  onChange={(e) => handleInputChange('name', e?.target?.value)}
                  disabled={!isEditing}
                />
                
                <Input
                  label="Company"
                  value={formData?.company || ''}
                  onChange={(e) => handleInputChange('company', e?.target?.value)}
                  disabled={!isEditing}
                />

                <Input
                  label="Email"
                  type="email"
                  value={formData?.email || ''}
                  onChange={(e) => handleInputChange('email', e?.target?.value)}
                  disabled={!isEditing}
                />

                <Input
                  label="Phone"
                  value={formData?.phone || ''}
                  onChange={(e) => handleInputChange('phone', e?.target?.value)}
                  disabled={!isEditing}
                />

                <Select
                  label="Industry"
                  value={formData?.industry || ''}
                  onChange={(value) => handleInputChange('industry', value)}
                  options={industryOptions}
                  disabled={!isEditing}
                />

                <Select
                  label="Relationship Status"
                  value={formData?.relationshipStatus || ''}
                  onChange={(value) => handleInputChange('relationshipStatus', value)}
                  options={relationshipStatusOptions}
                  disabled={!isEditing}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    value={formData?.address || ''}
                    onChange={(e) => handleInputChange('address', e?.target?.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <p className="text-2xl font-semibold text-foreground">{client?.projectCount}</p>
                  <p className="text-sm text-text-secondary">Total Projects</p>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <p className="text-2xl font-semibold text-foreground">
                    {formatCurrency(client?.totalContractValue)}
                  </p>
                  <p className="text-sm text-text-secondary">Total Contract Value</p>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <p className="text-2xl font-semibold text-foreground">
                    {formatDate(client?.lastContact)}
                  </p>
                  <p className="text-sm text-text-secondary">Last Contact</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Project Portfolio</h3>
                <Button
                  variant="default"
                  iconName="Plus"
                  onClick={onCreateProject}
                >
                  Create Project
                </Button>
              </div>

              {client?.projects?.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="Briefcase" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium text-foreground mb-2">No projects yet</h4>
                  <p className="text-text-secondary mb-4">
                    Start building your relationship by creating the first project
                  </p>
                  <Button
                    variant="default"
                    iconName="Plus"
                    onClick={onCreateProject}
                  >
                    Create First Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {client?.projects?.map((project) => (
                    <div key={project?.id} className="bg-muted/20 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-foreground">{project?.title}</h4>
                          <p className={`text-sm font-medium ${getProjectStatusColor(project?.status)}`}>
                            {project?.status}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {formatCurrency(project?.value)}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {project?.progress}% Complete
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-muted rounded-full h-2 mb-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project?.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Communication History</h3>
              
              {client?.communicationHistory?.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="MessageSquare" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium text-foreground mb-2">No communication history</h4>
                  <p className="text-text-secondary">
                    Communication records will appear here as you interact with the client
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {client?.communicationHistory?.map((communication, index) => (
                    <div key={index} className="bg-muted/20 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <Icon 
                            name={
                              communication?.type === 'Email' ? 'Mail' : 
                              communication?.type === 'Phone'? 'Phone' : 'Users'
                            } 
                            size={16} 
                            className="text-primary" 
                          />
                          <span className="font-medium text-foreground">{communication?.type}</span>
                          <span className="text-sm text-text-secondary">•</span>
                          <span className="text-sm text-text-secondary">
                            {formatDate(communication?.date)}
                          </span>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-foreground mb-1">
                        {communication?.subject}
                      </h4>
                      <p className="text-text-secondary">
                        {communication?.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Client Notes</h3>
                <Button variant="outline" iconName="Plus">
                  Add Note
                </Button>
              </div>
              
              <div className="text-center py-8">
                <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h4 className="text-lg font-medium text-foreground mb-2">No notes yet</h4>
                <p className="text-text-secondary mb-4">
                  Keep track of important client information and interactions
                </p>
                <Button variant="outline" iconName="Plus">
                  Add First Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientProfileModal;