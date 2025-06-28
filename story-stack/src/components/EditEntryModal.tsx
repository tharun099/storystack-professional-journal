import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Calendar, Target, Hash, Tag, Award, Lightbulb, Rocket, Users, BookOpen, Handshake } from 'lucide-react';
import { CareerEntry } from '../types';
import { LoadingButton } from './ui/loading-button';
import { useModalScrollLock } from '../hooks/useScrollPosition';

interface EditEntryModalProps {
  entry: CareerEntry;
  onUpdateEntry: (updates: Partial<CareerEntry>) => void;
  onClose: () => void;
}

const categoryOptions: { value: CareerEntry['category']; label: string; icon: React.ComponentType<any>; color: string }[] = [
  { value: 'achievement', label: 'Achievement', icon: Award, color: 'text-yellow-600 dark:text-yellow-400' },
  { value: 'skill', label: 'Skill Development', icon: Lightbulb, color: 'text-blue-600 dark:text-blue-400' },
  { value: 'project', label: 'Project', icon: Rocket, color: 'text-green-600 dark:text-green-400' },
  { value: 'leadership', label: 'Leadership', icon: Users, color: 'text-purple-600 dark:text-purple-400' },
  { value: 'learning', label: 'Learning', icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400' },
  { value: 'networking', label: 'Networking', icon: Handshake, color: 'text-pink-600 dark:text-pink-400' }
];

export function EditEntryModal({ entry, onUpdateEntry, onClose }: EditEntryModalProps) {
  // Form state - initialize with existing entry data
  const [description, setDescription] = useState(entry.description);
  const [impact, setImpact] = useState(entry.impact);
  const [skills, setSkills] = useState(entry.skills.join(', '));
  const [tags, setTags] = useState(entry.tags.join(', '));
  const [project, setProject] = useState(entry.project);
  const [category, setCategory] = useState<CareerEntry['category']>(entry.category);
  const [date, setDate] = useState(entry.date);
  const [isSaving, setIsSaving] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose, isSaving]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && !isSaving) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, isSaving]);

  // Prevent body scroll when modal is open while preserving scroll position
  useModalScrollLock();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isSaving) return;

    setIsSaving(true);

    // Simulate saving delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    const tagsArray = tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);

    onUpdateEntry({
      description: description.trim(),
      impact: impact.trim(),
      skills: skillsArray,
      tags: tagsArray,
      project: project.trim(),
      category,
      date
    });

    setIsSaving(false);
  };

  const handleCancel = () => {
    onClose();
  };

  // Handle click outside modal to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSaving) {
      onClose();
    }
  };

  return (
    <div
      className="modal-container bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="card-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
      >
      {/* Header */}
      <div className="sticky top-0 bg-card rounded-t-2xl border-b border-border p-6 z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Edit Entry</h2>
            <p className="text-sm text-muted-foreground">Update your career activity</p>
          </div>
        </div>
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Date and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CareerEntry['category'])}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-none"
              rows={3}
              placeholder="What did you accomplish or work on?"
              required
            />
          </div>

          {/* Impact */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Impact & Results
            </label>
            <textarea
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              className="w-full px-3 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-none"
              rows={2}
              placeholder="What was the outcome or impact?"
            />
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Rocket className="w-4 h-4 inline mr-1" />
              Project
            </label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              placeholder="Project or initiative name"
            />
          </div>

          {/* Skills and Tags Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Lightbulb className="w-4 h-4 inline mr-1" />
                Skills
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                placeholder="React, Node.js, Leadership..."
              />
              <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                placeholder="frontend, optimization, teamwork..."
              />
              <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-border">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-ghost px-6 py-2"
            disabled={isSaving}
          >
            Cancel
          </button>
          <LoadingButton
            type="submit"
            isLoading={isSaving}
            variant="primary"
            className="px-6 py-2"
            disabled={!description.trim()}
          >
            <Save className="w-4 h-4 mr-2" />
            Update Entry
          </LoadingButton>
        </div>
      </form>
      </div>
    </div>
  );
}
