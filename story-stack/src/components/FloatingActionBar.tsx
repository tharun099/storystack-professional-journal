import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Square, 
  Download, 
  Trash2, 
  X, 
  ChevronUp,
  FileText,
  Sparkles
} from 'lucide-react';
import { useScrollPastElement } from '../hooks/useScrollPosition';

interface FloatingActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onExport: () => void;
  onDelete?: () => void;
  triggerElementId?: string;
  className?: string;
}

export function FloatingActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onExport,
  onDelete,
  triggerElementId = 'timeline-header',
  className = ''
}: FloatingActionBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const hasScrolledPast = useScrollPastElement(triggerElementId, 100);

  // Show/hide based on scroll position and selection state
  useEffect(() => {
    const shouldShow = hasScrolledPast && totalCount > 0;
    setIsVisible(shouldShow);
    
    // Auto-expand if items are selected
    if (selectedCount > 0 && shouldShow) {
      setIsExpanded(true);
    }
  }, [hasScrolledPast, totalCount, selectedCount]);

  // Auto-collapse when no items selected
  useEffect(() => {
    if (selectedCount === 0) {
      const timer = setTimeout(() => setIsExpanded(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedCount]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectToggle = () => {
    if (selectedCount === totalCount) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${className}`}>
      {/* Mobile: Bottom center, Desktop: Bottom right */}
      <div className="sm:relative sm:bottom-auto sm:right-auto fixed bottom-6 left-1/2 transform -translate-x-1/2 sm:transform-none sm:left-auto">
        
        {/* Compact floating button */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="group relative bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            title={selectedCount > 0 ? `${selectedCount} items selected` : 'Selection actions'}
          >
            <div className="flex items-center space-x-2">
              {selectedCount > 0 ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5" />
              )}
              
              {/* Selection count badge */}
              {selectedCount > 0 && (
                <span className="bg-primary-foreground text-primary text-xs font-bold px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                  {selectedCount}
                </span>
              )}
            </div>

            {/* Pulse animation for attention */}
            {selectedCount === 0 && (
              <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></div>
            )}
          </button>
        )}

        {/* Expanded action bar */}
        {isExpanded && (
          <div className="bg-card border border-border rounded-2xl shadow-xl p-4 min-w-[280px] sm:min-w-[320px] animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {selectedCount > 0 ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">
                    {selectedCount > 0 ? 'Items Selected' : 'Quick Actions'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedCount > 0 
                      ? `${selectedCount} of ${totalCount} selected`
                      : `${totalCount} items available`
                    }
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-accent rounded-lg transition-colors"
                title="Minimize"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              {/* Select/Deselect All */}
              <button
                onClick={handleSelectToggle}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
              >
                {selectedCount === totalCount ? (
                  <Square className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <CheckSquare className="w-4 h-4 text-primary" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
                </span>
              </button>

              {/* Export */}
              {selectedCount > 0 && (
                <button
                  onClick={onExport}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-foreground">
                    Export Selected ({selectedCount})
                  </span>
                </button>
              )}

              {/* Delete (if provided) */}
              {selectedCount > 0 && onDelete && (
                <button
                  onClick={onDelete}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-destructive/10 transition-colors text-left group"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    Delete Selected ({selectedCount})
                  </span>
                </button>
              )}

              {/* Scroll to top */}
              <button
                onClick={scrollToTop}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
              >
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Back to Top
                </span>
              </button>
            </div>

            {/* Quick tip */}
            {selectedCount === 0 && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Select timeline items to unlock bulk actions like export and organization.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
