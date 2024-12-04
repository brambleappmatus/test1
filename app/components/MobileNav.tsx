'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, DumbbellIcon, WorkoutsIcon, LogIcon, HistoryIcon } from './icons';

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/workouts', label: 'Workouts', icon: WorkoutsIcon },
    { path: '/exercises', label: 'Exercises', icon: DumbbellIcon },
    { path: '/history', label: 'History', icon: HistoryIcon },
  ];

  // Insert Log button in the middle
  const midPoint = Math.floor(menuItems.length / 2);
  const itemsWithLog = [
    ...menuItems.slice(0, midPoint),
    { path: '/log', label: 'Log', icon: LogIcon, isMain: true },
    ...menuItems.slice(midPoint)
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-900 pb-safe-area z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {itemsWithLog.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`
              flex flex-col items-center justify-center
              ${item.isMain ? '-mt-6' : ''}
              ${isActive(item.path)
                ? 'text-black dark:text-white'
                : 'text-gray-400 dark:text-gray-500'
              }
            `}
          >
            {item.isMain ? (
              <div className="flex flex-col items-center">
                <div className="p-3 rounded-full bg-black dark:bg-white -mb-1">
                  <item.icon className={`
                    w-6 h-6
                    ${isActive(item.path)
                      ? 'text-white dark:text-black'
                      : 'text-white dark:text-black'
                    }
                  `} />
                </div>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </div>
            ) : (
              <>
                <item.icon className={`
                  w-6 h-6 mb-1
                  ${isActive(item.path)
                    ? 'text-black dark:text-white'
                    : 'text-gray-400 dark:text-gray-500'
                  }
                `} />
                <span className="text-xs font-medium">{item.label}</span>
              </>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}