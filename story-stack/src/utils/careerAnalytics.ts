import { CareerEntry, SkillInsight, AchievementInsight, CareerTrend, QuickWin, CareerInsights, SimplifiedInsights, SimplifiedAction } from '../types';

export class CareerAnalytics {
  /**
   * Analyze skills to identify unique, rare, and trending skills
   */
  static analyzeSkills(entries: CareerEntry[]): SkillInsight[] {
    if (entries.length === 0) return [];

    const skillMap = new Map<string, {
      count: number;
      dates: string[];
      entryIds: string[];
      firstUsed: string;
      lastUsed: string;
    }>();

    // Collect skill data
    entries.forEach(entry => {
      entry.skills.forEach(skill => {
        const normalizedSkill = skill.trim();
        if (!skillMap.has(normalizedSkill)) {
          skillMap.set(normalizedSkill, {
            count: 0,
            dates: [],
            entryIds: [],
            firstUsed: entry.date,
            lastUsed: entry.date
          });
        }
        const skillData = skillMap.get(normalizedSkill)!;
        skillData.count++;
        skillData.dates.push(entry.date);
        skillData.entryIds.push(entry.id);
        
        // Update first/last used dates
        if (new Date(entry.date) < new Date(skillData.firstUsed)) {
          skillData.firstUsed = entry.date;
        }
        if (new Date(entry.date) > new Date(skillData.lastUsed)) {
          skillData.lastUsed = entry.date;
        }
      });
    });

    const now = new Date();
    const totalSkills = skillMap.size;
    
    // Define trending skills (this could be enhanced with external data)
    const trendingSkills = [
      'AI', 'Machine Learning', 'React', 'TypeScript', 'Python', 'Cloud', 
      'DevOps', 'Kubernetes', 'GraphQL', 'Next.js', 'Rust', 'Go'
    ];

    return Array.from(skillMap.entries()).map(([skill, data]) => {
      // Calculate recency score (0-100)
      const daysSinceLastUsed = Math.floor((now.getTime() - new Date(data.lastUsed).getTime()) / (1000 * 60 * 60 * 24));
      const recencyScore = Math.max(0, 100 - daysSinceLastUsed);

      // Determine rarity based on frequency relative to total entries
      const usageRatio = data.count / entries.length;
      let rarity: 'unique' | 'rare' | 'common';
      if (usageRatio <= 0.1) rarity = 'unique';
      else if (usageRatio <= 0.3) rarity = 'rare';
      else rarity = 'common';

      // Check if trending
      const trending = trendingSkills.some(ts => 
        skill.toLowerCase().includes(ts.toLowerCase()) || 
        ts.toLowerCase().includes(skill.toLowerCase())
      );

      // Calculate growth trend
      const sortedDates = data.dates.sort();
      const midPoint = Math.floor(sortedDates.length / 2);
      const firstHalf = sortedDates.slice(0, midPoint);
      const secondHalf = sortedDates.slice(midPoint);
      
      let growthTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
      if (secondHalf.length > firstHalf.length) growthTrend = 'increasing';
      else if (firstHalf.length > secondHalf.length && data.count > 2) growthTrend = 'decreasing';

      return {
        skill,
        frequency: data.count,
        recency: recencyScore,
        rarity,
        trending,
        firstUsed: data.firstUsed,
        lastUsed: data.lastUsed,
        relatedEntries: data.entryIds,
        growthTrend
      };
    }).sort((a, b) => {
      // Sort by rarity first, then by frequency
      const rarityOrder = { unique: 3, rare: 2, common: 1 };
      if (rarityOrder[a.rarity] !== rarityOrder[b.rarity]) {
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      }
      return b.frequency - a.frequency;
    });
  }

