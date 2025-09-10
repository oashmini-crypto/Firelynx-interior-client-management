import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessionalSidebar from '../../components/ui/ProfessionalSidebar';
import NotificationCenter from '../../components/ui/NotificationCenter';
import KPICard from './components/KPICard';
import ProjectStatusChart from './components/ProjectStatusChart';
import PriorityActionsPanel from './components/PriorityActionsPanel';
import TeamActivityFeed from './components/TeamActivityFeed';
import QuickActionsPanel from './components/QuickActionsPanel';
import Icon from '../../components/AppIcon';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock notification counts for sidebar
  const notificationCounts = {
    variations: 3,
    tickets: 7
  };

  // Mock KPI data
  const kpiData = [
    {
      title: 'Active Projects',
      value: '28',
      change: '+12%',
      changeType: 'positive',
      icon: 'Briefcase',
      color: 'accent'
    },
    {
      title: 'Pending Approvals',
      value: '15',
      change: '+5',
      changeType: 'negative',
      icon: 'Clock',
      color: 'warning'
    },
    {
      title: 'Team Utilization',
      value: '87%',
      change: '+3%',
      changeType: 'positive',
      icon: 'Users',
      color: 'success'
    },
    {
      title: 'Monthly Revenue',
      value: '$284K',
      change: '+18%',
      changeType: 'positive',
      icon: 'DollarSign',
      color: 'primary'
    }
  ];

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleNavigation = (route) => {
    navigate(route);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <ProfessionalSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        notificationCounts={notificationCounts}
      />
      {/* Main Content */}
      <div className={`transition-smooth ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-60'} pb-16 md:pb-0`}>
        {/* Header */}
        <header className="sticky top-0 bg-surface border-b border-border z-50 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="md:hidden">
                <button
                  onClick={handleToggleSidebar}
                  className="p-2 rounded-lg hover:bg-muted transition-smooth"
                >
                  <Icon name="Menu" size={20} />
                </button>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Manager Dashboard</h1>
                <p className="text-sm text-text-secondary hidden sm:block">
                  {formatDate(currentTime)} • {formatTime(currentTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Add notification handlers for NotificationCenter */}
              <NotificationCenter 
                onMarkAsRead={(id) => {
                  // Handle marking notification as read
                  console.log('Marking notification as read:', id);
                }}
                onMarkAllAsRead={() => {
                  // Handle marking all notifications as read
                  console.log('Marking all notifications as read');
                }}
              />
              <div className="hidden sm:flex items-center space-x-2 text-sm text-text-secondary">
                <Icon name="Calendar" size={16} />
                <span>{formatDate(currentTime)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Welcome back, Studio Manager
                </h2>
                <p className="text-text-secondary">
                  Here's what's happening with your projects today
                </p>
              </div>
              <div className="hidden md:block">
                <Icon name="LayoutDashboard" size={48} className="text-accent/20" />
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData?.map((kpi, index) => (
              <KPICard
                key={index}
                title={kpi?.title}
                value={kpi?.value}
                change={kpi?.change}
                changeType={kpi?.changeType}
                icon={kpi?.icon}
                color={kpi?.color}
              />
            ))}
          </div>

          {/* Charts and Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProjectStatusChart />
            <PriorityActionsPanel onNavigate={handleNavigation} />
          </div>

          {/* Activity and Quick Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TeamActivityFeed />
            </div>
            <div>
              <QuickActionsPanel onNavigate={handleNavigation} />
            </div>
          </div>

          {/* Additional Insights */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-subtle">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-card-foreground">Today's Insights</h3>
              <Icon name="TrendingUp" size={20} className="text-success" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-semibold text-success mb-1">94%</div>
                <div className="text-sm text-text-secondary">Client Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-accent mb-1">6.2h</div>
                <div className="text-sm text-text-secondary">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-primary mb-1">12</div>
                <div className="text-sm text-text-secondary">Projects This Month</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;