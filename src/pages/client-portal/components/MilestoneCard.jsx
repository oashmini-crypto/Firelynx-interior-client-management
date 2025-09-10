import React from 'react';
import Icon from '../../../components/AppIcon';

const MilestoneCard = ({ milestone }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    if (milestone.status === 'Completed') return 100;
    if (milestone.status === 'In Progress') return milestone.progress || 50;
    return 0;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.title}</h3>
          <p className="text-gray-600 text-sm">{milestone.description}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(milestone.status)}`}>
          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            milestone.status === 'Completed' ? 'bg-green-400' :
            milestone.status === 'In Progress' ? 'bg-blue-400' :
            milestone.status === 'Overdue' ? 'bg-red-400' :
            'bg-yellow-400'
          }`}></div>
          {milestone.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-500">Created</p>
          <p className="font-medium text-gray-900">
            {formatDate(milestone.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Expected Date</p>
          <p className="font-medium text-gray-900">
            {formatDate(milestone.expectedDate)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{getProgressPercentage()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              milestone.status === 'Completed' ? 'bg-green-600' :
              milestone.status === 'In Progress' ? 'bg-blue-600' :
              milestone.status === 'Overdue' ? 'bg-red-600' :
              'bg-gray-400'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Dependencies */}
      {milestone.dependencies && milestone.dependencies.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-500 mb-2">Dependencies:</p>
          <div className="flex flex-wrap gap-1">
            {milestone.dependencies.map((dep, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                <Icon name="Link" size={12} className="mr-1" />
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneCard;