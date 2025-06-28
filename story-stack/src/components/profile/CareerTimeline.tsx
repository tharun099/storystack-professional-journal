import React, { useState } from 'react';
import {
  Briefcase,
  Building,
  Calendar,
  MapPin,
  TrendingUp,
  Award,
  ChevronRight,
  ChevronDown,
  Clock
} from 'lucide-react';
import { Position } from '../../types';

interface CareerTimelineProps {
  positions: Position[];
  currentPosition: Position;
  onPositionClick?: (position: Position) => void;
}

export function CareerTimeline({ positions, currentPosition, onPositionClick }: CareerTimelineProps) {
  // State for tracking expanded positions
  const [expandedPositions, setExpandedPositions] = useState<Set<string>>(new Set());
  const [showAllPositions, setShowAllPositions] = useState(false);

  // Combine current position with history and sort by date
  const allPositions = [currentPosition, ...positions].filter(pos => pos.title && pos.company);
  const sortedPositions = allPositions.sort((a, b) => {
    const dateA = new Date(a.startDate || '1900-01-01');
    const dateB = new Date(b.startDate || '1900-01-01');
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  // Limit positions shown initially (show first 2, then toggle to show all)
  const maxInitialPositions = 4;
  const displayedPositions = showAllPositions
    ? sortedPositions
    : sortedPositions.slice(0, maxInitialPositions);
  const hasMorePositions = sortedPositions.length > maxInitialPositions;

  // Toggle expansion state for a position
  const toggleExpansion = (positionId: string) => {
    setExpandedPositions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(positionId)) {
        newSet.delete(positionId);
      } else {
        newSet.add(positionId);
      }
      return newSet;
    });
  };

  const formatDuration = (startDate: string, endDate?: string): string => {
    if (!startDate) return 'Duration unknown';
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    if (months < 1) return 'Less than 1 month';
    if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    let duration = `${years} year${years > 1 ? 's' : ''}`;
    if (remainingMonths > 0) {
      duration += ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
    
    return duration;
  };

  const formatDateRange = (startDate: string, endDate?: string): string => {
    if (!startDate) return 'Date unknown';
    
    const start = new Date(startDate);
    const startFormatted = start.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    
    if (!endDate) return `${startFormatted} - Present`;
    
    const end = new Date(endDate);
    const endFormatted = end.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  if (sortedPositions.length === 0) {
    return (
      <div className="card-elevated p-6">
        <div className="text-center py-8">
          <Briefcase className="w-12 h-12 text-muted-foreground/60 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Career History</h3>
          <p className="text-muted-foreground">Complete your profile to see your career timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6 flex flex-col h-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
          <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Career Timeline</h3>
          <p className="text-sm text-muted-foreground">Your professional journey</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="space-y-4">
        {displayedPositions.map((position, index) => {
          const isExpanded = expandedPositions.has(position.id);

          return (
            <div key={position.id} className="relative">
              {/* Timeline Line */}
              {index < displayedPositions.length - 1 && (
                <div className={`absolute left-6 w-0.5 bg-border transition-all duration-200 ${
                  isExpanded ? 'top-16 h-20' : 'top-12 h-12'
                }`} />
              )}

              {/* Position Card */}
              <div
                className={`relative rounded-lg border transition-all duration-200 ${
                  position.isActive
                    ? 'bg-primary/10 border-primary/20 shadow-soft'
                    : 'bg-muted/30 border-border hover:bg-accent'
                }`}
              >
                {/* Compact Header - Always Visible */}
                <div
                  className="flex items-start space-x-4 p-4 cursor-pointer"
                  onClick={() => toggleExpansion(position.id)}
                >
                  {/* Timeline Dot */}
                  <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
                    position.isActive ? 'bg-primary' : 'bg-muted-foreground'
                  }`} />

                  {/* Compact Position Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-base font-semibold text-foreground truncate">
                            {position.title}
                          </h4>
                          {position.isActive && (
                            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full flex-shrink-0">
                              Current
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-1 sm:space-y-0 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Building className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{position.company}</span>
                          </div>

                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDuration(position.startDate, position.endDate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Expand/Collapse Button */}
                      <div className="flex items-center space-x-2 ml-4">
                        {/* {onPositionClick && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPositionClick(position);
                            }}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit position"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )} */}
                        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details - Conditionally Visible */}
                {isExpanded && (
                  <div className="px-4 pb-4 ml-7 border-t border-border pt-4 mt-2">
                    {/* Detailed Information */}
                    <div className="space-y-3">
                      {/* Full Date Range and Location */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateRange(position.startDate, position.endDate)}</span>
                        </div>

                        {position.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{position.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Department and Team Size */}
                      {(position.department || position.teamSize) && (
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {position.department && (
                            <div className="flex items-center space-x-1">
                              <Building className="w-4 h-4" />
                              <span>{position.department}</span>
                            </div>
                          )}

                          {position.teamSize && (
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>Team of {position.teamSize}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      {position.description && (
                        <div className="text-sm text-foreground">
                          <p>{position.description}</p>
                        </div>
                      )}

                      {/* Position Stats */}
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <TrendingUp className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          <span>{position.logs.length} activities</span>
                        </div>

                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Award className="w-4 h-4 text-green-500 dark:text-green-400" />
                          <span>{position.skills.length} skills</span>
                        </div>

                        {position.achievements.length > 0 && (
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Award className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                            <span>{position.achievements.length} achievements</span>
                          </div>
                        )}
                      </div>

                      {/* Achievements */}
                      {position.achievements.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-1">
                            <Award className="w-4 h-4" />
                            <span>Key Achievements</span>
                          </h5>
                          <ul className="space-y-1">
                            {position.achievements.map((achievement, achievementIndex) => (
                              <li key={achievementIndex} className="text-sm text-muted-foreground flex items-start space-x-2">
                                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Skills */}
                      {position.skills.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-foreground mb-2">Skills & Technologies</h5>
                          <div className="flex flex-wrap gap-1">
                            {position.skills.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>

        {/* Show More/Less Toggle */}
        {hasMorePositions && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAllPositions(!showAllPositions)}
              className="btn btn-ghost inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium"
            >
              <span>
                {showAllPositions
                  ? `Show Less (${maxInitialPositions} of ${sortedPositions.length})`
                  : `Show All Positions (${sortedPositions.length})`
                }
              </span>
              <div className={`transition-transform duration-200 ${showAllPositions ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-auto pt-6 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">{sortedPositions.length}</div>
              <div className="text-sm text-muted-foreground">Position{sortedPositions.length !== 1 ? 's' : ''}</div>
            </div>

            <div>
              <div className="text-2xl font-bold text-foreground">
                {sortedPositions.reduce((total, pos) => total + pos.logs.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Activities</div>
            </div>

            <div>
              <div className="text-2xl font-bold text-foreground">
                {[...new Set(sortedPositions.flatMap(pos => pos.skills))].length}
              </div>
              <div className="text-sm text-muted-foreground">Unique Skills</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
