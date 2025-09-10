import React from 'react';
import Icon from '../../../components/AppIcon';
import ClientMilestoneCard from './ClientMilestoneCard';

const MilestoneTimeline = ({ milestones, projectId }) => {

  return (
    <div className="space-y-6">
      {milestones?.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
          <Icon name="CheckCircle" size={48} className="mx-auto text-text-secondary mb-4" />
          <h4 className="font-medium text-primary mb-2">No Milestones Available</h4>
          <p className="text-text-secondary max-w-md mx-auto">
            Your project team will create and share milestones here as your project progresses. 
            Milestones help track important phases of your interior design project.
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <Icon name="Info" size={16} className="text-blue-600 mr-2" />
            <span className="text-sm text-blue-700">
              Check back soon for project milestone updates
            </span>
          </div>
        </div>
      ) : (
        milestones?.map((milestone, index) => (
          <ClientMilestoneCard 
            key={milestone?.id} 
            milestone={milestone} 
            projectId={projectId}
          />
        ))
      )}
    </div>
  );
};

export default MilestoneTimeline;