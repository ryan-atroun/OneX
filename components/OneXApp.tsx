"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  Copy,
  Dumbbell,
  Flame,
  History,
  Home,
  NotebookPen,
  Play,
  RotateCcw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Trash2,
  TrendingUp,
  Weight
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AppShell from "@/components/AppShell";
import type { AppTab } from "@/components/BottomNav";
import EmptyState from "@/components/EmptyState";
import GlassCard from "@/components/GlassCard";
import MetricCard from "@/components/MetricCard";
import OneXLogo from "@/components/OneXLogo";
import PrimaryButton from "@/components/PrimaryButton";
import ProgressBar from "@/components/ProgressBar";
import StatBadge from "@/components/StatBadge";
import WorkoutCard from "@/components/WorkoutCard";
import BrandSignature from "@/components/BrandSignature";
import { program } from "@/data/program";
import { formatLongDate, formatShortDate, getNextWorkout, getWeekBounds, getWeekLabel, getWorkoutForDate, isSameDate, sortByDateDesc, todayKey } from "@/lib/dates";
import { getCompletedCount, getProgressionSuggestion, getSessionProgress, hasExerciseInput } from "@/lib/progression";
import {
  addExerciseHistoryFromSession,
  clearOneXData,
  deleteDraft,
  deleteSession,
  exportOneXData,
  getDrafts,
  getExerciseHistory,
  getLastExerciseHistory,
  getSessions,
  getTrackingEntries,
  getTrackingForDate,
  importOneXData,
  saveDraft,
  saveSession,
  saveSettings,
  saveTracking
} from "@/lib/storage";
import type { DailyTracking, Exercise, ExerciseLog, ExerciseHistoryEntry, WorkoutDay, WorkoutDraft, WorkoutSession } from "@/types";

const navItems = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "program", label: "Plan", icon: CalendarDays },
  { id: "session", label: "Seance", icon: Dumbbell },
  { id: "tracking", label: "Suivi", icon: Activity },
  { id: "history", label: "Historique", icon: History },
  { id: "settings", label: "Data", icon: Settings }
] satisfies { id: AppTab; label: string; icon: LucideIcon }[];

function createExerciseLogs(workout: WorkoutDay): ExerciseLog[] {
  return workout.exercises.map((exercise) => ({
    exerciseId: exercise.id,
    name: exercise.name,
    target: exercise.target,
    kind: exercise.kind,
    weight: "",
    reps: "",
    done: false,
    notes: ""
  }));
}

function formatNumber(value: number, fallback = "--") {
  return Number.isFinite(value) && value > 0 ? Math.round(value).toString() : fallback;
}

function average(values: string[]) {
  const nums = values.map((value) => Number(value.replace(",", "."))).filter((value) => Number.isFinite(value) && value > 0);
  if (!nums.length) return 0;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}

function doneExercises(session: WorkoutSession) {
  return session.exercises.filter((exercise) => hasExerciseInput(exercise));
}

