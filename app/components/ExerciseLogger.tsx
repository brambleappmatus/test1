'use client';

import { useState, useEffect } from 'react';
import { updateWorkoutExercise } from '../lib/api/workout-exercises';
import { saveExerciseState, removeSavedExercise, getSavedExercises } from '../lib/utils/localStorage';
import type { WorkoutExercise } from '../types/database';
import ExerciseCard from './exercise/ExerciseCard';

interface ExerciseLoggerProps {
  workoutExercises: WorkoutExercise[];
  onError: (error: string | null) => void;
  onExerciseUpdate: (exercises: WorkoutExercise[]) => void;
  onDeleteExercise: (exerciseId: string) => void;
}

interface ExerciseState {
  sets: number;
  reps: number;
  weight: number;
  isUpdated: boolean;
  isLoading: boolean;
}

export default function ExerciseLogger({ 
  workoutExercises, 
  onError, 
  onExerciseUpdate,
  onDeleteExercise
}: ExerciseLoggerProps) {
  const [exerciseData, setExerciseData] = useState<Record<string, ExerciseState>>({});

  // Initialize exercise data when workoutExercises changes
  useEffect(() => {
    const savedExercises = getSavedExercises();
    
    const initialData = workoutExercises.reduce((acc, exercise) => {
      acc[exercise.id] = {
        sets: exercise.sets || exercise.exercise?.default_sets || 3,
        reps: exercise.reps || exercise.exercise?.default_reps || 10,
        weight: exercise.weight || exercise.exercise?.default_weight || 20,
        isUpdated: savedExercises.has(exercise.id),
        isLoading: false
      };
      return acc;
    }, {} as Record<string, ExerciseState>);

    setExerciseData(initialData);
  }, [workoutExercises]);

  // Update parent component when exercise data changes
  useEffect(() => {
    const updatedExercises = workoutExercises.map(exercise => ({
      ...exercise,
      sets: exerciseData[exercise.id]?.sets ?? exercise.sets,
      reps: exerciseData[exercise.id]?.reps ?? exercise.reps,
      weight: exerciseData[exercise.id]?.weight ?? exercise.weight
    }));

    const hasChanges = updatedExercises.some((exercise, index) => {
      const original = workoutExercises[index];
      return exercise.sets !== original.sets ||
             exercise.reps !== original.reps ||
             exercise.weight !== original.weight;
    });

    if (hasChanges) {
      onExerciseUpdate(updatedExercises);
    }
  }, [exerciseData, workoutExercises, onExerciseUpdate]);

  const handleUpdate = async (exerciseId: string) => {
    const data = exerciseData[exerciseId];
    if (!data) return;

    setExerciseData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        isLoading: true
      }
    }));

    try {
      await updateWorkoutExercise(exerciseId, {
        sets: data.sets,
        reps: data.reps,
        weight: data.weight
      });

      // Artificial delay for loading state
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Save the exercise state to localStorage
      saveExerciseState(exerciseId);
      
      setExerciseData(prev => ({
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          isLoading: false,
          isUpdated: true
        }
      }));
      
      onError(null);
    } catch (err) {
      removeSavedExercise(exerciseId);
      setExerciseData(prev => ({
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          isLoading: false,
          isUpdated: false
        }
      }));
      onError('Failed to update exercise');
    }
  };

  const handleInputChange = (
    exerciseId: string,
    field: keyof Pick<ExerciseState, 'sets' | 'reps' | 'weight'>,
    value: number
  ) => {
    setExerciseData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value,
        isUpdated: false
      }
    }));
    // Remove from saved exercises when values change
    removeSavedExercise(exerciseId);
  };

  return (
    <div className="space-y-4">
      {workoutExercises.map((workoutExercise) => {
        const data = exerciseData[workoutExercise.id];
        if (!data) return null;

        return (
          <ExerciseCard
            key={workoutExercise.id}
            exercise={workoutExercise}
            exerciseData={data}
            onInputChange={(field, value) => handleInputChange(workoutExercise.id, field, value)}
            onSave={() => handleUpdate(workoutExercise.id)}
            onDelete={() => onDeleteExercise(workoutExercise.id)}
          />
        );
      })}
    </div>
  );
}