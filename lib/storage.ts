import type {
  DailyTracking,
  ExerciseHistoryEntry,
  OneXExport,
  OneXSettings,
  WorkoutDraft,
  WorkoutSession
} from "@/types";

export const STORAGE_KEYS = {
  sessions: "onex_workout_sessions",
  drafts: "onex_workout_drafts",
  tracking: "onex_daily_tracking",
  exerciseHistory: "onex_exercise_history",
  settings: "onex_settings"
} as const;

const LEGACY_KEYS = {
  sessions: "onex:sessions",
  tracking: "onex:tracking"
} as const;

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function getStorageItem<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setStorageItem<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function updateStorageItem<T>(key: string, fallback: T, updater: (value: T) => T) {
  const current = getStorageItem<T>(key, fallback);
  const next = updater(current);
  setStorageItem(key, next);
  return next;
}

export function removeStorageItem(key: string) {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(key);
}

function migrateLegacyData() {
  if (!canUseStorage()) return;

  const hasStableSessions = window.localStorage.getItem(STORAGE_KEYS.sessions);
  const legacySessions = window.localStorage.getItem(LEGACY_KEYS.sessions);
  if (!hasStableSessions && legacySessions) window.localStorage.setItem(STORAGE_KEYS.sessions, legacySessions);

  const hasStableTracking = window.localStorage.getItem(STORAGE_KEYS.tracking);
  const legacyTracking = window.localStorage.getItem(LEGACY_KEYS.tracking);
  if (!hasStableTracking && legacyTracking) window.localStorage.setItem(STORAGE_KEYS.tracking, legacyTracking);
}

export function getSessions(): WorkoutSession[] {
  migrateLegacyData();
  return getStorageItem<WorkoutSession[]>(STORAGE_KEYS.sessions, []);
}

export function setSessions(sessions: WorkoutSession[]) {
  setStorageItem(STORAGE_KEYS.sessions, sessions);
}

export function saveSession(session: WorkoutSession) {
  return updateStorageItem<WorkoutSession[]>(STORAGE_KEYS.sessions, [], (sessions) => [
    session,
    ...sessions.filter((item) => item.id !== session.id)
  ]);
}

export function deleteSession(sessionId: string) {
  setSessions(getSessions().filter((session) => session.id !== sessionId));
  setExerciseHistory(getExerciseHistory().filter((entry) => entry.sessionId !== sessionId));
}

export function getDrafts(): WorkoutDraft[] {
  return getStorageItem<WorkoutDraft[]>(STORAGE_KEYS.drafts, []);
}

export function saveDraft(draft: WorkoutDraft) {
  return updateStorageItem<WorkoutDraft[]>(STORAGE_KEYS.drafts, [], (drafts) => [
    draft,
    ...drafts.filter((item) => item.workoutId !== draft.workoutId)
  ]);
}

export function deleteDraft(workoutId: string) {
  setStorageItem(
    STORAGE_KEYS.drafts,
    getDrafts().filter((draft) => draft.workoutId !== workoutId)
  );
}

export function getTrackingEntries(): DailyTracking[] {
  migrateLegacyData();
  return getStorageItem<DailyTracking[]>(STORAGE_KEYS.tracking, []);
}

export function getTrackingForDate(date: string): DailyTracking {
  const entry = getTrackingEntries().find((item) => item.date === date);

  return (
    entry ?? {
      date,
      weight: "",
      calories: "",
      protein: "",
      steps: "",
      score: "",
      note: ""
    }
  );
}

export function saveTracking(entry: DailyTracking) {
  return updateStorageItem<DailyTracking[]>(STORAGE_KEYS.tracking, [], (entries) => [
    entry,
    ...entries.filter((item) => item.date !== entry.date)
  ]);
}

export function getExerciseHistory(): ExerciseHistoryEntry[] {
  return getStorageItem<ExerciseHistoryEntry[]>(STORAGE_KEYS.exerciseHistory, []);
}

export function setExerciseHistory(history: ExerciseHistoryEntry[]) {
  setStorageItem(STORAGE_KEYS.exerciseHistory, history);
}

export function addExerciseHistoryFromSession(session: WorkoutSession) {
  const nextEntries: ExerciseHistoryEntry[] = session.exercises
    .filter((exercise) => exercise.done || exercise.weight || exercise.reps || exercise.notes)
    .map((exercise) => ({
      exerciseId: exercise.exerciseId,
      workoutId: session.workoutId,
      sessionId: session.id,
      date: session.date,
      weight: exercise.weight,
      reps: exercise.reps,
      notes: exercise.notes
    }));

  setExerciseHistory([...nextEntries, ...getExerciseHistory().filter((entry) => entry.sessionId !== session.id)]);
}

export function getLastExerciseHistory(exerciseId: string) {
  return getExerciseHistory().find((entry) => entry.exerciseId === exerciseId);
}

export function getSettings(): OneXSettings {
  return getStorageItem<OneXSettings>(STORAGE_KEYS.settings, {});
}

export function saveSettings(settings: OneXSettings) {
  setStorageItem(STORAGE_KEYS.settings, settings);
}

export function clearOneXData() {
  Object.values(STORAGE_KEYS).forEach((key) => removeStorageItem(key));
}

export function exportOneXData(): OneXExport {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    sessions: getSessions(),
    drafts: getDrafts(),
    tracking: getTrackingEntries(),
    exerciseHistory: getExerciseHistory(),
    settings: getSettings()
  };
}

export function importOneXData(data: unknown) {
  if (!data || typeof data !== "object" || !("version" in data)) {
    throw new Error("Format d'import OneX invalide.");
  }

  const payload = data as Partial<OneXExport>;
  if (payload.version !== 1) {
    throw new Error("Version d'import OneX non supportee.");
  }

  setStorageItem(STORAGE_KEYS.sessions, Array.isArray(payload.sessions) ? payload.sessions : []);
  setStorageItem(STORAGE_KEYS.drafts, Array.isArray(payload.drafts) ? payload.drafts : []);
  setStorageItem(STORAGE_KEYS.tracking, Array.isArray(payload.tracking) ? payload.tracking : []);
  setStorageItem(STORAGE_KEYS.exerciseHistory, Array.isArray(payload.exerciseHistory) ? payload.exerciseHistory : []);
  setStorageItem(STORAGE_KEYS.settings, payload.settings && typeof payload.settings === "object" ? payload.settings : {});
}
