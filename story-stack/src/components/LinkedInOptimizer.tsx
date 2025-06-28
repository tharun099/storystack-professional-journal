import React, { useState, useRef, useEffect } from 'react';
import { X, Linkedin, Sparkles, User, FileText, Target, TrendingUp, Copy, Download, Brain, BarChart3, Lightbulb } from 'lucide-react';
import { CareerEntry, LinkedInContentOptions, DynamicVariables } from '../types';
import { LinkedInService } from '../services/linkedinService';
import { ProfileBuilder } from './linkedin/ProfileBuilder';
import { ContentGenerator } from './linkedin/ContentGenerator';
import { SkillsOptimizer } from './linkedin/SkillsOptimizer';
import { OptimizationScore } from './linkedin/OptimizationScore';
import { FullScreenLoading } from './ui/full-screen-loading';
import { useModalScrollLock } from '../hooks/useScrollPosition';

interface LinkedInOptimizerProps {
  selectedEntries: CareerEntry[];
  onClose: () => void;
  dynamicVariables?: DynamicVariables;
}

const GEMINI_API_KEY = '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';

type TabType = 'overview' | 'profile' | 'content' | 'skills';

export function LinkedInOptimizer({ selectedEntries, onClose, dynamicVariables }: LinkedInOptimizerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimizationScore, setOptimizationScore] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const linkedinService = new LinkedInService(GEMINI_API_KEY);

  // Prevent body scroll when modal is open while preserving scroll position
  useModalScrollLock();

  // Initial profile analysis
  useEffect(() => {
    if (selectedEntries.length > 0) {
      // Add a small delay to let the UI render first
      setTimeout(() => {
        analyzeProfile();
      }, 500);
    }
  }, [selectedEntries]);

  const analyzeProfile = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      if (selectedEntries.length === 0) {
        throw new Error('Please select at least one career entry to analyze');
      }

      const score = await linkedinService.analyzeProfile(selectedEntries);
      setOptimizationScore(score);
    } catch (err) {
      console.error('Profile analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze profile. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const tabs = [
    {
      id: 'overview' as TabType,
      name: 'Overview',
      icon: TrendingUp,
      description: 'Profile analysis & optimization score'
    },
    {
      id: 'profile' as TabType,
      name: 'Profile Builder',
      icon: User,
      description: 'Headlines, summaries & experience'
    },
    {
      id: 'content' as TabType,
      name: 'Content Creator',
      icon: FileText,
      description: 'Posts, articles & engagement content'
    },
    {
      id: 'skills' as TabType,
      name: 'Skills Optimizer',
      icon: Target,
      description: 'Skills analysis & recommendations'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OptimizationScore 
            score={optimizationScore}
            entries={selectedEntries}
            onRefresh={analyzeProfile}
            isLoading={isAnalyzing}
          />
        );
      case 'profile':
        return (
          <ProfileBuilder
            entries={selectedEntries}
            linkedinService={linkedinService}
            dynamicVariables={dynamicVariables}
          />
        );
      case 'content':
        return (
          <ContentGenerator 
            entries={selectedEntries}
            linkedinService={linkedinService}
          />
        );
      case 'skills':
        return (
          <SkillsOptimizer 
            entries={selectedEntries}
            linkedinService={linkedinService}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <FullScreenLoading
        isVisible={isAnalyzing && !optimizationScore}
        title="Analyzing Your Profile"
        subtitle="Extracting insights from your career activities"
        messages={[
          { text: "Analyzing your achievements and skills...", icon: Brain },
          { text: "Calculating optimization opportunities...", icon: BarChart3 },
          { text: "Generating personalized recommendations...", icon: Lightbulb },
          { text: "Identifying areas for improvement...", icon: Target },
          { text: "Preparing your LinkedIn strategy...", icon: Sparkles }
        ]}
      />

      <div className="modal-container bg-black/50 backdrop-blur-sm animate-fade-in">
        <div
          ref={modalRef}
          className="card-elevated w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden animate-scale-in"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-t-xl border-b border-border p-6 z-10 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-soft">
                <Linkedin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">LinkedIn Optimizer</h2>
                <p className="text-muted-foreground">Transform your career activities into LinkedIn success</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                {selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'} selected
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border bg-muted/30">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-card border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <div className="font-medium">{tab.name}</div>
                      <div className="text-xs text-muted-foreground">{tab.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {error ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Analysis Failed</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={analyzeProfile}
                    className="btn btn-primary px-4 py-2"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      setError(null);
                      // Use fallback score
                      setOptimizationScore({
                        overall: 72,
                        headline: 75,
                        summary: 68,
                        experience: 70,
                        skills: 76,
                        suggestions: [
                          {
                            area: 'summary',
                            current: 68,
                            suggestion: 'Add more quantified achievements and specific metrics from your career activities',
                            priority: 'high',
                            impact: 'Could improve profile engagement by 30%'
                          },
                          {
                            area: 'headline',
                            current: 75,
                            suggestion: 'Include your most impactful skills and a key achievement',
                            priority: 'medium',
                            impact: 'Better visibility in LinkedIn searches'
                          }
                        ]
                      });
                    }}
                    className="btn btn-secondary px-4 py-2"
                  >
                    Continue Without Analysis
                  </button>
                </div>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground flex items-center space-x-1">
                <Lightbulb className="w-3 h-3" />
                <span>Tip: Select more entries for better optimization suggestions</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">Powered by AI</span>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
