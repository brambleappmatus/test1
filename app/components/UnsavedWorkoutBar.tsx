'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useWorkout } from '../providers/WorkoutProvider';

export default function UnsavedWorkoutBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeWorkout } = useWorkout();

  // Don't show the bar on the log page
  if (!activeWorkout || pathname === '/log') return null;

  return (
    <>
      {/* Mobile version */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30">
        <div className="bg-emerald-600 text-white">
          <div 
            onClick={() => router.push('/log')}
            className="cursor-pointer"
          >
            <div className="px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-sm font-medium">Continue workout</span>
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop version */}
      <div className="hidden lg:block fixed bottom-6 left-[calc(256px+1.5rem)] z-30">
        <div 
          onClick={() => router.push('/log')}
          className="bg-emerald-600 text-white rounded-lg shadow-lg cursor-pointer hover:bg-emerald-500 transition-colors"
        >
          <div className="px-4 py-2 flex items-center gap-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-medium">Continue workout</span>
            <span className="text-sm opacity-75">→</span>
          </div>
        </div>
      </div>
    </>
  );
}