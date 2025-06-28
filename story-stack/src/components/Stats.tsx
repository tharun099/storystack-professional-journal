import React, { useMemo } from 'react';
import { TrendingUp, Target, Calendar, Award, Zap, AlertTriangle, BarChart3 } from 'lucide-react';
import { CareerEntry } from '../types';
import { CareerAnalytics } from '../utils/careerAnalytics';

interface StatsProps {
  entries: CareerEntry[];
  onShowInsights?: () => void;
}

export function Stats({ entries, onShowInsights }: StatsProps) {
  const thisWeek = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  }).length;

  const thisMonth = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return entryDate >= monthAgo;
  }).length;

  const uniqueSkills = new Set(entries.flatMap(entry => entry.skills)).size;
  const entriesWithImpact = entries.filter(entry => entry.impact.trim()).length;

  // Get quick insights for preview
  const quickInsights = useMemo(() => {
    if (entries.length === 0) return null;
    return CareerAnalytics.generateSimplifiedInsights(entries);
  }, [entries]);

  const stats = [
    {
      label: 'This Week',
      value: thisWeek,
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      label: 'This Month',
      value: thisMonth,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30'
    },
    {
      label: 'Unique Skills',
      value: uniqueSkills,
      icon: Award,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30'
    },
    {
      label: 'With Impact',
      value: entriesWithImpact,
      icon: Target,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30'
    }
  ];

  const getMomentumConfig = (momentum: string) => {
    switch (momentum) {
      case 'growing':
        return {
          icon: TrendingUp,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          label: 'Growing'
        };
      case 'needs-attention':
        return {
          icon: AlertTriangle,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-950/30',
          label: 'Needs Attention'
        };
      default:
        return {
          icon: BarChart3,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          label: 'Steady'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card-elevated p-4 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Insights Preview */}
      {quickInsights && onShowInsights && (
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getMomentumConfig(quickInsights.momentum).bgColor}`}>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Career Insights Preview</h3>
                <p className="text-sm text-muted-foreground">
                  Momentum: <span className={`font-medium ${getMomentumConfig(quickInsights.momentum).color}`}>
                    {getMomentumConfig(quickInsights.momentum).label}
                  </span>
                  {quickInsights.priorityActions.filter(a => a.priority === 'high').length > 0 && (
                    <span className="ml-2">• {quickInsights.priorityActions.filter(a => a.priority === 'high').length} priority actions</span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onShowInsights}
              className="btn btn-primary px-4 py-2 text-sm font-medium"
            >
              View Full Insights
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Skills Preview */}
            {quickInsights.topSkills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Top Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {quickInsights.topSkills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full border border-blue-200 dark:border-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {quickInsights.topSkills.length > 3 && (
                    <span className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                      +{quickInsights.topSkills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Priority Actions Preview */}
            {quickInsights.priorityActions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Next Steps</h4>
                <div className="space-y-2">
                  {quickInsights.priorityActions.slice(0, 2).map((action) => (
                    <div key={action.id} className="flex items-center space-x-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        action.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                      }`}></div>
                      <span className="text-foreground">{action.title}</span>
                    </div>
                  ))}
                  {quickInsights.priorityActions.length > 2 && (
                    <div className="text-sm text-muted-foreground">
                      +{quickInsights.priorityActions.length - 2} more recommendations
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}