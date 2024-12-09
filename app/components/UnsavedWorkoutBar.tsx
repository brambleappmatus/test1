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
    <div className="fixed bottom-[4rem] lg:bottom-0 left-0 right-0 z-40">
      <div className="bg-emerald-600 text-white lg:container lg:mx-auto lg:px-4">
        <div 
          onClick={() => router.push('/log')}
          className="lg:max-w-3xl lg:mx-auto lg:mb-2 lg:rounded-lg cursor-pointer"
        >
          <div className="px-4 py-2 lg:py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-3">
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm lg:text-base font-medium">
                <span className="lg:hidden">Continue workout</span>
                <span className="hidden lg:inline">You have an unsaved workout in progress</span>
              </span>
            </div>
            <svg className="w-4 h-4 lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="hidden lg:block text-sm">Click to continue →</span>
          </div>
        </div>
      </div>
    </div>
  );
}