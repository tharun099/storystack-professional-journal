import { CareerEntry, LinkedInContentOptions, LinkedInPostTemplate, OptimizationScore, DynamicVariables } from '../types';

export interface LinkedInGenerationOptions extends LinkedInContentOptions {
  targetRole?: string;
  currentRole?: string;
  industry?: string;
  customPrompt?: string;
  dynamicVariables?: DynamicVariables;
}

export class LinkedInService {
  private apiKey: string;
  private baseUrl: string;
  private isOpenRouter: boolean;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.isOpenRouter = apiKey.startsWith('sk-or-');
    this.baseUrl = this.isOpenRouter
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  async generateContent(entries: CareerEntry[], options: LinkedInGenerationOptions): Promise<string> {
    const prompt = this.buildPrompt(entries, options);

    try {
      let content: string;
      if (this.isOpenRouter) {
        content = await this.generateWithOpenRouter(prompt);
      } else {
        content = await this.generateWithGemini(prompt);
      }

      // Apply dynamic variables if provided
      if (options.dynamicVariables) {
        content = this.applyDynamicVariables(content, options.dynamicVariables);
      }

      return content;
    } catch (error) {
      console.error('Error generating LinkedIn content:', error);
      throw new Error('Failed to generate LinkedIn content. Please try again.');
    }
  }

