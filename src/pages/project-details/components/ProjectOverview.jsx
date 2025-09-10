import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

import Icon from '../../../components/AppIcon';

const ProjectOverview = ({ project }) => {
  const [updates, setUpdates] = useState([
    {
      id: 1,
      title: 'Design phase completed',
      description: 'All interior design layouts have been finalized and approved by the client.',
      author: 'Sarah Wilson',
      date: '2024-12-05',
      type: 'milestone'
    },
    {
      id: 2,
      title: 'Material procurement started',
      description: 'Ordered premium fixtures and furniture according to the approved design specifications.',
      author: 'Mike Johnson',
      date: '2024-12-03',
      type: 'update'
    },
    {
      id: 3,
      title: 'Client feedback incorporated',
      description: 'Updated lighting plan based on client preferences for warmer tones in the living areas.',
      author: 'Design Team',
      date: '2024-12-01',
      type: 'update'
    }
  ]);

  const [newUpdate, setNewUpdate] = useState('');
  const [showAddUpdate, setShowAddUpdate] = useState(false);

  const handleAddUpdate = () => {
    if (newUpdate?.trim()) {
      const update = {
        id: Date.now(),
        title: 'Project Update',
        description: newUpdate,
        author: 'Current User',
        date: new Date()?.toISOString()?.split('T')?.[0],
        type: 'update'
      };
      setUpdates([update, ...updates]);
      setNewUpdate('');
      setShowAddUpdate(false);
      console.log('Update added successfully');
    }
  };

  const getUpdateIcon = (type) => {
    switch (type) {
      case 'milestone':
        return 'Target';
      case 'update':
        return 'MessageCircle';
      default:
        return 'Clock';
    }
  };

  const getUpdateColor = (type) => {
    switch (type) {
      case 'milestone':
        return 'text-green-600 bg-green-100';
      case 'update':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Project Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm mb-1">Timeline</p>
              <p className="text-2xl font-semibold text-card-foreground">
                {Math.ceil((new Date(project?.targetDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Calendar" size={24} className="text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm mb-1">Budget Status</p>
              <p className="text-2xl font-semibold text-card-foreground">{formatCurrency(project?.budget * 0.35)}</p>
              <p className="text-text-secondary text-xs">of {formatCurrency(project?.budget)} used</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm mb-1">Team Members</p>
              <p className="text-2xl font-semibold text-card-foreground">8</p>
              <p className="text-text-secondary text-xs">Active members</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm mb-1">Open Issues</p>
              <p className="text-2xl font-semibold text-card-foreground">3</p>
              <p className="text-text-secondary text-xs">Requires attention</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon name="AlertCircle" size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Project Description */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Project Description</h3>
        <p className="text-text-secondary leading-relaxed">
          {project?.description}
        </p>
      </div>

      {/* Recent Updates */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">Recent Updates</h3>
          <Button
            onClick={() => setShowAddUpdate(true)}
            iconName="Plus"
            size="sm"
          >
            Add Update
          </Button>
        </div>

        {/* Add Update Form */}
        {showAddUpdate && (
          <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
            <div className="space-y-3">
              <textarea
                value={newUpdate}
                onChange={(e) => setNewUpdate(e?.target?.value)}
                placeholder="What's the latest update on this project?"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddUpdate(false);
                    setNewUpdate('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddUpdate}
                  disabled={!newUpdate?.trim()}
                >
                  Add Update
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Updates Timeline */}
        <div className="space-y-4">
          {updates?.map((update) => (
            <div key={update?.id} className="flex items-start space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getUpdateColor(update?.type)}`}>
                <Icon name={getUpdateIcon(update?.type)} size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-card-foreground">{update?.title}</h4>
                  <span className="text-text-secondary text-sm">{formatDate(update?.date)}</span>
                </div>
                <p className="text-text-secondary text-sm mt-1">{update?.description}</p>
                <p className="text-text-secondary text-xs mt-2">by {update?.author}</p>
              </div>
            </div>
          ))}

          {updates?.length === 0 && (
            <div className="text-center py-8">
              <Icon name="MessageCircle" size={48} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-text-secondary">No updates yet. Add the first update to keep everyone informed.</p>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Project Timeline</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Started:</span>
              <span className="font-medium">{formatDate(project?.startDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Target Completion:</span>
              <span className="font-medium">{formatDate(project?.targetDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Duration:</span>
              <span className="font-medium">
                {Math.ceil((new Date(project?.targetDate) - new Date(project?.startDate)) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Milestones:</span>
              <span className="font-medium">5 of 8 completed</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Approvals:</span>
              <span className="font-medium">3 pending</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Files:</span>
              <span className="font-medium">24 documents</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;