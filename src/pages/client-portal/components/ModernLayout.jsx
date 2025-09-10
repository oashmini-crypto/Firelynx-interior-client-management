// Modern Client Portal Layout with Sticky Left Navigation
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ModernLayout = ({ children, onLogout, project, loading }) => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Navigation items based on your specification
  const navigationItems = [
    { id: 'overview', label: 'Project Overview', icon: 'Home', path: '' },
    { id: 'milestones', label: 'Timeline & Milestones', icon: 'Calendar', path: '?tab=milestones' },
    { id: 'files', label: 'File Library', icon: 'FileText', path: '?tab=files' },
    { id: 'variations', label: 'Change Requests', icon: 'GitBranch', path: '?tab=variations' },
    { id: 'approvals', label: 'Approvals', icon: 'CheckCircle', path: '?tab=approvals' },
    { id: 'invoices', label: 'Invoices & Billing', icon: 'CreditCard', path: '?tab=invoices' },
    { id: 'tickets', label: 'Support Tickets', icon: 'MessageSquare', path: '?tab=tickets' },
  ];

  const currentTab = new URLSearchParams(location.search).get('tab') || 'overview';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sticky Left Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg transition-all duration-300 fixed left-0 top-0 h-full z-30 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">FireLynx</h1>
                <p className="text-sm text-gray-500">Client Portal</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2"
            >
              <Icon name={sidebarCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
            </Button>
          </div>
        </div>

        {/* Project Info */}
        {!sidebarCollapsed && project && (
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <h3 className="font-semibold text-gray-900 text-sm">{project.title}</h3>
            <p className="text-xs text-gray-600 mt-1">
              {project.status} • {project.progress}% Complete
            </p>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = currentTab === item.id || (currentTab === 'overview' && item.id === 'overview');
            return (
              <Link
                key={item.id}
                to={`${location.pathname}${item.path}`}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon name={item.icon} size={18} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
                {!sidebarCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          {!sidebarCollapsed && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{project?.clientName || 'Client'}</p>
                  <p className="text-xs text-gray-500">{project?.clientEmail || ''}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="w-full justify-start text-red-600 hover:bg-red-50"
              >
                <Icon name="LogOut" size={16} className="mr-2" />
                Sign Out
              </Button>
            </div>
          )}
          {sidebarCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="w-full p-2 text-red-600 hover:bg-red-50"
              title="Sign Out"
            >
              <Icon name="LogOut" size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {navigationItems.find(item => item.id === currentTab)?.label || 'Project Overview'}
              </h1>
              {project && (
                <p className="text-gray-600 mt-1">
                  {project.title} • Budget: AED {parseFloat(project.budget || 0).toLocaleString()}
                </p>
              )}
            </div>
            
            {/* Status Badge */}
            {project && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Project Status</div>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      project.status === 'Completed' ? 'bg-green-400' :
                      project.status === 'In Progress' ? 'bg-blue-400' :
                      project.status === 'On Hold' ? 'bg-yellow-400' :
                      'bg-gray-400'
                    }`}></div>
                    {project.status}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernLayout;