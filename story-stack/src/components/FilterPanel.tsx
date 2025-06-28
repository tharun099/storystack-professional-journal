import React, { useState } from 'react';
import { Search, Filter, X, Calendar, ChevronDown, ChevronUp, Clock, Star, Zap, Award, Lightbulb, Rocket, Users, BookOpen, Handshake } from 'lucide-react';
import { FilterOptions, CareerEntry } from '../types';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  allEntries: CareerEntry[];
}

const categories = [
  { id: 'achievement', label: 'Achievement', icon: Award, color: 'green' },
  { id: 'skill', label: 'Skill', icon: Lightbulb, color: 'blue' },
  { id: 'project', label: 'Project', icon: Rocket, color: 'purple' },
  { id: 'leadership', label: 'Leadership', icon: Users, color: 'orange' },
  { id: 'learning', label: 'Learning', icon: BookOpen, color: 'indigo' },
  { id: 'networking', label: 'Networking', icon: Handshake, color: 'pink' }
];

const filterPresets = [
  {
    id: 'recent',
    label: 'Recent (30 days)',
    icon: Clock,
    filters: () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return {
        dateRange: { start: thirtyDaysAgo.toISOString().split('T')[0], end: '' },
        tags: [],
        categories: [],
        projects: [],
        searchQuery: ''
      };
    }
  },
  {
    id: 'achievements',
    label: 'Achievements Only',
    icon: Star,
    filters: () => ({
      dateRange: { start: '', end: '' },
      tags: [],
      categories: ['achievement'],
      projects: [],
      searchQuery: ''
    })
  },
  {
    id: 'leadership',
    label: 'Leadership & Projects',
    icon: Zap,
    filters: () => ({
      dateRange: { start: '', end: '' },
      tags: [],
      categories: ['leadership', 'project'],
      projects: [],
      searchQuery: ''
    })
  }
];

// Filter Chip Component
function FilterChip({ label, onRemove, color = 'blue', icon }: { label: string; onRemove: () => void; color?: string; icon?: React.ComponentType<{ className?: string }> }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    pink: 'bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
      {icon && React.createElement(icon, { className: "w-3 h-3 mr-1" })}
      {label}
      <button
        onClick={onRemove}
        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none transition-colors"
      >
        <X size={10} />
      </button>
    </span>
  );
}

// Collapsible Section Component
function FilterSection({
  title,
  children,
  defaultExpanded = true,
  count
}: {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  count?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 text-left hover:bg-accent rounded-lg px-2 -mx-2 transition-colors"
      >
        <div className="flex items-center">
          <span className="text-sm font-medium text-foreground">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary bg-primary/10 rounded-full">
              {count}
            </span>
          )}
        </div>
        <div className="text-muted-foreground">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      {isExpanded && <div className="pb-3">{children}</div>}
    </div>
  );
}

export function FilterPanel({ filters, onFiltersChange, allEntries }: FilterPanelProps) {
  const allTags = Array.from(new Set(allEntries.flatMap(entry => entry.tags)));
  const allProjects = Array.from(new Set(allEntries.map(entry => entry.project).filter(Boolean)));

  const updateFilters = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { start: '', end: '' },
      tags: [],
      categories: [],
      projects: [],
      searchQuery: ''
    });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.categories.length > 0 ||
    filters.tags.length > 0 ||
    filters.projects.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end;

  const activeFilterCount =
    (filters.searchQuery ? 1 : 0) +
    filters.categories.length +
    filters.tags.length +
    filters.projects.length +
    (filters.dateRange.start ? 1 : 0) +
    (filters.dateRange.end ? 1 : 0);

  const applyPreset = (preset: typeof filterPresets[0]) => {
    onFiltersChange(preset.filters());
  };

  const removeFilter = (type: keyof FilterOptions, value: string) => {
    switch (type) {
      case 'categories':
        updateFilters('categories', filters.categories.filter(c => c !== value));
        break;
      case 'tags':
        updateFilters('tags', filters.tags.filter(t => t !== value));
        break;
      case 'projects':
        updateFilters('projects', filters.projects.filter(p => p !== value));
        break;
      case 'searchQuery':
        updateFilters('searchQuery', '');
        break;
    }
  };

  return (
    <div className="card-elevated overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-purple-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="w-5 h-5 mr-2 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-foreground bg-primary rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:text-primary/80 flex items-center font-medium transition-colors"
            >
              <X size={16} className="mr-1" />
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Quick Presets */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-foreground mb-3">Quick Filters</h4>
          <div className="grid grid-cols-1 gap-2">
            {filterPresets.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="btn btn-ghost flex items-center justify-start px-3 py-2 text-sm w-full"
                >
                  <Icon size={16} className="mr-2 text-muted-foreground" />
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {filters.searchQuery && (
                <FilterChip
                  label={`Search: "${filters.searchQuery}"`}
                  onRemove={() => removeFilter('searchQuery', '')}
                />
              )}
              {filters.categories.map((category) => {
                const categoryData = categories.find(c => c.id === category);
                const IconComponent = categoryData?.icon;
                return (
                  <FilterChip
                    key={category}
                    label={categoryData?.label || category}
                    onRemove={() => removeFilter('categories', category)}
                    color={categoryData?.color}
                    icon={IconComponent}
                  />
                );
              })}
              {filters.tags.map((tag) => (
                <FilterChip
                  key={tag}
                  label={`#${tag}`}
                  onRemove={() => removeFilter('tags', tag)}
                />
              ))}
              {filters.projects.map((project) => (
                <FilterChip
                  key={project}
                  label={project}
                  onRemove={() => removeFilter('projects', project)}
                  color="purple"
                />
              ))}
              {filters.dateRange.start && (
                <FilterChip
                  label={`From: ${filters.dateRange.start}`}
                  onRemove={() => updateFilters('dateRange', { ...filters.dateRange, start: '' })}
                  color="indigo"
                />
              )}
              {filters.dateRange.end && (
                <FilterChip
                  label={`To: ${filters.dateRange.end}`}
                  onRemove={() => updateFilters('dateRange', { ...filters.dateRange, end: '' })}
                  color="indigo"
                />
              )}
            </div>
          </div>
        )}

        {/* Filter Sections */}
        <div className="space-y-1">
          {/* Search */}
          <FilterSection title="Search" count={filters.searchQuery ? 1 : 0}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => updateFilters('searchQuery', e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200"
                placeholder="Search descriptions and impacts..."
              />
              {filters.searchQuery && (
                <button
                  onClick={() => updateFilters('searchQuery', '')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </FilterSection>

          {/* Date Range */}
          <FilterSection
            title="Date Range"
            count={(filters.dateRange.start ? 1 : 0) + (filters.dateRange.end ? 1 : 0)}
          >
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">From</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => updateFilters('dateRange', { ...filters.dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => updateFilters('dateRange', { ...filters.dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent text-sm transition-colors"
                />
              </div>
            </div>
          </FilterSection>

          {/* Categories */}
          <FilterSection title="Categories" count={filters.categories.length}>
            <div className="grid grid-cols-1 gap-2">
              {categories.map((category) => {
                const isSelected = filters.categories.includes(category.id);
                return (
                  <label
                    key={category.id}
                    className={`flex items-center p-2.5 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? `border-${category.color}-300 dark:border-${category.color}-700 bg-${category.color}-50 dark:bg-${category.color}-950/30`
                        : 'border-border hover:border-border/60 hover:bg-accent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...filters.categories, category.id]
                          : filters.categories.filter(c => c !== category.id);
                        updateFilters('categories', newCategories);
                      }}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-ring focus:ring-2"
                    />
                    <span className="ml-3 text-sm font-medium text-foreground flex items-center">
                      {React.createElement(category.icon, { className: "w-4 h-4 mr-2" })}
                      {category.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </FilterSection>

          {/* Tags */}
          {allTags.length > 0 && (
            <FilterSection title="Tags" count={filters.tags.length}>
              <div className="max-h-40 overflow-y-auto">
                <div className="grid grid-cols-1 gap-1.5">
                  {allTags.map((tag) => {
                    const isSelected = filters.tags.includes(tag);
                    return (
                      <label
                        key={tag}
                        className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-200 ${
                          isSelected
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newTags = e.target.checked
                              ? [...filters.tags, tag]
                              : filters.tags.filter(t => t !== tag);
                            updateFilters('tags', newTags);
                          }}
                          className="w-4 h-4 text-primary border-border rounded focus:ring-ring focus:ring-2"
                        />
                        <span className="ml-2 text-sm text-foreground font-medium">#{tag}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </FilterSection>
          )}

          {/* Projects */}
          {allProjects.length > 0 && (
            <FilterSection title="Projects" count={filters.projects.length}>
              <div className="max-h-40 overflow-y-auto">
                <div className="grid grid-cols-1 gap-1.5">
                  {allProjects.map((project) => {
                    const isSelected = filters.projects.includes(project);
                    return (
                      <label
                        key={project}
                        className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-200 ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newProjects = e.target.checked
                              ? [...filters.projects, project]
                              : filters.projects.filter(p => p !== project);
                            updateFilters('projects', newProjects);
                          }}
                          className="w-4 h-4 text-primary border-border rounded focus:ring-ring focus:ring-2"
                        />
                        <span className="ml-2 text-sm text-foreground font-medium">{project}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </FilterSection>
          )}
        </div>
      </div>
    </div>
  );
}