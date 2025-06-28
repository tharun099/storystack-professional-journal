import React, { useState } from 'react';
import { 
  Briefcase, 
  Building, 
  Calendar, 
  MapPin, 
  Users, 
  Edit3, 
  Plus, 
  TrendingUp,
  Target,
  Award
} from 'lucide-react';
import { Position, CareerEntry } from '../../types';
import { LoadingButton } from '../ui/loading-button';

interface CurrentPositionCardProps {
  position: Position;
  onUpdate: (updates: Partial<Position>) => void;
  onAddNew: () => void;
  associatedLogsCount: number;
  completionScore: number;
  allEntries: CareerEntry[];
  positionHistory: Position[];
}

export function CurrentPositionCard({
  position,
  onUpdate,
  onAddNew,
  associatedLogsCount,
  completionScore,
  allEntries,
  positionHistory
}: CurrentPositionCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Auto-expand content based on available data to balance with CareerTimeline
  const shouldAutoExpand = positionHistory.length > 2 || associatedLogsCount > 5;
  const [showRecentActivities, setShowRecentActivities] = useState(shouldAutoExpand && associatedLogsCount > 0);
  const [showSkillsBreakdown, setShowSkillsBreakdown] = useState(shouldAutoExpand && position.skills.length > 3);
  const [showCareerProgress, setShowCareerProgress] = useState(shouldAutoExpand && positionHistory.length > 100);
  const [editData, setEditData] = useState({
    title: position.title,
    company: position.company,
    location: position.location || '',
    department: position.department || '',
    teamSize: position.teamSize || '',
    startDate: position.startDate
  });

  const calculateTenure = (startDate: string): string => {
    if (!startDate) return 'Duration not set';

    const start = new Date(startDate);
    const now = new Date();
    const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());

    if (months < 1) return 'Recently started';
    if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
  };

  // Helper functions for expandable content
  const getRecentActivities = () => {
    return allEntries
      .filter(entry => {
        // Get entries associated with current position or recent entries if no position assigned
        if (entry.associatedPosition) {
          return entry.associatedPosition === position.id;
        }
        // If no position assigned, check if entry date is after current position start date
        const entryDate = new Date(entry.date);
        const positionStartDate = new Date(position.startDate || '1900-01-01');
        return entryDate >= positionStartDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const calculateTotalExperience = () => {
    const allPositions = [position, ...positionHistory];
    let totalDays = 0;

    allPositions.forEach(pos => {
      if (pos.startDate) {
        const start = new Date(pos.startDate);
        const end = pos.endDate ? new Date(pos.endDate) : new Date();
        const diffTime = Math.abs(end.getTime() - start.getTime());
        totalDays += Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    });

    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);

    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years}y ${months}m`;
    }
  };

  const getUniqueCompanies = () => {
    const allPositions = [position, ...positionHistory];
    return [...new Set(allPositions.map(pos => pos.company).filter(Boolean))];
  };

  const getAllUniqueSkills = () => {
    const allPositions = [position, ...positionHistory];
    return [...new Set(allPositions.flatMap(pos => pos.skills))];
  };

  const handleSave = () => {
    onUpdate({
      title: editData.title,
      company: editData.company,
      location: editData.location || undefined,
      department: editData.department || undefined,
      teamSize: editData.teamSize ? parseInt(editData.teamSize.toString()) : undefined,
      startDate: editData.startDate
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: position.title,
      company: position.company,
      location: position.location || '',
      department: position.department || '',
      teamSize: position.teamSize?.toString() || '',
      startDate: position.startDate
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Edit Current Position</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="btn btn-ghost px-3 py-1.5 text-sm"
            >
              Cancel
            </button>
            <LoadingButton
              onClick={handleSave}
              isLoading={false}
              variant="primary"
              size="sm"
            >
              Save
            </LoadingButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Job Title *
            </label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Company *
            </label>
            <input
              type="text"
              value={editData.company}
              onChange={(e) => setEditData(prev => ({ ...prev, company: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              placeholder="e.g., TechCorp Inc"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={editData.startDate}
              onChange={(e) => setEditData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Location
            </label>
            <input
              type="text"
              value={editData.location}
              onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              placeholder="e.g., San Francisco, CA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Department
            </label>
            <input
              type="text"
              value={editData.department}
              onChange={(e) => setEditData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              placeholder="e.g., Engineering, Product"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Team Size
            </label>
            <input
              type="number"
              value={editData.teamSize}
              onChange={(e) => setEditData(prev => ({ ...prev, teamSize: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              placeholder="e.g., 5"
              min="1"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Current Position</h3>
            <p className="text-sm text-muted-foreground">Your active role</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            title="Edit position"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onAddNew}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            title="Add new position"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Position Details */}
      <div className="space-y-4 flex-1 flex flex-col">
        <div>
          <h4 className="text-xl font-semibold text-foreground">{position.title || 'Job Title Not Set'}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <Building className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{position.company || 'Company Not Set'}</span>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Tenure</p>
              <p className="text-sm font-medium text-foreground">{calculateTenure(position.startDate)}</p>
            </div>
          </div>

          {position.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium text-foreground">{position.location}</p>
              </div>
            </div>
          )}

          {position.teamSize && (
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Team Size</p>
                <p className="text-sm font-medium text-foreground">{position.teamSize} people</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Profile Score</p>
              <p className="text-sm font-medium text-foreground">{completionScore}%</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-semibold text-foreground">{associatedLogsCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Activities</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-lg font-semibold text-foreground">{position.skills.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Skills Used</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-lg font-semibold text-foreground">{position.achievements.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Achievements</p>
          </div>
        </div>

        {/* Expandable Content Sections */}
        <div className="space-y-4 pt-4 border-t border-border flex-1">
          {/* Recent Activities Toggle */}
          {associatedLogsCount > 0 && (
            <div>
              <button
                onClick={() => setShowRecentActivities(!showRecentActivities)}
                className="flex items-center justify-between w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-foreground">Recent Activities</span>
                  <span className="text-xs text-muted-foreground">({Math.min(associatedLogsCount, 5)} latest)</span>
                </div>
                <div className={`transition-transform duration-200 ${showRecentActivities ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {showRecentActivities && (
                <div className="ml-6 space-y-2">
                  {getRecentActivities().map((entry) => (
                    <div key={entry.id} className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                      <div className="font-medium text-foreground">{entry.description}</div>
                      {entry.impact && (
                        <div className="text-xs text-muted-foreground mt-1">{entry.impact}</div>
                      )}
                      <div className="text-xs text-muted-foreground/70 mt-1">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skills Breakdown Toggle */}
          {position.skills.length > 0 && (
            <div>
              <button
                onClick={() => setShowSkillsBreakdown(!showSkillsBreakdown)}
                className="flex items-center justify-between w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-foreground">Skills & Technologies</span>
                  <span className="text-xs text-muted-foreground">({position.skills.length} total)</span>
                </div>
                <div className={`transition-transform duration-200 ${showSkillsBreakdown ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {showSkillsBreakdown && (
                <div className="ml-6">
                  <div className="flex flex-wrap gap-2">
                    {position.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Career Progress Toggle */}
          {positionHistory.length > 0 && (
            <div>
              <button
                onClick={() => setShowCareerProgress(!showCareerProgress)}
                className="flex items-center justify-between w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-foreground">Career Progress</span>
                  <span className="text-xs text-muted-foreground">({positionHistory.length + 1} positions)</span>
                </div>
                <div className={`transition-transform duration-200 ${showCareerProgress ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {showCareerProgress && (
                <div className="ml-6 space-y-3">
                  <div className="text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">Total Experience</span>
                      <span className="text-muted-foreground">{calculateTotalExperience()}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">Companies Worked</span>
                      <span className="text-muted-foreground">{getUniqueCompanies().length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Total Skills Acquired</span>
                      <span className="text-muted-foreground">{getAllUniqueSkills().length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Smart Suggestions - Show when there's space and limited content */}
          {(!shouldAutoExpand || (associatedLogsCount === 0 && position.skills.length === 0)) && (
            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h5 className="text-sm font-medium text-primary mb-2">💡 Boost Your Profile</h5>
              <div className="space-y-2 text-sm text-foreground">
                {associatedLogsCount === 0 && (
                  <p>• Start logging your daily activities to track achievements</p>
                )}
                {position.skills.length === 0 && (
                  <p>• Add skills and technologies you use in your current role</p>
                )}
                {!position.description && (
                  <p>• Add a role description to showcase your responsibilities</p>
                )}
                {positionHistory.length === 0 && (
                  <p>• Add your previous positions to build your career timeline</p>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions - Always show at bottom */}
          <div className="mt-auto pt-4">
            <div className="flex flex-wrap gap-2">
              {/* <button
                onClick={() => {}}
                className="btn btn-primary flex-1 min-w-0 px-3 py-2 text-xs font-medium"
              >
                + Log Activity
              </button> */}
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary flex-1 min-w-0 px-3 py-2 text-xs font-medium"
              >
                Edit Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
