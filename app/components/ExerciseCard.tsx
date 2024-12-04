'use client';

import { useState } from 'react';
import type { Exercise } from '../types/database';
import { deleteExercise } from '../lib/api/exercises';
import ConfirmDialog from './ConfirmDialog';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
}

export default function ExerciseCard({ exercise, onEdit, onDelete }: ExerciseCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteExercise(exercise.id);
      onDelete(exercise.id);
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    } finally {
      setIsDeleting(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <div className="group bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-900 p-3 hover:border-gray-200 dark:hover:border-gray-800 transition-all">
        <div className="flex flex-col min-h-[4rem]">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {exercise.name}
            </h3>
            {exercise.description && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {exercise.description}
              </p>
            )}
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded px-2 py-1 text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Sets</span>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{exercise.default_sets}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded px-2 py-1 text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Reps</span>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{exercise.default_reps}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded px-2 py-1 text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">kg</span>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{exercise.default_weight}</p>
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(exercise)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Edit exercise"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={isDeleting}
              className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              title="Delete exercise"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete Exercise"
        message={`Are you sure you want to delete "${exercise.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
}