  /**
   * Analyze achievements to identify high-impact entries
   */
  static analyzeAchievements(entries: CareerEntry[]): AchievementInsight[] {
    const impactKeywords = [
      'increased', 'decreased', 'improved', 'reduced', 'achieved', 'delivered',
      'saved', 'generated', 'optimized', 'streamlined', 'accelerated', 'enhanced'
    ];

    const quantifiablePatterns = [
      /\d+%/g,           // Percentages
      /\$[\d,]+/g,       // Money
      /\d+[kKmMbB]/g,    // Numbers with k/m/b suffixes
      /\d+\s*(hours?|days?|weeks?|months?|years?)/gi, // Time periods
      /\d+\s*(users?|customers?|clients?)/gi,         // People counts
    ];

    return entries
      .filter(entry => entry.impact && entry.impact.trim())
      .map(entry => {
        const impact = entry.impact.toLowerCase();
        const description = entry.description.toLowerCase();
        
        // Calculate impact score based on keywords
        const keywordMatches = impactKeywords.filter(keyword => 
          impact.includes(keyword) || description.includes(keyword)
        );
        
        // Extract quantifiable metrics
        const metrics = {
          numbers: [] as string[],
          percentages: [] as string[],
          timeframes: [] as string[]
        };

        quantifiablePatterns.forEach(pattern => {
          const matches = (entry.impact + ' ' + entry.description).match(pattern) || [];
          matches.forEach(match => {
            if (match.includes('%')) {
              metrics.percentages.push(match);
            } else if (match.match(/hours?|days?|weeks?|months?|years?/i)) {
              metrics.timeframes.push(match);
            } else {
              metrics.numbers.push(match);
            }
          });
        });

        const hasQuantifiableResults = Object.values(metrics).some(arr => arr.length > 0);
        
        // Calculate impact score (0-100)
        let impactScore = keywordMatches.length * 10;
        if (hasQuantifiableResults) impactScore += 30;
        if (metrics.percentages.length > 0) impactScore += 20;
        if (entry.category === 'achievement') impactScore += 15;
        
        impactScore = Math.min(100, impactScore);

        // Categorize impact level
        let category: 'high' | 'medium' | 'low';
        if (impactScore >= 70) category = 'high';
        else if (impactScore >= 40) category = 'medium';
        else category = 'low';

        return {
          entry,
          impactScore,
          hasQuantifiableResults,
          impactKeywords: keywordMatches,
          category,
          metrics
        };
      })
      .sort((a, b) => b.impactScore - a.impactScore);
  }

