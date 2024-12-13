// Local storage keys
export const SAVED_EXERCISES_KEY = 'savedExercises';

// Save exercise IDs to localStorage 
export function saveExerciseState(exerciseId: string) {
  try {
    const savedExercises = getSavedExercises();
    savedExercises.add(exerciseId);
    localStorage.setItem(SAVED_EXERCISES_KEY, JSON.stringify(Array.from(savedExercises)));
  } catch (error) {
    console.error('Failed to save exercise state:', error);
  }
}

// Remove exercise ID from localStorage
export function removeSavedExercise(exerciseId: string) {
  try {
    const savedExercises = getSavedExercises();
    savedExercises.delete(exerciseId);
    localStorage.setItem(SAVED_EXERCISES_KEY, JSON.stringify(Array.from(savedExercises)));
  } catch (error) {
    console.error('Failed to remove exercise state:', error);
  }
}

// Get all saved exercise IDs
export function getSavedExercises(): Set<string> {
  try {
    const saved = localStorage.getItem(SAVED_EXERCISES_KEY);
    return new Set(saved ? JSON.parse(saved) : []);
  } catch (error) {
    console.error('Failed to get saved exercises:', error);
    return new Set();
  }
}