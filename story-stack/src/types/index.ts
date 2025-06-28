export interface CareerEntry {
  id: string;
  date: string;
  description: string;
  impact: string;
  skills: string[];
  tags: string[];
  project: string;
  category: 'achievement' | 'skill' | 'project' | 'leadership' | 'learning' | 'networking';
  createdAt: string;
  updatedAt: string;
  // Position association
  associatedPosition?: string; // Position ID
  positionContext?: string; // Cached position context for AI
  // Dynamic content generation
  generatedContent?: {
    resumeBullet?: string;
    linkedinPost?: string;
    customTemplates?: {
      formal?: string;
      casual?: string;
      technical?: string;
    };
  };
}

export interface ResumeFormat {
  id: string;
  name: string;
  description: string;
  template: (entry: CareerEntry) => string;
}

export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  tags: string[];
  categories: string[];
  projects: string[];
  searchQuery: string;
}

export interface AppState {
  entries: CareerEntry[];
  selectedEntries: string[];
  filters: FilterOptions;
  showQuickEntry: boolean;
  showResumeGenerator: boolean;
  showLinkedInOptimizer: boolean;
}

// LinkedIn Optimization Types
export interface LinkedInProfile {
  headline: string;
  summary: string;
  experience: LinkedInExperience[];
  skills: string[];
  currentRole?: string;
  industry?: string;
}

export interface LinkedInExperience {
  title: string;
  company: string;
  duration: string;
  description: string[];
  achievements: string[];
}

export interface LinkedInContentOptions {
  type: 'headline' | 'summary' | 'experience' | 'post' | 'skills';
  tone: 'professional' | 'casual' | 'thought-leader' | 'storytelling';
  length: 'concise' | 'detailed' | 'comprehensive';
  focus: 'technical' | 'leadership' | 'results' | 'learning';
  includeEmojis: boolean;
  includeHashtags: boolean;
}

export interface LinkedInPostTemplate {
  id: string;
  name: string;
  description: string;
  category: 'achievement' | 'learning' | 'insight' | 'story' | 'tips';
  template: string;
}

export interface OptimizationScore {
  overall: number;
  headline: number;
  summary: number;
  experience: number;
  skills: number;
  suggestions: OptimizationSuggestion[];
}

export interface OptimizationSuggestion {
  area: string;
  current: number;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

// User Profile & Position Management Types
export interface UserProfile {
  // Core Identity
  personal: {
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
    location?: string;
    timezone?: string;
    profileSummary?: string;
  };

  // Professional Information
  professional: {
    linkedInUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
    personalWebsite?: string;
    certifications: string[];
    languages: Array<{
      language: string;
      proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
    }>;
    education: Array<{
      institution: string;
      degree: string;
      field?: string;
      graduationYear?: string;
    }>;
  };

  // Career Preferences
  preferences: {
    careerGoals?: string;
    preferredWorkStyle?: 'remote' | 'hybrid' | 'onsite' | 'flexible';
    availableForOpportunities?: boolean;
    salaryRange?: {
      min?: number;
      max?: number;
      currency?: string;
    };
    preferredIndustries: string[];
    workValues: string[]; // e.g., 'work-life balance', 'innovation', 'growth'
  };

  // Current Position (Active)
  currentPosition: Position;

  // Career Timeline
  positionHistory: Position[];

  // Profile Metadata
  meta: {
    industry?: string;
    experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
    primarySkills: string[];
    lastUpdated: string;
    onboardingComplete: boolean;
    profileCompletionScore: number;
    profileVisibility?: 'public' | 'private' | 'connections';
  };
}

export interface Position {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  location?: string;
  department?: string;
  isActive: boolean;
  logs: string[]; // Associated activity log IDs
  achievements: string[]; // Generated achievement bullets
  skills: string[]; // Auto-extracted skills
  teamSize?: number;
  description?: string;
}

export interface DynamicVariables {
  // Personal
  '{NAME}': string;
  '{FULL_NAME}': string;

  // Current Role
  '{TITLE}': string;
  '{COMPANY}': string;
  '{ROLE_AT_COMPANY}': string;

  // Experience Context
  '{EXPERIENCE_LEVEL}': string;
  '{TENURE}': string;
  '{INDUSTRY}': string;

  // Dynamic Context
  '{RECENT_SKILLS}': string;
  '{TOP_SKILLS}': string;
  '{TEAM_SIZE}': string;
}

// Career Insights Types
export interface SkillInsight {
  skill: string;
  frequency: number;
  recency: number;
  rarity: 'unique' | 'rare' | 'common';
  trending: boolean;
  firstUsed: string;
  lastUsed: string;
  relatedEntries: string[];
  growthTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface AchievementInsight {
  entry: CareerEntry;
  impactScore: number;
  hasQuantifiableResults: boolean;
  impactKeywords: string[];
  category: 'high' | 'medium' | 'low';
  metrics: {
    numbers: string[];
    percentages: string[];
    timeframes: string[];
  };
}

export interface CareerTrend {
  period: string;
  activityCount: number;
  skillsLearned: string[];
  categoriesActive: string[];
  impactfulEntries: number;
  momentum: 'high' | 'medium' | 'low';
}

export interface QuickWin {
  type: 'underutilized_skill' | 'missing_documentation' | 'skill_gap' | 'impact_opportunity';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  relatedEntries?: string[];
  suggestedAction?: string;
}

export interface CareerInsights {
  uniqueSkills: SkillInsight[];
  keyAchievements: AchievementInsight[];
  careerTrends: CareerTrend[];
  quickWins: QuickWin[];
  recentHighlights: CareerEntry[];
  overallMomentum: 'accelerating' | 'steady' | 'declining';
  skillDiversityScore: number;
  impactConsistency: number;
}

// Simplified Insights for better UX
export interface SimplifiedInsights {
  // Key Highlights - most important info at a glance
  topSkills: string[];
  recentWins: string[];
  momentum: 'growing' | 'steady' | 'needs-attention';

  // Next Steps - actionable recommendations
  priorityActions: SimplifiedAction[];

  // Quick stats for header
  totalEntries: number;
  entriesThisMonth: number;
  uniqueSkillsCount: number;
}

export interface SimplifiedAction {
  id: string;
  title: string;
  description: string;
  type: 'skill' | 'documentation' | 'impact' | 'networking';
  priority: 'high' | 'medium';
  estimatedTime: string; // e.g., "5 minutes", "1 hour"
  relatedEntries?: string[];
}

export interface OnboardingStep {
  id: string;
  question: string;
  placeholder: string;
  type: 'text' | 'select' | 'date';
  options?: string[];
  required: boolean;
  validation?: (value: string) => string | null;
}