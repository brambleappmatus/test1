'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { Workout, WorkoutExercise } from '../types/database';

interface WorkoutContextType {
  activeWorkout: {
    workout: Workout | null;
    exercises: WorkoutExercise[];
  } | null;
  setActiveWorkout: (workout: { workout: Workout | null; exercises: WorkoutExercise[] } | null) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkout, setActiveWorkout] = useState<WorkoutContextType['activeWorkout']>(null);

  // Load saved workout from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('activeWorkout');
    if (saved) {
      try {
        setActiveWorkout(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse saved workout:', err);
        localStorage.removeItem('activeWorkout');
      }
    }
  }, []);

  // Save workout to localStorage when it changes
  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem('activeWorkout', JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem('activeWorkout');
    }
  }, [activeWorkout]);

  return (
    <WorkoutContext.Provider value={{ activeWorkout, setActiveWorkout }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}