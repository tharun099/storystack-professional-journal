import React, { useState } from 'react';
import { Linkedin, Globe, Github, Award, Languages, GraduationCap, Plus, X } from 'lucide-react';
import { UserProfile } from '../../../types';

interface ProfessionalInfoTabProps {
  data: UserProfile['professional'];
  onChange: (updates: Partial<UserProfile['professional']>) => void;
}

export function ProfessionalInfoTab({ data, onChange }: ProfessionalInfoTabProps) {
  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Loading professional information...</p>
      </div>
    );
  }

  const [newCertification, setNewCertification] = useState('');
  const [newLanguage, setNewLanguage] = useState({ language: '', proficiency: 'conversational' as const });
  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    graduationYear: ''
  });

  const handleInputChange = (field: keyof UserProfile['professional'], value: any) => {
    onChange({ [field]: value });
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      const updatedCertifications = [...data.certifications, newCertification.trim()];
      handleInputChange('certifications', updatedCertifications);
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    const updatedCertifications = data.certifications.filter((_, i) => i !== index);
    handleInputChange('certifications', updatedCertifications);
  };

  const addLanguage = () => {
    if (newLanguage.language.trim()) {
      const updatedLanguages = [...data.languages, newLanguage];
      handleInputChange('languages', updatedLanguages);
      setNewLanguage({ language: '', proficiency: 'conversational' });
    }
  };

  const removeLanguage = (index: number) => {
    const updatedLanguages = data.languages.filter((_, i) => i !== index);
    handleInputChange('languages', updatedLanguages);
  };

  const addEducation = () => {
    if (newEducation.institution.trim() && newEducation.degree.trim()) {
      const updatedEducation = [...data.education, newEducation];
      handleInputChange('education', updatedEducation);
      setNewEducation({ institution: '', degree: '', field: '', graduationYear: '' });
    }
  };

  const removeEducation = (index: number) => {
    const updatedEducation = data.education.filter((_, i) => i !== index);
    handleInputChange('education', updatedEducation);
  };

  const proficiencyLevels = [
    { value: 'basic', label: 'Basic' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'fluent', label: 'Fluent' },
    { value: 'native', label: 'Native' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-primary" />
          Professional Links & Information
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Add your professional links and credentials to enhance your profile.
        </p>
      </div>

      {/* Professional Links */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Professional Links</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
              <Linkedin className="w-4 h-4 mr-1 text-blue-600" />
              LinkedIn Profile
            </label>
            <input
              type="url"
              value={data.linkedInUrl || ''}
              onChange={(e) => handleInputChange('linkedInUrl', e.target.value)}
              className="input-field"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          {/* GitHub */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
              <Github className="w-4 h-4 mr-1" />
              GitHub Profile
            </label>
            <input
              type="url"
              value={data.githubUrl || ''}
              onChange={(e) => handleInputChange('githubUrl', e.target.value)}
              className="input-field"
              placeholder="https://github.com/yourusername"
            />
          </div>

          {/* Portfolio */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
              <Globe className="w-4 h-4 mr-1" />
              Portfolio Website
            </label>
            <input
              type="url"
              value={data.portfolioUrl || ''}
              onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
              className="input-field"
              placeholder="https://yourportfolio.com"
            />
          </div>

          {/* Personal Website */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
              <Globe className="w-4 h-4 mr-1" />
              Personal Website
            </label>
            <input
              type="url"
              value={data.personalWebsite || ''}
              onChange={(e) => handleInputChange('personalWebsite', e.target.value)}
              className="input-field"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground flex items-center">
          <Award className="w-4 h-4 mr-1" />
          Certifications
        </h4>
        
        {/* Add new certification */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newCertification}
            onChange={(e) => setNewCertification(e.target.value)}
            className="input-field flex-1"
            placeholder="e.g., AWS Certified Solutions Architect"
            onKeyPress={(e) => e.key === 'Enter' && addCertification()}
          />
          <button
            onClick={addCertification}
            className="btn btn-primary px-3 py-2"
            disabled={!newCertification.trim()}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Existing certifications */}
        {data.certifications.length > 0 && (
          <div className="space-y-2">
            {data.certifications.map((cert, index) => (
              <div key={index} className="flex items-center justify-between bg-accent/50 rounded-lg p-3">
                <span className="text-sm text-foreground">{cert}</span>
                <button
                  onClick={() => removeCertification(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Languages */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground flex items-center">
          <Languages className="w-4 h-4 mr-1" />
          Languages
        </h4>
        
        {/* Add new language */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newLanguage.language}
            onChange={(e) => setNewLanguage(prev => ({ ...prev, language: e.target.value }))}
            className="input-field flex-1"
            placeholder="e.g., Spanish, French, Mandarin"
          />
          <select
            value={newLanguage.proficiency}
            onChange={(e) => setNewLanguage(prev => ({ ...prev, proficiency: e.target.value as any }))}
            className="input-field w-32"
          >
            {proficiencyLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          <button
            onClick={addLanguage}
            className="btn btn-primary px-3 py-2"
            disabled={!newLanguage.language.trim()}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Existing languages */}
        {data.languages.length > 0 && (
          <div className="space-y-2">
            {data.languages.map((lang, index) => (
              <div key={index} className="flex items-center justify-between bg-accent/50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-foreground font-medium">{lang.language}</span>
                  <span className="text-xs text-muted-foreground bg-accent rounded-full px-2 py-1">
                    {lang.proficiency}
                  </span>
                </div>
                <button
                  onClick={() => removeLanguage(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Education */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground flex items-center">
          <GraduationCap className="w-4 h-4 mr-1" />
          Education
        </h4>

        {/* Add new education */}
        <div className="space-y-3 p-4 border border-border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={newEducation.institution}
              onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
              className="input-field"
              placeholder="Institution name"
            />
            <input
              type="text"
              value={newEducation.degree}
              onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
              className="input-field"
              placeholder="Degree (e.g., Bachelor's, Master's)"
            />
            <input
              type="text"
              value={newEducation.field}
              onChange={(e) => setNewEducation(prev => ({ ...prev, field: e.target.value }))}
              className="input-field"
              placeholder="Field of study (optional)"
            />
            <input
              type="text"
              value={newEducation.graduationYear}
              onChange={(e) => setNewEducation(prev => ({ ...prev, graduationYear: e.target.value }))}
              className="input-field"
              placeholder="Graduation year (optional)"
            />
          </div>
          <button
            onClick={addEducation}
            className="btn btn-primary px-4 py-2 w-full"
            disabled={!newEducation.institution.trim() || !newEducation.degree.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Education
          </button>
        </div>

        {/* Existing education */}
        {data.education.length > 0 && (
          <div className="space-y-3">
            {data.education.map((edu, index) => (
              <div key={index} className="flex items-start justify-between bg-accent/50 rounded-lg p-4">
                <div className="flex-1">
                  <div className="font-medium text-foreground">{edu.degree}</div>
                  <div className="text-sm text-muted-foreground">{edu.institution}</div>
                  {edu.field && (
                    <div className="text-sm text-muted-foreground">Field: {edu.field}</div>
                  )}
                  {edu.graduationYear && (
                    <div className="text-xs text-muted-foreground">Graduated: {edu.graduationYear}</div>
                  )}
                </div>
                <button
                  onClick={() => removeEducation(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors ml-3"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2">💡 Professional Profile Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Add your LinkedIn profile for better networking content</li>
          <li>• Include relevant certifications to highlight expertise</li>
          <li>• Language skills help with international opportunities</li>
          <li>• Education background adds credibility to your profile</li>
          <li>• All information is used to personalize AI-generated content</li>
        </ul>
      </div>
    </div>
  );
}
