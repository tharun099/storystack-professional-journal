import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Copy, Download, FileText, CheckCircle, X, Settings, Wand2, AlertCircle, Search, Brain, Target, Rocket, Lightbulb } from 'lucide-react';
import { CareerEntry } from '../types';
import { GeminiService, ResumeGenerationOptions } from '../services/geminiService';
import { DocumentExporter } from '../utils/documentExport';
import { FullScreenLoading } from '@/components/ui/full-screen-loading';
import { LoadingButton } from '@/components/ui/loading-button';
import { useModalScrollLock } from '../hooks/useScrollPosition';

interface ResumeGeneratorProps {
  selectedEntries: CareerEntry[];
  onClose: () => void;
}

const GEMINI_API_KEY = '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';

export function ResumeGenerator({ selectedEntries, onClose }: ResumeGeneratorProps) {
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Generation options
  const [targetRole, setTargetRole] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [format, setFormat] = useState<'standard' | 'star' | 'linkedin' | 'metrics'>('standard');
  const [tone, setTone] = useState<'professional' | 'dynamic' | 'technical' | 'executive'>('professional');
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [categorized, setCategorized] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const geminiService = new GeminiService(GEMINI_API_KEY);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

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

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const options: ResumeGenerationOptions = {
        targetRole: targetRole.trim() || undefined,
        customPrompt: customPrompt.trim() || undefined,
        format,
        tone,
        includeMetrics,
        categorized
      };

      const content = await geminiService.generateResume(selectedEntries, options);
      setGeneratedContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownload = async (exportFormat: 'txt' | 'docx' | 'pdf') => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const rolePrefix = targetRole ? `${targetRole.replace(/\s+/g, '-').toLowerCase()}-` : '';
      const filename = `${rolePrefix}resume-content-${timestamp}`;

      await DocumentExporter.exportDocument({
        format: exportFormat,
        filename,
        content: generatedContent,
        metadata: {
          title: targetRole ? `Resume Content - ${targetRole}` : 'Resume Content',
          author: 'StoryStack',
          subject: 'Professional Resume Content'
        }
      });
    } catch (err) {
      console.error('Export failed:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  if (selectedEntries.length === 0) {
    return (
      <div className="modal-container bg-black/50 backdrop-blur-sm animate-fade-in">
        <div
          ref={modalRef}
          className="card-elevated p-8 max-w-2xl text-center animate-scale-in"
        >
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">AI Resume Generator</h2>
          <p className="text-muted-foreground mb-6">
            Select entries from your timeline to generate professional resume content using AI.
          </p>
          <button
            onClick={onClose}
            className="btn btn-secondary px-6 py-3"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Full-screen loading overlay */}
      <FullScreenLoading
        isVisible={isGenerating}
        title="AI Resume Generator"
        subtitle="Crafting professional content from your activities"
        messages={[
          { text: "Analyzing your career achievements…", icon: Search },
          { text: "Applying AI-powered language optimization…", icon: Brain },
          { text: "Crafting compelling bullet points…", icon: FileText },
          { text: "Tailoring content for your target role…", icon: Target },
          { text: "Generating professional resume content…", icon: Rocket },
          { text: "Optimizing for ATS compatibility…", icon: Lightbulb },
          { text: "Fine-tuning language and tone…", icon: Settings },
          { text: "Ensuring consistency and impact…", icon: Search }
        ]}
      />

      <div className="modal-container bg-black/50 backdrop-blur-sm animate-fade-in">
        <div
          ref={modalRef}
          className="card-elevated w-full max-w-7xl overflow-hidden flex flex-col animate-scale-in"
        >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground flex items-center">
            <Wand2 className="w-6 h-6 mr-2 text-primary" />
            AI Resume Generator
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
            {/* Configuration Panel */}
            <div className="xl:col-span-1 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Selected Entries ({selectedEntries.length})
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedEntries.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-xs font-medium text-foreground line-clamp-1">
                        {entry.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.category} • {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {selectedEntries.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{selectedEntries.length - 3} more entries
                    </p>
                  )}
                </div>
              </div>

              {/* Target Role */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Target Role (Optional)
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent text-sm transition-colors"
                  placeholder="e.g., Senior Software Engineer, Product Manager"
                />
              </div>

              {/* Custom Prompt */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent text-sm resize-none transition-colors"
                  rows={3}
                  placeholder="e.g., Focus on leadership experience, emphasize technical skills, highlight remote work capabilities..."
                />
              </div>

              {/* Advanced Options Toggle */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <Settings size={16} className="mr-1" />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </button>
              </div>

              {/* Advanced Options */}
              {showAdvanced && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Format</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as any)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring text-sm transition-colors"
                    >
                      <option value="standard">Standard Bullets</option>
                      <option value="star">STAR Method</option>
                      <option value="linkedin">LinkedIn Style</option>
                      <option value="metrics">Metrics-Focused</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value as any)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring text-sm transition-colors"
                    >
                      <option value="professional">Professional</option>
                      <option value="dynamic">Dynamic</option>
                      <option value="technical">Technical</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={includeMetrics}
                        onChange={(e) => setIncludeMetrics(e.target.checked)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-ring focus:ring-2 mr-2"
                      />
                      Emphasize metrics and quantifiable results
                    </label>
                    <label className="flex items-center text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={categorized}
                        onChange={(e) => setCategorized(e.target.checked)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-ring focus:ring-2 mr-2"
                      />
                      Organize by categories
                    </label>
                  </div>
                </div>
              )}

              <LoadingButton
                onClick={handleGenerate}
                isLoading={isGenerating}
                loadingText="Generating with AI..."
                loadingSize="lg"
                icon={Sparkles}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Generate Resume
              </LoadingButton>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start space-x-2">
                  <AlertCircle size={16} className="text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>

            {/* Generated Content */}
            <div className="xl:col-span-2 space-y-4 flex flex-col h-full">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">AI-Generated Resume Content</h3>
                {generatedContent && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied ? <CheckCircle size={20} className="text-green-600" /> : <Copy size={20} />}
                    </button>
                    <div className="relative group">
                      <button className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors">
                        <Download size={20} />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-large opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <div className="p-2 space-y-1 min-w-[120px]">
                          <button
                            onClick={() => handleDownload('txt')}
                            className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent rounded"
                          >
                            Download TXT
                          </button>
                          <button
                            onClick={() => handleDownload('docx')}
                            className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent rounded"
                          >
                            Download DOCX
                          </button>
                          <button
                            onClick={() => handleDownload('pdf')}
                            className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent rounded"
                          >
                            Download PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 border border-border rounded-lg p-4 bg-muted/20 overflow-y-auto min-h-0">
                {generatedContent ? (
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {generatedContent}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/60" />
                      <p className="mb-2">AI-powered resume generation</p>
                      <p className="text-sm">Configure your preferences and click "Generate Resume" to create professional content</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}