import React from 'react';
import { User, Mail, Phone, MapPin, Clock, FileText } from 'lucide-react';
import { UserProfile } from '../../../types';

interface PersonalInfoTabProps {
  data: UserProfile['personal'];
  onChange: (updates: Partial<UserProfile['personal']>) => void;
}

export function PersonalInfoTab({ data, onChange }: PersonalInfoTabProps) {
  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Loading personal information...</p>
      </div>
    );
  }

  const handleInputChange = (field: keyof UserProfile['personal'], value: string) => {
    onChange({ [field]: value });
  };

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-primary" />
          Personal Information
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Basic information that helps personalize your experience and content generation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="input-field"
            placeholder="Enter your first name"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={data.lastName || ''}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="input-field"
            placeholder="Enter your last name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
            <Mail className="w-4 h-4 mr-1" />
            Email Address
          </label>
          <input
            type="email"
            value={data.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="input-field"
            placeholder="your.email@example.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
            <Phone className="w-4 h-4 mr-1" />
            Phone Number
          </label>
          <input
            type="tel"
            value={data.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="input-field"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            Location
          </label>
          <input
            type="text"
            value={data.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="input-field"
            placeholder="City, State/Country"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Used for networking opportunities and location-based content
          </p>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Timezone
          </label>
          <select
            value={data.timezone || ''}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            className="input-field"
          >
            <option value="">Select timezone</option>
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Profile Summary */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
          <FileText className="w-4 h-4 mr-1" />
          Professional Summary
        </label>
        <textarea
          value={data.profileSummary || ''}
          onChange={(e) => handleInputChange('profileSummary', e.target.value)}
          className="input-field min-h-[120px] resize-y"
          placeholder="Write a brief professional summary that highlights your expertise, experience, and career focus. This will be used to personalize AI-generated content."
          rows={5}
        />
        <p className="text-xs text-muted-foreground mt-1">
          A compelling summary helps generate better LinkedIn content and career insights
        </p>
      </div>

      {/* Tips Section */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2">💡 Profile Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Complete all fields for better AI-generated content</li>
          <li>• Your professional summary should be 2-3 sentences</li>
          <li>• Location helps with networking and opportunity matching</li>
          <li>• This information is kept private and secure</li>
        </ul>
      </div>
    </div>
  );
}
