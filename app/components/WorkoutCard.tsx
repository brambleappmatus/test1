'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { deleteWorkout } from '../lib/api/workouts';
import type { Workout } from '../types/database';
import ConfirmDialog from './ConfirmDialog';

interface WorkoutCardProps {
  workout: Workout;
  onDelete: (id: string) => void;
  onEdit: (workout: Workout) => void;
}

export default function WorkoutCard({ workout, onDelete, onEdit }: WorkoutCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteWorkout(workout.id);
      onDelete(workout.id);
    } catch (error) {
      console.error('Failed to delete workout:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="group bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-900 p-3 hover:border-gray-200 dark:hover:border-gray-800 transition-all">
        <div className="flex flex-col min-h-[4rem]">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {workout.name}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {format(new Date(workout.date), 'MMM d, yyyy')}
            </p>
          </div>
          
          <div className="mt-2 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(workout)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Edit workout"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              title="Delete workout"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Workout"
        message={`Are you sure you want to delete "${workout.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}