export default function OneXApp() {
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(program[0].id);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(createExerciseLogs(program[0]));
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [drafts, setDrafts] = useState<WorkoutDraft[]>([]);
  const [trackingEntries, setTrackingEntries] = useState<DailyTracking[]>([]);
  const [trackingDate, setTrackingDate] = useState(todayKey());
  const [tracking, setTracking] = useState<DailyTracking>(getEmptyTracking(todayKey()));
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistoryEntry[]>([]);
  const [toast, setToast] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const autoSaveReady = useRef(false);

  const selectedWorkout = useMemo(
    () => program.find((workout) => workout.id === selectedWorkoutId) ?? program[0],
    [selectedWorkoutId]
  );

  const selectedDraft = useMemo(
    () => drafts.find((draft) => draft.workoutId === selectedWorkout.id),
    [drafts, selectedWorkout.id]
  );

  const todayWorkout = getWorkoutForDate();
  const nextWorkout = todayWorkout ?? getNextWorkout();
  const todaySession = sessions.find((session) => isSameDate(session.date, new Date()) && session.workoutId === todayWorkout?.id);
  const lastSession = sessions[0];
  const { start, end } = getWeekBounds();
  const sessionsThisWeek = sessions.filter((session) => {
    const date = new Date(session.date);
    return date >= start && date <= end;
  });
  const currentDraft = drafts[0];

  useEffect(() => {
    refreshData();
    const settings = localStorageSafePreferredWorkout();
    if (settings) setSelectedWorkoutId(settings);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const draft = getDrafts().find((item) => item.workoutId === selectedWorkout.id);
    setExerciseLogs(draft ? draft.exercises : createExerciseLogs(selectedWorkout));
    autoSaveReady.current = true;
  }, [isHydrated, selectedWorkout]);

  useEffect(() => {
    if (!isHydrated) return;
    setTracking(getTrackingForDate(trackingDate));
  }, [isHydrated, trackingDate]);

  useEffect(() => {
    if (!isHydrated || !autoSaveReady.current) return;
    if (!exerciseLogs.some(hasExerciseInput)) return;
    persistDraft("auto");
  }, [exerciseLogs]);

  function localStorageSafePreferredWorkout() {
    try {
      return window.localStorage ? JSON.parse(window.localStorage.getItem("onex_settings") || "{}")?.preferredWorkoutId : undefined;
    } catch {
      return undefined;
    }
  }

  function refreshData() {
    const nextSessions = sortByDateDesc(getSessions());
    setSessions(nextSessions);
    setDrafts(getDrafts());
    const entries = sortByDateDesc(getTrackingEntries());
    setTrackingEntries(entries);
    setTracking(getTrackingForDate(trackingDate));
    setExerciseHistory(getExerciseHistory());
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function startWorkout(workoutId: string) {
    setSelectedWorkoutId(workoutId);
    saveSettings({ preferredWorkoutId: workoutId });
    setActiveTab("session");
  }

  function updateExercise(index: number, field: keyof ExerciseLog, value: string | boolean) {
    setExerciseLogs((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, [field]: value } : exercise
      )
    );
  }

  function copyLastPerformance(index: number, exercise: Exercise) {
    const last = getLastExerciseHistory(exercise.id);
    if (!last) return;
    updateExercise(index, "weight", last.weight);
    updateExercise(index, "reps", last.reps);
    showToast("Derniere perf copiee.");
  }

  function persistDraft(source: "manual" | "auto" = "manual") {
    const draft: WorkoutDraft = {
      id: selectedDraft?.id ?? crypto.randomUUID(),
      workoutId: selectedWorkout.id,
      workoutTitle: selectedWorkout.shortTitle,
      startedAt: selectedDraft?.startedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exercises: exerciseLogs
    };

    saveDraft(draft);
    setDrafts(getDrafts());
    if (source === "manual") showToast("Brouillon sauvegarde.");
  }

  function cancelDraft() {
    const hasData = exerciseLogs.some(hasExerciseInput);
    if (hasData && !window.confirm("Annuler cette seance et supprimer le brouillon ?")) return;
    deleteDraft(selectedWorkout.id);
    setExerciseLogs(createExerciseLogs(selectedWorkout));
    refreshData();
    showToast("Brouillon supprime.");
  }

  function finishSession() {
    if (!exerciseLogs.some(hasExerciseInput)) {
      showToast("Ajoute au moins une performance avant de terminer.");
      return;
    }

    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      workoutId: selectedWorkout.id,
      workoutTitle: selectedWorkout.shortTitle,
      durationMinutes: selectedWorkout.estimatedMinutes,
      date: new Date().toISOString(),
      exercises: exerciseLogs
    };

    saveSession(session);
    addExerciseHistoryFromSession(session);
    deleteDraft(selectedWorkout.id);
    setExerciseLogs(createExerciseLogs(selectedWorkout));
    refreshData();
    setActiveTab("history");
    showToast("Seance terminee. Historique mis a jour.");
  }

  function submitTracking() {
    saveTracking(tracking);
    refreshData();
    showToast("Suivi sauvegarde.");
  }

  function handleDeleteSession(sessionId: string) {
    if (!window.confirm("Supprimer cette seance de l'historique ?")) return;
    deleteSession(sessionId);
    refreshData();
    showToast("Seance supprimee.");
  }

  function handleExport() {
    const payload = exportOneXData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `onex-export-${todayKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Export JSON prepare.");
  }

  function handleImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!window.confirm("Importer ces donnees va remplacer les donnees locales OneX. Continuer ?")) return;
        importOneXData(parsed);
        refreshData();
        showToast("Import termine.");
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Import impossible.");
      }
    };
    reader.readAsText(file);
  }

  function handleReset() {
    const first = window.confirm("Attention : cela supprimera toutes les donnees OneX locales. Continuer ?");
    if (!first) return;
    const second = window.confirm("Derniere confirmation : reset definitif ?");
    if (!second) return;
    clearOneXData();
    setSelectedWorkoutId(program[0].id);
    setExerciseLogs(createExerciseLogs(program[0]));
    refreshData();
    showToast("Donnees OneX reinitialisees.");
  }

  if (!isHydrated) {
    return (
      <AppShell date={formatLongDate()} week={getWeekLabel()} navItems={navItems} activeTab="dashboard" onTabChange={setActiveTab}>
        <GlassCard className="mt-4">
          <p className="text-sm text-slate-400">Chargement de tes donnees locales...</p>
        </GlassCard>
      </AppShell>
    );
  }

  return (
    <AppShell date={formatLongDate()} week={getWeekLabel()} navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab}>
      {toast ? (
        <div className="fixed left-1/2 top-[max(env(safe-area-inset-top),0.75rem)] z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-3xl border border-cyan-300/30 bg-cyan-300/[0.12] px-4 py-3 text-sm font-bold text-cyan-100 shadow-glow backdrop-blur-2xl">
          {toast}
        </div>
      ) : null}

      {activeTab === "dashboard" ? (
        <DashboardView
          tracking={trackingEntries.find((entry) => entry.date === todayKey()) ?? getEmptyTracking(todayKey())}
          todayWorkout={todayWorkout}
          nextWorkout={nextWorkout}
          todaySession={todaySession}
          currentDraft={currentDraft}
          sessionsThisWeek={sessionsThisWeek.length}
          lastSession={lastSession}
          onStart={startWorkout}
          onTab={setActiveTab}
        />
      ) : null}

      {activeTab === "program" ? <ProgramView selectedWorkoutId={selectedWorkoutId} onStart={startWorkout} /> : null}

      {activeTab === "session" ? (
        <SessionView
          selectedWorkout={selectedWorkout}
          exerciseLogs={exerciseLogs}
          drafts={drafts}
          onWorkoutChange={startWorkout}
          onExerciseChange={updateExercise}
          onCopyLast={copyLastPerformance}
          onSaveDraft={() => persistDraft("manual")}
          onCancel={cancelDraft}
          onFinish={finishSession}
        />
      ) : null}

      {activeTab === "tracking" ? (
        <TrackingView
          tracking={tracking}
          setTracking={setTracking}
          trackingDate={trackingDate}
          setTrackingDate={setTrackingDate}
          entries={trackingEntries}
          onSave={submitTracking}
        />
      ) : null}

      {activeTab === "history" ? (
        <HistoryView sessions={sessions} onDelete={handleDeleteSession} />
      ) : null}

      {activeTab === "settings" ? (
        <SettingsView
          sessions={sessions.length}
          drafts={drafts.length}
          tracking={trackingEntries.length}
          exerciseHistory={exerciseHistory.length}
          onExport={handleExport}
          onImport={handleImport}
          onReset={handleReset}
        />
      ) : null}
    </AppShell>
  );
}

function getEmptyTracking(date: string): DailyTracking {
  return { date, weight: "", calories: "", protein: "", steps: "", score: "", note: "" };
}

function DashboardView({
  tracking,
  todayWorkout,
  nextWorkout,
  todaySession,
  currentDraft,
  sessionsThisWeek,
  lastSession,
  onStart,
  onTab
}: {
  tracking: DailyTracking;
  todayWorkout?: WorkoutDay;
  nextWorkout: WorkoutDay;
  todaySession?: WorkoutSession;
  currentDraft?: WorkoutDraft;
  sessionsThisWeek: number;
  lastSession?: WorkoutSession;
  onStart: (workoutId: string) => void;
  onTab: (tab: AppTab) => void;
}) {
  const featured = todayWorkout ?? nextWorkout;
  const title = todaySession ? "Seance terminee" : currentDraft ? "Reprendre la seance" : todayWorkout ? "Seance du jour" : "Prochaine seance";

  return (
    <div className="space-y-4">
      <GlassCard className="relative overflow-hidden bg-gradient-to-br from-violet-500/20 via-blue-500/[0.12] to-cyan-300/[0.12]">
        <div className="absolute right-[-3rem] top-[-3rem] h-32 w-32 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative">
          <OneXLogo size="lg" showSignature className="mb-6" />
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <StatBadge tone={todaySession ? "green" : currentDraft ? "violet" : "cyan"}>{title}</StatBadge>
              <h2 className="mt-3 text-3xl font-black leading-tight">{featured.shortTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{featured.focus}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-3">
              <Dumbbell className="text-cyan-100" size={28} />
            </div>
          </div>
          <ProgressBar value={(sessionsThisWeek / 4) * 100} label={`${sessionsThisWeek} / 4 seances cette semaine`} />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <PrimaryButton disabled={Boolean(todaySession)} onClick={() => onStart(currentDraft?.workoutId ?? featured.id)}>
              <Play size={18} />
              {currentDraft ? "Reprendre" : "Commencer"}
            </PrimaryButton>
            <PrimaryButton variant="secondary" onClick={() => onTab("program")}>
              Voir programme
            </PrimaryButton>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={Weight} label="Poids" value={tracking.weight || "--"} unit="kg" />
        <MetricCard icon={Flame} label="Calories" value={tracking.calories || "--"} unit="kcal" />
        <MetricCard icon={Dumbbell} label="Proteines" value={tracking.protein || "--"} unit="g" />
        <MetricCard icon={Activity} label="Steps" value={tracking.steps || "--"} unit="pas" />
      </div>

      <GlassCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-cyan-200">Focus du jour</p>
            <h3 className="mt-1 text-xl font-black">{featured.muscleGroups.join(" / ")}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{featured.estimatedMinutes} min estimees · {featured.exercises.length} exercices</p>
          </div>
          <Sparkles className="shrink-0 text-violet-200" />
        </div>
      </GlassCard>

      {lastSession ? (
        <GlassCard>
          <p className="text-sm font-bold text-cyan-200">Dernier entrainement</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black">{lastSession.workoutTitle}</h3>
              <p className="mt-1 text-sm text-slate-400">{formatShortDate(lastSession.date)} · {doneExercises(lastSession).length} exercices notes</p>
            </div>
            <TrendingUp className="text-cyan-200" />
          </div>
        </GlassCard>
      ) : (
        <EmptyState icon={History} title="Aucun historique" text="Termine ta premiere seance pour debloquer le suivi de progression." />
      )}
    </div>
  );
}

function ProgramView({ selectedWorkoutId, onStart }: { selectedWorkoutId: string; onStart: (workoutId: string) => void }) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Programme integre" text="Ta semaine OneX, simple et fixe pour progresser sans te disperser." />
      {program.map((workout) => (
        <WorkoutCard key={workout.id} workout={workout} onStart={onStart} />
      ))}
      <p className="px-1 text-xs text-slate-500">Selection actuelle : {program.find((workout) => workout.id === selectedWorkoutId)?.shortTitle}</p>
    </div>
  );
}

function SessionView({
  selectedWorkout,
  exerciseLogs,
  drafts,
  onWorkoutChange,
  onExerciseChange,
  onCopyLast,
  onSaveDraft,
  onCancel,
  onFinish
}: {
  selectedWorkout: WorkoutDay;
  exerciseLogs: ExerciseLog[];
  drafts: WorkoutDraft[];
  onWorkoutChange: (workoutId: string) => void;
  onExerciseChange: (index: number, field: keyof ExerciseLog, value: string | boolean) => void;
  onCopyLast: (index: number, exercise: Exercise) => void;
  onSaveDraft: () => void;
  onCancel: () => void;
  onFinish: () => void;
}) {
  const progress = getSessionProgress(exerciseLogs);
  const completed = getCompletedCount(exerciseLogs);
  const activeDraft = drafts.find((draft) => draft.workoutId === selectedWorkout.id);

  return (
    <div className="space-y-4">
      <GlassCard className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-cyan-200">Seance active</p>
            <h2 className="mt-1 text-2xl font-black">{selectedWorkout.shortTitle}</h2>
            <p className="mt-1 text-sm text-slate-400">{completed}/{exerciseLogs.length} exercices faits</p>
          </div>
          {activeDraft ? <StatBadge tone="violet">Brouillon</StatBadge> : <StatBadge tone="slate">Pret</StatBadge>}
        </div>
        <ProgressBar value={progress} />
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Changer de seance</span>
          <select
            value={selectedWorkout.id}
            onChange={(event) => onWorkoutChange(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-sm font-bold text-white outline-none focus:border-cyan-300/60"
          >
            {program.map((workout) => (
              <option key={workout.id} value={workout.id}>
                {workout.day} - {workout.shortTitle}
              </option>
            ))}
          </select>
        </label>
      </GlassCard>

      {exerciseLogs.map((log, index) => {
        const exercise = selectedWorkout.exercises[index];
        const last = exercise ? getLastExerciseHistory(exercise.id) : undefined;
        return (
          <ExerciseCard
            key={log.exerciseId}
            exercise={exercise}
            log={log}
            last={last}
            index={index}
            onChange={onExerciseChange}
            onCopyLast={onCopyLast}
          />
        );
      })}

      <div className="grid grid-cols-2 gap-3">
        <PrimaryButton variant="secondary" onClick={onSaveDraft}>
          <Shield size={18} />
          Sauvegarder
        </PrimaryButton>
        <PrimaryButton variant="danger" onClick={onCancel}>
          <RotateCcw size={18} />
          Annuler
        </PrimaryButton>
      </div>
      <PrimaryButton className="w-full" disabled={!exerciseLogs.some(hasExerciseInput)} onClick={onFinish}>
        <Check size={19} />
        Terminer seance
      </PrimaryButton>
    </div>
  );
}

function ExerciseCard({
  exercise,
  log,
  last,
  index,
  onChange,
  onCopyLast
}: {
  exercise?: Exercise;
  log: ExerciseLog;
  last?: ExerciseHistoryEntry;
  index: number;
  onChange: (index: number, field: keyof ExerciseLog, value: string | boolean) => void;
  onCopyLast: (index: number, exercise: Exercise) => void;
}) {
  const suggestion = exercise ? getProgressionSuggestion(exercise, last) : "Note ta performance";

  return (
    <GlassCard className={log.done ? "border-cyan-300/[0.35] bg-cyan-300/[0.075]" : ""}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black leading-tight">{log.name}</h3>
          <p className="mt-1 text-sm font-bold text-cyan-200">{log.target}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(index, "done", !log.done)}
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition active:scale-95 ${
            log.done ? "border-cyan-200 bg-cyan-200 text-black" : "border-white/12 bg-white/[0.08] text-slate-500"
          }`}
          aria-label="Marquer comme fait"
        >
          <Check size={20} />
        </button>
      </div>
      <div className="mb-3 rounded-2xl border border-white/[0.08] bg-black/25 p-3 text-sm">
        <p className="text-slate-500">Derniere perf</p>
        <p className="mt-1 font-bold text-slate-200">
          {last ? `${last.weight || "--"} kg / ${last.reps || "--"} reps · ${formatShortDate(last.date)}` : "Aucune donnee"}
        </p>
        <p className="mt-2 text-cyan-100">{suggestion}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Charge" value={log.weight} placeholder="kg" inputMode="decimal" onChange={(value) => onChange(index, "weight", value)} />
        <Field label="Reps" value={log.reps} placeholder="total" inputMode="numeric" onChange={(value) => onChange(index, "reps", value)} />
      </div>
      <textarea
        value={log.notes}
        onChange={(event) => onChange(index, "notes", event.target.value)}
        placeholder="Notes rapides"
        className="mt-3 min-h-20 w-full resize-none rounded-2xl border border-white/10 bg-black/[0.35] px-4 py-3 text-base outline-none placeholder:text-slate-600 focus:border-cyan-300/60"
      />
      <PrimaryButton
        variant="secondary"
        className="mt-3 w-full"
        disabled={!last || !exercise}
        onClick={() => exercise && onCopyLast(index, exercise)}
      >
        <Copy size={17} />
        Copier derniere perf
      </PrimaryButton>
    </GlassCard>
  );
}

