interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export interface ResumeGenerationOptions {
  targetRole?: string;
  customPrompt?: string;
  format: 'standard' | 'star' | 'linkedin' | 'metrics';
  tone: 'professional' | 'dynamic' | 'technical' | 'executive';
  includeMetrics: boolean;
  categorized: boolean;
}

export class GeminiService {
  private apiKey: string;
  private baseUrl: string;
  private isOpenRouter: boolean;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Detect if this is an OpenRouter API key
    this.isOpenRouter = apiKey.startsWith('sk-or-');
    this.baseUrl = this.isOpenRouter
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  async generateResume(entries: any[], options: ResumeGenerationOptions): Promise<string> {
    const prompt = this.buildPrompt(entries, options);

    try {
      if (this.isOpenRouter) {
        return await this.generateWithOpenRouter(prompt);
      } else {
        return await this.generateWithGemini(prompt);
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      throw new Error('Failed to generate resume. Please try again.');
    }
  }

  private async generateWithOpenRouter(prompt: string): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'StoryStack'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 2048,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response generated from OpenRouter API');
    }

    return data.choices[0].message.content;
  }

  private async generateWithGemini(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  }

  private buildPrompt(entries: any[], options: ResumeGenerationOptions): string {
    const { targetRole, customPrompt, format, tone, includeMetrics, categorized } = options;

    let basePrompt = `You are a professional resume writer and career coach. Generate compelling resume content based on the following career activities.

CONTEXT:
${targetRole ? `Target Role: ${targetRole}` : 'General professional resume'}
${customPrompt ? `Additional Instructions: ${customPrompt}` : ''}

TONE: ${tone}
FORMAT: ${format}
${includeMetrics ? 'EMPHASIS: Include quantifiable metrics and results wherever possible' : ''}
${categorized ? 'ORGANIZATION: Group by relevant categories' : 'ORGANIZATION: Chronological list'}

CAREER ACTIVITIES:
${entries.map((entry, index) => `
${index + 1}. ${entry.description}
   Date: ${entry.date}
   Category: ${entry.category}
   Impact: ${entry.impact || 'Not specified'}
   Skills: ${entry.skills.join(', ') || 'None specified'}
   Project: ${entry.project || 'Not specified'}
   Tags: ${entry.tags.join(', ') || 'None'}
`).join('\n')}

INSTRUCTIONS:
1. Transform each activity into professional resume bullet points
2. Use action verbs and quantify achievements where possible
3. Tailor language to the ${targetRole || 'professional'} role
4. Ensure consistency in formatting and tone
5. Highlight transferable skills and measurable outcomes
6. Remove redundancy and focus on most impactful achievements
${format === 'star' ? '7. Use STAR method (Situation, Task, Action, Result) format' : ''}
${format === 'linkedin' ? '7. Make content engaging for LinkedIn profile format' : ''}
${format === 'metrics' ? '7. Emphasize numerical results and quantifiable impacts' : ''}

Generate professional, ATS-friendly resume content that showcases the candidate's value proposition.`;

    return basePrompt;
  }
}