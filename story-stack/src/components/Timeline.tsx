import React, { useState, useMemo } from 'react';
import { Calendar, Target, Hash, Trash, Edit3, ChevronLeft, ChevronRight, Download, Award, Lightbulb, Rocket, Users, BookOpen, Handshake } from 'lucide-react';
import { CareerEntry } from '../types';


interface TimelineProps {
  entries: CareerEntry[];
  selectedEntries: string[];
  onSelectEntry: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onEditEntry?: (entry: CareerEntry) => void;
  onExportEntries?: (entries: CareerEntry[]) => void;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  entriesPerPage: number;
  totalEntries: number;
}

const categoryStyles = {
  achievement: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  skill: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  project: 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  leadership: 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  learning: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  networking: 'bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800'
};

const categoryIcons = {
  achievement: Award,
  skill: Lightbulb,
  project: Rocket,
  leadership: Users,
  learning: BookOpen,
  networking: Handshake
};

// Pagination component
function Pagination({ currentPage, totalPages, onPageChange, entriesPerPage, totalEntries }: PaginationProps) {
  const startEntry = (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalEntries);

  if (totalPages <= 1) return null;

  return (
    <div className="card flex items-center justify-between px-4 py-3">
      <div className="flex items-center text-sm text-muted-foreground">
        <span>
          Showing <span className="font-medium text-foreground">{startEntry}</span> to{' '}
          <span className="font-medium text-foreground">{endEntry}</span> of{' '}
          <span className="font-medium text-foreground">{totalEntries}</span> entries
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-ghost px-3 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum;
            if (totalPages <= 7) {
              pageNum = i + 1;
            } else if (currentPage <= 4) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 3) {
              pageNum = totalPages - 6 + i;
            } else {
              pageNum = currentPage - 3 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`relative inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md transition-colors ${
                  currentPage === pageNum
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'text-muted-foreground bg-background border-border hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn btn-ghost px-3 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export const Timeline = React.memo(function Timeline({ entries, selectedEntries, onSelectEntry, onDeleteEntry, onEditEntry, onExportEntries }: TimelineProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(15);
  const [viewMode, setViewMode] = useState<'paginated' | 'infinite'>('paginated');
  const [isChangingPage, setIsChangingPage] = useState(false);


  // Calculate pagination
  const totalPages = Math.ceil(entries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = useMemo(() =>
    viewMode === 'paginated' ? entries.slice(startIndex, endIndex) : entries,
    [entries, startIndex, endIndex, viewMode]
  );

  // Reset to first page when entries change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [entries.length]);

  // Handle page change with loading state
  const handlePageChange = (page: number) => {
    setIsChangingPage(true);
    setCurrentPage(page);
    // Small delay to show loading state
    setTimeout(() => setIsChangingPage(false), 150);
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No entries yet</h3>
        <p className="text-muted-foreground">Start logging your career activities to build your professional timeline.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'today';
    if (diffDays === 2) return 'yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="space-y-6">
      {/* Timeline Controls */}
      <div className="card flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">View:</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'paginated' | 'infinite')}
              className="text-sm border border-border rounded-md px-2 py-1 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="paginated">Paginated</option>
              <option value="infinite">All Entries</option>
            </select>
          </div>

          {viewMode === 'paginated' && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-foreground">Per page:</label>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-sm border border-border rounded-md px-2 py-1 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {onExportEntries && (
            <button
              onClick={() => onExportEntries(entries)}
              className="btn btn-secondary px-3 py-2 text-sm font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </button>
          )}
        </div>
      </div>

      {/* Pagination - Top */}
      {viewMode === 'paginated' && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          entriesPerPage={entriesPerPage}
          totalEntries={entries.length}
        />
      )}

      {/* Timeline Entries */}
      <div className={`space-y-4 relative transition-all duration-300 ${isChangingPage ? 'opacity-50 pointer-events-none' : ''}`}>
        {isChangingPage && (
          <div className="absolute inset-0 bg-background/75 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading...</span>
            </div>
          </div>
        )}
        {currentEntries.map((entry, index) => {
        const isSelected = selectedEntries.includes(entry.id);
        const showDateDivider = index === 0 || currentEntries[index - 1].date !== entry.date;

        return (
          <div key={entry.id}>
            {showDateDivider && (
              <div className="flex items-center justify-center py-4">
                <div className="flex-1 h-px bg-border"></div>
                <div className="px-4 py-2 bg-card rounded-full border border-border text-sm font-medium text-muted-foreground shadow-soft">
                  {formatDate(entry.date)}
                </div>
                <div className="flex-1 h-px bg-border"></div>
              </div>
            )}

            <div className={`relative group timeline-card-selectable ${isSelected ? 'timeline-card-selected' : ''}`}>
              <div
                className={`card-elevated p-6 cursor-pointer select-none transition-all duration-200 ${
                  isSelected
                    ? 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                    : 'hover:border-border/60 hover:bg-accent/30'
                } group-hover:shadow-large focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
                onClick={() => onSelectEntry(entry.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectEntry(entry.id);
                  }
                }}
                title={isSelected ? 'Click to deselect' : 'Click to select'}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectEntry(entry.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-ring focus:ring-2 pointer-events-auto"
                    />
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${categoryStyles[entry.category]}`}>
                      {React.createElement(categoryIcons[entry.category], { className: "w-3 h-3 mr-1" })}
                      {entry.category}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {getTimeAgo(entry.date)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEditEntry && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEntry(entry);
                        }}
                        className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                        title="Edit entry"
                      >
                        <Edit3 size={16} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEntry(entry.id);
                      }}
                      className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                      title="Delete entry"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-foreground font-medium leading-relaxed mb-3">
                    {entry.description}
                  </p>
                  {entry.impact && (
                    <div className="mt-3 p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="p-1 bg-green-100 dark:bg-green-900 rounded-full">
                          <Target className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide mb-1">Impact</p>
                          <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed">
                            {entry.impact}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {entry.project && (
                  <div className="mb-4">
                    <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-muted/50 to-muted/30 text-muted-foreground text-sm rounded-lg border border-border">
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full mr-2"></div>
                      <span className="font-medium">{entry.project}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {entry.skills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center px-2.5 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors cursor-default"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.tags.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-1 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors cursor-default"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Hash size={10} className="mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -left-1 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-12 bg-primary rounded-r-full shadow-lg animate-pulse"></div>
                  </div>
                )}

                {/* Hover selection hint */}
                {!isSelected && (
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full border border-border/50 shadow-sm">
                      {/* <Square className="w-3 h-3" /> */}
                      <span>Click to select</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      </div>

      {/* Pagination - Bottom */}
      {viewMode === 'paginated' && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          entriesPerPage={entriesPerPage}
          totalEntries={entries.length}
        />
      )}
    </div>
  );
});