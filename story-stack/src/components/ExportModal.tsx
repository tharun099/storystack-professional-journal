import React, { useState, useEffect, useRef } from 'react';
import { X, Download, FileText, Database, File, Calendar, Filter, Info, Award, Lightbulb, Rocket, Users, BookOpen, Handshake } from 'lucide-react';
import { CareerEntry } from '../types';
import { CareerEntryExporter, CareerEntryExportOptions } from '../utils/careerEntryExport';
import { LoadingButton } from './ui/loading-button';
import { useModalScrollLock } from '../hooks/useScrollPosition';

interface ExportModalProps {
  entries: CareerEntry[];
  onClose: () => void;
  selectedEntries?: string[];
}

const exportFormats = [
  {
    id: 'csv',
    name: 'CSV',
    description: 'Spreadsheet format for Excel/Google Sheets',
    icon: Database,
    recommended: true
  },
  {
    id: 'json',
    name: 'JSON',
    description: 'Structured data format for developers',
    icon: FileText,
    recommended: false
  },
  {
    id: 'txt',
    name: 'Text',
    description: 'Plain text format for easy reading',
    icon: File,
    recommended: false
  },
  {
    id: 'pdf',
    name: 'PDF',
    description: 'Formatted document for sharing',
    icon: FileText,
    recommended: true
  }
] as const;

const categories = [
  { id: 'achievement', label: 'Achievement', icon: Award },
  { id: 'skill', label: 'Skill', icon: Lightbulb },
  { id: 'project', label: 'Project', icon: Rocket },
  { id: 'leadership', label: 'Leadership', icon: Users },
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'networking', label: 'Networking', icon: Handshake }
];

export function ExportModal({ entries, onClose, selectedEntries = [] }: ExportModalProps) {
  const [format, setFormat] = useState<'csv' | 'json' | 'txt' | 'pdf'>('csv');
  const [filename, setFilename] = useState('');
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [exportSelectedOnly, setExportSelectedOnly] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Get export statistics
  const stats = CareerEntryExporter.getExportStats(entries);
  
  // Calculate filtered entries count
  const getFilteredCount = () => {
    let filtered = entries;
    
    if (exportSelectedOnly && selectedEntries.length > 0) {
      filtered = entries.filter(entry => selectedEntries.includes(entry.id));
    }
    
    if (dateRange.start) {
      filtered = filtered.filter(entry => entry.date >= dateRange.start);
    }
    if (dateRange.end) {
      filtered = filtered.filter(entry => entry.date <= dateRange.end);
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(entry => selectedCategories.includes(entry.category));
    }
    
    return filtered.length;
  };

  // Set default filename based on format
  useEffect(() => {
    const timestamp = new Date().toISOString().split('T')[0];
    const prefix = exportSelectedOnly && selectedEntries.length > 0 ? 'selected-' : '';
    setFilename(`${prefix}career-logs-${timestamp}`);
  }, [format, exportSelectedOnly, selectedEntries.length]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isExporting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose, isExporting]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && !isExporting) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, isExporting]);

  // Prevent body scroll when modal is open while preserving scroll position
  useModalScrollLock();

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      const options: CareerEntryExportOptions = {
        format,
        filename,
        includeMetadata,
        dateRange: dateRange.start || dateRange.end ? dateRange : undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        selectedOnly: exportSelectedOnly
      };

      let entriesToExport = entries;
      if (exportSelectedOnly && selectedEntries.length > 0) {
        entriesToExport = entries.filter(entry => selectedEntries.includes(entry.id));
      }

      await CareerEntryExporter.exportEntries(entriesToExport, options);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const filteredCount = getFilteredCount();

  return (
    <div className="modal-container bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        ref={modalRef}
        className="card-elevated max-w-2xl w-full overflow-y-auto animate-scale-in"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card rounded-t-2xl border-b border-border p-6 z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Export Career Logs</h2>
              <p className="text-sm text-muted-foreground">Download your career entries in various formats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Statistics */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Info className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">Export Overview</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Entries:</span>
                <span className="ml-2 font-medium text-foreground">{stats.totalEntries}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Will Export:</span>
                <span className="ml-2 font-medium text-primary">{filteredCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Unique Skills:</span>
                <span className="ml-2 font-medium text-foreground">{stats.totalSkills}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Projects:</span>
                <span className="ml-2 font-medium text-foreground">{stats.totalProjects}</span>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              {exportFormats.map((formatOption) => (
                <button
                  key={formatOption.id}
                  onClick={() => setFormat(formatOption.id)}
                  className={`relative p-4 border rounded-lg text-left transition-all ${
                    format === formatOption.id
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                      : 'border-border hover:border-border/60 hover:bg-accent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <formatOption.icon className={`w-5 h-5 mt-0.5 ${
                      format === formatOption.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">{formatOption.name}</span>
                        {formatOption.recommended && (
                          <span className="px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-950/30 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{formatOption.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filename */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Filename</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              placeholder="Enter filename (without extension)"
            />
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Export Filters</h3>

            {/* Selected Entries Only */}
            {selectedEntries.length > 0 && (
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={exportSelectedOnly}
                  onChange={(e) => setExportSelectedOnly(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-ring focus:ring-2"
                />
                <span className="text-sm text-foreground">
                  Export only selected entries ({selectedEntries.length} selected)
                </span>
              </label>
            )}

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">From Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">To Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                        selectedCategories.includes(category.id)
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <IconComponent className="w-3 h-3 mr-1" />
                      {category.label}
                    </button>
                  );
                })}
              </div>
              {selectedCategories.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">All categories will be included</p>
              )}
            </div>

            {/* Include Metadata */}
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-ring focus:ring-2"
              />
              <span className="text-sm text-foreground">
                Include metadata (IDs, timestamps)
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="btn btn-secondary px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>

            <LoadingButton
              onClick={handleExport}
              loading={isExporting}
              disabled={filteredCount === 0 || !filename.trim()}
              className="btn btn-primary px-6 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? 'Exporting...' : `Export ${filteredCount} Entries`}
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}
