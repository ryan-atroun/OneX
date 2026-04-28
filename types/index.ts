export type Weekday = "Lundi" | "Mercredi" | "Vendredi" | "Dimanche";

export type Exercise = {
  id: string;
  name: string;
  target: string;
};

export type WorkoutDay = {
  id: string;
  day: Weekday;
  title: string;
  shortTitle: string;
  exercises: Exercise[];
};

export type ExerciseLog = {
  exerciseId: string;
  name: string;
  weight: string;
  reps: string;
  done: boolean;
  notes: string;
};

export type WorkoutSession = {
  id: string;
  workoutId: string;
  workoutTitle: string;
  date: string;
  exercises: ExerciseLog[];
};

export type DailyTracking = {
  date: string;
  weight: string;
  calories: string;
  protein: string;
  steps: string;
  note: string;
};
