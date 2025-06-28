import { Position, CareerEntry, UserProfile, DynamicVariables } from '../types';

export class PositionManager {
  /**
   * Detect if a log entry indicates a position change
   */
  static detectPositionChange(logContent: string): boolean {
    const changeIndicators = [
      'new job', 'starting at', 'joined', 'new role', 'new position',
      'promotion', 'promoted to', 'moved to', 'now working at',
      'accepted offer', 'first day at', 'starting my new role',
      'excited to announce', 'pleased to share', 'happy to join'
    ];
    
    const content = logContent.toLowerCase();
    return changeIndicators.some(indicator => content.includes(indicator));
  }

  /**
   * Extract potential company/role information from log content
   */
  static extractPositionInfo(logContent: string): { company?: string; title?: string } {
    const content = logContent.toLowerCase();
    const result: { company?: string; title?: string } = {};

    // Common patterns for company extraction
    const companyPatterns = [
      /(?:joined|starting at|working at|new job at)\s+([a-zA-Z0-9\s&.,'-]+?)(?:\s+as|\s+in|\.|$)/i,
      /(?:at|@)\s+([a-zA-Z0-9\s&.,'-]+?)(?:\s+as|\s+in|\.|$)/i
    ];

    // Common patterns for title extraction
    const titlePatterns = [
      /(?:as|as a|as an)\s+([\w\s]+?)(?:\s+at|\s+in|\.|$)/i,
      /(?:promoted to|new role as|position as)\s+([\w\s]+?)(?:\s+at|\s+in|\.|$)/i
    ];

    for (const pattern of companyPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        result.company = match[1].trim();
        break;
      }
    }

    for (const pattern of titlePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        result.title = match[1].trim();
        break;
      }
    }

    return result;
  }

  /**
   * Associate career entries with positions based on date ranges
   */
  static associateEntriesWithPositions(
    entries: CareerEntry[], 
    positions: Position[]
  ): { [positionId: string]: CareerEntry[] } {
    const associations: { [positionId: string]: CareerEntry[] } = {};
    
    // Initialize associations
    positions.forEach(pos => {
      associations[pos.id] = [];
    });

    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      
      // Find the position that was active during this entry's date
      const activePosition = positions.find(pos => {
        const startDate = new Date(pos.startDate);
        const endDate = pos.endDate ? new Date(pos.endDate) : new Date();
        
        return entryDate >= startDate && entryDate <= endDate;
      });

      if (activePosition) {
        associations[activePosition.id].push(entry);
      }
    });

    return associations;
  }

  /**
   * Extract skills from career entries for a position
   */
  static extractSkillsFromEntries(entries: CareerEntry[]): string[] {
    const skillSet = new Set<string>();
    
    entries.forEach(entry => {
      entry.skills.forEach(skill => skillSet.add(skill));
    });

    return Array.from(skillSet);
  }

  /**
   * Generate achievements from career entries
   */
  static generateAchievements(entries: CareerEntry[]): string[] {
    return entries
      .filter(entry => entry.impact && entry.impact.trim().length > 0)
      .map(entry => {
        const description = entry.description;
        const impact = entry.impact;
        
        // Create achievement bullet point
        if (impact.toLowerCase().includes('increased') || 
            impact.toLowerCase().includes('improved') || 
            impact.toLowerCase().includes('reduced')) {
          return `${description} - ${impact}`;
        } else {
          return `${description}, resulting in ${impact}`;
        }
      })
      .slice(0, 10); // Limit to top 10 achievements
  }

  /**
   * Update position with associated data from entries
   */
  static updatePositionWithEntryData(
    position: Position, 
    entries: CareerEntry[]
  ): Position {
    const associatedEntries = entries.filter(entry => 
      entry.associatedPosition === position.id
    );

    return {
      ...position,
      logs: associatedEntries.map(entry => entry.id),
      skills: this.extractSkillsFromEntries(associatedEntries),
      achievements: this.generateAchievements(associatedEntries)
    };
  }

