'use client';

import { useState } from 'react';
import type { Exercise } from '@/app/types/database';

interface ExerciseSelectorProps {
  exercises: Exercise[];
  selectedExercises: string[];
  onExerciseChange: (exerciseIds: string[]) => void;
}

export default function ExerciseSelector({ 
  exercises, 
  selectedExercises, 
  onExerciseChange 
}: ExerciseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectAll = () => {
    if (selectedExercises.length === exercises.length) {
      onExerciseChange([]);
    } else {
      onExerciseChange(exercises.map(e => e.id));
    }
  };

  const handleToggleExercise = (exerciseId: string) => {
    if (selectedExercises.includes(exerciseId)) {
      onExerciseChange(selectedExercises.filter(id => id !== exerciseId));
    } else {
      onExerciseChange([...selectedExercises, exerciseId]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-900 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span>
            {selectedExercises.length === 0
              ? 'Select exercises'
              : `${selectedExercises.length} selected`}
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-56 bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-lg shadow-lg">
            <div className="p-2">
              <button
                onClick={handleSelectAll}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-md"
              >
                {selectedExercises.length === exercises.length ? 'Deselect All' : 'Select All'}
              </button>
              <div className="mt-2 max-h-60 overflow-auto">
                {exercises.map((exercise) => (
                  <label
                    key={exercise.id}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer rounded-md"
                  >
                    <input
                      type="checkbox"
                      checked={selectedExercises.includes(exercise.id)}
                      onChange={() => handleToggleExercise(exercise.id)}
                      className="rounded border-gray-300 text-black focus:ring-black dark:border-gray-700 dark:text-white dark:focus:ring-white"
                    />
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">
                      {exercise.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}