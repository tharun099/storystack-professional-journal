import React, { useState, useRef, useEffect } from 'react';
import { Plus, Mic, MicOff, Tag, Calendar, Target, Hash, X, ChevronRight, ChevronLeft, Zap, Clock, HelpCircle, Save, Award, Lightbulb, Rocket, Users, BookOpen, Handshake, BarChart3, Brain, FileText, Sparkles } from 'lucide-react';
import { CareerEntry } from '../types';
import { MessageLoading } from '@/components/ui/message-loading';
import { FullScreenLoading } from '@/components/ui/full-screen-loading';
import { LoadingButton } from '@/components/ui/loading-button';
import { useModalScrollLock } from '../hooks/useScrollPosition';

interface QuickEntryProps {
  onAddEntry: (entry: Omit<CareerEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

const categories = [
  {
    id: 'achievement',
    label: 'Achievement',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Award,
    description: 'Accomplishments, wins, recognitions'
  },
  {
    id: 'skill',
    label: 'Skill Development',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Lightbulb,
    description: 'Learning new skills, certifications'
  },
  {
    id: 'project',
    label: 'Project Work',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Rocket,
    description: 'Project milestones, deliverables'
  },
  {
    id: 'leadership',
    label: 'Leadership',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Users,
    description: 'Leading teams, mentoring, decisions'
  },
  {
    id: 'learning',
    label: 'Learning',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: BookOpen,
    description: 'Training, courses, knowledge gained'
  },
  {
    id: 'networking',
    label: 'Networking',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    icon: Handshake,
    description: 'Building relationships, connections'
  }
] as const;

const quickActionsByCategory = {
  achievement: [
    'Exceeded quarterly targets',
    'Received positive feedback',
    'Won team recognition',
    'Completed challenging task'
  ],
  skill: [
    'Learned new framework',
    'Completed certification',
    'Mastered new tool',
    'Improved existing skill'
  ],
  project: [
    'Delivered project milestone',
    'Fixed critical issue',
    'Launched new feature',
    'Completed sprint goals'
  ],
  leadership: [
    'Led team meeting',
    'Mentored colleague',
    'Made strategic decision',
    'Resolved team conflict'
  ],
  learning: [
    'Attended workshop',
    'Read technical article',
    'Watched training video',
    'Participated in conference'
  ],
  networking: [
    'Met new contact',
    'Attended networking event',
    'Had coffee chat',
    'Joined professional group'
  ]
};

const dateOptions = [
  { label: 'Today', value: new Date().toISOString().split('T')[0] },
  { label: 'Yesterday', value: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
  { label: 'This week', value: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0] },
  { label: 'Last week', value: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0] }
];

export function QuickEntry({ onAddEntry, onClose }: QuickEntryProps) {
  // Form state
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState('');
  const [skills, setSkills] = useState('');
  const [tags, setTags] = useState('');
  const [project, setProject] = useState('');
  const [category, setCategory] = useState<CareerEntry['category']>('achievement');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [suggestedCategory, setSuggestedCategory] = useState<CareerEntry['category'] | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Smart category detection based on keywords
  const detectCategory = (text: string): CareerEntry['category'] => {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('learn') || lowerText.includes('course') || lowerText.includes('training') || lowerText.includes('study')) {
      return 'learning';
    }
    if (lowerText.includes('lead') || lowerText.includes('mentor') || lowerText.includes('manage') || lowerText.includes('decision')) {
      return 'leadership';
    }
    if (lowerText.includes('project') || lowerText.includes('deliver') || lowerText.includes('build') || lowerText.includes('develop')) {
      return 'project';
    }
    if (lowerText.includes('skill') || lowerText.includes('technology') || lowerText.includes('framework') || lowerText.includes('tool')) {
      return 'skill';
    }
    if (lowerText.includes('network') || lowerText.includes('meet') || lowerText.includes('connect') || lowerText.includes('event')) {
      return 'networking';
    }
    return 'achievement';
  };

  // Auto-focus description field
  useEffect(() => {
    if (descriptionRef.current && currentStep === 1) {
      descriptionRef.current.focus();
    }
  }, [currentStep]);

