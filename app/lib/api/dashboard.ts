import { supabase } from '../supabase';
import { DateRange } from '@/app/hooks/useDateRange';

export async function getDashboardStats(timeFrame: string, startDate: Date, endDate: Date) {
  // Format dates for database query
  const start = startDate.toISOString();
  const end = endDate.toISOString();

  // Get all exercises first
  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select('*')
    .order('name');

  if (exercisesError) throw new Error('Failed to fetch exercises');

  // Get workouts within the time frame
  const { data: workouts, error: workoutsError } = await supabase
    .from('archived_workouts')
    .select(`
      *,
      workout_exercises (
        *,
        exercise:exercises(*)
      )
    `)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true });

  if (workoutsError) throw new Error('Failed to fetch workout data');

  // If no data found for the selected range, get the nearest available data point
  if (!workouts || workouts.length === 0) {
    const { data: nearestWorkout, error: nearestError } = await supabase
      .from('archived_workouts')
      .select(`
        *,
        workout_exercises (
          *,
          exercise:exercises(*)
        )
      `)
      .lte('date', end)
      .order('date', { ascending: false })
      .limit(1);

    if (nearestError) throw new Error('Failed to fetch nearest workout data');

    // If we found a nearest workout, use its date as the start date
    if (nearestWorkout && nearestWorkout.length > 0) {
      const nearestDate = new Date(nearestWorkout[0].date);
      return getDashboardStats(timeFrame, nearestDate, endDate);
    }
  }

  // Calculate stats for the current period
  const totalWorkouts = workouts?.length || 0;
  const totalWeight = workouts?.reduce((sum, workout) => 
    sum + workout.workout_exercises.reduce((exerciseSum, exercise) => 
      exerciseSum + (exercise.weight * exercise.sets * exercise.reps), 0
    ), 0
  ) || 0;
  const avgScore = workouts?.reduce((sum, workout) => sum + (workout.score || 0), 0) / totalWorkouts || 0;

  // Process workout data for the performance chart - aggregate by day
  const performanceByDay = workouts?.reduce((acc: { [key: string]: number }, workout) => {
    const date = workout.date.split('T')[0];
    const workoutWeight = workout.workout_exercises.reduce((sum, exercise) => 
      sum + (exercise.weight * exercise.sets * exercise.reps), 0
    );
    
    if (acc[date]) {
      acc[date] += workoutWeight;
    } else {
      acc[date] = workoutWeight;
    }
    
    return acc;
  }, {});

  const performanceData = Object.entries(performanceByDay || {}).map(([date, totalWeight]) => ({
    date,
    totalWeight
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Process exercise-specific data for the progress chart - aggregate by day
  const exerciseProgressByDay = workouts?.reduce((acc: { [key: string]: { [key: string]: number } }, workout) => {
    const date = workout.date.split('T')[0];
    
    if (!acc[date]) {
      acc[date] = {};
    }

    workout.workout_exercises.forEach(exercise => {
      if (exercise.exercise) {
        // For each exercise, keep the highest weight for that day
        if (!acc[date][exercise.exercise.id] || acc[date][exercise.exercise.id] < exercise.weight) {
          acc[date][exercise.exercise.id] = exercise.weight;
        }
      }
    });

    return acc;
  }, {});

  const exerciseProgressData = Object.entries(exerciseProgressByDay || {}).map(([date, exercises]) => ({
    date,
    ...exercises
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate personal bests
  const personalBests = workouts?.reduce((bests: any[], workout) => {
    workout.workout_exercises.forEach(exercise => {
      if (!exercise.exercise) return;

      const exerciseName = exercise.exercise.name;
      const existingBest = bests.find(b => b.exerciseName === exerciseName);

      // Different metrics for different exercises
      let metric: 'weight_per_rep' | 'max_reps' | 'max_weight' = 'max_weight';
      let value = exercise.weight;

      if (exerciseName === 'Dumbbell Bench Press') {
        metric = 'weight_per_rep';
        value = exercise.weight / exercise.reps;
      } else if (exerciseName === 'Pull Ups') {
        metric = 'max_reps';
        value = exercise.reps;
      } else if (exerciseName === 'Lat Pulldowns') {
        metric = 'max_weight';
        value = exercise.weight;
      }

      if (!existingBest || (
        metric === existingBest.metric && value > existingBest.value
      )) {
        if (existingBest) {
          existingBest.value = value;
          existingBest.date = workout.date;
        } else {
          bests.push({
            exerciseName,
            value,
            metric,
            date: workout.date
          });
        }
      }
    });
    return bests;
  }, []) || [];

  // Get recent activity
  const recentActivity = workouts?.slice(0, 5).map(workout => ({
    id: workout.id,
    name: workout.name,
    date: workout.date,
    score: workout.score
  })) || [];

  return {
    totalWorkouts,
    totalWeight: Math.round(totalWeight),
    avgScore: Math.round(avgScore * 10) / 10,
    performanceData,
    exerciseProgressData,
    exercises,
    recentActivity,
    personalBests
  };
}

export async function getRecentActivity(limit = 5) {
  const { data, error } = await supabase
    .from('archived_workouts')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);

  if (error) throw new Error('Failed to fetch recent activity');
  return data;
}