export type Weekday = "Lundi" | "Mercredi" | "Vendredi" | "Dimanche";

export type WorkoutTag = "force" | "hypertrophie" | "sprint" | "rappel" | "endurance" | "gainage";

export type ExerciseKind = "weighted" | "bodyweight" | "cardio" | "core";

export type Exercise = {
  id: string;
  name: string;
  target: string;
  kind: ExerciseKind;
  repRange?: {
    min: number;
    max: number;
  };
};

export type WorkoutDay = {
  id: string;
  day: Weekday;
  weekdayIndex: number;
  title: string;
  shortTitle: string;
  muscleGroups: string[];
  estimatedMinutes: number;
  tags: WorkoutTag[];
  focus: string;
  exercises: Exercise[];
};

export type ExerciseLog = {
  exerciseId: string;
  name: string;
  target: string;
  kind: ExerciseKind;
  weight: string;
  reps: string;
  done: boolean;
  notes: string;
};

export type WorkoutDraft = {
  id: string;
  workoutId: string;
  workoutTitle: string;
  updatedAt: string;
  startedAt: string;
  exercises: ExerciseLog[];
};

export type WorkoutSession = {
  id: string;
  workoutId: string;
  workoutTitle: string;
  date: string;
  durationMinutes?: number;
  exercises: ExerciseLog[];
};

export type ExerciseHistoryEntry = {
  exerciseId: string;
  workoutId: string;
  sessionId: string;
  date: string;
  weight: string;
  reps: string;
  notes: string;
};
