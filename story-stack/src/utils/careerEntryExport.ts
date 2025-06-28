import { CareerEntry } from '../types';
import { DocumentExporter } from './documentExport';

export interface CareerEntryExportOptions {
  format: 'csv' | 'json' | 'txt' | 'pdf';
  filename?: string;
  includeMetadata?: boolean;
  dateRange?: {
    start?: string;
    end?: string;
  };
  categories?: string[];
  selectedOnly?: boolean;
}

export class CareerEntryExporter {
  static async exportEntries(
    entries: CareerEntry[],
    options: CareerEntryExportOptions
  ): Promise<void> {
    const { format, filename, includeMetadata = true } = options;
    
    // Filter entries based on options
    const filteredEntries = this.filterEntries(entries, options);
    
    if (filteredEntries.length === 0) {
      throw new Error('No entries match the export criteria');
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `career-logs-${timestamp}`;
    const exportFilename = filename || defaultFilename;

    switch (format) {
      case 'csv':
        this.exportAsCSV(filteredEntries, exportFilename, includeMetadata);
        break;
      case 'json':
        this.exportAsJSON(filteredEntries, exportFilename, includeMetadata);
        break;
      case 'txt':
        await this.exportAsText(filteredEntries, exportFilename, includeMetadata);
        break;
      case 'pdf':
        await this.exportAsPDF(filteredEntries, exportFilename, includeMetadata);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private static filterEntries(
    entries: CareerEntry[],
    options: CareerEntryExportOptions
  ): CareerEntry[] {
    let filtered = [...entries];

    // Filter by date range
    if (options.dateRange?.start) {
      filtered = filtered.filter(entry => entry.date >= options.dateRange!.start!);
    }
    if (options.dateRange?.end) {
      filtered = filtered.filter(entry => entry.date <= options.dateRange!.end!);
    }

    // Filter by categories
    if (options.categories && options.categories.length > 0) {
      filtered = filtered.filter(entry => options.categories!.includes(entry.category));
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return filtered;
  }

  private static exportAsCSV(
    entries: CareerEntry[],
    filename: string,
    includeMetadata: boolean
  ): void {
    const headers = [
      'Date',
      'Category',
      'Description',
      'Impact',
      'Skills',
      'Tags',
      'Project',
      ...(includeMetadata ? ['Created At', 'Updated At', 'ID'] : [])
    ];

    const csvContent = [
      headers.join(','),
      ...entries.map(entry => [
        `"${entry.date}"`,
        `"${entry.category}"`,
        `"${this.escapeCsvField(entry.description)}"`,
        `"${this.escapeCsvField(entry.impact)}"`,
        `"${entry.skills.join('; ')}"`,
        `"${entry.tags.join('; ')}"`,
        `"${entry.project || ''}"`,
        ...(includeMetadata ? [
          `"${entry.createdAt}"`,
          `"${entry.updatedAt}"`,
          `"${entry.id}"`
        ] : [])
      ].join(','))
    ].join('\n');

    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  }

  private static exportAsJSON(
    entries: CareerEntry[],
    filename: string,
    includeMetadata: boolean
  ): void {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalEntries: entries.length,
      entries: includeMetadata 
        ? entries 
        : entries.map(({ id, createdAt, updatedAt, ...entry }) => entry)
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
  }

  private static async exportAsText(
    entries: CareerEntry[],
    filename: string,
    includeMetadata: boolean
  ): Promise<void> {
    let content = `Career Activity Log Export\n`;
    content += `Generated: ${new Date().toLocaleDateString()}\n`;
    content += `Total Entries: ${entries.length}\n`;
    content += `\n${'='.repeat(50)}\n\n`;

    entries.forEach((entry, index) => {
      content += `Entry ${index + 1}\n`;
      content += `Date: ${new Date(entry.date).toLocaleDateString()}\n`;
      content += `Category: ${entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}\n`;
      content += `Project: ${entry.project || 'N/A'}\n\n`;
      
      content += `Description:\n${entry.description}\n\n`;
      
      if (entry.impact) {
        content += `Impact:\n${entry.impact}\n\n`;
      }
      
      if (entry.skills.length > 0) {
        content += `Skills: ${entry.skills.join(', ')}\n`;
      }
      
      if (entry.tags.length > 0) {
        content += `Tags: ${entry.tags.map(tag => `#${tag}`).join(', ')}\n`;
      }
      
      if (includeMetadata) {
        content += `\nMetadata:\n`;
        content += `  ID: ${entry.id}\n`;
        content += `  Created: ${new Date(entry.createdAt).toLocaleString()}\n`;
        content += `  Updated: ${new Date(entry.updatedAt).toLocaleString()}\n`;
      }
      
      content += `\n${'-'.repeat(30)}\n\n`;
    });

    await DocumentExporter.exportDocument({
      format: 'txt',
      filename,
      content,
      metadata: {
        title: 'Career Activity Log',
        author: 'StoryStack',
        subject: 'Professional Career Entries Export'
      }
    });
  }

  private static async exportAsPDF(
    entries: CareerEntry[],
    filename: string,
    includeMetadata: boolean
  ): Promise<void> {
    let content = `Career Activity Log Export\n`;
    content += `Generated: ${new Date().toLocaleDateString()}\n`;
    content += `Total Entries: ${entries.length}\n\n`;

    // Group entries by category for better organization
    const entriesByCategory = entries.reduce((acc, entry) => {
      if (!acc[entry.category]) {
        acc[entry.category] = [];
      }
      acc[entry.category].push(entry);
      return acc;
    }, {} as Record<string, CareerEntry[]>);

    Object.entries(entriesByCategory).forEach(([category, categoryEntries]) => {
      content += `${category.toUpperCase()} (${categoryEntries.length} entries):\n\n`;
      
      categoryEntries.forEach((entry, index) => {
        content += `${index + 1}. ${new Date(entry.date).toLocaleDateString()}\n`;
        content += `   ${entry.description}\n`;
        
        if (entry.impact) {
          content += `   Impact: ${entry.impact}\n`;
        }
        
        if (entry.project) {
          content += `   Project: ${entry.project}\n`;
        }
        
        if (entry.skills.length > 0) {
          content += `   Skills: ${entry.skills.join(', ')}\n`;
        }
        
        content += `\n`;
      });
      
      content += `\n`;
    });

    await DocumentExporter.exportDocument({
      format: 'pdf',
      filename,
      content,
      metadata: {
        title: 'Career Activity Log',
        author: 'StoryStack',
        subject: 'Professional Career Entries Export'
      }
    });
  }

  private static escapeCsvField(field: string): string {
    return field.replace(/"/g, '""');
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Utility method to get export statistics
  static getExportStats(entries: CareerEntry[]): {
    totalEntries: number;
    categoryCounts: Record<string, number>;
    dateRange: { earliest: string; latest: string } | null;
    totalSkills: number;
    totalProjects: number;
  } {
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        categoryCounts: {},
        dateRange: null,
        totalSkills: 0,
        totalProjects: 0
      };
    }

    const categoryCounts = entries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dates = entries.map(entry => entry.date).sort();
    const dateRange = {
      earliest: dates[0],
      latest: dates[dates.length - 1]
    };

    const uniqueSkills = new Set(entries.flatMap(entry => entry.skills));
    const uniqueProjects = new Set(entries.map(entry => entry.project).filter(Boolean));

    return {
      totalEntries: entries.length,
      categoryCounts,
      dateRange,
      totalSkills: uniqueSkills.size,
      totalProjects: uniqueProjects.size
    };
  }
}
