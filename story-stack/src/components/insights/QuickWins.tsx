import React, { useState } from 'react';
import { 
  Lightbulb, 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  CheckCircle,
  ArrowRight,
  Zap,
  FileText,
  Award,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { QuickWin, CareerEntry } from '../../types';

interface QuickWinsProps {
  quickWins: QuickWin[];
  entries: CareerEntry[];
}

export function QuickWins({ quickWins, entries }: QuickWinsProps) {
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [completedWins, setCompletedWins] = useState<Set<string>>(new Set());

  const highPriorityWins = quickWins.filter(w => w.priority === 'high');
  const mediumPriorityWins = quickWins.filter(w => w.priority === 'medium');
  const lowPriorityWins = quickWins.filter(w => w.priority === 'low');

  const getFilteredWins = () => {
    switch (selectedPriority) {
      case 'high': return highPriorityWins;
      case 'medium': return mediumPriorityWins;
      case 'low': return lowPriorityWins;
      default: return quickWins;
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          color: 'text-red-700 dark:text-red-300',
          bg: 'bg-red-50 dark:bg-red-950/30',
          border: 'border-red-200 dark:border-red-800',
          icon: AlertTriangle,
          label: 'High Priority',
          urgency: 'Urgent'
        };
      case 'medium':
        return {
          color: 'text-yellow-700 dark:text-yellow-300',
          bg: 'bg-yellow-50 dark:bg-yellow-950/30',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: Target,
          label: 'Medium Priority',
          urgency: 'Important'
        };
      default:
        return {
          color: 'text-blue-700 dark:text-blue-300',
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          border: 'border-blue-200 dark:border-blue-800',
          icon: Lightbulb,
          label: 'Low Priority',
          urgency: 'Consider'
        };
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'underutilized_skill':
        return {
          icon: Award,
          label: 'Skill Showcase',
          description: 'Highlight unique skills more prominently'
        };
      case 'missing_documentation':
        return {
          icon: FileText,
          label: 'Documentation Gap',
          description: 'Add missing impact statements'
        };
      case 'skill_gap':
        return {
          icon: BookOpen,
          label: 'Learning Opportunity',
          description: 'Consider trending skills'
        };
      case 'impact_opportunity':
        return {
          icon: TrendingUp,
          label: 'Impact Enhancement',
          description: 'Boost measurable outcomes'
        };
      default:
        return {
          icon: Lightbulb,
          label: 'General Improvement',
          description: 'Career enhancement opportunity'
        };
    }
  };

  const handleMarkComplete = (winTitle: string) => {
    const newCompleted = new Set(completedWins);
    if (completedWins.has(winTitle)) {
      newCompleted.delete(winTitle);
    } else {
      newCompleted.add(winTitle);
    }
    setCompletedWins(newCompleted);
  };

  const filteredWins = getFilteredWins();
  const actionableWins = filteredWins.filter(w => w.actionable);

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-foreground">Quick Wins & Opportunities</h4>
          <p className="text-sm text-muted-foreground">
            Actionable recommendations to enhance your career profile
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-lg p-1">
            {[
              { id: 'all', label: 'All', count: quickWins.length },
              { id: 'high', label: 'High', count: highPriorityWins.length },
              { id: 'medium', label: 'Medium', count: mediumPriorityWins.length },
              { id: 'low', label: 'Low', count: lowPriorityWins.length }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedPriority(option.id as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedPriority === option.id
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{highPriorityWins.length}</div>
              <div className="text-sm text-red-700 dark:text-red-300">High Priority</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{actionableWins.length}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Actionable Items</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completedWins.size}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Wins List */}
      {filteredWins.length > 0 ? (
        <div className="space-y-4">
          {filteredWins.map((win, index) => {
            const priorityConfig = getPriorityConfig(win.priority);
            const typeConfig = getTypeConfig(win.type);
            const PriorityIcon = priorityConfig.icon;
            const TypeIcon = typeConfig.icon;
            const isCompleted = completedWins.has(win.title);

            return (
              <div
                key={index}
                className={`card rounded-lg border-2 transition-all duration-200 ${
                  isCompleted
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
                    : priorityConfig.border
                } ${isCompleted ? 'opacity-75' : 'hover:shadow-medium'}`}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100 dark:bg-green-950/30' : priorityConfig.bg} flex-shrink-0`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <PriorityIcon className={`w-5 h-5 ${priorityConfig.color}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isCompleted
                              ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                              : `${priorityConfig.bg} ${priorityConfig.color}`
                          }`}>
                            {isCompleted ? 'Completed' : priorityConfig.urgency}
                          </span>
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                            {typeConfig.label}
                          </span>
                        </div>
                        <h5 className={`font-semibold mb-2 ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {win.title}
                        </h5>
                        <p className={`text-sm leading-relaxed ${isCompleted ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                          {win.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMarkComplete(win.title)}
                      className={`ml-4 p-2 rounded-lg transition-colors ${
                        isCompleted
                          ? 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-950/50'
                          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Suggested Action */}
                  {win.suggestedAction && !isCompleted && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h6 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Suggested Action</h6>
                          <p className="text-sm text-blue-800 dark:text-blue-200">{win.suggestedAction}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Related Entries */}
                  {win.relatedEntries && win.relatedEntries.length > 0 && !isCompleted && (
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          Related Entries ({win.relatedEntries.length})
                        </span>
                        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center space-x-1">
                          <span>View entries</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {win.actionable && !isCompleted && (
                    <div className="flex justify-end pt-4">
                      <button className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${priorityConfig.bg} ${priorityConfig.color} hover:opacity-80`}>
                        <span>Take Action</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
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
            <Lightbulb className="w-8 h-8 text-muted-foreground" />
          </div>
          <h5 className="text-lg font-medium text-foreground mb-2">
            No {selectedPriority !== 'all' ? selectedPriority + ' priority' : ''} opportunities found
          </h5>
          <p className="text-muted-foreground">
            Great job! Your career profile is well-optimized.
          </p>
        </div>
      )}

      {/* Progress Summary */}
      {quickWins.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h6 className="font-semibold text-foreground">Progress Summary</h6>
            <span className="text-sm text-muted-foreground">
              {completedWins.size} of {quickWins.length} completed
            </span>
          </div>

          <div className="w-full bg-muted rounded-full h-2 mb-3">
            <div
              className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedWins.size / quickWins.length) * 100}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-bold text-red-600 dark:text-red-400">{highPriorityWins.length}</div>
              <div className="text-muted-foreground">High Priority</div>
            </div>
            <div>
              <div className="font-bold text-yellow-600 dark:text-yellow-400">{mediumPriorityWins.length}</div>
              <div className="text-muted-foreground">Medium Priority</div>
            </div>
            <div>
              <div className="font-bold text-green-600 dark:text-green-400">{completedWins.size}</div>
              <div className="text-muted-foreground">Completed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