  /**
   * Analyze career trends over time
   */
  static analyzeCareerTrends(entries: CareerEntry[]): CareerTrend[] {
    if (entries.length === 0) return [];

    // Group entries by month
    const monthlyData = new Map<string, CareerEntry[]>();
    
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, []);
      }
      monthlyData.get(monthKey)!.push(entry);
    });

    return Array.from(monthlyData.entries())
      .map(([period, periodEntries]) => {
        const skillsLearned = [...new Set(periodEntries.flatMap(e => e.skills))];
        const categoriesActive = [...new Set(periodEntries.map(e => e.category))];
        const impactfulEntries = periodEntries.filter(e => e.impact && e.impact.trim()).length;
        
        // Calculate momentum based on activity and impact
        let momentum: 'high' | 'medium' | 'low' = 'low';
        const activityScore = periodEntries.length;
        const impactRatio = impactfulEntries / periodEntries.length;
        
        if (activityScore >= 5 && impactRatio >= 0.6) momentum = 'high';
        else if (activityScore >= 3 && impactRatio >= 0.4) momentum = 'medium';

        return {
          period,
          activityCount: periodEntries.length,
          skillsLearned,
          categoriesActive,
          impactfulEntries,
          momentum
        };
      })
      .sort((a, b) => b.period.localeCompare(a.period))
      .slice(0, 12); // Last 12 months
  }

  /**
   * Generate comprehensive career insights
   */
  static generateInsights(entries: CareerEntry[]): CareerInsights {
    const uniqueSkills = this.analyzeSkills(entries);
    const keyAchievements = this.analyzeAchievements(entries);
    const careerTrends = this.analyzeCareerTrends(entries);
    const quickWins = this.generateQuickWins(entries, uniqueSkills, keyAchievements);
    
    // Get recent highlights (last 30 days with high impact)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentHighlights = entries
      .filter(entry => new Date(entry.date) >= thirtyDaysAgo)
      .filter(entry => entry.impact && entry.impact.trim())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Calculate overall metrics
    const skillDiversityScore = Math.min(100, uniqueSkills.length * 2);
    const impactConsistency = entries.length > 0 
      ? (entries.filter(e => e.impact && e.impact.trim()).length / entries.length) * 100 
      : 0;

    // Determine overall momentum
    const recentTrends = careerTrends.slice(0, 3);
    const highMomentumMonths = recentTrends.filter(t => t.momentum === 'high').length;
    let overallMomentum: 'accelerating' | 'steady' | 'declining' = 'steady';
    
    if (highMomentumMonths >= 2) overallMomentum = 'accelerating';
    else if (recentTrends.every(t => t.momentum === 'low')) overallMomentum = 'declining';

    return {
      uniqueSkills: uniqueSkills.slice(0, 10), // Top 10 unique skills
      keyAchievements: keyAchievements.slice(0, 8), // Top 8 achievements
      careerTrends,
      quickWins,
      recentHighlights,
      overallMomentum,
      skillDiversityScore,
      impactConsistency
    };
  }

  /**
   * Generate quick wins and opportunities
   */
  private static generateQuickWins(
    entries: CareerEntry[], 
    skills: SkillInsight[], 
    achievements: AchievementInsight[]
  ): QuickWin[] {
    const quickWins: QuickWin[] = [];

    // Underutilized skills (skills used only once or twice)
    const underutilizedSkills = skills.filter(s => s.frequency <= 2 && s.rarity === 'unique');
    if (underutilizedSkills.length > 0) {
      quickWins.push({
        type: 'underutilized_skill',
        title: `Showcase ${underutilizedSkills.length} Unique Skills`,
        description: `You have ${underutilizedSkills.length} unique skills that could be highlighted more: ${underutilizedSkills.slice(0, 3).map(s => s.skill).join(', ')}`,
        priority: 'medium',
        actionable: true,
        suggestedAction: 'Create more entries showcasing these skills or add them to existing projects'
      });
    }

    // Missing impact documentation
    const entriesWithoutImpact = entries.filter(e => !e.impact || !e.impact.trim());
    if (entriesWithoutImpact.length > 0) {
      quickWins.push({
        type: 'missing_documentation',
        title: `Document Impact for ${entriesWithoutImpact.length} Entries`,
        description: `${entriesWithoutImpact.length} entries are missing impact statements. Adding these could significantly boost your profile.`,
        priority: 'high',
        actionable: true,
        relatedEntries: entriesWithoutImpact.slice(0, 5).map(e => e.id),
        suggestedAction: 'Add quantifiable impact statements to these entries'
      });
    }

    // Skill gaps (trending skills not in portfolio)
    const currentSkills = skills.map(s => s.skill.toLowerCase());
    const trendingSkillsNotUsed = [
      'AI', 'Machine Learning', 'Cloud Computing', 'DevOps', 'TypeScript'
    ].filter(skill => !currentSkills.some(cs => cs.includes(skill.toLowerCase())));
    
    if (trendingSkillsNotUsed.length > 0) {
      quickWins.push({
        type: 'skill_gap',
        title: `Consider Learning Trending Skills`,
        description: `Industry-trending skills you might want to explore: ${trendingSkillsNotUsed.slice(0, 3).join(', ')}`,
        priority: 'low',
        actionable: true,
        suggestedAction: 'Consider projects or learning opportunities in these areas'
      });
    }

    return quickWins.slice(0, 5); // Limit to top 5 quick wins
  }

  /**
   * Generate simplified insights focused on actionability and clarity
   */
  static generateSimplifiedInsights(entries: CareerEntry[]): SimplifiedInsights {
    if (entries.length === 0) {
      return {
        topSkills: [],
        recentWins: [],
        momentum: 'needs-attention',
        priorityActions: [],
        totalEntries: 0,
        entriesThisMonth: 0,
        uniqueSkillsCount: 0
      };
    }

    // Get basic stats
    const totalEntries = entries.length;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const entriesThisMonth = entries.filter(entry => new Date(entry.date) >= thirtyDaysAgo).length;

    // Get top skills (most frequently used)
    const skillFrequency = new Map<string, number>();
    entries.forEach(entry => {
      entry.skills.forEach(skill => {
        skillFrequency.set(skill, (skillFrequency.get(skill) || 0) + 1);
      });
    });

    const topSkills = Array.from(skillFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill);

    const uniqueSkillsCount = skillFrequency.size;

    // Get recent wins (entries with impact from last 60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const recentWins = entries
      .filter(entry => new Date(entry.date) >= sixtyDaysAgo && entry.impact && entry.impact.trim())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .map(entry => entry.description.length > 80 ? entry.description.substring(0, 80) + '...' : entry.description);

    // Determine momentum based on recent activity
    const momentum = this.calculateSimplifiedMomentum(entries);

    // Generate priority actions
    const priorityActions = this.generatePriorityActions(entries, skillFrequency);

    return {
      topSkills,
      recentWins,
      momentum,
      priorityActions,
      totalEntries,
      entriesThisMonth,
      uniqueSkillsCount
    };
  }

  /**
   * Calculate simplified momentum indicator
   */
  private static calculateSimplifiedMomentum(entries: CareerEntry[]): 'growing' | 'steady' | 'needs-attention' {
    if (entries.length < 3) return 'needs-attention';

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentEntries = entries.filter(entry => new Date(entry.date) >= thirtyDaysAgo).length;
    const previousEntries = entries.filter(entry => {
      const date = new Date(entry.date);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;

    const recentImpactEntries = entries.filter(entry =>
      new Date(entry.date) >= thirtyDaysAgo && entry.impact && entry.impact.trim()
    ).length;

    // Growing: more recent activity and good impact documentation
    if (recentEntries > previousEntries && recentImpactEntries >= Math.max(1, recentEntries * 0.3)) {
      return 'growing';
    }

    // Needs attention: very low activity or no impact documentation
    if (recentEntries < 2 || recentImpactEntries === 0) {
      return 'needs-attention';
    }

    return 'steady';
  }

  /**
   * Generate actionable priority recommendations
   */
  private static generatePriorityActions(entries: CareerEntry[], skillFrequency: Map<string, number>): SimplifiedAction[] {
    const actions: SimplifiedAction[] = [];

    // Check for missing impact statements
    const entriesWithoutImpact = entries.filter(entry => !entry.impact || !entry.impact.trim()).length;
    if (entriesWithoutImpact > 0) {
      actions.push({
        id: 'add-impact',
        title: 'Add impact statements',
        description: `${entriesWithoutImpact} entries could benefit from impact descriptions`,
        type: 'impact',
        priority: 'high',
        estimatedTime: '10 minutes',
        relatedEntries: entries.filter(entry => !entry.impact || !entry.impact.trim()).slice(0, 3).map(e => e.id)
      });
    }

    // Check for skill documentation opportunities
    const recentSkills = new Set<string>();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    entries
      .filter(entry => new Date(entry.date) >= thirtyDaysAgo)
      .forEach(entry => entry.skills.forEach(skill => recentSkills.add(skill)));

    if (recentSkills.size < 3) {
      actions.push({
        id: 'document-skills',
        title: 'Document more skills',
        description: 'Add specific technologies and tools you\'ve been using',
        type: 'skill',
        priority: 'medium',
        estimatedTime: '5 minutes'
      });
    }

    // Check for recent activity
    const recentEntries = entries.filter(entry => new Date(entry.date) >= thirtyDaysAgo).length;
    if (recentEntries < 3) {
      actions.push({
        id: 'log-activities',
        title: 'Log recent activities',
        description: 'Keep your career timeline up to date with recent work',
        type: 'documentation',
        priority: 'high',
        estimatedTime: '15 minutes'
      });
    }

    // Networking opportunity
    const networkingEntries = entries.filter(entry => entry.category === 'networking').length;
    if (networkingEntries < Math.max(1, entries.length * 0.1)) {
      actions.push({
        id: 'networking',
        title: 'Document networking activities',
        description: 'Track meetings, conferences, and professional connections',
        type: 'networking',
        priority: 'medium',
        estimatedTime: '5 minutes'
      });
    }

    return actions.slice(0, 4); // Limit to top 4 actions
  }
}
