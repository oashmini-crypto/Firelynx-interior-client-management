import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessionalSidebar from '../../components/ui/ProfessionalSidebar';
import NotificationCenter from '../../components/ui/NotificationCenter';
import KPICard from './components/KPICard';
import ProjectStatusChart from './components/ProjectStatusChart';
import PriorityActionsPanel from './components/PriorityActionsPanel';
import TeamActivityFeed from './components/TeamActivityFeed';
import QuickActionsPanel from './components/QuickActionsPanel';
import Icon from '../../components/AppIcon';
import { useProjects } from '../../hooks/useProjectData';
import { useAllVariations } from '../../hooks/useProjectData';
import { useAllTickets } from '../../hooks/useProjectData';
import { useAllInvoices } from '../../hooks/useProjectData';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch real data
  const { data: allProjects = [], isLoading: projectsLoading } = useProjects();
  const { data: allVariations = [], isLoading: variationsLoading } = useAllVariations();
  const { data: allTickets = [], isLoading: ticketsLoading } = useAllTickets();
  const { data: allInvoices = [], isLoading: invoicesLoading } = useAllInvoices();

  // Calculate real KPIs from data
  const kpiData = useMemo(() => {
    const activeProjects = allProjects.filter(p => p.status === 'In Progress' || p.status === 'Active').length;
    const pendingApprovals = allVariations.filter(v => v.status === 'Under Review' || v.status === 'Pending').length;
    const monthlyRevenue = allInvoices
      .filter(inv => inv.status === 'Paid' && new Date(inv.paymentDate).getMonth() === new Date().getMonth())
      .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const openTickets = allTickets.filter(t => t.status === 'Open').length;

    return [
      {
        title: 'Active Projects',
        value: activeProjects.toString(),
        change: allProjects.length > 0 ? `${allProjects.length} total` : 'No data',
        changeType: 'neutral',
        icon: 'Briefcase',
        color: 'accent'
      },
      {
        title: 'Pending Approvals',
        value: pendingApprovals.toString(),
        change: pendingApprovals > 0 ? 'Needs attention' : 'All clear',
        changeType: pendingApprovals > 0 ? 'negative' : 'positive',
        icon: 'Clock',
        color: 'warning'
      },
      {
        title: 'Open Tickets',
        value: openTickets.toString(),
        change: allTickets.length > openTickets ? `${allTickets.length - openTickets} resolved` : 'No data',
        changeType: openTickets === 0 ? 'positive' : 'neutral',
        icon: 'MessageSquare',
        color: 'error'
      },
      {
        title: 'Monthly Revenue',
        value: `AED ${monthlyRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
        change: allInvoices.length > 0 ? `${allInvoices.filter(inv => inv.status === 'Paid').length} paid invoices` : 'No data',
        changeType: 'positive',
        icon: 'DollarSign',
        color: 'primary'
      }
    ];
  }, [allProjects, allVariations, allTickets, allInvoices]);

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
      <div className="flex">
        <ProfessionalSidebar />
        
        <main className="flex-1 ml-64">
          <div className="sticky top-0 z-10 bg-background border-b border-border">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">Manager Dashboard</h1>
                <p className="text-text-secondary">
                  {formatDate(currentTime)} • {formatTime(currentTime)}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <NotificationCenter 
                  onMarkAsRead={(id) => {
                    console.log('Marking notification as read:', id);
                  }}
                  onMarkAllAsRead={() => {
                    console.log('Marking all notifications as read');
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-2">
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;