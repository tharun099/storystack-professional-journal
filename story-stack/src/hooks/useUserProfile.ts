import { useState, useCallback, useEffect } from 'react';
import { UserProfile, Position, DynamicVariables } from '../types';
import { useLocalStorage } from './useLocalStorage';

const defaultProfile: UserProfile = {
  personal: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    timezone: '',
    profileSummary: ''
  },
  professional: {
    linkedInUrl: '',
    portfolioUrl: '',
    githubUrl: '',
    personalWebsite: '',
    certifications: [],
    languages: [],
    education: []
  },
  preferences: {
    careerGoals: '',
    preferredWorkStyle: 'flexible',
    availableForOpportunities: true,
    salaryRange: {
      min: undefined,
      max: undefined,
      currency: 'USD'
    },
    preferredIndustries: [],
    workValues: []
  },
  currentPosition: {
    id: 'current',
    title: '',
    company: '',
    startDate: '',
    location: '',
    department: '',
    isActive: true,
    logs: [],
    achievements: [],
    skills: [],
    teamSize: undefined,
    description: ''
  },
  positionHistory: [],
  meta: {
    industry: '',
    experienceLevel: 'mid',
    primarySkills: [],
    lastUpdated: new Date().toISOString(),
    onboardingComplete: false,
    profileCompletionScore: 0,
    profileVisibility: 'private'
  }
};

// Migration function to ensure profile has all required fields
const migrateProfile = (profile: any): UserProfile => {
  return {
    personal: {
      firstName: profile.personal?.firstName || '',
      lastName: profile.personal?.lastName || '',
      email: profile.personal?.email || '',
      phone: profile.personal?.phone || '',
      location: profile.personal?.location || '',
      timezone: profile.personal?.timezone || '',
      profileSummary: profile.personal?.profileSummary || ''
    },
    professional: {
      linkedInUrl: profile.professional?.linkedInUrl || '',
      portfolioUrl: profile.professional?.portfolioUrl || '',
      githubUrl: profile.professional?.githubUrl || '',
      personalWebsite: profile.professional?.personalWebsite || '',
      certifications: profile.professional?.certifications || [],
      languages: profile.professional?.languages || [],
      education: profile.professional?.education || []
    },
    preferences: {
      careerGoals: profile.preferences?.careerGoals || '',
      preferredWorkStyle: profile.preferences?.preferredWorkStyle || 'flexible',
      availableForOpportunities: profile.preferences?.availableForOpportunities ?? true,
      salaryRange: {
        min: profile.preferences?.salaryRange?.min,
        max: profile.preferences?.salaryRange?.max,
        currency: profile.preferences?.salaryRange?.currency || 'USD'
      },
      preferredIndustries: profile.preferences?.preferredIndustries || [],
      workValues: profile.preferences?.workValues || []
    },
    currentPosition: profile.currentPosition || defaultProfile.currentPosition,
    positionHistory: profile.positionHistory || [],
    meta: {
      ...defaultProfile.meta,
      ...profile.meta,
      profileVisibility: profile.meta?.profileVisibility || 'private'
    }
  };
};

