import React, { useState, useEffect } from 'react';
import { Sparkles, Settings, Brain, Lightbulb, Rocket, Target, FileText, Search } from 'lucide-react';

interface LoadingMessage {
  text: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface FullScreenLoadingProps {
  isVisible: boolean;
  messages?: (string | LoadingMessage)[];
  title?: string;
  subtitle?: string;
}

const defaultMessages = [
  { text: "Generating tailored content for you…", icon: Sparkles },
  { text: "Optimizing your experience…", icon: Settings },
  { text: "Analyzing inputs and crafting results…", icon: Brain },
  { text: "Just a moment—magic is happening!", icon: Lightbulb },
  { text: "Preparing your data-driven results…", icon: Rocket },
  { text: "Personalizing your content…", icon: Target },
  { text: "Crafting professional language…", icon: FileText },
  { text: "Analyzing your achievements…", icon: Search }
];

export function FullScreenLoading({
  isVisible,
  messages = defaultMessages,
  title = "AI is working its magic",
  subtitle = "Please wait while we process your request"
}: FullScreenLoadingProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [dots, setDots] = useState('');

  // Cycle through messages
  useEffect(() => {
    if (!isVisible) return;

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(messageInterval);
  }, [isVisible, messages.length]);

  // Animate dots
  useEffect(() => {
    if (!isVisible) return;

    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(dotsInterval);
  }, [isVisible]);

  if (!isVisible) return null;

  // Handle both old string format and new object format for backward compatibility
  const getCurrentMessage = () => {
    const message = messages[currentMessageIndex];
    if (typeof message === 'string') {
      return { text: message, icon: Sparkles };
    }
    return message;
  };

  const currentMessage = getCurrentMessage();
  const MessageIcon = currentMessage.icon;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Dark overlay background */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Loading content */}
      <div className="relative z-10 text-center px-6 py-8 max-w-md mx-auto">
        {/* Large animated spinner */}
        <div className="mb-8">
          <div className="relative mx-auto w-24 h-24">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
            
            {/* Spinning gradient ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-white border-r-white/70 rounded-full animate-spin"></div>
            
            {/* Inner pulsing dot */}
            <div className="absolute inset-6 bg-white rounded-full animate-pulse"></div>
            
            {/* Floating particles */}
            <div className="absolute -inset-4">
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-0 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">
          {title}
        </h2>

        {/* Subtitle */}
        <p className="text-white/80 text-lg mb-6">
          {subtitle}
        </p>

        {/* Dynamic message with icon */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
          <div className="flex items-center justify-center space-x-3">
            <MessageIcon className="w-5 h-5 text-white animate-pulse" />
            <p className="text-white font-medium text-lg">
              {currentMessage.text}{dots}
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-6">
          <div className="flex justify-center space-x-1">
            {messages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentMessageIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
