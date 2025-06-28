import React, { useState } from 'react';
import { Copy, CheckCircle, Edit3, Eye, Linkedin, User, MessageSquare } from 'lucide-react';

interface ContentPreviewProps {
  content: string;
  type: 'headline' | 'summary' | 'experience' | 'post' | 'skills';
  onCopy: (content: string) => void;
  isCopied: boolean;
}

export function ContentPreview({ content, type, onCopy, isCopied }: ContentPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');

  const handleSaveEdit = () => {
    setIsEditing(false);
    // In a real app, you might want to call a callback to update the parent component
  };

  const getCharacterLimit = () => {
    switch (type) {
      case 'headline': return 220;
      case 'post': return 3000;
      default: return null;
    }
  };

  const characterLimit = getCharacterLimit();
  const currentLength = editedContent.length;
  const isOverLimit = characterLimit && currentLength > characterLimit;

  const renderLinkedInPreview = () => {
    switch (type) {
      case 'headline':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Your Name</h3>
                <p className="text-gray-700 text-lg leading-relaxed">{editedContent}</p>
                <div className="mt-2 text-sm text-gray-500">Your Location • Your Industry</div>
              </div>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">About</h3>
            </div>
            <div className="prose prose-gray max-w-none">
              {editedContent.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700 mb-3 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">Your Current Role</h4>
                  <p className="text-gray-600 mb-3">Company Name • Duration</p>
                  <div className="space-y-2">
                    {editedContent.split('\n').filter(line => line.trim()).map((bullet, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 leading-relaxed">{bullet.replace(/^[•\-\*]\s*/, '')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'post':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">Your Name</h4>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500 text-sm">Now</span>
                </div>
                <p className="text-gray-600 text-sm">Your Professional Title</p>
              </div>
            </div>
            <div className="prose prose-gray max-w-none">
              {editedContent.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-900 mb-3 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center space-x-6 text-gray-500">
              <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                <span>👍</span>
                <span className="text-sm">Like</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                <span>💬</span>
                <span className="text-sm">Comment</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                <span>🔄</span>
                <span className="text-sm">Repost</span>
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm">
              {editedContent}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              viewMode === 'preview'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-1" />
            Preview
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              viewMode === 'raw'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Raw Text
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {characterLimit && (
            <span className={`text-sm ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
              {currentLength}/{characterLimit}
            </span>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'Cancel' : 'Edit'}</span>
          </button>
          <button
            onClick={() => onCopy(editedContent)}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isCopied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className={`w-full h-64 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              isOverLimit ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Edit your content..."
          />
          <div className="flex items-center justify-between">
            <div>
              {isOverLimit && (
                <p className="text-red-600 text-sm">
                  Content exceeds LinkedIn's {characterLimit} character limit
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setEditedContent(content);
                  setIsEditing(false);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {viewMode === 'preview' ? (
            renderLinkedInPreview()
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-gray-700 text-sm font-mono">
                {editedContent}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* LinkedIn Branding */}
      <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
        <Linkedin className="w-4 h-4" />
        <span>Preview shows how this will appear on LinkedIn</span>
      </div>
    </div>
  );
}