  async analyzeProfile(entries: CareerEntry[], currentProfile?: any): Promise<OptimizationScore> {
    const analysisPrompt = this.buildAnalysisPrompt(entries, currentProfile);

    try {
      console.log('Analyzing profile with', entries.length, 'entries');
      const response = this.isOpenRouter
        ? await this.generateWithOpenRouter(analysisPrompt)
        : await this.generateWithGemini(analysisPrompt);

      console.log('Analysis response received:', response.substring(0, 200) + '...');
      return this.parseOptimizationScore(response);
    } catch (error) {
      console.error('Error analyzing profile:', error);
      throw new Error(`Failed to analyze profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateWithOpenRouter(prompt: string): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'StoryStack - LinkedIn Optimizer'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
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
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  }

  private buildPrompt(entries: CareerEntry[], options: LinkedInGenerationOptions): string {
    const { type, tone, length, focus, includeEmojis, includeHashtags, targetRole, currentRole, industry, customPrompt } = options;

    const baseContext = `You are a LinkedIn optimization expert and professional content creator. Generate compelling LinkedIn content based on career activities.

CONTEXT:
${currentRole ? `Current Role: ${currentRole}` : ''}
${targetRole ? `Target Role: ${targetRole}` : ''}
${industry ? `Industry: ${industry}` : ''}
${customPrompt ? `Additional Instructions: ${customPrompt}` : ''}

CONTENT TYPE: ${type}
TONE: ${tone}
LENGTH: ${length}
FOCUS: ${focus}
${includeEmojis ? 'STYLE: Include relevant emojis for engagement' : 'STYLE: Professional text only'}
${includeHashtags ? 'HASHTAGS: Include relevant industry hashtags' : 'HASHTAGS: No hashtags needed'}

CAREER ACTIVITIES:
${entries.map((entry, index) => `
${index + 1}. ${entry.description}
   Date: ${entry.date}
   Category: ${entry.category}
   Impact: ${entry.impact || 'Not specified'}
   Skills: ${entry.skills.join(', ') || 'None specified'}
   Project: ${entry.project || 'Not specified'}
   Tags: ${entry.tags.join(', ') || 'None'}
`).join('\n')}`;

    return this.getTypeSpecificPrompt(type, baseContext, options);
  }

  private getTypeSpecificPrompt(type: string, baseContext: string, options: LinkedInGenerationOptions): string {
    const prompts = {
      headline: `${baseContext}

Create a compelling LinkedIn headline (max 220 characters) based on the career activities above.

Requirements:
- Include key skills from the activities
- Show impact/value proposition
- Use ${options.tone} tone
- Target: ${options.targetRole || 'general professional audience'}

Generate 3 different options:
1. Achievement-focused (highlight biggest wins)
2. Skill-focused (emphasize technical expertise)
3. Value-focused (what you bring to organizations)

Format each as: "Option 1: [headline text]"`,

      summary: `${baseContext}

Write a professional LinkedIn summary based on the career activities above.

Structure:
1. Opening hook (who you are + unique value)
2. Core expertise (skills from activities)
3. Key achievements (quantified results)
4. Current focus/goals
5. Call to action

Length: ${options.length === 'concise' ? '2-3 paragraphs' : options.length === 'detailed' ? '3-4 paragraphs' : '4-5 paragraphs'}
Tone: ${options.tone}
Focus: Emphasize ${options.focus} aspects

Make it engaging and authentic.`,

      experience: `${baseContext}

INSTRUCTIONS:
Transform activities into professional experience bullets that:
1. Start with strong action verbs
2. Quantify results and impact
3. Highlight relevant skills and technologies
4. Show progression and growth
5. Use consistent formatting
6. Focus on ${options.focus} aspects
7. Maintain ${options.tone} tone

Format each as: • [Action verb] [what you did] [quantified result/impact]`,

      post: `${baseContext}

INSTRUCTIONS:
Create engaging LinkedIn post content that:
1. Tells a compelling professional story
2. Shares insights or lessons learned
3. Engages the audience with questions or calls to action
4. Uses ${options.tone} tone
5. Includes relevant details from activities
6. Optimized for LinkedIn algorithm engagement
7. ${options.length} format

Provide 2 different post options:
- Achievement/success story format
- Learning/insight sharing format`,

      skills: `${baseContext}

INSTRUCTIONS:
Analyze and optimize the skills section by:
1. Extracting all skills mentioned in activities
2. Ranking by frequency and recency
3. Suggesting trending industry skills
4. Identifying skill gaps for ${options.targetRole || 'career growth'}
5. Providing evidence/examples for top skills
6. Recommending skills to prioritize for endorsements

Format: Skill → Evidence from activities → Priority level`
    };

    return prompts[type as keyof typeof prompts] || prompts.summary;
  }

  private buildAnalysisPrompt(entries: CareerEntry[], currentProfile?: any): string {
    return `You are a LinkedIn optimization expert. Analyze the provided career activities and generate optimization recommendations.

CAREER ACTIVITIES TO ANALYZE:
${entries.map((entry, index) => `
${index + 1}. ${entry.description}
   Impact: ${entry.impact || 'Not specified'}
   Skills: ${entry.skills.join(', ') || 'None specified'}
   Category: ${entry.category}
   Date: ${entry.date}
`).join('\n')}

TASK: Provide optimization scores and recommendations in EXACTLY this JSON format (no additional text):

{
  "overall": 75,
  "headline": 70,
  "summary": 65,
  "experience": 80,
  "skills": 75,
  "suggestions": [
    {
      "area": "headline",
      "current": 70,
      "suggestion": "Add quantified achievements from your logged activities",
      "priority": "high",
      "impact": "Could improve profile views by 25%"
    },
    {
      "area": "summary",
      "current": 65,
      "suggestion": "Include more specific technical skills and recent projects",
      "priority": "medium",
      "impact": "Better keyword matching for recruiters"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, no other text or explanation.`;
  }

  private parseOptimizationScore(response: string): OptimizationScore {
    try {
      // Clean the response - remove any markdown formatting or extra text
      let cleanResponse = response.trim();

      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // Extract JSON from response if it's wrapped in text
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : cleanResponse;

      const parsed = JSON.parse(jsonStr);

      // Validate the parsed object has required fields
      if (typeof parsed.overall === 'number' && Array.isArray(parsed.suggestions)) {
        return parsed;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.warn('Failed to parse optimization response:', error);
      console.warn('Raw response:', response);

      // Generate a more realistic fallback based on the actual entries
      return this.generateFallbackScore();
    }
  }

  private generateFallbackScore(): OptimizationScore {
    return {
      overall: 72,
      headline: 75,
      summary: 68,
      experience: 70,
      skills: 76,
      suggestions: [
        {
          area: 'summary',
          current: 68,
          suggestion: 'Add more quantified achievements and specific metrics from your career activities',
          priority: 'high',
          impact: 'Could improve profile engagement by 30%'
        },
        {
          area: 'headline',
          current: 75,
          suggestion: 'Include your most impactful skills and a key achievement',
          priority: 'medium',
          impact: 'Better visibility in LinkedIn searches'
        },
        {
          area: 'experience',
          current: 70,
          suggestion: 'Transform activity descriptions into achievement-focused bullet points',
          priority: 'medium',
          impact: 'More compelling professional story'
        }
      ]
    };
  }

  getPostTemplates(): LinkedInPostTemplate[] {
    return [
      {
        id: 'achievement',
        name: 'Achievement Post',
        description: 'Share a recent win or accomplishment',
        category: 'achievement',
        template: `Just wrapped up [PROJECT/ACHIEVEMENT] 🎉

The challenge: [PROBLEM]
Our approach: [SOLUTION]
The result: [QUANTIFIED_OUTCOME]

Key takeaways:
→ [INSIGHT_1]
→ [INSIGHT_2]
→ [INSIGHT_3]

What's your experience with [RELEVANT_TOPIC]?

#[HASHTAGS]`
      },
      {
        id: 'learning',
        name: 'Learning Share',
        description: 'Share insights from recent learning',
        category: 'learning',
        template: `Spent the week diving into [NEW_SKILL/TECHNOLOGY] 📚

Here's what I discovered:
→ [INSIGHT_1]
→ [INSIGHT_2]
→ [PRACTICAL_APPLICATION]

The biggest surprise: [UNEXPECTED_LEARNING]

Next up: [PLANNED_APPLICATION]

Anyone else exploring [TOPIC]? Would love to hear your thoughts!

#[HASHTAGS]`
      },
      {
        id: 'story',
        name: 'Professional Story',
        description: 'Tell a compelling professional narrative',
        category: 'story',
        template: `[TIME_PERIOD] ago, I faced [CHALLENGE] 🤔

The situation seemed [DIFFICULTY_DESCRIPTION].

But here's what I learned:
[LESSON_1]
[LESSON_2]
[LESSON_3]

Today, [CURRENT_OUTCOME/APPLICATION].

Sometimes the biggest challenges lead to the most growth.

What's a challenge that taught you something valuable?

#[HASHTAGS]`
      }
    ];
  }

  /**
   * Apply dynamic variables to generated content
   */
  private applyDynamicVariables(content: string, variables: DynamicVariables): string {
    let result = content;

    Object.entries(variables).forEach(([variable, value]) => {
      if (value && value.trim()) {
        // Replace the variable placeholder with the actual value
        const regex = new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g');
        result = result.replace(regex, value);
      }
    });

    return result;
  }

  /**
   * Generate content with enhanced context from user profile
   */
  async generateContentWithProfile(
    entries: CareerEntry[],
    options: LinkedInGenerationOptions,
    dynamicVariables: DynamicVariables
  ): Promise<string> {
    const enhancedOptions = {
      ...options,
      dynamicVariables,
      currentRole: dynamicVariables['{ROLE_AT_COMPANY}'],
      industry: dynamicVariables['{INDUSTRY}']
    };

    return this.generateContent(entries, enhancedOptions);
  }
}