  /**
   * Infer industry from company name
   */
  static inferIndustry(company: string): string {
    const companyLower = company.toLowerCase();
    
    const industryKeywords = {
      'Technology': ['tech', 'software', 'digital', 'app', 'platform', 'data', 'ai', 'ml', 'cloud', 'cyber', 'dev'],
      'Finance': ['bank', 'finance', 'capital', 'investment', 'trading', 'credit', 'loan', 'insurance'],
      'Healthcare': ['health', 'medical', 'pharma', 'bio', 'care', 'hospital', 'clinic', 'drug'],
      'Education': ['education', 'school', 'university', 'college', 'learning', 'academic'],
      'Retail': ['retail', 'store', 'shop', 'commerce', 'marketplace', 'fashion'],
      'Manufacturing': ['manufacturing', 'factory', 'production', 'industrial', 'automotive'],
      'Consulting': ['consulting', 'advisory', 'strategy', 'management'],
      'Media': ['media', 'news', 'entertainment', 'publishing', 'broadcast'],
      'Real Estate': ['real estate', 'property', 'construction', 'development'],
      'Non-profit': ['non-profit', 'nonprofit', 'foundation', 'charity', 'ngo']
    };

    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => companyLower.includes(keyword))) {
        return industry;
      }
    }

    return 'Other';
  }

  /**
   * Calculate experience level based on position history
   */
  static calculateExperienceLevel(positions: Position[]): 'entry' | 'mid' | 'senior' | 'executive' {
    const totalMonths = positions.reduce((total, pos) => {
      const start = new Date(pos.startDate);
      const end = pos.endDate ? new Date(pos.endDate) : new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      return total + Math.max(0, months);
    }, 0);

    const years = totalMonths / 12;

    if (years < 2) return 'entry';
    if (years < 5) return 'mid';
    if (years < 10) return 'senior';
    return 'executive';
  }

  /**
   * Generate dynamic variables for content generation
   */
  static generateDynamicVariables(profile: UserProfile): DynamicVariables {
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

    return {
      '{NAME}': profile.personal.firstName,
      '{FULL_NAME}': `${profile.personal.firstName} ${profile.personal.lastName || ''}`.trim(),
      '{TITLE}': profile.currentPosition.title,
      '{COMPANY}': profile.currentPosition.company,
      '{ROLE_AT_COMPANY}': `${profile.currentPosition.title} at ${profile.currentPosition.company}`,
      '{EXPERIENCE_LEVEL}': profile.meta.experienceLevel || 'experienced',
      '{TENURE}': calculateTenure(profile.currentPosition.startDate),
      '{INDUSTRY}': profile.meta.industry || this.inferIndustry(profile.currentPosition.company),
      '{RECENT_SKILLS}': profile.meta.primarySkills.slice(0, 3).join(', '),
      '{TOP_SKILLS}': profile.meta.primarySkills.slice(0, 5).join(', '),
      '{TEAM_SIZE}': profile.currentPosition.teamSize ? `team of ${profile.currentPosition.teamSize}` : ''
    };
  }

  /**
   * Apply dynamic variables to content template
   */
  static applyDynamicVariables(template: string, variables: DynamicVariables): string {
    let result = template;
    
    Object.entries(variables).forEach(([variable, value]) => {
      if (value) {
        result = result.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
      }
    });

    return result;
  }

  /**
   * Suggest profile improvements based on completion score
   */
  static getProfileSuggestions(profile: UserProfile): Array<{
    type: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    action: string;
  }> {
    const suggestions = [];
    const score = profile.meta.profileCompletionScore;

    if (!profile.currentPosition.startDate) {
      suggestions.push({
        type: 'startDate',
        message: 'Add your start date for better timeline tracking',
        priority: 'high' as const,
        action: 'Add start date'
      });
    }

    if (!profile.personal.lastName) {
      suggestions.push({
        type: 'lastName',
        message: 'Add your last name for professional content',
        priority: 'medium' as const,
        action: 'Add last name'
      });
    }

    if (!profile.currentPosition.location) {
      suggestions.push({
        type: 'location',
        message: 'Add your location for networking opportunities',
        priority: 'medium' as const,
        action: 'Add location'
      });
    }

    if (!profile.meta.industry) {
      suggestions.push({
        type: 'industry',
        message: 'Specify your industry for better content targeting',
        priority: 'medium' as const,
        action: 'Set industry'
      });
    }

    if (!profile.currentPosition.teamSize) {
      suggestions.push({
        type: 'teamSize',
        message: 'Add team size for leadership context',
        priority: 'low' as const,
        action: 'Add team size'
      });
    }

    return suggestions;
  }
}
