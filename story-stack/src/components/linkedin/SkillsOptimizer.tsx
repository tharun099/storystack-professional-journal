import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Star, Award, BarChart3, Wand2, Copy, CheckCircle } from 'lucide-react';
import { CareerEntry } from '../../types';
import { LinkedInService } from '../../services/linkedinService';
import { LoadingButton } from '../ui/loading-button';

interface SkillsOptimizerProps {
  entries: CareerEntry[];
  linkedinService: LinkedInService;
}

interface SkillAnalysis {
  skill: string;
  frequency: number;
  recency: number;
  evidence: string[];
  priority: 'high' | 'medium' | 'low';
  trending: boolean;
}

export function SkillsOptimizer({ entries, linkedinService }: SkillsOptimizerProps) {
  const [skillsAnalysis, setSkillsAnalysis] = useState<SkillAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [copiedContent, setCopiedContent] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyzeSkills();
  }, [entries]);

  const analyzeSkills = () => {
    if (entries.length === 0) return;

    // Extract and analyze skills from entries
    const skillMap = new Map<string, { count: number; dates: string[]; evidence: string[] }>();
    
    entries.forEach(entry => {
      entry.skills.forEach(skill => {
        const normalizedSkill = skill.trim();
        if (!skillMap.has(normalizedSkill)) {
          skillMap.set(normalizedSkill, { count: 0, dates: [], evidence: [] });
        }
        const skillData = skillMap.get(normalizedSkill)!;
        skillData.count++;
        skillData.dates.push(entry.date);
        skillData.evidence.push(`${entry.description} (${entry.date})`);
      });
    });

    // Calculate recency score (more recent = higher score)
    const now = new Date();
    const analysis: SkillAnalysis[] = Array.from(skillMap.entries()).map(([skill, data]) => {
      const mostRecentDate = new Date(Math.max(...data.dates.map(d => new Date(d).getTime())));
      const daysSinceRecent = Math.floor((now.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
      const recencyScore = Math.max(0, 100 - daysSinceRecent);

      // Determine priority based on frequency and recency
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (data.count >= 3 && recencyScore > 60) priority = 'high';
      else if (data.count >= 2 || recencyScore > 30) priority = 'medium';

      // Mock trending data (in real app, this would come from LinkedIn API or industry data)
      const trendingSkills = ['React', 'TypeScript', 'AI', 'Machine Learning', 'Cloud', 'DevOps', 'Python', 'Node.js'];
      const trending = trendingSkills.some(ts => skill.toLowerCase().includes(ts.toLowerCase()));

      return {
        skill,
        frequency: data.count,
        recency: recencyScore,
        evidence: data.evidence.slice(0, 3), // Top 3 examples
        priority,
        trending
      };
    });

    // Sort by priority and frequency
    analysis.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.frequency - a.frequency;
    });

    setSkillsAnalysis(analysis);
  };

  const handleGenerateSkillsContent = async () => {
    if (entries.length === 0) return;

    setIsAnalyzing(true);
    setError(null);
    setGeneratedContent('');

    try {
      const options = {
        type: 'skills' as const,
        tone: 'professional' as const,
        length: 'detailed' as const,
        focus: 'technical' as const,
        includeEmojis: false,
        includeHashtags: false,
        targetRole: targetRole.trim() || undefined
      };

      const content = await linkedinService.generateContent(entries, options);
      setGeneratedContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate skills content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedContent(content);
      setTimeout(() => setCopiedContent(null), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const topSkills = skillsAnalysis.slice(0, 10);
  const trendingSkills = skillsAnalysis.filter(s => s.trending);
  const highPrioritySkills = skillsAnalysis.filter(s => s.priority === 'high');

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills Optimization</h2>
          <p className="text-gray-600">
            Analyze and optimize your skills based on {entries.length} career activities
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{skillsAnalysis.length}</div>
                <div className="text-blue-700">Total Skills</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <Star className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">{highPrioritySkills.length}</div>
                <div className="text-green-700">High Priority</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900">{trendingSkills.length}</div>
                <div className="text-purple-700">Trending</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-900">
                  {Math.round(skillsAnalysis.reduce((acc, s) => acc + s.recency, 0) / skillsAnalysis.length || 0)}
                </div>
                <div className="text-orange-700">Avg Recency</div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Skills */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills by Usage</h3>
            <div className="space-y-3">
              {topSkills.map((skill, index) => (
                <div key={skill.skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 flex items-center space-x-2">
                        <span>{skill.skill}</span>
                        {skill.trending && (
                          <TrendingUp className="w-4 h-4 text-green-500" title="Trending skill" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Used {skill.frequency} times • Recency: {skill.recency}%
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(skill.priority)}`}>
                    {skill.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Recommendations */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Skills Optimization</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Target role..."
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <LoadingButton
                  onClick={handleGenerateSkillsContent}
                  isLoading={isAnalyzing}
                  loadingText="Analyzing..."
                  icon={Wand2}
                  size="sm"
                  disabled={entries.length === 0}
                >
                  Optimize
                </LoadingButton>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {generatedContent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Optimization Recommendations</h4>
                  <button
                    onClick={() => handleCopy(generatedContent)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {copiedContent === generatedContent ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {generatedContent}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 text-sm">
                  Generate personalized skills optimization recommendations
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Trending Skills */}
        {trendingSkills.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span>Your Trending Skills</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingSkills.map((skill) => (
                <div key={skill.skill} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900">{skill.skill}</h4>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Trending
                    </span>
                  </div>
                  <div className="text-sm text-green-700 mb-2">
                    Used {skill.frequency} times • {skill.recency}% recent
                  </div>
                  <div className="text-xs text-green-600">
                    Latest: {skill.evidence[0]?.split('(')[0].trim().substring(0, 50)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