function TrackingView({
  tracking,
  setTracking,
  trackingDate,
  setTrackingDate,
  entries,
  onSave
}: {
  tracking: DailyTracking;
  setTracking: (value: DailyTracking | ((current: DailyTracking) => DailyTracking)) => void;
  trackingDate: string;
  setTrackingDate: (date: string) => void;
  entries: DailyTracking[];
  onSave: () => void;
}) {
  const lastSeven = entries.slice(0, 7);
  const totalSteps = lastSeven.reduce((sum, entry) => sum + Number(entry.steps || 0), 0);
  const avgWeight = average(lastSeven.map((entry) => entry.weight));
  const avgCalories = average(lastSeven.map((entry) => entry.calories));
  const avgProtein = average(lastSeven.map((entry) => entry.protein));

  const update = (field: keyof DailyTracking, value: string) => {
    setTracking((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <SectionTitle title="Suivi quotidien" text="Poids, nutrition, steps et ressenti. Une entree par date." />
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={Weight} label="Moy. poids 7j" value={avgWeight ? avgWeight.toFixed(1) : "--"} unit="kg" />
        <MetricCard icon={Activity} label="Steps semaine" value={formatNumber(totalSteps)} />
        <MetricCard icon={Flame} label="Moy. kcal" value={formatNumber(avgCalories)} />
        <MetricCard icon={Dumbbell} label="Moy. prot." value={formatNumber(avgProtein)} unit="g" />
      </div>

      <GlassCard className="space-y-4">
        <Field label="Date" value={trackingDate} type="date" onChange={setTrackingDate} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Poids" value={tracking.weight} placeholder="kg" inputMode="decimal" onChange={(value) => update("weight", value)} />
          <Field label="Calories" value={tracking.calories} placeholder="kcal" inputMode="numeric" onChange={(value) => update("calories", value)} />
          <Field label="Proteines" value={tracking.protein} placeholder="g" inputMode="numeric" onChange={(value) => update("protein", value)} />
          <Field label="Steps" value={tracking.steps} placeholder="pas" inputMode="numeric" onChange={(value) => update("steps", value)} />
        </div>
        <Field label="Score journee /10" value={tracking.score} placeholder="8" inputMode="numeric" onChange={(value) => update("score", value)} />
        <textarea
          value={tracking.note}
          onChange={(event) => update("note", event.target.value)}
          placeholder="Note du jour"
          className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-black/[0.35] px-4 py-3 text-base outline-none placeholder:text-slate-600 focus:border-cyan-300/60"
        />
        <PrimaryButton className="w-full" onClick={onSave}>
          <Check size={18} />
          Sauvegarder le suivi
        </PrimaryButton>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-black">7 derniers jours</h3>
        {lastSeven.length ? (
          <div className="mt-3 space-y-2">
            {lastSeven.map((entry) => (
              <div key={entry.date} className="rounded-2xl bg-black/[0.24] p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold">{formatShortDate(entry.date)}</p>
                  <p className="text-slate-400">{entry.score ? `${entry.score}/10` : "score --"}</p>
                </div>
                <p className="mt-1 text-slate-400">
                  {entry.weight || "--"} kg · {entry.calories || "--"} kcal · {entry.protein || "--"} g · {entry.steps || "--"} pas
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400">Aucune donnee de suivi pour l'instant.</p>
        )}
      </GlassCard>
    </div>
  );
}

function HistoryView({ sessions, onDelete }: { sessions: WorkoutSession[]; onDelete: (sessionId: string) => void }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(sessions[0]?.id ?? null);

  const visibleSessions = sessions.filter((session) => {
    const matchesFilter = filter === "all" || session.workoutId === filter;
    const matchesQuery =
      !query.trim() ||
      session.exercises.some((exercise) => exercise.name.toLowerCase().includes(query.trim().toLowerCase()));
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-4">
      <SectionTitle title="Historique" text="Tes seances terminees, filtrables par type ou par exercice." />
      <GlassCard className="space-y-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un exercice"
            className="h-12 w-full rounded-2xl border border-white/10 bg-black/[0.35] pl-11 pr-4 text-base outline-none placeholder:text-slate-600 focus:border-cyan-300/60"
          />
        </label>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-sm font-bold text-white outline-none focus:border-cyan-300/60"
        >
          <option value="all">Toutes les seances</option>
          {program.map((workout) => (
            <option key={workout.id} value={workout.id}>
              {workout.shortTitle}
            </option>
          ))}
        </select>
      </GlassCard>

      {!visibleSessions.length ? (
        <EmptyState icon={History} title="Rien a afficher" text="Termine une seance ou modifie tes filtres pour voir ton historique." />
      ) : (
        visibleSessions.map((session) => {
          const isOpen = openId === session.id;
          const exercises = doneExercises(session);
          return (
            <GlassCard key={session.id}>
              <button type="button" className="w-full text-left" onClick={() => setOpenId(isOpen ? null : session.id)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-cyan-200">{formatShortDate(session.date)}</p>
                    <h3 className="mt-1 text-xl font-black">{session.workoutTitle}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      ~{session.durationMinutes ?? 60} min · {exercises.length} exercices notes
                    </p>
                  </div>
                  <ChevronDown className={`mt-2 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </button>
              {isOpen ? (
                <div className="mt-4 space-y-2">
                  {exercises.map((exercise) => (
                    <div key={exercise.exerciseId} className="rounded-2xl bg-black/[0.24] p-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <p className="font-bold">{exercise.name}</p>
                        <p className="shrink-0 text-slate-300">{exercise.weight || "--"} kg / {exercise.reps || "--"} reps</p>
                      </div>
                      {exercise.notes ? <p className="mt-1 text-slate-500">{exercise.notes}</p> : null}
                    </div>
                  ))}
                  <PrimaryButton variant="danger" className="mt-2 w-full" onClick={() => onDelete(session.id)}>
                    <Trash2 size={17} />
                    Supprimer cette seance
                  </PrimaryButton>
                </div>
              ) : null}
            </GlassCard>
          );
        })
      )}
    </div>
  );
}

function SettingsView({
  sessions,
  drafts,
  tracking,
  exerciseHistory,
  onExport,
  onImport,
  onReset
}: {
  sessions: number;
  drafts: number;
  tracking: number;
  exerciseHistory: number;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-4">
      <GlassCard>
        <OneXLogo size="md" showSignature />
      </GlassCard>
      <SectionTitle title="Donnees locales" text="Tout reste sur ton iPhone. Exporte un JSON pour garder une sauvegarde." />
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={History} label="Seances" value={String(sessions)} />
        <MetricCard icon={Shield} label="Brouillons" value={String(drafts)} />
        <MetricCard icon={NotebookPen} label="Suivis" value={String(tracking)} />
        <MetricCard icon={BarChart3} label="Perfs" value={String(exerciseHistory)} />
      </div>
      <GlassCard className="space-y-3">
        <PrimaryButton className="w-full" onClick={onExport}>
          <Shield size={18} />
          Exporter mes donnees JSON
        </PrimaryButton>
        <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-sm font-black text-white transition active:scale-[0.98]">
          Importer un JSON OneX
          <input
            type="file"
            accept="application/json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImport(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </GlassCard>
      <GlassCard className="border-rose-400/30 bg-rose-500/10">
        <h3 className="text-lg font-black text-rose-100">Zone dangereuse</h3>
        <p className="mt-2 text-sm leading-6 text-rose-100/75">
          Le reset supprime les seances, brouillons, suivis, historiques exercices et parametres locaux. Deux confirmations sont demandees.
        </p>
        <PrimaryButton variant="danger" className="mt-4 w-full" onClick={onReset}>
          <Trash2 size={17} />
          Reinitialiser OneX
        </PrimaryButton>
      </GlassCard>
      <div className="pb-2 text-center">
        <BrandSignature />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  inputMode,
  type = "text",
  onChange
}: {
  label: string;
  value: string;
  placeholder?: string;
  inputMode?: "decimal" | "numeric";
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <input
        value={value}
        type={type}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/[0.35] px-4 text-base font-semibold outline-none placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/10"
      />
    </label>
  );
}

function SectionTitle({ title, text }: { title: string; text: string }) {
  return (
    <div className="px-1">
      <OneXLogo size="sm" className="mb-3 scale-[0.82] origin-left" />
      <h2 className="mt-1 text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}
