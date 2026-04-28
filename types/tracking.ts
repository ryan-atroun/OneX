export type DailyTracking = {
  date: string;
  weight: string;
  calories: string;
  protein: string;
  steps: string;
  score: string;
  note: string;
};

export type OneXSettings = {
  preferredWorkoutId?: string;
};

export type OneXExport = {
  version: 1;
  exportedAt: string;
  sessions: unknown;
  drafts: unknown;
  tracking: unknown;
  exerciseHistory: unknown;
  settings: unknown;
};
