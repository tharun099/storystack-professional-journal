import React, { useState } from 'react';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  Clock, 
  Hash,
  Zap,
  Eye,
  Calendar
} from 'lucide-react';
import { SkillInsight, CareerEntry } from '../../types';

interface SkillsSpotlightProps {
  skills: SkillInsight[];
  recentHighlights: CareerEntry[];
}

export function SkillsSpotlight({ skills, recentHighlights }: SkillsSpotlightProps) {
  const [viewMode, setViewMode] = useState<'unique' | 'trending' | 'recent'>('unique');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const uniqueSkills = skills.filter(s => s.rarity === 'unique');
  const rareSkills = skills.filter(s => s.rarity === 'rare');
  const trendingSkills = skills.filter(s => s.trending);
  const recentSkills = skills.filter(s => s.recency > 70).slice(0, 8);

  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case 'unique':
        return {
          color: 'text-purple-700 dark:text-purple-300',
          bg: 'bg-purple-50 dark:bg-purple-950/30',
          border: 'border-purple-200 dark:border-purple-800',
          icon: Sparkles,
          label: 'Unique'
        };
      case 'rare':
        return {
          color: 'text-blue-700 dark:text-blue-300',
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          border: 'border-blue-200 dark:border-blue-800',
          icon: Star,
          label: 'Rare'
        };
      default:
        return {
          color: 'text-muted-foreground',
          bg: 'bg-muted',
          border: 'border-border',
          icon: Hash,
          label: 'Common'
        };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return { icon: TrendingUp, color: 'text-green-600 dark:text-green-400' };
      case 'decreasing': return { icon: TrendingDown, color: 'text-red-600 dark:text-red-400' };
      default: return { icon: Minus, color: 'text-muted-foreground' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const getSkillsToShow = () => {
    switch (viewMode) {
      case 'trending': return trendingSkills;
      case 'recent': return recentSkills;
      default: return uniqueSkills;
    }
  };

  const skillsToShow = getSkillsToShow();

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-foreground">Skills Spotlight</h4>
          <p className="text-sm text-muted-foreground">
            Discover your unique skills and technical strengths
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-lg p-1">
            {[
              { id: 'unique', label: 'Unique', count: uniqueSkills.length },
              { id: 'trending', label: 'Trending', count: trendingSkills.length },
              { id: 'recent', label: 'Recent', count: recentSkills.length }
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
                {option.count > 0 && (
                  <span className="ml-1 text-xs bg-muted-foreground/20 text-muted-foreground px-1.5 py-0.5 rounded-full">
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      {skillsToShow.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillsToShow.map((skill) => {
            const rarityConfig = getRarityConfig(skill.rarity);
            const trendConfig = getTrendIcon(skill.growthTrend);
            const RarityIcon = rarityConfig.icon;
            const TrendIcon = trendConfig.icon;
            const isExpanded = showDetails === skill.skill;

            return (
              <div
                key={skill.skill}
                className={`card rounded-lg border-2 transition-all duration-200 hover:shadow-medium cursor-pointer ${
                  isExpanded ? rarityConfig.border + ' shadow-medium' : 'border-border'
                }`}
                onClick={() => setShowDetails(isExpanded ? null : skill.skill)}
              >
                <div className="p-4">
                  {/* Skill Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-lg ${rarityConfig.bg}`}>
                        <RarityIcon className={`w-4 h-4 ${rarityConfig.color}`} />
                      </div>
                      <div>
                        <h5 className="font-semibold text-foreground">{skill.skill}</h5>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span className={`px-2 py-0.5 rounded-full ${rarityConfig.bg} ${rarityConfig.color} font-medium`}>
                            {rarityConfig.label}
                          </span>
                          {skill.trending && (
                            <span className="px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 font-medium">
                              Trending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <TrendIcon className={`w-4 h-4 ${trendConfig.color}`} />
                      <span className="text-xs text-muted-foreground">{skill.frequency}x</span>
                    </div>
                  </div>

                  {/* Skill Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{skill.recency}</div>
                      <div className="text-xs text-muted-foreground">Recency Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{skill.frequency}</div>
                      <div className="text-xs text-muted-foreground">Times Used</div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-border pt-3 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">First Used:</span>
                        <span className="font-medium text-foreground">{formatDate(skill.firstUsed)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Used:</span>
                        <span className="font-medium text-foreground">{formatDate(skill.lastUsed)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Related Entries:</span>
                        <span className="ml-2 font-medium text-foreground">{skill.relatedEntries.length}</span>
                      </div>
                    </div>
                  )}

                  {/* Click to expand hint */}
                  {!isExpanded && (
                    <div className="flex items-center justify-center pt-2 text-xs text-muted-foreground/60">
                      <Eye className="w-3 h-3 mr-1" />
                      Click for details
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
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <h5 className="text-lg font-medium text-foreground mb-2">
            {viewMode === 'unique' && 'No Unique Skills Found'}
            {viewMode === 'trending' && 'No Trending Skills Found'}
            {viewMode === 'recent' && 'No Recent Skills Found'}
          </h5>
          <p className="text-muted-foreground">
            {viewMode === 'unique' && 'Keep logging activities to identify your unique technical strengths.'}
            {viewMode === 'trending' && 'Consider learning trending technologies to stay current.'}
            {viewMode === 'recent' && 'Log recent activities to see your latest skill usage.'}
          </p>
        </div>
      )}

      {/* Recent Highlights Section */}
      {recentHighlights.length > 0 && viewMode === 'recent' && (
        <div className="border-t border-border pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
            <h5 className="font-semibold text-foreground">Recent Skill Highlights</h5>
          </div>

          <div className="space-y-3">
            {recentHighlights.slice(0, 3).map((entry) => (
              <div key={entry.id} className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {entry.description}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(entry.date)}</span>
                      {entry.skills.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{entry.skills.slice(0, 3).join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{uniqueSkills.length}</div>
            <div className="text-sm text-muted-foreground">Unique Skills</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{rareSkills.length}</div>
            <div className="text-sm text-muted-foreground">Rare Skills</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{trendingSkills.length}</div>
            <div className="text-sm text-muted-foreground">Trending Skills</div>
          </div>
        </div>
      </div>
    </div>
  );
}
