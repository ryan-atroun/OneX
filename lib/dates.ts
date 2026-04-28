import { program } from "@/data/program";
import type { WorkoutDay } from "@/types";

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function formatShortDate(date: string | Date) {
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export function formatLongDate(date = new Date()) {
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" });
}

export function getWeekBounds(date = new Date()) {
  const start = new Date(date);
  start.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function getWeekLabel(date = new Date()) {
  const { start, end } = getWeekBounds(date);
  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
}

export function isSameDate(a: string | Date, b: string | Date) {
  return todayKey(new Date(a)) === todayKey(new Date(b));
}

export function getWorkoutForDate(date = new Date()): WorkoutDay | undefined {
  return program.find((workout) => workout.weekdayIndex === date.getDay());
}

export function getNextWorkout(date = new Date()): WorkoutDay {
  for (let offset = 1; offset <= 7; offset += 1) {
    const next = new Date(date);
    next.setDate(date.getDate() + offset);
    const workout = getWorkoutForDate(next);
    if (workout) return workout;
  }

  return program[0];
}

export function sortByDateDesc<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
