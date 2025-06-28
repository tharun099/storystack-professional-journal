import React, { useState, useEffect, useRef } from 'react';
import { X, User, Briefcase, Settings, Globe, Target, Save } from 'lucide-react';
import { UserProfile } from '../../types';
import { LoadingButton } from '../ui/loading-button';
import { useModalScrollLock } from '../../hooks/useScrollPosition';
import { PersonalInfoTab } from './ProfileTabs/PersonalInfoTab';
import { ProfessionalInfoTab } from './ProfileTabs/ProfessionalInfoTab';
import { PreferencesTab } from './ProfileTabs/PreferencesTab';

interface ProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  completionScore: number;
}

type TabId = 'personal' | 'professional' | 'preferences';

export function ProfileModal({ profile, onClose, onUpdateProfile, completionScore }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('personal');
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);

  const tabs = [
    {
      id: 'personal' as TabId,
      name: 'Personal Info',
      icon: User,
      description: 'Basic information and contact details'
    },
    {
      id: 'professional' as TabId,
      name: 'Professional',
      icon: Briefcase,
      description: 'Links, certifications, and education'
    },
    {
      id: 'preferences' as TabId,
      name: 'Career Goals',
      icon: Target,
      description: 'Career preferences and goals'
    }
  ];

  // Track changes
  useEffect(() => {
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(profile);
    setHasChanges(hasChanged);
  }, [formData, profile]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isSaving]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && !isSaving) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSaving]);

  // Prevent body scroll when modal is open
  useModalScrollLock();

  const handleClose = () => {
    if (hasChanges && !isSaving) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate saving delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      onUpdateProfile(formData);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (section: keyof UserProfile, updates: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfoTab
            data={formData.personal}
            onChange={(updates) => updateFormData('personal', updates)}
          />
        );
      case 'professional':
        return (
          <ProfessionalInfoTab
            data={formData.professional}
            onChange={(updates) => updateFormData('professional', updates)}
          />
        );
      case 'preferences':
        return (
          <PreferencesTab
            data={formData.preferences}
            meta={formData.meta}
            onChange={(updates) => updateFormData('preferences', updates)}
            onMetaChange={(updates) => updateFormData('meta', updates)}
          />
        );
      default:
        return (
          <div className="text-center text-muted-foreground">
            <p>Tab content not found for: {activeTab}</p>
          </div>
        );
    }
  };

  return (
    <div
      className="modal-container bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="card-elevated max-w-4xl w-full h-[90vh] flex flex-col animate-scale-in"
      >
        {/* Header */}
        <div className="bg-card rounded-t-2xl border-b border-border p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Edit Profile</h2>
              <p className="text-sm text-muted-foreground">
                Profile completion: {completionScore}%
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-64 border-r border-border p-6 flex-shrink-0 overflow-y-auto">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'hover:bg-accent text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-sm">{tab.name}</div>
                        <div className="text-xs opacity-70">{tab.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {renderTabContent() || (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Loading tab content...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-6 bg-card flex items-center justify-between flex-shrink-0">
              <div className="text-sm text-muted-foreground">
                {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="btn btn-ghost px-4 py-2"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={handleSave}
                  disabled={!hasChanges}
                  isLoading={isSaving}
                  loadingText="Saving..."
                  icon={Save}
                  variant="primary"
                  size="md"
                >
                  Save Changes
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
