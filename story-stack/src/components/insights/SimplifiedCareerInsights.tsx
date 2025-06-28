import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Lightbulb,
  Award,
  FileText,
  Users,
  ChevronDown,
  ChevronRight,
  Zap,
  BarChart3
} from 'lucide-react';
import { CareerEntry, SimplifiedInsights } from '../../types';
import { CareerAnalytics } from '../../utils/careerAnalytics';

interface SimplifiedCareerInsightsProps {
  entries: CareerEntry[];
  isVisible: boolean;
  onToggle: () => void;
}

export function SimplifiedCareerInsights({ entries, isVisible, onToggle }: SimplifiedCareerInsightsProps) {
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Generate simplified insights with memoization
  const insights = useMemo(() => {
    if (entries.length === 0) return null;
    
    setIsAnalyzing(true);
    const result = CareerAnalytics.generateSimplifiedInsights(entries);
    setTimeout(() => setIsAnalyzing(false), 300);
    return result;
  }, [entries]);

  if (entries.length === 0) {
    return null;
  }

  const getMomentumConfig = (momentum: string) => {
    switch (momentum) {
      case 'growing':
        return {
          icon: TrendingUp,
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-950/30',
          label: 'Growing',
          description: 'Great momentum! Keep it up.'
        };
      case 'needs-attention':
        return {
          icon: AlertTriangle,
          color: 'text-orange-600 dark:text-orange-400',
          bg: 'bg-orange-50 dark:bg-orange-950/30',
          label: 'Needs Attention',
          description: 'Time to boost your activity.'
        };
      default:
        return {
          icon: BarChart3,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          label: 'Steady',
          description: 'Consistent progress.'
        };
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'impact': return Target;
      case 'skill': return Award;
      case 'documentation': return FileText;
      case 'networking': return Users;
      default: return Lightbulb;
    }
  };

  const momentumConfig = insights ? getMomentumConfig(insights.momentum) : getMomentumConfig('steady');

  return (
    <div className="card-elevated mb-6 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-accent transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-lg ${momentumConfig.bg}`}>
            <momentumConfig.icon className={`w-5 h-5 ${momentumConfig.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <span>Career Insights</span>
              {isAnalyzing && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {insights ? (
                <>
                  {insights.entriesThisMonth} entries this month • 
                  {insights.uniqueSkillsCount} skills • 
                  <span className={`font-medium ${momentumConfig.color}`}>
                    {momentumConfig.label}
                  </span>
                </>
              ) : (
                'Analyzing your career data...'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Quick Stats */}
          {insights && (
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-primary">{insights.totalEntries}</div>
                <div className="text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600 dark:text-green-400">{insights.priorityActions.filter(a => a.priority === 'high').length}</div>
                <div className="text-muted-foreground">Priority</div>
              </div>
            </div>
          )}

          <div className={`transition-transform duration-200 ${isVisible ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Content */}
      {isVisible && insights && (
        <div className="border-t border-border">
          <div className="p-6 space-y-6">
            {/* Key Highlights */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Key Highlights</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top Skills */}
                <div className="card rounded-lg border border-border p-4">
                  <h5 className="font-medium text-foreground mb-3 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Top Skills</span>
                  </h5>
                  {insights.topSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {insights.topSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full border border-blue-200 dark:border-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Start logging activities to identify your key skills</p>
                  )}
                </div>

                {/* Recent Wins */}
                <div className="card rounded-lg border border-border p-4">
                  <h5 className="font-medium text-foreground mb-3 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>Recent Wins</span>
                  </h5>
                  {insights.recentWins.length > 0 ? (
                    <div className="space-y-2">
                      {insights.recentWins.map((win, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {win}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Add impact statements to highlight your achievements</p>
                  )}
                </div>
              </div>
            </div>

            {/* Next Steps */}
            {insights.priorityActions.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  <span>Next Steps</span>
                </h4>
                
                <div className="space-y-3">
                  {insights.priorityActions.map((action) => {
                    const ActionIcon = getActionIcon(action.type);
                    const isExpanded = expandedAction === action.id;
                    const isHighPriority = action.priority === 'high';

                    return (
                      <div
                        key={action.id}
                        className={`card rounded-lg border-2 transition-all duration-200 ${
                          isHighPriority 
                            ? 'border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-950/20' 
                            : 'border-border hover:border-border/60'
                        }`}
                      >
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => setExpandedAction(isExpanded ? null : action.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${
                                isHighPriority 
                                  ? 'bg-orange-100 dark:bg-orange-950/30' 
                                  : 'bg-blue-50 dark:bg-blue-950/30'
                              }`}>
                                <ActionIcon className={`w-4 h-4 ${
                                  isHighPriority 
                                    ? 'text-orange-600 dark:text-orange-400' 
                                    : 'text-blue-600 dark:text-blue-400'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h5 className="font-medium text-foreground">{action.title}</h5>
                                  {isHighPriority && (
                                    <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
                                      Priority
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{action.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{action.estimatedTime}</span>
                              </div>
                              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`} />
                            </div>
                          </div>
                        </div>
                        
                        {isExpanded && action.relatedEntries && (
                          <div className="border-t border-border px-4 py-3 bg-muted/20">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                              Related Entries ({action.relatedEntries.length})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Click on timeline entries to review and update them.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Momentum Summary */}
            <div className={`rounded-lg p-4 ${momentumConfig.bg} border border-opacity-20`}>
              <div className="flex items-center space-x-3">
                <momentumConfig.icon className={`w-5 h-5 ${momentumConfig.color}`} />
                <div>
                  <h5 className={`font-medium ${momentumConfig.color}`}>
                    Career Momentum: {momentumConfig.label}
                  </h5>
                  <p className={`text-sm ${momentumConfig.color} opacity-80`}>
                    {momentumConfig.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isVisible && !insights && (
        <div className="border-t border-border p-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <h4 className="text-lg font-medium text-foreground mb-2">Analyzing Your Career Data</h4>
            <p className="text-muted-foreground">
              Identifying key insights and actionable recommendations...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
