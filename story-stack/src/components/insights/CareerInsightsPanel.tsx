import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Award, 
  Target, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  BarChart3,
  Zap
} from 'lucide-react';
import { CareerEntry, CareerInsights } from '../../types';
import { CareerAnalytics } from '../../utils/careerAnalytics';
import { SkillsSpotlight } from './SkillsSpotlight';
import { AchievementsDashboard } from './AchievementsDashboard';
import { CareerTrends } from './CareerTrends';
import { QuickWins } from './QuickWins';

interface CareerInsightsPanelProps {
  entries: CareerEntry[];
  isVisible: boolean;
  onToggle: () => void;
}

export function CareerInsightsPanel({ entries, isVisible, onToggle }: CareerInsightsPanelProps) {
  const [activeTab, setActiveTab] = useState<'skills' | 'achievements' | 'trends' | 'quickwins'>('skills');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Generate insights with memoization for performance
  const insights = useMemo(() => {
    if (entries.length === 0) return null;
    
    setIsAnalyzing(true);
    const result = CareerAnalytics.generateInsights(entries);
    setTimeout(() => setIsAnalyzing(false), 500); // Small delay for UX
    return result;
  }, [entries]);

  if (entries.length === 0) {
    return null;
  }

  const tabs = [
    {
      id: 'skills' as const,
      label: 'Unique Skills',
      icon: Sparkles,
      count: insights?.uniqueSkills.filter(s => s.rarity === 'unique').length || 0,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30'
    },
    {
      id: 'achievements' as const,
      label: 'Key Achievements',
      icon: Award,
      count: insights?.keyAchievements.filter(a => a.category === 'high').length || 0,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30'
    },
    {
      id: 'trends' as const,
      label: 'Career Trends',
      icon: TrendingUp,
      count: insights?.careerTrends.filter(t => t.momentum === 'high').length || 0,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      id: 'quickwins' as const,
      label: 'Quick Wins',
      icon: Lightbulb,
      count: insights?.quickWins.filter(q => q.priority === 'high').length || 0,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30'
    }
  ];

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'accelerating': return { icon: TrendingUp, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30' };
      case 'declining': return { icon: BarChart3, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' };
      default: return { icon: Target, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' };
    }
  };

  const momentumConfig = insights ? getMomentumIcon(insights.overallMomentum) : getMomentumIcon('steady');

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
                  {insights.uniqueSkills.filter(s => s.rarity === 'unique').length} unique skills •
                  {insights.keyAchievements.filter(a => a.category === 'high').length} high-impact achievements •
                  Momentum: <span className={`font-medium ${momentumConfig.color}`}>
                    {insights.overallMomentum}
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
                <div className="font-bold text-purple-600 dark:text-purple-400">{Math.round(insights.skillDiversityScore)}</div>
                <div className="text-muted-foreground">Skill Diversity</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600 dark:text-green-400">{Math.round(insights.impactConsistency)}%</div>
                <div className="text-muted-foreground">Impact Rate</div>
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
          {/* Tab Navigation */}
          <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-border">
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-card text-foreground shadow-soft border border-border'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-muted-foreground'}`} />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        isActive ? `${tab.bgColor} ${tab.color}` : 'bg-muted text-muted-foreground'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Recent Highlights Indicator */}
            {insights.recentHighlights.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                <span>{insights.recentHighlights.length} recent highlights</span>
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'skills' && (
              <SkillsSpotlight 
                skills={insights.uniqueSkills} 
                recentHighlights={insights.recentHighlights}
              />
            )}
            
            {activeTab === 'achievements' && (
              <AchievementsDashboard 
                achievements={insights.keyAchievements}
                impactConsistency={insights.impactConsistency}
              />
            )}
            
            {activeTab === 'trends' && (
              <CareerTrends 
                trends={insights.careerTrends}
                overallMomentum={insights.overallMomentum}
                skillDiversityScore={insights.skillDiversityScore}
              />
            )}
            
            {activeTab === 'quickwins' && (
              <QuickWins 
                quickWins={insights.quickWins}
                entries={entries}
              />
            )}
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
              Identifying unique skills, key achievements, and career patterns...
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {isVisible && insights && entries.length === 0 && (
        <div className="border-t border-border p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-medium text-foreground mb-2">No Data to Analyze</h4>
          <p className="text-muted-foreground">
            Start logging your career activities to see personalized insights and recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
