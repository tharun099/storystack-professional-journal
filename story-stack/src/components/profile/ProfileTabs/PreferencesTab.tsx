import React, { useState } from 'react';
import { Target, MapPin, DollarSign, Heart, Plus, X, Building } from 'lucide-react';
import { UserProfile } from '../../../types';

interface PreferencesTabProps {
  data: UserProfile['preferences'];
  meta: UserProfile['meta'];
  onChange: (updates: Partial<UserProfile['preferences']>) => void;
  onMetaChange: (updates: Partial<UserProfile['meta']>) => void;
}

export function PreferencesTab({ data, meta, onChange, onMetaChange }: PreferencesTabProps) {
  if (!data || !meta) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Loading career preferences...</p>
      </div>
    );
  }

  const [newIndustry, setNewIndustry] = useState('');
  const [newWorkValue, setNewWorkValue] = useState('');

  const handleInputChange = (field: keyof UserProfile['preferences'], value: any) => {
    onChange({ [field]: value });
  };

  const handleSalaryChange = (field: 'min' | 'max' | 'currency', value: string | number) => {
    const updatedSalaryRange = {
      ...data.salaryRange,
      [field]: field === 'currency' ? value : value === '' ? undefined : Number(value)
    };
    handleInputChange('salaryRange', updatedSalaryRange);
  };

  const addIndustry = () => {
    if (newIndustry.trim() && !data.preferredIndustries.includes(newIndustry.trim())) {
      const updatedIndustries = [...data.preferredIndustries, newIndustry.trim()];
      handleInputChange('preferredIndustries', updatedIndustries);
      setNewIndustry('');
    }
  };

  const removeIndustry = (index: number) => {
    const updatedIndustries = data.preferredIndustries.filter((_, i) => i !== index);
    handleInputChange('preferredIndustries', updatedIndustries);
  };

  const addWorkValue = () => {
    if (newWorkValue.trim() && !data.workValues.includes(newWorkValue.trim())) {
      const updatedWorkValues = [...data.workValues, newWorkValue.trim()];
      handleInputChange('workValues', updatedWorkValues);
      setNewWorkValue('');
    }
  };

  const removeWorkValue = (index: number) => {
    const updatedWorkValues = data.workValues.filter((_, i) => i !== index);
    handleInputChange('workValues', updatedWorkValues);
  };

  const workStyleOptions = [
    { value: 'remote', label: 'Remote', description: 'Work from anywhere' },
    { value: 'hybrid', label: 'Hybrid', description: 'Mix of remote and office' },
    { value: 'onsite', label: 'On-site', description: 'Office-based work' },
    { value: 'flexible', label: 'Flexible', description: 'Open to various arrangements' }
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level', description: '0-2 years experience' },
    { value: 'mid', label: 'Mid Level', description: '3-7 years experience' },
    { value: 'senior', label: 'Senior Level', description: '8-15 years experience' },
    { value: 'executive', label: 'Executive', description: '15+ years experience' }
  ];

  const commonWorkValues = [
    'Work-life balance', 'Innovation', 'Growth opportunities', 'Team collaboration',
    'Autonomy', 'Impact', 'Learning', 'Stability', 'Diversity & inclusion',
    'Competitive compensation', 'Flexible schedule', 'Remote work'
  ];

  const commonIndustries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Consulting', 'Media & Entertainment', 'Non-profit',
    'Government', 'Real Estate', 'Transportation'
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-primary" />
          Career Goals & Preferences
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Help us understand your career aspirations and preferences for better content generation.
        </p>
      </div>

      {/* Career Goals */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Career Goals & Aspirations
        </label>
        <textarea
          value={data.careerGoals || ''}
          onChange={(e) => handleInputChange('careerGoals', e.target.value)}
          className="input-field min-h-[100px] resize-y"
          placeholder="Describe your short-term and long-term career goals, what you want to achieve, and where you see yourself heading..."
          rows={4}
        />
        <p className="text-xs text-muted-foreground mt-1">
          This helps generate more targeted career content and insights
        </p>
      </div>

      {/* Experience Level */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Experience Level
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {experienceLevels.map((level) => (
            <label
              key={level.value}
              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                meta.experienceLevel === level.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="experienceLevel"
                value={level.value}
                checked={meta.experienceLevel === level.value}
                onChange={(e) => onMetaChange({ experienceLevel: e.target.value as any })}
                className="sr-only"
              />
              <div>
                <div className="font-medium text-sm">{level.label}</div>
                <div className="text-xs text-muted-foreground">{level.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Work Style Preference */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3 flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          Preferred Work Style
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {workStyleOptions.map((style) => (
            <label
              key={style.value}
              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                data.preferredWorkStyle === style.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="workStyle"
                value={style.value}
                checked={data.preferredWorkStyle === style.value}
                onChange={(e) => handleInputChange('preferredWorkStyle', e.target.value as any)}
                className="sr-only"
              />
              <div>
                <div className="font-medium text-sm">{style.label}</div>
                <div className="text-xs text-muted-foreground">{style.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3 flex items-center">
          <DollarSign className="w-4 h-4 mr-1" />
          Salary Range (Optional)
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Minimum</label>
            <input
              type="number"
              value={data.salaryRange?.min || ''}
              onChange={(e) => handleSalaryChange('min', e.target.value)}
              className="input-field"
              placeholder="50000"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Maximum</label>
            <input
              type="number"
              value={data.salaryRange?.max || ''}
              onChange={(e) => handleSalaryChange('max', e.target.value)}
              className="input-field"
              placeholder="100000"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Currency</label>
            <select
              value={data.salaryRange?.currency || 'USD'}
              onChange={(e) => handleSalaryChange('currency', e.target.value)}
              className="input-field"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preferred Industries */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3 flex items-center">
          <Building className="w-4 h-4 mr-1" />
          Preferred Industries
        </label>
        
        {/* Quick add buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {commonIndustries.map((industry) => (
            <button
              key={industry}
              onClick={() => {
                if (!data.preferredIndustries.includes(industry)) {
                  const updatedIndustries = [...data.preferredIndustries, industry];
                  handleInputChange('preferredIndustries', updatedIndustries);
                }
              }}
              className="text-xs px-2 py-1 bg-accent hover:bg-accent/80 rounded-full transition-colors"
              disabled={data.preferredIndustries.includes(industry)}
            >
              {industry}
            </button>
          ))}
        </div>

        {/* Custom add */}
        <div className="flex space-x-2 mb-3">
          <input
            type="text"
            value={newIndustry}
            onChange={(e) => setNewIndustry(e.target.value)}
            className="input-field flex-1"
            placeholder="Add custom industry"
            onKeyPress={(e) => e.key === 'Enter' && addIndustry()}
          />
          <button
            onClick={addIndustry}
            className="btn btn-primary px-3 py-2"
            disabled={!newIndustry.trim()}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Selected industries */}
        {data.preferredIndustries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.preferredIndustries.map((industry, index) => (
              <div key={index} className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm">
                <span>{industry}</span>
                <button
                  onClick={() => removeIndustry(index)}
                  className="ml-2 hover:text-primary/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Opportunity Availability */}
      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={data.availableForOpportunities || false}
            onChange={(e) => handleInputChange('availableForOpportunities', e.target.checked)}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
          />
          <div>
            <span className="text-sm font-medium text-foreground">Available for new opportunities</span>
            <p className="text-xs text-muted-foreground">
              This helps tailor content for networking and career advancement
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