export function useUserProfile() {
  const [rawProfile, setRawProfile] = useLocalStorage<any>('user-profile', defaultProfile);
  const profile = migrateProfile(rawProfile);
  const [isOnboarding, setIsOnboarding] = useState(!profile.meta.onboardingComplete);

  const setProfile = useCallback((newProfile: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    if (typeof newProfile === 'function') {
      setRawProfile(prev => newProfile(migrateProfile(prev)));
    } else {
      setRawProfile(newProfile);
    }
  }, [setRawProfile]);

  // Calculate profile completion score
  const calculateCompletionScore = useCallback((userProfile: UserProfile): number => {
    let score = 0;
    const weights = {
      // Core essentials (60 points)
      firstName: 15,
      title: 20,
      company: 20,
      email: 5,

      // Professional details (25 points)
      lastName: 3,
      location: 4,
      startDate: 3,
      department: 3,
      industry: 5,
      teamSize: 2,
      profileSummary: 5,

      // Enhanced profile (15 points)
      linkedInUrl: 3,
      certifications: 2,
      languages: 2,
      education: 3,
      careerGoals: 2,
      primarySkills: 3
    };

    if (userProfile.personal.firstName) score += weights.firstName;
    if (userProfile.personal.lastName) score += weights.lastName;
    if (userProfile.personal.email) score += weights.email;
    if (userProfile.personal.location) score += weights.location;
    if (userProfile.personal.profileSummary) score += weights.profileSummary;

    // Position fields
    if (userProfile.currentPosition.title) score += weights.title;
    if (userProfile.currentPosition.company) score += weights.company;
    if (userProfile.currentPosition.startDate) score += weights.startDate;
    if (userProfile.currentPosition.department) score += weights.department;
    if (userProfile.currentPosition.teamSize) score += weights.teamSize;

    // Meta fields
    if (userProfile.meta.industry) score += weights.industry;
    if (userProfile.meta.primarySkills.length > 0) score += weights.primarySkills;

    // Professional fields
    if (userProfile.professional.linkedInUrl) score += weights.linkedInUrl;
    if (userProfile.professional.certifications.length > 0) score += weights.certifications;
    if (userProfile.professional.languages.length > 0) score += weights.languages;
    if (userProfile.professional.education.length > 0) score += weights.education;

    // Preferences
    if (userProfile.preferences.careerGoals) score += weights.careerGoals;

    return Math.min(score, 100);
  }, []);

  // Update profile and recalculate completion score
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...updates };
      updated.meta.profileCompletionScore = calculateCompletionScore(updated);
      updated.meta.lastUpdated = new Date().toISOString();
      return updated;
    });
  }, [setProfile, calculateCompletionScore]);

  // Complete onboarding with minimal data
  const completeOnboarding = useCallback((data: {
    firstName: string;
    title: string;
    company: string;
  }) => {
    const updatedProfile: UserProfile = {
      ...profile,
      personal: {
        ...profile.personal,
        firstName: data.firstName
      },
      currentPosition: {
        ...profile.currentPosition,
        title: data.title,
        company: data.company,
        startDate: new Date().toISOString().split('T')[0] // Today's date as default
      },
      meta: {
        ...profile.meta,
        onboardingComplete: true,
        lastUpdated: new Date().toISOString()
      }
    };

    updatedProfile.meta.profileCompletionScore = calculateCompletionScore(updatedProfile);
    setProfile(updatedProfile);
    setIsOnboarding(false);
  }, [profile, setProfile, calculateCompletionScore]);

  // Update current position
  const updateCurrentPosition = useCallback((updates: Partial<Position>) => {
    updateProfile({
      currentPosition: {
        ...profile.currentPosition,
        ...updates
      }
    });
  }, [profile.currentPosition, updateProfile]);

  // Add new position (moves current to history)
  const addNewPosition = useCallback((newPosition: Omit<Position, 'id' | 'isActive' | 'logs' | 'achievements' | 'skills'>) => {
    const currentPos = profile.currentPosition;
    
    // Move current position to history if it has meaningful data
    const updatedHistory = currentPos.title && currentPos.company 
      ? [...profile.positionHistory, { ...currentPos, isActive: false, endDate: new Date().toISOString().split('T')[0] }]
      : profile.positionHistory;

    const newPos: Position = {
      ...newPosition,
      id: crypto.randomUUID(),
      isActive: true,
      logs: [],
      achievements: [],
      skills: []
    };

    updateProfile({
      currentPosition: newPos,
      positionHistory: updatedHistory
    });
  }, [profile.currentPosition, profile.positionHistory, updateProfile]);

  // Generate dynamic variables for AI content
  const getDynamicVariables = useCallback((): DynamicVariables => {
    const calculateTenure = (startDate: string): string => {
      if (!startDate) return '';
      const start = new Date(startDate);
      const now = new Date();
      const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      
      if (months < 1) return 'recently started';
      if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
    };

    const inferIndustry = (company: string): string => {
      // Simple industry inference - can be enhanced
      const techKeywords = ['tech', 'software', 'digital', 'app', 'platform', 'data', 'ai', 'ml'];
      const financeKeywords = ['bank', 'finance', 'capital', 'investment', 'trading'];
      const healthKeywords = ['health', 'medical', 'pharma', 'bio', 'care'];
      
      const companyLower = company.toLowerCase();
      if (techKeywords.some(keyword => companyLower.includes(keyword))) return 'Technology';
      if (financeKeywords.some(keyword => companyLower.includes(keyword))) return 'Finance';
      if (healthKeywords.some(keyword => companyLower.includes(keyword))) return 'Healthcare';
      return profile.meta.industry || 'Technology';
    };

    return {
      '{NAME}': profile.personal.firstName,
      '{FULL_NAME}': `${profile.personal.firstName} ${profile.personal.lastName || ''}`.trim(),
      '{TITLE}': profile.currentPosition.title,
      '{COMPANY}': profile.currentPosition.company,
      '{ROLE_AT_COMPANY}': `${profile.currentPosition.title} at ${profile.currentPosition.company}`,
      '{EXPERIENCE_LEVEL}': profile.meta.experienceLevel || 'experienced',
      '{TENURE}': calculateTenure(profile.currentPosition.startDate),
      '{INDUSTRY}': profile.meta.industry || inferIndustry(profile.currentPosition.company),
      '{RECENT_SKILLS}': profile.meta.primarySkills.slice(0, 3).join(', '),
      '{TOP_SKILLS}': profile.meta.primarySkills.slice(0, 5).join(', '),
      '{TEAM_SIZE}': profile.currentPosition.teamSize ? `team of ${profile.currentPosition.teamSize}` : ''
    };
  }, [profile]);

  // Detect position change from log content
  const detectPositionChange = useCallback((logContent: string): boolean => {
    const changeIndicators = [
      'new job', 'starting at', 'joined', 'new role', 'new position',
      'promotion', 'promoted to', 'moved to', 'now working at',
      'accepted offer', 'first day at'
    ];
    
    return changeIndicators.some(indicator => 
      logContent.toLowerCase().includes(indicator)
    );
  }, []);

  // Get suggestions for profile improvement
  const getProfileSuggestions = useCallback(() => {
    const suggestions = [];
    const score = profile.meta.profileCompletionScore;

    if (score < 50) {
      if (!profile.currentPosition.startDate) {
        suggestions.push({
          type: 'startDate',
          message: 'Add your start date for better timeline tracking',
          priority: 'high'
        });
      }
      if (!profile.personal.lastName) {
        suggestions.push({
          type: 'lastName',
          message: 'Add your last name for professional content',
          priority: 'medium'
        });
      }
    }

    if (score < 75) {
      if (!profile.currentPosition.location) {
        suggestions.push({
          type: 'location',
          message: 'Add your location for networking opportunities',
          priority: 'medium'
        });
      }
      if (!profile.meta.industry) {
        suggestions.push({
          type: 'industry',
          message: 'Specify your industry for better content targeting',
          priority: 'medium'
        });
      }
    }

    return suggestions;
  }, [profile]);

  // Initialize completion score on first load
  useEffect(() => {
    if (profile.meta.profileCompletionScore === 0) {
      const score = calculateCompletionScore(profile);
      if (score > 0) {
        updateProfile({ meta: { ...profile.meta, profileCompletionScore: score } });
      }
    }
  }, [profile, calculateCompletionScore, updateProfile]);

  // Update isOnboarding state when onboardingComplete changes
  useEffect(() => {
    setIsOnboarding(!profile.meta.onboardingComplete);
  }, [profile.meta.onboardingComplete]);

  return {
    profile,
    isOnboarding,
    updateProfile,
    updateCurrentPosition,
    addNewPosition,
    completeOnboarding,
    getDynamicVariables,
    detectPositionChange,
    getProfileSuggestions,
    completionScore: profile.meta.profileCompletionScore
  };
}
