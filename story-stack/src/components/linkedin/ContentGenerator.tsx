import React, { useState } from 'react';
import { FileText, MessageSquare, TrendingUp, Lightbulb, Copy, CheckCircle, Wand2, Hash } from 'lucide-react';
import { CareerEntry, LinkedInContentOptions, LinkedInPostTemplate } from '../../types';
import { LinkedInService } from '../../services/linkedinService';
import { LoadingButton } from '../ui/loading-button';
import { ContentPreview } from '../ui/content-preview';

interface ContentGeneratorProps {
  entries: CareerEntry[];
  linkedinService: LinkedInService;
}

export function ContentGenerator({ entries, linkedinService }: ContentGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [copiedContent, setCopiedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generation options
  const [tone, setTone] = useState<'professional' | 'casual' | 'thought-leader' | 'storytelling'>('professional');
  const [length, setLength] = useState<'concise' | 'detailed' | 'comprehensive'>('detailed');
  const [focus, setFocus] = useState<'technical' | 'leadership' | 'results' | 'learning'>('results');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');

  const postTemplates = linkedinService.getPostTemplates();

  const contentTypes = [
    {
      id: 'achievement',
      name: 'Achievement Post',
      icon: TrendingUp,
      description: 'Share recent wins and accomplishments',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'learning',
      name: 'Learning Share',
      icon: Lightbulb,
      description: 'Share insights from recent learning',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'story',
      name: 'Professional Story',
      icon: MessageSquare,
      description: 'Tell compelling professional narratives',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'custom',
      name: 'Custom Content',
      icon: FileText,
      description: 'Generate content with custom instructions',
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  const handleGenerate = async () => {
    if (entries.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedContent('');

    try {
      const options: LinkedInContentOptions & { customPrompt?: string } = {
        type: 'post',
        tone,
        length,
        focus,
        includeEmojis,
        includeHashtags,
        customPrompt: customPrompt.trim() || undefined
      };

      const content = await linkedinService.generateContent(entries, options);
      setGeneratedContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateGenerate = async (template: LinkedInPostTemplate) => {
    if (entries.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedContent('');

    try {
      const templatePrompt = `Use this template structure to create a LinkedIn post:

${template.template}

Fill in the template with relevant information from the provided career activities. Make it engaging and authentic.`;

      const options: LinkedInContentOptions & { customPrompt?: string } = {
        type: 'post',
        tone,
        length,
        focus,
        includeEmojis,
        includeHashtags,
        customPrompt: templatePrompt
      };

      const content = await linkedinService.generateContent(entries, options);
      setGeneratedContent(content);
      setSelectedTemplate(template.id);
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

  return (
    <div className="h-full flex">
      {/* Left Panel - Configuration */}
      <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Content Type Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Type</h3>
            <div className="grid grid-cols-1 gap-3">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      if (type.id === 'custom') {
                        setSelectedTemplate('custom');
                      } else {
                        const template = postTemplates.find(t => t.category === type.id);
                        if (template) {
                          handleTemplateGenerate(template);
                        }
                      }
                    }}
                    className={`p-4 rounded-lg border text-left transition-all hover:border-gray-300 ${
                      selectedTemplate === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{type.name}</div>
                        <div className="text-sm text-gray-600">{type.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Prompt */}
          {selectedTemplate === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Instructions
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe what kind of LinkedIn post you want to create..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          )}

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

              <div className="space-y-3">
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

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeHashtags"
                    checked={includeHashtags}
                    onChange={(e) => setIncludeHashtags(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="includeHashtags" className="ml-2 text-sm text-gray-700">
                    Include relevant hashtags
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          {selectedTemplate === 'custom' && (
            <LoadingButton
              onClick={handleGenerate}
              isLoading={isGenerating}
              loadingText="Generating..."
              icon={Wand2}
              className="w-full"
              disabled={entries.length === 0 || !customPrompt.trim()}
            >
              Generate Custom Content
            </LoadingButton>
          )}

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
              <h2 className="text-xl font-semibold text-gray-900">LinkedIn Post Content</h2>
              <p className="text-gray-600">Engaging content ready for LinkedIn</p>
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
              type="post"
              onCopy={handleCopy}
              isCopied={copiedContent === generatedContent}
            />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Create</h3>
              <p className="text-gray-600 mb-4">
                Choose a content type above to generate engaging LinkedIn posts
              </p>
              <p className="text-sm text-gray-500">
                Your career activities will be transformed into compelling social content
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