  // Handle ESC key press and keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      // Ctrl+Enter to save
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handleQuickSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [description, category, date]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Prevent body scroll when modal is open while preserving scroll position
  useModalScrollLock();

  // Smart category suggestion when description changes
  useEffect(() => {
    if (description.trim().length > 10) {
      const suggested = detectCategory(description);
      if (suggested !== category) {
        setSuggestedCategory(suggested);
      } else {
        setSuggestedCategory(null);
      }
      setShowQuickActions(false);
    } else {
      setSuggestedCategory(null);
      setShowQuickActions(true);
    }
  }, [description, category]);

  const startVoiceRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setIsProcessingVoice(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsProcessingVoice(false);
      };

      recognitionRef.current.onresult = (event) => {
        setIsProcessingVoice(true);
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setDescription(transcript);

        // Simulate processing delay for better UX
        setTimeout(() => {
          setIsProcessingVoice(false);
        }, 500);
      };

      recognitionRef.current.start();
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsProcessingVoice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isSaving) return;

    setIsSaving(true);

    // Simulate saving delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    const tagsArray = tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);

    onAddEntry({
      description: description.trim(),
      impact: impact.trim(),
      skills: skillsArray,
      tags: tagsArray,
      project: project.trim(),
      category,
      date
    });

    setIsSaving(false);
    onClose();
  };

  const handleQuickSave = async () => {
    if (!description.trim() || isSaving) return;

    setIsSaving(true);

    // Simulate saving delay for better UX
    await new Promise(resolve => setTimeout(resolve, 600));

    onAddEntry({
      description: description.trim(),
      impact: '',
      skills: [],
      tags: [],
      project: '',
      category,
      date
    });

    setIsSaving(false);
    onClose();
  };

  const handleQuickAction = (action: string) => {
    setDescription(action);
    const detectedCategory = detectCategory(action);
    setCategory(detectedCategory);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && description.trim()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const applySuggestedCategory = () => {
    if (suggestedCategory) {
      setCategory(suggestedCategory);
      setSuggestedCategory(null);
    }
  };

  return (
    <>
      {/* Full-screen loading for voice processing */}
      <FullScreenLoading
        isVisible={isProcessingVoice}
        title="Processing Voice Input"
        subtitle="Converting your speech to text"
        messages={[
          { text: "Analyzing your voice input…", icon: Mic },
          { text: "Converting speech to text…", icon: Brain },
          { text: "Processing your words…", icon: Sparkles },
          { text: "Preparing your content…", icon: FileText }
        ]}
      />

      {/* Full-screen loading for saving */}
      <FullScreenLoading
        isVisible={isSaving}
        title="Saving Your Activity"
        subtitle="Adding to your career timeline"
        messages={[
          { text: "Saving your career activity…", icon: Save },
          { text: "Updating your timeline…", icon: BarChart3 },
          { text: "Processing your achievement…", icon: Sparkles },
          { text: "Organizing your progress…", icon: Target }
        ]}
      />

      <div className="modal-container bg-black/50 backdrop-blur-sm animate-fade-in">
        <div
          ref={modalRef}
          className="card-elevated w-full max-w-2xl overflow-y-auto animate-scale-in"
        >
        {/* Header */}
        <div className="sticky top-0 bg-card rounded-t-2xl border-b border-border px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-foreground">
                {currentStep === 1 ? 'What did you accomplish?' : 'Add more details'}
              </h2>
              {currentStep === 2 && (
                <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  Optional
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {/* Step indicator */}
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full transition-colors ${currentStep === 1 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                <div className={`w-2 h-2 rounded-full transition-colors ${currentStep === 2 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
              </div>
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {currentStep === 1 && (
              <>
                {/* Quick Actions */}
                {showQuickActions && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-foreground">
                        <Zap className="inline w-4 h-4 mr-1" />
                        Quick Start
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowQuickActions(false)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Hide
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {quickActionsByCategory[category].map((action) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => handleQuickAction(action)}
                          className="btn btn-ghost px-3 py-2 text-sm text-left justify-start"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    What type of activity is this?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((cat) => {
                      const IconComponent = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            category === cat.id
                              ? `${cat.color} border-current`
                              : 'bg-card border-border hover:border-border/60 text-foreground hover:bg-accent'
                          }`}
                        >
                          <div className="mb-2">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="font-medium text-sm">{cat.label}</div>
                          <div className="text-xs opacity-75 mt-1">{cat.description}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Smart category suggestion */}
                  {suggestedCategory && (
                    <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Lightbulb className="w-4 h-4 text-primary" />
                          <span className="text-sm text-foreground">
                            This sounds like a <strong>{categories.find(c => c.id === suggestedCategory)?.label}</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={applySuggestedCategory}
                          className="btn btn-primary text-xs px-2 py-1"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Describe what you accomplished *
                  </label>
                  <div className="relative">
                    <textarea
                      ref={descriptionRef}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition-colors"
                      rows={4}
                      placeholder="Be specific about what you did and any results..."
                      required
                    />
                    <button
                      type="button"
                      onClick={isListening ? stopVoiceRecording : startVoiceRecording}
                      disabled={isProcessingVoice}
                      className={`absolute right-3 top-3 p-2 rounded-lg transition-colors ${
                        isListening
                          ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                          : isProcessingVoice
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                      aria-label={
                        isProcessingVoice
                          ? 'Processing voice input...'
                          : isListening
                          ? 'Stop voice recording'
                          : 'Start voice recording'
                      }
                    >
                      {isProcessingVoice ? (
                        <MessageLoading size="lg" className="text-primary" />
                      ) : isListening ? (
                        <MicOff size={20} />
                      ) : (
                        <Mic size={20} />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground flex items-center space-x-1">
                    <Lightbulb className="w-3 h-3" />
                    <span>Tip: Press Ctrl+Enter to save quickly, or continue for more details</span>
                  </div>
                </div>

                {/* Quick Date Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    <Clock className="inline w-4 h-4 mr-1" />
                    When did this happen?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {dateOptions.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setDate(option.value)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          date === option.value
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-card border-border hover:border-border/60 text-foreground hover:bg-accent'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent text-sm transition-colors"
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                {/* Impact */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Target className="inline w-4 h-4 mr-1" />
                    Impact & Results
                    <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
                  </label>
                  <textarea
                    value={impact}
                    onChange={(e) => setImpact(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition-colors"
                    rows={3}
                    placeholder="What was the outcome? Any metrics or feedback?"
                  />
                  <div className="mt-1 text-xs text-muted-foreground flex items-center space-x-1">
                    <BarChart3 className="w-3 h-3" />
                    <span>Include numbers, percentages, or specific outcomes when possible</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Skills & Technologies
                      <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                      placeholder="React, Leadership, Python..."
                    />
                    <div className="mt-1 text-xs text-muted-foreground">
                      Separate with commas
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Hash className="inline w-4 h-4 mr-1" />
                      Tags
                      <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                      placeholder="#frontend, #debugging, #teamwork"
                    />
                    <div className="mt-1 text-xs text-muted-foreground">
                      Use # for hashtags
                    </div>
                  </div>
                </div>

                {/* Project */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Project or Context
                    <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                    placeholder="Project name, team, or context..."
                  />
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-border">
              <div className="flex items-center space-x-3 order-2 sm:order-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="btn btn-secondary px-4 py-2 flex items-center space-x-1"
                  >
                    <ChevronLeft size={16} />
                    <span>Back</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3 order-1 sm:order-2">
                {currentStep === 1 && (
                  <>
                    <LoadingButton
                      type="button"
                      onClick={handleQuickSave}
                      disabled={!description.trim()}
                      isLoading={isSaving}
                      loadingText="Saving..."
                      icon={Save}
                      iconSize={16}
                      variant="success"
                      size="md"
                    >
                      Quick Save
                    </LoadingButton>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!description.trim() || isSaving}
                      className="btn btn-primary px-6 py-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 flex items-center space-x-2"
                    >
                      <span>Add Details</span>
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {currentStep === 2 && (
                  <LoadingButton
                    type="submit"
                    disabled={!description.trim()}
                    isLoading={isSaving}
                    loadingText="Saving Entry..."
                    icon={Plus}
                    iconSize={16}
                    variant="primary"
                    size="md"
                  >
                    Save Entry
                  </LoadingButton>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}