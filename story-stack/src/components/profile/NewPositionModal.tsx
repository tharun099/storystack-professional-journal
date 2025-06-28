import React, { useState, useEffect, useRef } from 'react';
import { X, Briefcase, Building, Calendar, MapPin, Users, Plus } from 'lucide-react';
import { Position } from '../../types';
import { LoadingButton } from '../ui/loading-button';
import { useModalScrollLock } from '../../hooks/useScrollPosition';

interface NewPositionModalProps {
  onClose: () => void;
  onAddPosition: (position: Omit<Position, 'id' | 'isActive' | 'logs' | 'achievements' | 'skills'>) => void;
  currentPosition: Position;
}

export function NewPositionModal({ onClose, onAddPosition, currentPosition }: NewPositionModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    location: '',
    department: '',
    teamSize: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const modalRef = useRef<HTMLDivElement>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newPosition = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        location: formData.location.trim() || undefined,
        department: formData.department.trim() || undefined,
        teamSize: formData.teamSize ? parseInt(formData.teamSize) : undefined,
        description: formData.description.trim() || undefined
      };

      onAddPosition(newPosition);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose, isSubmitting]);

  // Prevent body scroll when modal is open while preserving scroll position
  useModalScrollLock();

  // Handle click outside modal to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
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
        className="card-elevated max-w-2xl w-full overflow-y-auto animate-scale-in"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card rounded-t-2xl border-b border-border p-6 z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Add New Position</h2>
              <p className="text-sm text-muted-foreground">Your current role will be moved to history</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Current Position Info */}
        <div className="p-6 bg-muted/30 border-b border-border">
          <h3 className="text-sm font-medium text-foreground mb-2">Current Position (will be archived)</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Briefcase className="w-4 h-4" />
            <span>{currentPosition.title || 'No title'} at {currentPosition.company || 'No company'}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Job Title *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors ${
                    errors.title ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
            </div>

            {/* Company */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Company *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors ${
                    errors.company ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="e.g., TechCorp Inc"
                />
              </div>
              {errors.company && <p className="mt-1 text-sm text-destructive">{errors.company}</p>}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors ${
                    errors.startDate ? 'border-destructive' : 'border-border'
                  }`}
                />
              </div>
              {errors.startDate && <p className="mt-1 text-sm text-destructive">{errors.startDate}</p>}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Leave empty if this is your current position</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-3 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                placeholder="e.g., Engineering, Product"
              />
            </div>

            {/* Team Size */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Team Size
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  value={formData.teamSize}
                  onChange={(e) => handleInputChange('teamSize', e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  placeholder="e.g., 5"
                  min="1"
                />
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-none"
                placeholder="Brief description of your role and responsibilities..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost px-4 py-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Adding Position..."
              icon={Plus}
              variant="primary"
              size="md"
            >
              Add Position
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
