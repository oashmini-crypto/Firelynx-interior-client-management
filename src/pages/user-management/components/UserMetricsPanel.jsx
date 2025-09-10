import React from 'react';
import Icon from '../../../components/AppIcon';

const UserMetricsPanel = ({ metrics = {} }) => {
  const defaultMetrics = {
    totalUsers: 24,
    activeUsers: 22,
    roleDistribution: {
      managers: 3,
      designers: 15,
      clients: 6
    },
    departmentAllocation: {
      design: 12,
      management: 4,
      operations: 6,
      sales: 2
    },
    utilizationStats: {
      high: 8,
      medium: 12,
      low: 4
    }
  };

  const data = { ...defaultMetrics, ...metrics };

  const MetricCard = ({ title, value, icon, color = "text-primary", bgColor = "bg-muted" }) => (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">{title}</p>
          <p className={`text-2xl font-semibold ${color}`}>{value}</p>
        </div>
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon name={icon} size={20} className={color} />
        </div>
      </div>
    </div>
  );

  const DistributionItem = ({ label, value, total, color = "bg-accent" }) => {
    const percentage = Math.round((value / total) * 100);
    
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 ${color} rounded-full`}></div>
          <span className="text-sm text-text-primary">{label}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-primary">{value}</span>
          <span className="text-xs text-text-secondary">({percentage}%)</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={data?.totalUsers}
          icon="Users"
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <MetricCard
          title="Active Users"
          value={data?.activeUsers}
          icon="UserCheck"
          color="text-success"
          bgColor="bg-success/10"
        />
        <MetricCard
          title="Departments"
          value={Object.keys(data?.departmentAllocation)?.length}
          icon="Building"
          color="text-accent"
          bgColor="bg-accent/10"
        />
        <MetricCard
          title="High Utilization"
          value={data?.utilizationStats?.high}
          icon="TrendingUp"
          color="text-warning"
          bgColor="bg-warning/10"
        />
      </div>
      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="Shield" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-primary">Role Distribution</h3>
          </div>
          <div className="space-y-1">
            <DistributionItem
              label="Managers"
              value={data?.roleDistribution?.managers}
              total={data?.totalUsers}
              color="bg-primary"
            />
            <DistributionItem
              label="Designers"
              value={data?.roleDistribution?.designers}
              total={data?.totalUsers}
              color="bg-accent"
            />
            <DistributionItem
              label="Clients"
              value={data?.roleDistribution?.clients}
              total={data?.totalUsers}
              color="bg-success"
            />
          </div>
        </div>

        {/* Department Allocation */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="Building" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-primary">Department Allocation</h3>
          </div>
          <div className="space-y-1">
            <DistributionItem
              label="Design"
              value={data?.departmentAllocation?.design}
              total={data?.totalUsers}
              color="bg-accent"
            />
            <DistributionItem
              label="Management"
              value={data?.departmentAllocation?.management}
              total={data?.totalUsers}
              color="bg-primary"
            />
            <DistributionItem
              label="Operations"
              value={data?.departmentAllocation?.operations}
              total={data?.totalUsers}
              color="bg-warning"
            />
            <DistributionItem
              label="Sales"
              value={data?.departmentAllocation?.sales}
              total={data?.totalUsers}
              color="bg-success"
            />
          </div>
        </div>
      </div>
      {/* Utilization Overview */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Activity" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-primary">Team Utilization</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-error/5 rounded-lg border border-error/20">
            <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="AlertTriangle" size={20} className="text-error" />
            </div>
            <p className="text-2xl font-semibold text-error">{data?.utilizationStats?.high}</p>
            <p className="text-sm text-text-secondary">High Utilization</p>
          </div>
          <div className="text-center p-4 bg-warning/5 rounded-lg border border-warning/20">
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="Clock" size={20} className="text-warning" />
            </div>
            <p className="text-2xl font-semibold text-warning">{data?.utilizationStats?.medium}</p>
            <p className="text-sm text-text-secondary">Medium Utilization</p>
          </div>
          <div className="text-center p-4 bg-success/5 rounded-lg border border-success/20">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="CheckCircle" size={20} className="text-success" />
            </div>
            <p className="text-2xl font-semibold text-success">{data?.utilizationStats?.low}</p>
            <p className="text-sm text-text-secondary">Optimal Utilization</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMetricsPanel;