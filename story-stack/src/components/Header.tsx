import { useState } from 'react';
import { Plus, Sparkles, FileText, BarChart3, Linkedin, TrendingUp, User, ChevronDown, Menu, Share2 } from 'lucide-react';
import { ThemeToggle } from './ui/ThemeToggle';

interface HeaderProps {
  onQuickEntry: () => void;
  onResumeGenerator: () => void;
  onLinkedInOptimizer: () => void;
  onCareerInsights: () => void;
  onProfileEdit: () => void;
  selectedCount: number;
  totalEntries: number;
  userName?: string;
}

export function Header({ onQuickEntry, onResumeGenerator, onLinkedInOptimizer, onCareerInsights, onProfileEdit, selectedCount, totalEntries, userName }: HeaderProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo and Brand */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-soft">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">StoryStack</h1>
                <p className="text-sm text-muted-foreground hidden xl:block">Transform daily activities into professional content</p>
              </div>
            </div>
          </div>

          {/* Right: User Actions - Grouped and Spaced */}
          <div className="flex items-center space-x-8">

            {/* Group 1: Dashboard/Overview */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowDashboardMenu(!showDashboardMenu)}
                  className="btn btn-ghost px-3 py-2 text-sm flex items-center"
                  title="Dashboard & Insights"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="hidden xl:inline">Dashboard</span>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </button>

                {showDashboardMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-medium z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Overview
                      </div>
                      <button
                        onClick={() => {
                          onCareerInsights();
                          setShowDashboardMenu(false);
                        }}
                        disabled={totalEntries === 0}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-3" />
                          Career Insights
                        </div>
                      </button>
                      <div className="px-4 py-2 text-sm text-muted-foreground flex items-center justify-between border-t border-border mt-2 pt-3">
                        <div className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-3" />
                          Total Entries
                        </div>
                        <span className="font-medium">{totalEntries}</span>
                      </div>
                      {selectedCount > 0 && (
                        <div className="px-4 py-2 text-sm text-primary flex items-center justify-between">
                          <span>Selected</span>
                          <span className="font-medium">{selectedCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Group 2: Share & AI Tools */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  disabled={selectedCount === 0}
                  className="btn btn-secondary px-3 py-2 text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Share & AI Tools"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  <span className="hidden xl:inline">Share & AI</span>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </button>

                {showShareMenu && selectedCount > 0 && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-lg shadow-medium z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Export & Generate
                      </div>
                      <button
                        onClick={() => {
                          onLinkedInOptimizer();
                          setShowShareMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center"
                      >
                        <Linkedin className="w-4 h-4 mr-3" />
                        LinkedIn Optimizer
                      </button>
                      <button
                        onClick={() => {
                          onResumeGenerator();
                          setShowShareMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center"
                      >
                        <Sparkles className="w-4 h-4 mr-3" />
                        AI Generate Resume
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Group 3: User & Settings */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />

              <button
                onClick={onProfileEdit}
                className="btn btn-ghost px-3 py-2 text-sm flex items-center"
                title="Edit profile"
              >
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{userName ? `Hi, ${userName}` : 'Profile'}</span>
              </button>
            </div>

            {/* Group 4: Primary Action */}
            <div className="flex items-center">
              <button
                onClick={onQuickEntry}
                className="btn btn-primary px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-soft"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Activity
              </button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="btn btn-ghost px-3 py-2 text-sm"
                  title="More options"
                >
                  <Menu className="w-4 h-4" />
                </button>

                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-medium z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Dashboard
                      </div>
                      <button
                        onClick={() => {
                          onCareerInsights();
                          setShowShareMenu(false);
                        }}
                        disabled={totalEntries === 0}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <TrendingUp className="w-4 h-4 mr-3" />
                        Career Insights
                      </button>

                      <div className="border-t border-border my-2"></div>

                      <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Share & AI
                      </div>
                      <button
                        onClick={() => {
                          onLinkedInOptimizer();
                          setShowShareMenu(false);
                        }}
                        disabled={selectedCount === 0}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <Linkedin className="w-4 h-4 mr-3" />
                        LinkedIn Optimizer
                      </button>
                      <button
                        onClick={() => {
                          onResumeGenerator();
                          setShowShareMenu(false);
                        }}
                        disabled={selectedCount === 0}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <Sparkles className="w-4 h-4 mr-3" />
                        AI Generate Resume
                      </button>

                      <div className="border-t border-border my-2"></div>

                      <div className="px-4 py-2 text-sm text-muted-foreground flex items-center justify-between">
                        <div className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-3" />
                          Entries
                        </div>
                        <span className="font-medium">{totalEntries}</span>
                      </div>
                      {selectedCount > 0 && (
                        <div className="px-4 py-2 text-sm text-primary flex items-center justify-between">
                          <span>Selected</span>
                          <span className="font-medium">{selectedCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showShareMenu || showDashboardMenu) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowShareMenu(false);
            setShowDashboardMenu(false);
          }}
        />
      )}
    </header>
  );
}