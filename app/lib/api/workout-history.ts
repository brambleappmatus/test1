import { supabase } from '../supabase';
import type { Workout, WorkoutExercise, ArchivedWorkout } from '@/app/types/database';

export async function getWorkoutHistory() {
  const { data, error } = await supabase
    .from('archived_workouts')
    .select(`
      *,
      workout_exercises (
        *,
        exercise:exercises(*)
      )
    `)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching workout history:', error);
    throw new Error('Failed to fetch workout history');
  }

  return data || [];
}

export async function deleteArchivedWorkout(id: string): Promise<void> {
  const { error } = await supabase
    .from('archived_workouts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting archived workout:', error);
    throw new Error('Failed to delete workout');
  }
}

export async function updateArchivedWorkout(
  id: string,
  data: {
    name: string;
    date: string;
    exercises: {
      id: string;
      exercise_id: string;
      sets: number;
      reps: number;
      weight: number;
    }[];
  }
): Promise<void> {
  const { error: workoutError } = await supabase
    .from('archived_workouts')
    .update({ 
      name: data.name,
      date: data.date
    })
    .eq('id', id);

  if (workoutError) {
    throw new Error('Failed to update workout');
  }

  // Update each exercise
  for (const exercise of data.exercises) {
    const { error: exerciseError } = await supabase
      .from('workout_exercises')
      .update({
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight
      })
      .eq('id', exercise.id);

    if (exerciseError) {
      throw new Error('Failed to update exercise');
    }
  }
}

export async function finishWorkout(
  workout: Workout,
  exercises: WorkoutExercise[],
  score: number
): Promise<ArchivedWorkout> {
  // First, create the archived workout entry
  const { data: archivedWorkout, error: archiveError } = await supabase
    .from('archived_workouts')
    .insert([{
      workout_template_id: workout.id,
      name: workout.name,
      score,
      date: new Date().toISOString()
    }])
    .select()
    .single();

  if (archiveError) {
    console.error('Error archiving workout:', archiveError);
    throw new Error('Failed to archive workout');
  }

  // Then, create workout exercise entries linked to the archived workout
  const exerciseData = exercises.map(exercise => ({
    archived_workout_id: archivedWorkout.id,
    exercise_id: exercise.exercise_id,
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight
  }));

  const { error: exercisesError } = await supabase
    .from('workout_exercises')
    .insert(exerciseData);

  if (exercisesError) {
    console.error('Error saving workout exercises:', exercisesError);
    // Clean up the archived workout if exercise insertion fails
    await supabase.from('archived_workouts').delete().eq('id', archivedWorkout.id);
    throw new Error('Failed to save workout exercises');
  }

  return archivedWorkout;
}