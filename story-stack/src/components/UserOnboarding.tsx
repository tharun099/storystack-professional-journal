import React, { useState, useEffect, useRef } from 'react';
import { User, Briefcase, Building, ArrowRight, Sparkles } from 'lucide-react';
import { LoadingButton } from './ui/loading-button';
import { useModalScrollLock } from '../hooks/useScrollPosition';

interface UserOnboardingProps {
  onComplete: (data: { firstName: string; title: string; company: string }) => void;
  onClose: () => void;
}

interface OnboardingData {
  firstName: string;
  title: string;
  company: string;
}

const SUGGESTED_TITLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Product Manager',
  'Data Scientist',
  'UX Designer',
  'DevOps Engineer',
  'Marketing Manager',
  'Sales Representative',
  'Business Analyst',
  'Project Manager'
];

export function UserOnboarding({ onComplete, onClose }: UserOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    title: '',
    company: ''
  });
  const [isCompleting, setIsCompleting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      id: 'name',
      title: 'Welcome to StoryStack! 👋',
      subtitle: 'Let\'s get you set up in 30 seconds',
      question: 'What should we call you?',
      placeholder: 'Enter your first name',
      icon: User,
      field: 'firstName' as keyof OnboardingData,
      validation: (value: string) => value.trim().length >= 2 ? null : 'Please enter at least 2 characters'
    },
    {
      id: 'title',
      title: 'Great to meet you! 🚀',
      subtitle: 'Now let\'s understand your role',
      question: 'What\'s your current job title?',
      placeholder: 'e.g., Software Engineer, Product Manager',
      icon: Briefcase,
      field: 'title' as keyof OnboardingData,
      validation: (value: string) => value.trim().length >= 3 ? null : 'Please enter your job title'
    },
    {
      id: 'company',
      title: 'Almost done! ✨',
      subtitle: 'Last question, we promise',
      question: 'Where do you work?',
      placeholder: 'Enter your company name',
      icon: Building,
      field: 'company' as keyof OnboardingData,
      validation: (value: string) => value.trim().length >= 2 ? null : 'Please enter your company name'
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = currentStepData.validation(data[currentStepData.field]) === null;

  const handleInputChange = (value: string) => {
    setData(prev => ({
      ...prev,
      [currentStepData.field]: value
    }));
  };

  const handleNext = () => {
    if (!canProceed) return;
    
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      onComplete(data);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canProceed) {
      handleNext();
    }
  };

  const handleTitleSuggestion = (title: string) => {
    setData(prev => ({ ...prev, title }));
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isCompleting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose, isCompleting]);

  // Handle click outside modal (only allow closing on first step or when not completing)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && !isCompleting && currentStep === 0) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, isCompleting, currentStep]);

  // Prevent body scroll when modal is open while preserving scroll position
  useModalScrollLock();

  const Icon = currentStepData.icon;

  return (
    <div className="modal-container bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        ref={modalRef}
        className="card-elevated max-w-md w-full p-8 relative animate-scale-in"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-t-2xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8 mt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full mb-4">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-muted-foreground">
            {currentStepData.subtitle}
          </p>
        </div>

        {/* Question */}
        <div className="mb-6">
          <label className="block text-lg font-medium text-foreground mb-3">
            {currentStepData.question}
          </label>

          <input
            type="text"
            value={data[currentStepData.field]}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={currentStepData.placeholder}
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent text-lg transition-colors"
            autoFocus
          />

          {/* Title Suggestions */}
          {currentStepData.field === 'title' && !data.title && (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground mb-2">Popular titles:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TITLES.slice(0, 6).map((title) => (
                  <button
                    key={title}
                    onClick={() => handleTitleSuggestion(title)}
                    className="btn btn-ghost px-3 py-1 text-sm rounded-full"
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Validation Error */}
          {data[currentStepData.field] && currentStepData.validation(data[currentStepData.field]) && (
            <p className="mt-2 text-sm text-destructive">
              {currentStepData.validation(data[currentStepData.field])}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="btn btn-ghost px-4 py-2"
                disabled={isCompleting}
              >
                Back
              </button>
            )}

            <LoadingButton
              onClick={handleNext}
              disabled={!canProceed}
              isLoading={isCompleting}
              loadingText={isLastStep ? "Setting up..." : "Next"}
              icon={isLastStep ? Sparkles : ArrowRight}
              variant="primary"
              size="md"
            >
              {isLastStep ? "Let's go!" : "Next"}
            </LoadingButton>
          </div>
        </div>

        {/* Skip Option */}
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={isCompleting}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
