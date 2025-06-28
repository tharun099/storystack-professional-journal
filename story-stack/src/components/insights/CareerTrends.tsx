import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar, 
  Activity,
  Target,
  Award,
  Zap,
  Users,
  BookOpen
} from 'lucide-react';
import { CareerTrend } from '../../types';

interface CareerTrendsProps {
  trends: CareerTrend[];
  overallMomentum: string;
  skillDiversityScore: number;
}

export function CareerTrends({ trends, overallMomentum, skillDiversityScore }: CareerTrendsProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'momentum' | 'skills'>('timeline');

  const getMomentumConfig = (momentum: string) => {
    switch (momentum) {
      case 'high':
        return {
          color: 'text-green-700 dark:text-green-300',
          bg: 'bg-green-50 dark:bg-green-950/30',
          border: 'border-green-200 dark:border-green-800',
          icon: TrendingUp,
          label: 'High Momentum'
        };
      case 'medium':
        return {
          color: 'text-yellow-700 dark:text-yellow-300',
          bg: 'bg-yellow-50 dark:bg-yellow-950/30',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: Activity,
          label: 'Medium Momentum'
        };
      default:
        return {
          color: 'text-muted-foreground',
          bg: 'bg-muted',
          border: 'border-border',
          icon: TrendingDown,
          label: 'Low Momentum'
        };
    }
  };

  const getOverallMomentumConfig = (momentum: string) => {
    switch (momentum) {
      case 'accelerating':
        return {
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-950/30',
          icon: TrendingUp,
          label: 'Accelerating',
          description: 'Your career momentum is building strongly'
        };
      case 'declining':
        return {
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-950/30',
          icon: TrendingDown,
          label: 'Declining',
          description: 'Consider increasing activity and impact documentation'
        };
      default:
        return {
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          icon: Activity,
          label: 'Steady',
          description: 'Maintaining consistent career progress'
        };
    }
  };

  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'achievement': return Award;
      case 'skill': return BookOpen;
      case 'project': return Target;
      case 'leadership': return Users;
      case 'learning': return BookOpen;
      case 'networking': return Users;
      default: return Activity;
    }
  };

  const overallConfig = getOverallMomentumConfig(overallMomentum);
  const OverallIcon = overallConfig.icon;

  const highMomentumTrends = trends.filter(t => t.momentum === 'high');
  const recentTrends = trends.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-foreground">Career Trends</h4>
          <p className="text-sm text-muted-foreground">
            Track your career momentum and activity patterns over time
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-lg p-1">
            {[
              { id: 'timeline', label: 'Timeline' },
              { id: 'momentum', label: 'Momentum' },
              { id: 'skills', label: 'Skills' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setViewMode(option.id as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  viewMode === option.id
                    ? 'bg-card text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overall Momentum Card */}
      <div className={`rounded-lg border-2 p-4 ${overallConfig.bg} border-border`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-card`}>
              <OverallIcon className={`w-5 h-5 ${overallConfig.color}`} />
            </div>
            <div>
              <h5 className={`font-semibold ${overallConfig.color}`}>
                Overall Momentum: {overallConfig.label}
              </h5>
              <p className={`text-sm ${overallConfig.color}`}>
                {overallConfig.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${overallConfig.color}`}>
              {Math.round(skillDiversityScore)}
            </div>
            <div className={`text-sm ${overallConfig.color}`}>
              Skill Diversity
            </div>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'timeline' && (
        <div className="space-y-4">
          <h5 className="font-semibold text-foreground">Recent Activity Timeline</h5>
          {recentTrends.length > 0 ? (
            <div className="space-y-3">
              {recentTrends.map((trend, index) => {
                const momentumConfig = getMomentumConfig(trend.momentum);
                const MomentumIcon = momentumConfig.icon;

                return (
                  <div
                    key={trend.period}
                    className={`card rounded-lg border-2 p-4 ${
                      trend.momentum === 'high' ? 'border-green-200 dark:border-green-800' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${momentumConfig.bg}`}>
                          <MomentumIcon className={`w-4 h-4 ${momentumConfig.color}`} />
                        </div>
                        <div>
                          <h6 className="font-semibold text-foreground">
                            {formatPeriod(trend.period)}
                          </h6>
                          <span className={`text-xs px-2 py-1 rounded-full ${momentumConfig.bg} ${momentumConfig.color} font-medium`}>
                            {momentumConfig.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-foreground">{trend.activityCount}</div>
                        <div className="text-xs text-muted-foreground">Activities</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Skills Learned:</span>
                        <div className="font-medium text-foreground">{trend.skillsLearned.length}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Categories:</span>
                        <div className="font-medium text-foreground">{trend.categoriesActive.length}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">With Impact:</span>
                        <div className="font-medium text-foreground">{trend.impactfulEntries}</div>
                      </div>
                    </div>

                    {trend.skillsLearned.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex flex-wrap gap-1.5">
                          {trend.skillsLearned.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                          {trend.skillsLearned.length > 5 && (
                            <span className="text-xs text-muted-foreground">
                              +{trend.skillsLearned.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No trend data available</p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'momentum' && (
        <div className="space-y-4">
          <h5 className="font-semibold text-foreground">Momentum Analysis</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['high', 'medium', 'low'].map((momentumLevel) => {
              const levelTrends = trends.filter(t => t.momentum === momentumLevel);
              const config = getMomentumConfig(momentumLevel);
              const Icon = config.icon;

              return (
                <div key={momentumLevel} className={`card rounded-lg border-2 p-4 ${config.border}`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <h6 className="font-semibold text-foreground">{config.label}</h6>
                      <p className="text-sm text-muted-foreground">{levelTrends.length} months</p>
                    </div>
                  </div>

                  {levelTrends.length > 0 && (
                    <div className="space-y-2">
                      {levelTrends.slice(0, 3).map((trend) => (
                        <div key={trend.period} className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{formatPeriod(trend.period)}</span>
                            <span className="font-medium text-foreground">{trend.activityCount} activities</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'skills' && (
        <div className="space-y-4">
          <h5 className="font-semibold text-foreground">Skill Development Timeline</h5>
          {recentTrends.length > 0 ? (
            <div className="space-y-3">
              {recentTrends
                .filter(trend => trend.skillsLearned.length > 0)
                .map((trend) => (
                  <div key={trend.period} className="card rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h6 className="font-semibold text-foreground">{formatPeriod(trend.period)}</h6>
                      <span className="text-sm text-muted-foreground">
                        {trend.skillsLearned.length} skills
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trend.skillsLearned.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-3 py-1 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-full border border-purple-200 dark:border-purple-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No skill development data available</p>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{highMomentumTrends.length}</div>
            <div className="text-sm text-muted-foreground">High Momentum Months</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {trends.reduce((sum, t) => sum + t.skillsLearned.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Skills Learned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {trends.reduce((sum, t) => sum + t.activityCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Activities</div>
          </div>
        </div>
      </div>
    </div>
  );
}
