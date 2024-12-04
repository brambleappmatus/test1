'use client';

import { useState } from 'react';
import { updateExercise } from '../lib/api/exercises';
import type { Exercise } from '../types/database';

interface EditExerciseFormProps {
  exercise: Exercise;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditExerciseForm({ exercise, onSuccess, onCancel }: EditExerciseFormProps) {
  const [formData, setFormData] = useState({
    name: exercise.name,
    description: exercise.description || '',
    default_sets: exercise.default_sets,
    default_reps: exercise.default_reps,
    default_weight: exercise.default_weight,
    icon_url: exercise.icon_url || ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await updateExercise(exercise.id, formData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update exercise');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-black rounded-lg w-full max-w-md shadow-xl">
        <form onSubmit={handleSubmit} className="divide-y divide-gray-100 dark:divide-gray-900">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Edit Exercise</h2>
              <button
                type="button"
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="px-6 py-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exercise Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter exercise name"
                className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., preacher or standing"
                className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="icon_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image URL (optional)
              </label>
              <input
                type="url"
                id="icon_url"
                value={formData.icon_url}
                onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="default_sets" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Sets
                </label>
                <input
                  type="number"
                  id="default_sets"
                  min="1"
                  max="20"
                  value={formData.default_sets}
                  onChange={(e) => setFormData({ ...formData, default_sets: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 3"
                  className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="default_reps" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Reps
                </label>
                <input
                  type="number"
                  id="default_reps"
                  min="1"
                  max="100"
                  value={formData.default_reps}
                  onChange={(e) => setFormData({ ...formData, default_reps: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 10"
                  className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="default_weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="default_weight"
                  min="0"
                  step="0.5"
                  value={formData.default_weight}
                  onChange={(e) => setFormData({ ...formData, default_weight: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 30"
                  className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="px-6 py-4">
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            </div>
          )}

          <div className="px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium text-white dark:text-black bg-black dark:bg-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}