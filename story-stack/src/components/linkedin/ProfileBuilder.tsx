import React, { useState } from 'react';
import { User, FileText, Briefcase, Copy, CheckCircle, Settings, Wand2 } from 'lucide-react';
import { CareerEntry, LinkedInContentOptions, DynamicVariables } from '../../types';
import { LinkedInService } from '../../services/linkedinService';
import { LoadingButton } from '../ui/loading-button';
import { ContentPreview } from '../ui/content-preview';

interface ProfileBuilderProps {
  entries: CareerEntry[];
  linkedinService: LinkedInService;
  dynamicVariables?: DynamicVariables;
}

type ProfileSection = 'headline' | 'summary' | 'experience';

export function ProfileBuilder({ entries, linkedinService, dynamicVariables }: ProfileBuilderProps) {
  const [activeSection, setActiveSection] = useState<ProfileSection>('headline');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [copiedContent, setCopiedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generation options - Initialize with dynamic variables if available
  const [targetRole, setTargetRole] = useState('');
  const [currentRole, setCurrentRole] = useState(dynamicVariables?.['{ROLE_AT_COMPANY}'] || '');
  const [industry, setIndustry] = useState(dynamicVariables?.['{INDUSTRY}'] || '');
  const [tone, setTone] = useState<'professional' | 'casual' | 'thought-leader' | 'storytelling'>('professional');
  const [length, setLength] = useState<'concise' | 'detailed' | 'comprehensive'>('detailed');
  const [focus, setFocus] = useState<'technical' | 'leadership' | 'results' | 'learning'>('results');
  const [includeEmojis, setIncludeEmojis] = useState(false);

  const sections = [
    {
      id: 'headline' as ProfileSection,
      name: 'Professional Headline',
      icon: User,
      description: 'Compelling 220-character headline',
      placeholder: 'Generate a headline that captures your unique value proposition...'
    },
    {
      id: 'summary' as ProfileSection,
      name: 'Professional Summary',
      icon: FileText,
      description: 'Comprehensive profile summary',
      placeholder: 'Create a summary that tells your professional story...'
    },
    {
      id: 'experience' as ProfileSection,
      name: 'Experience Bullets',
      icon: Briefcase,
      description: 'Achievement-focused experience descriptions',
      placeholder: 'Transform your activities into professional experience bullets...'
    }
  ];

  const handleGenerate = async () => {
    if (entries.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedContent('');

    try {
      const options: LinkedInContentOptions & {
        targetRole?: string;
        currentRole?: string;
        industry?: string;
        dynamicVariables?: DynamicVariables;
      } = {
        type: activeSection,
        tone,
        length,
        focus,
        includeEmojis,
        includeHashtags: false,
        targetRole: targetRole.trim() || undefined,
        currentRole: currentRole.trim() || undefined,
        industry: industry.trim() || undefined,
        dynamicVariables
      };

      const content = await linkedinService.generateContent(entries, options);
      setGeneratedContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
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

  const currentSection = sections.find(s => s.id === activeSection)!;

  return (
    <div className="h-full flex">
      {/* Left Panel - Configuration */}
      <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Section Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Section</h3>
            <div className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      activeSection === section.id
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${activeSection === section.id ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div>
                        <div className="font-medium">{section.name}</div>
                        <div className="text-sm text-gray-500">{section.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Context</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Role
                </label>
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="e.g., Senior Frontend Developer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Role (Optional)
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Engineering Manager"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., Technology, Healthcare"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Style Options */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Style Options</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="thought-leader">Thought Leader</option>
                  <option value="storytelling">Storytelling</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Focus</label>
                <select
                  value={focus}
                  onChange={(e) => setFocus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="results">Results & Impact</option>
                  <option value="technical">Technical Skills</option>
                  <option value="leadership">Leadership</option>
                  <option value="learning">Learning & Growth</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeEmojis"
                  checked={includeEmojis}
                  onChange={(e) => setIncludeEmojis(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="includeEmojis" className="ml-2 text-sm text-gray-700">
                  Include emojis for engagement
                </label>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <LoadingButton
            onClick={handleGenerate}
            isLoading={isGenerating}
            loadingText="Generating..."
            icon={Wand2}
            className="w-full"
            disabled={entries.length === 0}
          >
            Generate {currentSection.name}
          </LoadingButton>

          {entries.length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              Select career entries to generate content
            </p>
          )}
        </div>
      </div>

      {/* Right Panel - Generated Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{currentSection.name}</h2>
              <p className="text-gray-600">{currentSection.description}</p>
            </div>
            {generatedContent && (
              <button
                onClick={() => handleCopy(generatedContent)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {generatedContent ? (
            <ContentPreview
              content={generatedContent}
              type={activeSection}
              onCopy={handleCopy}
              isCopied={copiedContent === generatedContent}
            />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <currentSection.icon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
              <p className="text-gray-600 mb-4">{currentSection.placeholder}</p>
              <p className="text-sm text-gray-500">
                Configure your options and click "Generate" to create optimized LinkedIn content
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
