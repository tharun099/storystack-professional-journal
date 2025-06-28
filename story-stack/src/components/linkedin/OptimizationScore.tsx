import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Target, RefreshCw } from 'lucide-react';
import { CareerEntry, OptimizationScore as OptimizationScoreType } from '../../types';
import { LoadingButton } from '../ui/loading-button';

interface OptimizationScoreProps {
  score: OptimizationScoreType | null;
  entries: CareerEntry[];
  onRefresh: () => void;
  isLoading: boolean;
}

export function OptimizationScore({ score, entries, onRefresh, isLoading }: OptimizationScoreProps) {
  if (!score && !isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Optimize</h3>
        <p className="text-gray-600 mb-4">
          Analyze your {entries.length} selected {entries.length === 1 ? 'entry' : 'entries'} to get optimization recommendations
        </p>
        <LoadingButton
          onClick={onRefresh}
          isLoading={isLoading}
          loadingText="Analyzing..."
          icon={TrendingUp}
          className="px-6 py-3"
        >
          Start Analysis
        </LoadingButton>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <p className="text-gray-600">Analyzing your profile...</p>
      </div>
    );
  }

  if (!score) return null;

  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-600 bg-green-100';
    if (value >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (value: number) => {
    if (value >= 80) return CheckCircle;
    if (value >= 60) return AlertCircle;
    return Target;
  };

  const scoreAreas = [
    { key: 'headline', label: 'Headline', value: score.headline },
    { key: 'summary', label: 'Summary', value: score.summary },
    { key: 'experience', label: 'Experience', value: score.experience },
    { key: 'skills', label: 'Skills', value: score.skills }
  ];

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Overall Score */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(score.overall / 100) * 314} 314`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{score.overall}</div>
                <div className="text-sm text-gray-500">Score</div>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Optimization Score</h2>
          <p className="text-gray-600">
            Based on {entries.length} career {entries.length === 1 ? 'activity' : 'activities'}
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {scoreAreas.map((area) => {
            const Icon = getScoreIcon(area.value);
            return (
              <div key={area.key} className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${getScoreColor(area.value)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{area.value}</div>
                <div className="text-sm text-gray-600">{area.label}</div>
              </div>
            );
          })}
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Optimization Recommendations</h3>
            <LoadingButton
              onClick={onRefresh}
              isLoading={isLoading}
              loadingText="Refreshing..."
              icon={RefreshCw}
              variant="secondary"
              size="sm"
            >
              Refresh Analysis
            </LoadingButton>
          </div>
          
          <div className="space-y-4">
            {score.suggestions.map((suggestion, index) => {
              const priorityColors = {
                high: 'border-red-200 bg-red-50',
                medium: 'border-yellow-200 bg-yellow-50',
                low: 'border-green-200 bg-green-50'
              };

              const priorityTextColors = {
                high: 'text-red-700',
                medium: 'text-yellow-700',
                low: 'text-green-700'
              };

              return (
                <div key={index} className={`p-4 rounded-lg border ${priorityColors[suggestion.priority]}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 capitalize">{suggestion.area}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityTextColors[suggestion.priority]} bg-white`}>
                        {suggestion.priority} priority
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">Score: {suggestion.current}/100</div>
                  </div>
                  <p className="text-gray-700 mb-2">{suggestion.suggestion}</p>
                  <p className="text-sm text-gray-600">💡 {suggestion.impact}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="text-2xl font-bold text-blue-900 mb-1">{entries.length}</div>
            <div className="text-blue-700">Career Activities</div>
            <div className="text-sm text-blue-600 mt-1">Ready for optimization</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
            <div className="text-2xl font-bold text-purple-900 mb-1">
              {entries.reduce((acc, entry) => acc + entry.skills.length, 0)}
            </div>
            <div className="text-purple-700">Skills Identified</div>
            <div className="text-sm text-purple-600 mt-1">Across all activities</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
            <div className="text-2xl font-bold text-green-900 mb-1">
              {score.suggestions.filter(s => s.priority === 'high').length}
            </div>
            <div className="text-green-700">High Priority Items</div>
            <div className="text-sm text-green-600 mt-1">Quick wins available</div>
          </div>
        </div>
      </div>
    </div>
  );
}
