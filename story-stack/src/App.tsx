import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { QuickEntry } from './components/QuickEntry';
import { Timeline } from './components/Timeline';
import { FilterPanel } from './components/FilterPanel';
import { ResumeGenerator } from './components/ResumeGenerator';
import { LinkedInOptimizer } from './components/LinkedInOptimizer';
import { Stats } from './components/Stats';
import { UserOnboarding } from './components/UserOnboarding';
import { CurrentPositionCard } from './components/profile/CurrentPositionCard';
import { CareerTimeline } from './components/profile/CareerTimeline';
import { NewPositionModal } from './components/profile/NewPositionModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { ExportModal } from './components/ExportModal';
import { EditEntryModal } from './components/EditEntryModal';
import { FloatingActionBar } from './components/FloatingActionBar';
import { CareerInsightsModal } from './components/CareerInsightsModal';
import { ThemeProvider } from './contexts/ThemeContext';
import { useCareerEntries } from './hooks/useCareerEntries';
import { useUserProfile } from './hooks/useUserProfile';
import { CareerEntry } from './types';

function App() {
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [showResumeGenerator, setShowResumeGenerator] = useState(false);
  const [showLinkedInOptimizer, setShowLinkedInOptimizer] = useState(false);
  const [showCareerInsights, setShowCareerInsights] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showNewPositionModal, setShowNewPositionModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CareerEntry | null>(null);

  const {
    entries,
    allEntries,
    filters,
    setFilters,
    selectedEntries,
    setSelectedEntries,
    addEntry,
    updateEntry,
    deleteEntry
  } = useCareerEntries();

  const {
    profile,
    isOnboarding,
    updateProfile,
    updateCurrentPosition,
    addNewPosition,
    completeOnboarding,
    getDynamicVariables,
    detectPositionChange,
    getProfileSuggestions,
    completionScore
  } = useUserProfile();

  const handleSelectEntry = (id: string) => {
    setSelectedEntries(prev =>
      prev.includes(id)
        ? prev.filter(entryId => entryId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEntries.length === entries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(entries.map(entry => entry.id));
    }
  };

  const handleEditEntry = (entry: CareerEntry) => {
    setEditingEntry(entry);
    setShowEditModal(true);
  };

  const handleUpdateEntry = (updates: Partial<CareerEntry>) => {
    if (editingEntry) {
      updateEntry(editingEntry.id, updates);
      setShowEditModal(false);
      setEditingEntry(null);
    }
  };

  // Enhanced add entry with position change detection and skill extraction
  const handleAddEntry = (entry: Parameters<typeof addEntry>[0]) => {
    const newEntry = addEntry(entry);

    // Check for position change indicators
    if (detectPositionChange(entry.description)) {
      // Could show a prompt here to update position
      console.log('Position change detected in entry:', entry.description);
    }

    // Update current position with new skills and achievements
    updateCurrentPositionData();

    return newEntry;
  };

  // Update current position skills and achievements based on associated entries
  const updateCurrentPositionData = () => {
    const relevantEntries = allEntries.filter(entry => {
      // Associate entries with current position if they don't have a position assigned
      // and fall within the current position's date range
      if (entry.associatedPosition) {
        return entry.associatedPosition === profile.currentPosition.id;
      }

      // If no position assigned, check if entry date is after current position start date
      const entryDate = new Date(entry.date);
      const positionStartDate = new Date(profile.currentPosition.startDate || '1900-01-01');
      return entryDate >= positionStartDate;
    });

    // Extract unique skills
    const allSkills = new Set<string>();
    relevantEntries.forEach(entry => {
      entry.skills.forEach(skill => allSkills.add(skill));
    });

    // Generate achievements from entries with impact
    const achievements = relevantEntries
      .filter(entry => entry.impact && entry.impact.trim().length > 0)
      .map(entry => {
        const description = entry.description;
        const impact = entry.impact;

        if (impact.toLowerCase().includes('increased') ||
            impact.toLowerCase().includes('improved') ||
            impact.toLowerCase().includes('reduced')) {
          return `${description} - ${impact}`;
        } else {
          return `${description}, resulting in ${impact}`;
        }
      })
      .slice(0, 10); // Limit to top 10 achievements

    // Update current position
    updateCurrentPosition({
      skills: Array.from(allSkills),
      achievements,
      logs: relevantEntries.map(entry => entry.id)
    });
  };

  // Get associated logs count for current position
  const getAssociatedLogsCount = () => {
    return allEntries.filter(entry =>
      entry.associatedPosition === profile.currentPosition.id ||
      (!entry.associatedPosition && profile.currentPosition.isActive)
    ).length;
  };

  // Update position data when entries change
  useEffect(() => {
    if (!isOnboarding && profile.currentPosition.title && allEntries.length > 0) {
      updateCurrentPositionData();
    }
  }, [allEntries.length, profile.currentPosition.id, isOnboarding]);

  // Also update when profile changes (for initial load)
  useEffect(() => {
    if (!isOnboarding && profile.currentPosition.title && allEntries.length > 0) {
      updateCurrentPositionData();
    }
  }, [profile.currentPosition.title, profile.currentPosition.company]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background transition-all duration-[400ms] ease-out">
      <Header
        onQuickEntry={() => setShowQuickEntry(true)}
        onResumeGenerator={() => setShowResumeGenerator(true)}
        onLinkedInOptimizer={() => setShowLinkedInOptimizer(true)}
        onCareerInsights={() => setShowCareerInsights(true)}
        onProfileEdit={() => setShowProfileModal(true)}
        selectedCount={selectedEntries.length}
        totalEntries={allEntries.length}
        userName={profile.personal.firstName}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8">
          <Stats
            entries={allEntries}
            onShowInsights={() => setShowCareerInsights(true)}
          />
        </div>

        {/* Profile Section - Only show if onboarding is complete */}
        {!isOnboarding && (
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CurrentPositionCard
                position={profile.currentPosition}
                onUpdate={updateCurrentPosition}
                onAddNew={() => setShowNewPositionModal(true)}
                associatedLogsCount={getAssociatedLogsCount()}
                completionScore={completionScore}
                allEntries={allEntries}
                positionHistory={profile.positionHistory}
              />

              <div className="lg:col-span-1">
                <CareerTimeline
                  positions={profile.positionHistory}
                  currentPosition={profile.currentPosition}
                  onPositionClick={() => setShowNewPositionModal(true)}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                allEntries={allEntries}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div id="timeline-header" className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Career Timeline</h2>
                <p className="text-muted-foreground mt-1">
                  {entries.length} {entries.length === 1 ? 'entry' : 'entries'} found
                  {selectedEntries.length > 0 && (
                    <span className="ml-2 text-primary font-medium">
                      • {selectedEntries.length} selected
                    </span>
                  )}
                </p>
              </div>

              {entries.length > 0 && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSelectAll}
                    className="btn btn-ghost text-sm px-3 py-1.5"
                  >
                    {selectedEntries.length === entries.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              )}
            </div>

            <Timeline
              entries={entries}
              selectedEntries={selectedEntries}
              onSelectEntry={handleSelectEntry}
              onDeleteEntry={deleteEntry}
              onEditEntry={handleEditEntry}
              onExportEntries={() => setShowExportModal(true)}
            />
          </div>
        </div>
      </main>

      {/* Floating Action Bar */}
      <FloatingActionBar
        selectedCount={selectedEntries.length}
        totalCount={entries.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={() => setSelectedEntries([])}
        onExport={() => setShowExportModal(true)}
        triggerElementId="timeline-header"
      />

      {/* Modals */}
      {showQuickEntry && (
        <QuickEntry
          onAddEntry={handleAddEntry}
          onClose={() => setShowQuickEntry(false)}
        />
      )}

      {showResumeGenerator && (
        <ResumeGenerator
          selectedEntries={selectedEntries.map(id => allEntries.find(entry => entry.id === id)!)}
          onClose={() => setShowResumeGenerator(false)}
        />
      )}

      {showLinkedInOptimizer && (
        <LinkedInOptimizer
          selectedEntries={selectedEntries.map(id => allEntries.find(entry => entry.id === id)!)}
          onClose={() => setShowLinkedInOptimizer(false)}
          dynamicVariables={getDynamicVariables()}
        />
      )}

      {/* Career Insights Modal */}
      {showCareerInsights && (
        <CareerInsightsModal
          entries={allEntries}
          onClose={() => setShowCareerInsights(false)}
        />
      )}

      {/* User Onboarding */}
      {isOnboarding && (
        <UserOnboarding
          onComplete={completeOnboarding}
          onClose={() => {
            // Allow skipping onboarding, but mark as complete to hide modal
            const updatedProfile = {
              ...profile,
              meta: {
                ...profile.meta,
                onboardingComplete: true
              }
            };
            updateProfile(updatedProfile);
          }}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          entries={allEntries}
          selectedEntries={selectedEntries}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* New Position Modal */}
      {showNewPositionModal && (
        <NewPositionModal
          onClose={() => setShowNewPositionModal(false)}
          onAddPosition={addNewPosition}
          currentPosition={profile.currentPosition}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          profile={profile}
          onClose={() => setShowProfileModal(false)}
          onUpdateProfile={updateProfile}
          completionScore={completionScore}
        />
      )}

      {/* Edit Entry Modal */}
      {showEditModal && editingEntry && (
        <div className="modal-container bg-black/50 backdrop-blur-sm animate-fade-in">
          <EditEntryModal
            entry={editingEntry}
            onUpdateEntry={handleUpdateEntry}
            onClose={() => {
              setShowEditModal(false);
              setEditingEntry(null);
            }}
          />
        </div>
      )}
      </div>
    </ThemeProvider>
  );
}

export default App;