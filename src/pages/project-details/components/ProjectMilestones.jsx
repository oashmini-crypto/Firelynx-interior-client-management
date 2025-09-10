import React, { useState } from 'react';
import { useMilestones } from '../../../hooks/useMilestones';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import EnhancedMilestoneCard from '../../../components/cards/EnhancedMilestoneCard';

const ProjectMilestones = ({ projectId }) => {
  // Get milestones from API
  const { 
    milestones: apiMilestones, 
    loading: milestonesLoading, 
    error: milestonesError,
    createMilestone: apiCreateMilestone,
    updateMilestone: apiUpdateMilestone,
    deleteMilestone: apiDeleteMilestone
  } = useMilestones(projectId);
  
  // Filter milestones for this project
  const milestones = apiMilestones.filter(m => m.projectId === projectId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expectedDate: '',
    progress: 0
  });

  const handleAddMilestone = () => {
    setFormData({
      title: '',
      description: '',
      expectedDate: '',
      progress: 0
    });
    setEditingMilestone(null);
    setShowAddModal(true);
  };

  const handleEditMilestone = (milestone) => {
    setFormData({
      title: milestone?.title || '',
      description: milestone?.description || '',
      expectedDate: milestone?.expectedDate || '',
      progress: milestone?.progress || 0
    });
    setEditingMilestone(milestone);
    setShowAddModal(true);
  };

  const handleSaveMilestone = async () => {
    if (!formData?.title?.trim()) return;

    try {
      const milestoneData = {
        ...formData,
        projectId,
        status: formData?.progress === 100 ? 'Completed' : formData?.progress > 0 ? 'In Progress' : 'Planned'
      };

      if (editingMilestone) {
        await apiUpdateMilestone(editingMilestone.id, milestoneData);
        console.log('Milestone updated successfully');
      } else {
        await apiCreateMilestone(milestoneData);
        console.log('Milestone created successfully');
      }

      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving milestone:', error);
      // TODO: Show error toast to user
    }
  };

  const handleDeleteMilestone = async (milestone) => {
    if (window.confirm(`Are you sure you want to delete "${milestone?.title}"?`)) {
      try {
        await apiDeleteMilestone(milestone.id);
        console.log('Milestone deleted successfully');
      } catch (error) {
        console.error('Error deleting milestone:', error);
        // TODO: Show error toast to user
      }
    }
  };

  const handleFileListUpdate = () => {
    // This function can be used to refresh milestone data when files are updated
    // For now, the enhanced cards handle their own file state
    console.log('File list updated for project:', projectId);
  };

  // Helper functions removed - now handled by EnhancedMilestoneCard

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Milestones</h2>
          <p className="text-text-secondary">Track project progress through key milestones</p>
        </div>
        <Button onClick={handleAddMilestone} iconName="Plus">
          Add Milestone
        </Button>
      </div>

      {/* Milestones Timeline */}
      <div className="space-y-4">
        {milestones?.map((milestone) => (
          <EnhancedMilestoneCard
            key={milestone?.id}
            milestone={milestone}
            onEdit={handleEditMilestone}
            onDelete={handleDeleteMilestone}
            projectId={projectId}
            onFileListUpdate={handleFileListUpdate}
          />
        ))}

        {milestones?.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Target" size={48} className="text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground mb-2">No milestones yet</h3>
            <p className="text-text-secondary mb-4">Create your first milestone to start tracking project progress.</p>
            <Button onClick={handleAddMilestone} iconName="Plus">
              Add First Milestone
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {editingMilestone ? 'Edit Milestone' : 'Add New Milestone'}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddModal(false)}
                  iconName="X"
                />
              </div>

              <div className="space-y-4">
                <Input
                  label="Milestone Title"
                  value={formData?.title}
                  onChange={(e) => setFormData({ ...formData, title: e?.target?.value })}
                  required
                  placeholder="Enter milestone title..."
                />

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <textarea
                    value={formData?.description}
                    onChange={(e) => setFormData({ ...formData, description: e?.target?.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Describe what needs to be accomplished..."
                  />
                </div>

                <Input
                  label="Expected Date"
                  type="date"
                  value={formData?.expectedDate}
                  onChange={(e) => setFormData({ ...formData, expectedDate: e?.target?.value })}
                  required
                />

                <Input
                  label="Progress (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={formData?.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e?.target?.value) })}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveMilestone}>
                  {editingMilestone ? 'Update Milestone' : 'Create Milestone'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMilestones;