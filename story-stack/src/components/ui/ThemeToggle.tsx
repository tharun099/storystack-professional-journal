import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, actualTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light mode';
      case 'dark':
        return 'Dark mode';
      case 'system':
        return 'System theme';
      default:
        return 'Light mode';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      title={getLabel()}
      aria-label={getLabel()}
    >
      <div className="relative">
        {/* Icon with smooth transition */}
        <div className="transition-all duration-300 ease-in-out">
          {getIcon()}
        </div>
        
        {/* Subtle indicator for system theme */}
        {theme === 'system' && (
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
        )}
      </div>
      
      {/* Tooltip-like indicator */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md border border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        {getLabel()}
      </div>
    </button>
  );
}

// Alternative dropdown version for more explicit control
export function ThemeDropdown() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Toggle theme"
      >
        <currentTheme.icon className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-12 z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-large animate-scale-in">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value);
                  setIsOpen(false);
                }}
                className={`relative flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:bg-accent focus-visible:text-accent-foreground ${
                  theme === themeOption.value ? 'bg-accent text-accent-foreground' : ''
                }`}
              >
                <themeOption.icon className="mr-2 h-4 w-4" />
                <span>{themeOption.label}</span>
                {theme === themeOption.value && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
