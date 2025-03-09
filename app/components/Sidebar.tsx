'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { HomeIcon, DumbbellIcon, WorkoutsIcon, LogIcon, HistoryIcon } from './icons';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path: string) => {
    return pathname === path 
      ? 'bg-black text-white dark:bg-white dark:text-black' 
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900';
  };

  const menuItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/workouts', label: 'Workouts', icon: WorkoutsIcon },
    { path: '/exercises', label: 'Exercises', icon: DumbbellIcon },
    { path: '/log', label: 'Log Workout', icon: LogIcon },
    { path: '/history', label: 'History', icon: HistoryIcon },
  ];

  return (
    <aside className={`
      hidden lg:flex flex-col sticky top-0 h-screen border-r border-gray-100 dark:border-gray-900
      transition-all duration-300 ease-in-out bg-white dark:bg-black
      ${isCollapsed ? 'w-16' : 'w-48'}
    `}>
      <div className="h-16 flex items-center justify-between px-3 border-b border-gray-100 dark:border-gray-900">
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'w-0' : 'w-24'}`}>
          <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">Fitness</span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 ${
            isCollapsed ? 'ml-auto mr-auto' : ''
          }`}
        >
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l-7 7 7 7" />
          </svg>
        </button>
      </div>
      
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`
              flex items-center rounded-md text-sm font-medium
              transition-all duration-200
              ${isActive(item.path)}
              ${isCollapsed ? 'justify-center px-2 py-2' : 'px-2.5 py-2 gap-3'}
            `}
          >
            <div className={isCollapsed ? 'w-5 h-5 flex items-center justify-center' : ''}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
            </div>
            <span className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
              isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="p-2 border-t border-gray-100 dark:border-gray-900">
        <ThemeToggle collapsed={isCollapsed} />
      </div>
    </aside>
  );
}