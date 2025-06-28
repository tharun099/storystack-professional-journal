import React from 'react';
import { MessageLoading } from './message-loading';
import { LucideIcon } from 'lucide-react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
  icon?: LucideIcon;
  iconSize?: number;
  loadingSize?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function LoadingButton({
  isLoading,
  loadingText,
  icon: Icon,
  iconSize = 20,
  loadingSize = 'md',
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseClasses = 'btn inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  const variantClasses = {
    primary: 'btn-primary bg-gradient-to-r from-primary to-purple-600 text-primary-foreground hover:from-primary/90 hover:to-purple-600/90 shadow-soft',
    secondary: 'btn-secondary',
    success: 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm space-x-1.5',
    md: 'px-4 py-2 text-sm space-x-2',
    lg: 'px-6 py-3 text-base space-x-2'
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={combinedClasses}
    >
      {isLoading ? (
        <>
          <MessageLoading size={loadingSize} className="text-current" />
          <span>{loadingText || 'Loading...'}</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={iconSize} />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
