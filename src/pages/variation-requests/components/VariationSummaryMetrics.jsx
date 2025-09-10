import React from 'react';
import Icon from '../../../components/AppIcon';

const VariationSummaryMetrics = ({ 
  totalVariations = 0,
  pendingApprovals = 0,
  approvedVariations = 0,
  declinedVariations = 0,
  totalBudgetImpact = 0,
  totalTimeImpact = 0,
  averageApprovalTime = 0
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100)?.toFixed(1)}%`;
  };

  const metrics = [
    {
      id: 'total',
      label: 'Total Variations',
      value: totalVariations,
      icon: 'FileEdit',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: null
    },
    {
      id: 'pending',
      label: 'Pending Approvals',
      value: pendingApprovals,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: pendingApprovals > 0 ? `${formatPercentage(pendingApprovals, totalVariations)} of total` : null
    },
    {
      id: 'approved',
      label: 'Approved',
      value: approvedVariations,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: approvedVariations > 0 ? `${formatPercentage(approvedVariations, totalVariations)} approval rate` : null
    },
    {
      id: 'declined',
      label: 'Declined',
      value: declinedVariations,
      icon: 'XCircle',
      color: 'text-error',
      bgColor: 'bg-error/10',
      change: declinedVariations > 0 ? `${formatPercentage(declinedVariations, totalVariations)} decline rate` : null
    },
    {
      id: 'budget',
      label: 'Budget Impact',
      value: formatCurrency(totalBudgetImpact),
      icon: 'DollarSign',
      color: totalBudgetImpact >= 0 ? 'text-error' : 'text-success',
      bgColor: totalBudgetImpact >= 0 ? 'bg-error/10' : 'bg-success/10',
      change: totalBudgetImpact !== 0 ? `${totalBudgetImpact > 0 ? 'Increase' : 'Decrease'} from variations` : null
    },
    {
      id: 'time',
      label: 'Time Impact',
      value: `${totalTimeImpact > 0 ? '+' : ''}${totalTimeImpact} days`,
      icon: 'Calendar',
      color: totalTimeImpact >= 0 ? 'text-error' : 'text-success',
      bgColor: totalTimeImpact >= 0 ? 'bg-error/10' : 'bg-success/10',
      change: totalTimeImpact !== 0 ? `${totalTimeImpact > 0 ? 'Delay' : 'Acceleration'} from variations` : null
    },
    {
      id: 'approval_time',
      label: 'Avg. Approval Time',
      value: `${averageApprovalTime} days`,
      icon: 'Timer',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      change: averageApprovalTime > 0 ? 'Average processing time' : null
    },
    {
      id: 'efficiency',
      label: 'Processing Efficiency',
      value: `${formatPercentage(approvedVariations + declinedVariations, totalVariations)}`,
      icon: 'TrendingUp',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      change: 'Completed variations'
    }
  ];

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-primary">Variation Summary</h2>
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <Icon name="BarChart3" size={16} />
          <span>Overview Metrics</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics?.map((metric) => (
          <div
            key={metric?.id}
            className="bg-background rounded-lg border border-border p-4 hover:shadow-subtle transition-smooth"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${metric?.bgColor} flex items-center justify-center`}>
                <Icon name={metric?.icon} size={20} className={metric?.color} />
              </div>
              {metric?.id === 'pending' && pendingApprovals > 0 && (
                <span className="inline-flex items-center px-2 py-1 bg-warning text-warning-foreground text-xs rounded-full">
                  Action Required
                </span>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-2xl font-semibold text-primary">
                {metric?.value}
              </p>
              <p className="text-sm font-medium text-text-secondary">
                {metric?.label}
              </p>
              {metric?.change && (
                <p className="text-xs text-text-secondary">
                  {metric?.change}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Quick Insights */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-medium text-primary mb-3">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-3 bg-background rounded-lg border border-border">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name="AlertCircle" size={16} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">
                {pendingApprovals > 0 
                  ? `${pendingApprovals} variations awaiting approval`
                  : 'All variations processed'
                }
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {pendingApprovals > 0 
                  ? 'Review pending requests to maintain project timeline' :'No pending variations require immediate attention'
                }
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-background rounded-lg border border-border">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              totalBudgetImpact > 0 ? 'bg-error/10' : totalBudgetImpact < 0 ? 'bg-success/10' : 'bg-muted'
            }`}>
              <Icon 
                name={totalBudgetImpact > 0 ? 'TrendingUp' : totalBudgetImpact < 0 ? 'TrendingDown' : 'Minus'} 
                size={16} 
                className={totalBudgetImpact > 0 ? 'text-error' : totalBudgetImpact < 0 ? 'text-success' : 'text-text-secondary'}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">
                {totalBudgetImpact === 0 
                  ? 'Budget neutral variations'
                  : `${formatCurrency(Math.abs(totalBudgetImpact))} ${totalBudgetImpact > 0 ? 'over' : 'under'} budget`
                }
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {totalBudgetImpact === 0 
                  ? 'Variations have no net budget impact'
                  : `Cumulative ${totalBudgetImpact > 0 ? 'increase' : 'savings'} from all variations`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariationSummaryMetrics;