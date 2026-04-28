import type { Exercise, ExerciseHistoryEntry, ExerciseLog } from "@/types";

function toNumber(value: string) {
  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getCompletedCount(exercises: ExerciseLog[]) {
  return exercises.filter((exercise) => exercise.done).length;
}

export function getSessionProgress(exercises: ExerciseLog[]) {
  if (!exercises.length) return 0;
  return Math.round((getCompletedCount(exercises) / exercises.length) * 100);
}

export function hasExerciseInput(exercise: ExerciseLog) {
  return Boolean(exercise.done || exercise.weight || exercise.reps || exercise.notes);
}

export function getProgressionSuggestion(exercise: Exercise, last?: ExerciseHistoryEntry | ExerciseLog) {
  if (!last || (!last.reps && !last.weight)) return "Reprends proprement, priorite execution";

  if (exercise.kind === "cardio") return "Garde l'intensite et ajoute une repetition si propre";
  if (exercise.kind === "core") return "Ajoute quelques secondes ou une serie propre";

  const reps = toNumber(last.reps);
  const weight = toNumber(last.weight);
  const highRange = exercise.repRange?.max;

  if (exercise.kind === "bodyweight") {
    if (highRange && reps >= highRange) return "Ajoute du lest leger si l'execution reste propre";
    return "Essaie +1 rep";
  }

  if (highRange && reps >= highRange && weight > 0) return "Augmente legerement la charge";
  if (highRange && reps >= highRange) return "Garde la charge et valide le haut de la fourchette";
  return "Essaie +1 rep";
}
