import React from 'react';
import Icon from '../../../components/AppIcon';

const ProjectOverviewCard = ({ project }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Planning':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const progressPercentage = project.progress || 0;
  const budgetUsed = (project.spent / project.budget) * 100;
  const remainingBudget = project.budget - project.spent;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Project Progress</h3>
          <span className="text-sm font-semibold text-gray-900">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {progressPercentage < 30 ? 'Getting started' : 
           progressPercentage < 70 ? 'Making great progress' : 
           progressPercentage < 100 ? 'Almost there!' : 'Project completed!'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Budget Overview */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
              <Icon name="DollarSign" size={24} className="text-green-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Total Budget</h4>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(project.budget)}</p>
          </div>

          {/* Spent Amount */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
              <Icon name="CreditCard" size={24} className="text-blue-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Amount Spent</h4>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(project.spent)}</p>
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{budgetUsed.toFixed(1)}% of budget</p>
            </div>
          </div>

          {/* Remaining Budget */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
              <Icon name="PiggyBank" size={24} className="text-purple-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Remaining</h4>
            <p className={`text-lg font-semibold ${
              remainingBudget < 0 ? 'text-red-600' : 'text-gray-900'
            }`}>
              {formatCurrency(remainingBudget)}
            </p>
            {remainingBudget < 0 && (
              <p className="text-xs text-red-500 mt-1">Over budget</p>
            )}
          </div>

          {/* Timeline */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3">
              <Icon name="Calendar" size={24} className="text-orange-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Timeline</h4>
            <p className="text-sm font-semibold text-gray-900">
              {project.startDate && formatDate(project.startDate)}
            </p>
            <p className="text-xs text-gray-500">to</p>
            <p className="text-sm font-semibold text-gray-900">
              {project.expectedCompletion && formatDate(project.expectedCompletion)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
            <Icon name="MessageSquare" size={14} />
            <span>Contact Team</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
            <Icon name="Download" size={14} />
            <span>Download Report</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
            <Icon name="Calendar" size={14} />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverviewCard;