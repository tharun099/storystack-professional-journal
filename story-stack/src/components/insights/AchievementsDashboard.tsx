import React, { useState } from 'react';
import { 
  Award, 
  Target, 
  TrendingUp, 
  Calendar, 
  Hash,
  Percent,
  DollarSign,
  Clock,
  Users,
  BarChart3,
  Star
} from 'lucide-react';
import { AchievementInsight } from '../../types';

interface AchievementsDashboardProps {
  achievements: AchievementInsight[];
  impactConsistency: number;
}

export function AchievementsDashboard({ achievements, impactConsistency }: AchievementsDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [expandedAchievement, setExpandedAchievement] = useState<string | null>(null);

  const highImpactAchievements = achievements.filter(a => a.category === 'high');
  const mediumImpactAchievements = achievements.filter(a => a.category === 'medium');
  const lowImpactAchievements = achievements.filter(a => a.category === 'low');

  const getFilteredAchievements = () => {
    switch (selectedCategory) {
      case 'high': return highImpactAchievements;
      case 'medium': return mediumImpactAchievements;
      case 'low': return lowImpactAchievements;
      default: return achievements;
    }
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'high':
        return {
          color: 'text-green-700 dark:text-green-300',
          bg: 'bg-green-50 dark:bg-green-950/30',
          border: 'border-green-200 dark:border-green-800',
          icon: Award,
          label: 'High Impact'
        };
      case 'medium':
        return {
          color: 'text-yellow-700 dark:text-yellow-300',
          bg: 'bg-yellow-50 dark:bg-yellow-950/30',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: Target,
          label: 'Medium Impact'
        };
      default:
        return {
          color: 'text-muted-foreground',
          bg: 'bg-muted',
          border: 'border-border',
          icon: BarChart3,
          label: 'Low Impact'
        };
    }
  };

  const getMetricIcon = (metric: string) => {
    if (metric.includes('%')) return Percent;
    if (metric.includes('$')) return DollarSign;
    if (metric.match(/hours?|days?|weeks?|months?|years?/i)) return Clock;
    if (metric.match(/users?|customers?|clients?/i)) return Users;
    return Hash;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredAchievements = getFilteredAchievements();

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-foreground">Key Achievements</h4>
          <p className="text-sm text-muted-foreground">
            Your most impactful career accomplishments with quantifiable results
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-lg p-1">
            {[
              { id: 'all', label: 'All', count: achievements.length },
              { id: 'high', label: 'High', count: highImpactAchievements.length },
              { id: 'medium', label: 'Medium', count: mediumImpactAchievements.length },
              { id: 'low', label: 'Low', count: lowImpactAchievements.length }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedCategory(option.id as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedCategory === option.id
                    ? 'bg-card text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {option.label}
                <span className="ml-1 text-xs bg-muted-foreground/20 text-muted-foreground px-1.5 py-0.5 rounded-full">
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Impact Consistency Score */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h5 className="font-semibold text-green-900 dark:text-green-100">Impact Consistency</h5>
              <p className="text-sm text-green-700 dark:text-green-300">
                {Math.round(impactConsistency)}% of your entries include measurable impact
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{Math.round(impactConsistency)}%</div>
            <div className="text-sm text-green-600 dark:text-green-400">
              {impactConsistency >= 70 ? 'Excellent' : impactConsistency >= 50 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements List */}
      {filteredAchievements.length > 0 ? (
        <div className="space-y-4">
          {filteredAchievements.map((achievement) => {
            const categoryConfig = getCategoryConfig(achievement.category);
            const CategoryIcon = categoryConfig.icon;
            const isExpanded = expandedAchievement === achievement.entry.id;

            return (
              <div
                key={achievement.entry.id}
                className={`card rounded-lg border-2 transition-all duration-200 hover:shadow-medium cursor-pointer ${
                  isExpanded ? categoryConfig.border + ' shadow-medium' : 'border-border'
                }`}
                onClick={() => setExpandedAchievement(isExpanded ? null : achievement.entry.id)}
              >
                <div className="p-5">
                  {/* Achievement Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${categoryConfig.bg} flex-shrink-0`}>
                        <CategoryIcon className={`w-5 h-5 ${categoryConfig.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryConfig.bg} ${categoryConfig.color}`}>
                            {categoryConfig.label}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(achievement.entry.date)}
                          </span>
                        </div>
                        <h5 className="font-semibold text-foreground mb-2">
                          {achievement.entry.description}
                        </h5>
                        {achievement.entry.impact && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {achievement.entry.impact}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-2xl font-bold text-foreground">{achievement.impactScore}</div>
                      <div className="text-xs text-muted-foreground">Impact Score</div>
                    </div>
                  </div>

                  {/* Quantifiable Metrics */}
                  {achievement.hasQuantifiableResults && (
                    <div className="mb-4">
                      <h6 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Quantifiable Results
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        {[...achievement.metrics.percentages, ...achievement.metrics.numbers, ...achievement.metrics.timeframes]
                          .slice(0, 6)
                          .map((metric, index) => {
                            const MetricIcon = getMetricIcon(metric);
                            return (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full border border-blue-200 dark:border-blue-800"
                              >
                                <MetricIcon className="w-3 h-3 mr-1" />
                                {metric}
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Skills and Tags */}
                  {(achievement.entry.skills.length > 0 || achievement.entry.tags.length > 0) && (
                    <div className="space-y-3">
                      {achievement.entry.skills.length > 0 && (
                        <div>
                          <h6 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Skills Used
                          </h6>
                          <div className="flex flex-wrap gap-1.5">
                            {achievement.entry.skills.slice(0, 5).map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center px-2.5 py-1 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full border border-purple-200 dark:border-purple-800"
                              >
                                {skill}
                              </span>
                            ))}
                            {achievement.entry.skills.length > 5 && (
                              <span className="text-xs text-muted-foreground">
                                +{achievement.entry.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {achievement.entry.tags.length > 0 && (
                        <div>
                          <h6 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Tags
                          </h6>
                          <div className="flex flex-wrap gap-1.5">
                            {achievement.entry.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2.5 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full border border-border"
                              >
                                <Hash className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expanded Details */}
                  {isExpanded && achievement.entry.project && (
                    <div className="border-t border-border pt-4 mt-4">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span className="font-medium">Project:</span>
                        <span>{achievement.entry.project}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Award className="w-8 h-8 text-muted-foreground" />
          </div>
          <h5 className="text-lg font-medium text-foreground mb-2">
            No {selectedCategory !== 'all' ? selectedCategory + ' impact' : ''} achievements found
          </h5>
          <p className="text-muted-foreground">
            Add impact statements to your entries to see them highlighted here.
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{highImpactAchievements.length}</div>
            <div className="text-sm text-muted-foreground">High Impact</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{mediumImpactAchievements.length}</div>
            <div className="text-sm text-muted-foreground">Medium Impact</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-muted-foreground">
              {achievements.filter(a => a.hasQuantifiableResults).length}
            </div>
            <div className="text-sm text-muted-foreground">With Metrics</div>
          </div>
        </div>
      </div>
    </div>
  );
}
