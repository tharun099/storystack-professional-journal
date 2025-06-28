import { CareerEntry, ResumeFormat } from '../types';

export const resumeFormats: ResumeFormat[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Clean, professional bullet points',
    template: (entry: CareerEntry) => 
      `• ${entry.description}${entry.impact ? ` - ${entry.impact}` : ''}`
  },
  {
    id: 'star',
    name: 'STAR Method',
    description: 'Situation, Task, Action, Result format',
    template: (entry: CareerEntry) => {
      const situation = entry.project ? `In ${entry.project}` : 'In my role';
      const task = entry.description;
      const result = entry.impact || 'achieved positive outcome';
      return `• ${situation}, ${task.toLowerCase()}, resulting in ${result}`;
    }
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Engaging format for social profiles',
    template: (entry: CareerEntry) =>
      `• ${entry.description}${entry.impact ? ` | Impact: ${entry.impact}` : ''}${entry.skills.length ? ` | Skills: ${entry.skills.slice(0, 3).join(', ')}` : ''}`
  },
  {
    id: 'metrics',
    name: 'Metrics-Focused',
    description: 'Emphasizes quantifiable results',
    template: (entry: CareerEntry) => {
      const metrics = entry.impact.match(/\d+(%|\w+)?/g);
      const metricsText = metrics ? ` (${metrics.join(', ')})` : '';
      return `• ${entry.description}${metricsText}${entry.impact && !metrics ? ` - ${entry.impact}` : ''}`;
    }
  }
];

export function generateResumeContent(entries: CareerEntry[], format: ResumeFormat): string {
  return entries.map(entry => format.template(entry)).join('\n');
}

export function categorizeEntries(entries: CareerEntry[]) {
  const categories = {
    'Technical Skills': entries.filter(e => e.category === 'skill' || e.tags.some(t => 
      ['frontend', 'backend', 'database', 'devops', 'testing'].includes(t.toLowerCase()))),
    'Leadership & Management': entries.filter(e => e.category === 'leadership'),
    'Project Achievements': entries.filter(e => e.category === 'project' || e.category === 'achievement'),
    'Professional Development': entries.filter(e => e.category === 'learning'),
    'Networking & Collaboration': entries.filter(e => e.category === 'networking')
  };

  return Object.entries(categories).filter(([, entries]) => entries.length > 0);
}