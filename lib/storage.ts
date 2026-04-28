import type { DailyTracking, WorkoutSession } from "@/types";

const SESSIONS_KEY = "onex:sessions";
const TRACKING_KEY = "onex:tracking";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getSessions(): WorkoutSession[] {
  return readJson<WorkoutSession[]>(SESSIONS_KEY, []);
}

export function saveSession(session: WorkoutSession) {
  const sessions = getSessions();
  writeJson(SESSIONS_KEY, [session, ...sessions]);
}

export function getTrackingEntries(): DailyTracking[] {
  return readJson<DailyTracking[]>(TRACKING_KEY, []);
}

export function getTodayTracking(date: string): DailyTracking {
  const entry = getTrackingEntries().find((item) => item.date === date);

  return (
    entry ?? {
      date,
      weight: "",
      calories: "",
      protein: "",
      steps: "",
      note: ""
    }
  );
}

export function saveTracking(entry: DailyTracking) {
  const entries = getTrackingEntries();
  const nextEntries = [entry, ...entries.filter((item) => item.date !== entry.date)];
  writeJson(TRACKING_KEY, nextEntries);
}

export function getLastPerformance(exerciseId: string): WorkoutSession | undefined {
  return getSessions().find((session) =>
    session.exercises.some((exercise) => exercise.exerciseId === exerciseId && exercise.done)
  );
}
