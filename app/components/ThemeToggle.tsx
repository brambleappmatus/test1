'use client';

import { useTheme } from '../providers/ThemeProvider';

interface ThemeToggleProps {
  collapsed?: boolean;
}

export default function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        w-full flex items-center rounded-md text-sm font-medium 
        text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 
        transition-all duration-200
        ${collapsed ? 'justify-center px-2 py-2' : 'px-2.5 py-2 gap-3'}
      `}
    >
      <div className={collapsed ? 'w-5 h-5 flex items-center justify-center' : ''}>
        {theme === 'light' ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </div>
      <span className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
        collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
      }`}>
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </span>
    </button>
  );
}