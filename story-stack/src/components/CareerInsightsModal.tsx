import React, { useState, useMemo } from 'react';
import {
  X,
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
  Zap,
  BarChart3,
  Sparkles,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { CareerEntry, SimplifiedInsights } from '../types';
import { CareerAnalytics } from '../utils/careerAnalytics';
import { useModalScrollLock } from '../hooks/useScrollPosition';
import { SkillsSpotlight } from './insights/SkillsSpotlight';
import { AchievementsDashboard } from './insights/AchievementsDashboard';
import { CareerTrends } from './insights/CareerTrends';
import { QuickWins } from './insights/QuickWins';

interface CareerInsightsModalProps {
  entries: CareerEntry[];
  onClose: () => void;
}

export function CareerInsightsModal({ entries, onClose }: CareerInsightsModalProps) {
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'simplified' | 'detailed'>('simplified');
  const [activeDetailTab, setActiveDetailTab] = useState<'skills' | 'achievements' | 'trends' | 'quickwins'>('skills');

  useModalScrollLock();

  // Handle click outside modal to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key to close
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Generate simplified insights with memoization
  const simplifiedInsights = useMemo(() => {
    if (entries.length === 0) return null;

    setIsAnalyzing(true);
    const result = CareerAnalytics.generateSimplifiedInsights(entries);
    setTimeout(() => setIsAnalyzing(false), 500);
    return result;
  }, [entries]);

  // Generate detailed insights with memoization
  const detailedInsights = useMemo(() => {
    if (entries.length === 0) return null;

    return CareerAnalytics.generateInsights(entries);
  }, [entries]);

  const insights = viewMode === 'simplified' ? simplifiedInsights : detailedInsights;



  const getMomentumConfig = (momentum: string) => {
    switch (momentum) {
      case 'growing':
        return {
          icon: TrendingUp,
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-950/30',
          label: 'Growing Strong',
          description: 'Your career momentum is accelerating! Keep up the excellent work.',
          advice: 'Continue documenting your achievements and consider taking on more challenging projects.'
        };
      case 'needs-attention':
        return {
          icon: AlertTriangle,
          color: 'text-orange-600 dark:text-orange-400',
          bg: 'bg-orange-50 dark:bg-orange-950/30',
          label: 'Needs Attention',
          description: 'Your career activity could use a boost.',
          advice: 'Focus on logging recent activities and adding impact statements to existing entries.'
        };
      default:
        return {
          icon: BarChart3,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          label: 'Steady Progress',
          description: 'You\'re maintaining consistent career development.',
          advice: 'Look for opportunities to accelerate growth and document more achievements.'
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
    <div
      className="modal-container bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card rounded-t-xl border-b border-border p-6 z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${momentumConfig.bg}`}>
              <momentumConfig.icon className={`w-6 h-6 ${momentumConfig.color}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2">
                <span>Career Insights</span>
                {isAnalyzing && (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                )}
              </h2>
              <p className="text-muted-foreground">
                {viewMode === 'simplified' && simplifiedInsights ? (
                  `${simplifiedInsights.totalEntries} total entries • ${simplifiedInsights.entriesThisMonth} this month • ${simplifiedInsights.uniqueSkillsCount} unique skills`
                ) : viewMode === 'detailed' && detailedInsights ? (
                  `${detailedInsights.uniqueSkills.length} unique skills • ${detailedInsights.keyAchievements.length} achievements • ${detailedInsights.careerTrends.length} trends`
                ) : (
                  'Analyzing your career data...'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode('simplified')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  viewMode === 'simplified'
                    ? 'bg-card text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Simplified
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  viewMode === 'detailed'
                    ? 'bg-card text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Detailed
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {viewMode === 'simplified' ? (
            // Simplified View
            simplifiedInsights ? (
              <div className="p-6 space-y-8">
                {/* Career Momentum Overview */}
                <div className={`rounded-xl p-6 ${momentumConfig.bg} border border-opacity-20`}>
                  <div className="flex items-start space-x-4">
                    <momentumConfig.icon className={`w-8 h-8 ${momentumConfig.color} mt-1`} />
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${momentumConfig.color} mb-2`}>
                        {momentumConfig.label}
                      </h3>
                      <p className={`text-base ${momentumConfig.color} opacity-90 mb-3`}>
                        {momentumConfig.description}
                      </p>
                      <p className={`text-sm ${momentumConfig.color} opacity-75`}>
                        💡 {momentumConfig.advice}
                      </p>
                    </div>
                  </div>
                </div>

              {/* Key Highlights Grid */}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                  <span>Key Highlights</span>
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Skills */}
                  <div className="card-elevated rounded-xl p-6">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center space-x-2">
                      <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span>Your Top Skills</span>
                    </h4>
                    {simplifiedInsights.topSkills.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {simplifiedInsights.topSkills.map((skill, index) => (
                            <span
                              key={skill}
                              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all hover:scale-105 ${
                                index === 0
                                  ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
                                  : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              }`}
                            >
                              {index === 0 && '⭐ '}{skill}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          These are your most frequently used skills based on your activity logs.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Award className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">Start logging activities to identify your key skills</p>
                      </div>
                    )}
                  </div>

                  {/* Recent Wins */}
                  <div className="card-elevated rounded-xl p-6">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span>Recent Achievements</span>
                    </h4>
                    {simplifiedInsights.recentWins.length > 0 ? (
                      <div className="space-y-3">
                        {simplifiedInsights.recentWins.map((win, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">{win}</p>
                          </div>
                        ))}
                        <p className="text-sm text-muted-foreground">
                          Your recent activities with measurable impact.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">Add impact statements to highlight your achievements</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

                {/* Priority Actions */}
                {simplifiedInsights.priorityActions.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center space-x-2">
                    <Target className="w-6 h-6 text-orange-500" />
                    <span>Recommended Actions</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {simplifiedInsights.priorityActions.map((action, index) => {
                      const ActionIcon = getActionIcon(action.type);
                      const isExpanded = expandedAction === action.id;
                      const isHighPriority = action.priority === 'high';

                      return (
                        <div
                          key={action.id}
                          className={`card-elevated rounded-xl border-2 transition-all duration-200 ${
                            isHighPriority 
                              ? 'border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-950/20' 
                              : 'border-border hover:border-border/60'
                          }`}
                        >
                          <div
                            className="p-6 cursor-pointer"
                            onClick={() => setExpandedAction(isExpanded ? null : action.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-xl ${
                                  isHighPriority 
                                    ? 'bg-orange-100 dark:bg-orange-950/30' 
                                    : 'bg-blue-50 dark:bg-blue-950/30'
                                }`}>
                                  <ActionIcon className={`w-5 h-5 ${
                                    isHighPriority 
                                      ? 'text-orange-600 dark:text-orange-400' 
                                      : 'text-blue-600 dark:text-blue-400'
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="font-semibold text-foreground">{action.title}</h4>
                                    {isHighPriority && (
                                      <span className="px-3 py-1 bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
                                        High Priority
                                      </span>
                                    )}
                                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                      <Clock className="w-4 h-4" />
                                      <span>{action.estimatedTime}</span>
                                    </div>
                                  </div>
                                  <p className="text-muted-foreground">{action.description}</p>
                                </div>
                              </div>
                              <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`} />
                            </div>
                          </div>
                          
                          {isExpanded && action.relatedEntries && (
                            <div className="border-t border-border px-6 py-4 bg-muted/20">
                              <p className="text-sm font-medium text-muted-foreground mb-2">
                                💡 Related Entries ({action.relatedEntries.length})
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Review and update these timeline entries to complete this action.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

                {/* Quick Stats Summary */}
                <div className="bg-muted/30 rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{simplifiedInsights.totalEntries}</div>
                      <div className="text-sm text-muted-foreground">Total Entries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{simplifiedInsights.entriesThisMonth}</div>
                      <div className="text-sm text-muted-foreground">This Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{simplifiedInsights.uniqueSkillsCount}</div>
                      <div className="text-sm text-muted-foreground">Unique Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {simplifiedInsights.priorityActions.filter(a => a.priority === 'high').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Priority Actions</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Analyzing Your Career Data</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We're processing your timeline entries to generate personalized insights and actionable recommendations...
                </p>
              </div>
            )
          ) : (
            // Detailed View
            detailedInsights ? (
              <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-border">
                  <div className="flex space-x-1">
                    {[
                      { id: 'skills' as const, label: 'Unique Skills', icon: Sparkles, count: detailedInsights.uniqueSkills.filter(s => s.rarity === 'unique').length },
                      { id: 'achievements' as const, label: 'Key Achievements', icon: Award, count: detailedInsights.keyAchievements.filter(a => a.category === 'high').length },
                      { id: 'trends' as const, label: 'Career Trends', icon: TrendingUp, count: detailedInsights.careerTrends.filter(t => t.momentum === 'high').length },
                      { id: 'quickwins' as const, label: 'Quick Wins', icon: Lightbulb, count: detailedInsights.quickWins.filter(q => q.priority === 'high').length }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeDetailTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveDetailTab(tab.id)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? 'bg-card text-foreground shadow-soft'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                          {tab.count > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                              {tab.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeDetailTab === 'skills' && (
                    <SkillsSpotlight
                      skills={detailedInsights.uniqueSkills}
                      recentHighlights={detailedInsights.recentHighlights}
                    />
                  )}

                  {activeDetailTab === 'achievements' && (
                    <AchievementsDashboard
                      achievements={detailedInsights.keyAchievements}
                      impactConsistency={detailedInsights.impactConsistency}
                    />
                  )}

                  {activeDetailTab === 'trends' && (
                    <CareerTrends
                      trends={detailedInsights.careerTrends}
                      overallMomentum={detailedInsights.overallMomentum}
                      skillDiversityScore={detailedInsights.skillDiversityScore}
                    />
                  )}

                  {activeDetailTab === 'quickwins' && (
                    <QuickWins
                      quickWins={detailedInsights.quickWins}
                      entries={entries}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Analyzing Your Career Data</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We're processing your timeline entries to generate detailed insights and analytics...
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
