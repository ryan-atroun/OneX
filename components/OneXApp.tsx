"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  Check,
  Dumbbell,
  Flame,
  History,
  Home,
  NotebookPen,
  Plus,
  Scale,
  type LucideIcon
} from "lucide-react";
import { program } from "@/data/program";
import {
  getLastPerformance,
  getSessions,
  getTodayTracking,
  saveSession,
  saveTracking
} from "@/lib/storage";
import type { DailyTracking, ExerciseLog, WorkoutDay, WorkoutSession } from "@/types";

type Tab = "dashboard" | "program" | "session" | "tracking" | "history";

const today = () => new Date().toISOString().slice(0, 10);

const navItems: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "program", label: "Programme", icon: CalendarDays },
  { id: "session", label: "Seance", icon: Dumbbell },
  { id: "tracking", label: "Suivi", icon: Activity },
  { id: "history", label: "Historique", icon: History }
];

function createExerciseLogs(workout: WorkoutDay): ExerciseLog[] {
  return workout.exercises.map((exercise) => ({
    exerciseId: exercise.id,
    name: exercise.name,
    weight: "",
    reps: "",
    done: false,
    notes: ""
  }));
}

function getWeekLabel() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return `${start.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} - ${end.toLocaleDateString(
    "fr-FR",
    { day: "2-digit", month: "short" }
  )}`;
}

function suggestProgress(log?: ExerciseLog) {
  if (!log || (!log.reps && !log.weight)) return "Note ta premiere perf";
  const reps = Number(log.reps);
  if (Number.isFinite(reps) && reps > 0 && reps < 12) return "essaie +1 rep";
  return "augmente la charge";
}

export default function OneXApp() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(program[0].id);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(createExerciseLogs(program[0]));
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [tracking, setTracking] = useState<DailyTracking>({
    date: today(),
    weight: "",
    calories: "",
    protein: "",
    steps: "",
    note: ""
  });
  const [savedMessage, setSavedMessage] = useState("");

  const selectedWorkout = useMemo(
    () => program.find((workout) => workout.id === selectedWorkoutId) ?? program[0],
    [selectedWorkoutId]
  );

  useEffect(() => {
    setSessions(getSessions());
    setTracking(getTodayTracking(today()));
  }, []);

  useEffect(() => {
    setExerciseLogs(createExerciseLogs(selectedWorkout));
  }, [selectedWorkout]);

  const sessionsThisWeek = sessions.filter((session) => {
    const sessionDate = new Date(session.date);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    start.setHours(0, 0, 0, 0);
    return sessionDate >= start;
  }).length;

  function updateExercise(index: number, field: keyof ExerciseLog, value: string | boolean) {
    setExerciseLogs((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, [field]: value } : exercise
      )
    );
  }

  function finishSession() {
    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      workoutId: selectedWorkout.id,
      workoutTitle: selectedWorkout.shortTitle,
      date: new Date().toISOString(),
      exercises: exerciseLogs
    };

    saveSession(session);
    setSessions(getSessions());
    setExerciseLogs(createExerciseLogs(selectedWorkout));
    setSavedMessage("Seance terminee et sauvegardee.");
    setActiveTab("history");
    window.setTimeout(() => setSavedMessage(""), 2400);
  }

  function submitTracking() {
    saveTracking(tracking);
    setSavedMessage("Suivi sauvegarde.");
    window.setTimeout(() => setSavedMessage(""), 2400);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28 pt-5">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-onex-cyan">OneX</p>
          <h1 className="text-3xl font-black tracking-normal">Training OS</h1>
        </div>
        <div className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs text-slate-300 shadow-glow backdrop-blur">
          {getWeekLabel()}
        </div>
      </header>

      {savedMessage ? (
        <div className="mb-4 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
          {savedMessage}
        </div>
      ) : null}

      {activeTab === "dashboard" ? (
        <Dashboard sessionsThisWeek={sessionsThisWeek} tracking={tracking} openTab={setActiveTab} />
      ) : null}
      {activeTab === "program" ? (
        <ProgramView
          selectedWorkoutId={selectedWorkoutId}
          onSelect={(workoutId) => {
            setSelectedWorkoutId(workoutId);
            setActiveTab("session");
          }}
        />
      ) : null}
      {activeTab === "session" ? (
        <SessionView
          selectedWorkout={selectedWorkout}
          exerciseLogs={exerciseLogs}
          onWorkoutChange={setSelectedWorkoutId}
          onExerciseChange={updateExercise}
          onFinish={finishSession}
        />
      ) : null}
      {activeTab === "tracking" ? (
        <TrackingView tracking={tracking} setTracking={setTracking} onSave={submitTracking} />
      ) : null}
      {activeTab === "history" ? <HistoryView sessions={sessions} /> : null}

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/75 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-[0.68rem] transition ${
                  isActive ? "bg-white/12 text-cyan-200" : "text-slate-500"
                }`}
                aria-label={item.label}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-white/10 bg-onex-panelSoft p-4 shadow-glow backdrop-blur ${className}`}>
      {children}
    </section>
  );
}

function Dashboard({
  sessionsThisWeek,
  tracking,
  openTab
}: {
  sessionsThisWeek: number;
  tracking: DailyTracking;
  openTab: (tab: Tab) => void;
}) {
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-violet-500/20 via-blue-500/12 to-cyan-400/10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-slate-300">Seances faites</p>
            <p className="mt-1 text-5xl font-black">{sessionsThisWeek}/4</p>
          </div>
          <button
            type="button"
            onClick={() => openTab("session")}
            className="flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-bold text-black"
          >
            <Plus size={17} />
            Log
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Metric icon={Scale} label="Poids" value={tracking.weight || "--"} unit="kg" />
        <Metric icon={Flame} label="Calories" value={tracking.calories || "--"} unit="kcal" />
        <Metric icon={Dumbbell} label="Proteines" value={tracking.protein || "--"} unit="g" />
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-bold">Semaine actuelle</h2>
        <div className="space-y-3">
          {program.map((workout) => (
            <div key={workout.id} className="flex items-center justify-between rounded-lg bg-white/6 px-3 py-3">
              <div>
                <p className="text-sm font-bold">{workout.day}</p>
                <p className="text-sm text-slate-400">{workout.shortTitle}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                {workout.exercises.length} exos
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  unit
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <Card className="p-3">
      <Icon size={18} className="mb-3 text-cyan-200" />
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black">
        {value} <span className="text-[0.65rem] font-medium text-slate-500">{unit}</span>
      </p>
    </Card>
  );
}

function ProgramView({
  selectedWorkoutId,
  onSelect
}: {
  selectedWorkoutId: string;
  onSelect: (workoutId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {program.map((workout) => (
        <Card key={workout.id} className={selectedWorkoutId === workout.id ? "border-cyan-300/45" : ""}>
          <button type="button" onClick={() => onSelect(workout.id)} className="w-full text-left">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-200">{workout.day}</p>
                <h2 className="text-2xl font-black">{workout.title}</h2>
              </div>
              <Dumbbell className="text-violet-300" size={24} />
            </div>
            <div className="space-y-2">
              {workout.exercises.map((exercise) => (
                <div key={exercise.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-200">{exercise.name}</span>
                  <span className="shrink-0 text-slate-500">{exercise.target}</span>
                </div>
              ))}
            </div>
          </button>
        </Card>
      ))}
    </div>
  );
}

function SessionView({
  selectedWorkout,
  exerciseLogs,
  onWorkoutChange,
  onExerciseChange,
  onFinish
}: {
  selectedWorkout: WorkoutDay;
  exerciseLogs: ExerciseLog[];
  onWorkoutChange: (workoutId: string) => void;
  onExerciseChange: (index: number, field: keyof ExerciseLog, value: string | boolean) => void;
  onFinish: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <label className="text-sm text-slate-400" htmlFor="workout-select">
          Seance du jour
        </label>
        <select
          id="workout-select"
          value={selectedWorkout.id}
          onChange={(event) => onWorkoutChange(event.target.value)}
          className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-3 text-white outline-none"
        >
          {program.map((workout) => (
            <option key={workout.id} value={workout.id}>
              {workout.day} - {workout.shortTitle}
            </option>
          ))}
        </select>
      </Card>

      {exerciseLogs.map((exercise, index) => {
        const lastSession = getLastPerformance(exercise.exerciseId);
        const lastLog = lastSession?.exercises.find((item) => item.exerciseId === exercise.exerciseId);

        return (
          <Card key={exercise.exerciseId}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">{exercise.name}</h2>
                <p className="text-sm text-cyan-200">{selectedWorkout.exercises[index]?.target}</p>
              </div>
              <button
                type="button"
                onClick={() => onExerciseChange(index, "done", !exercise.done)}
                className={`grid h-10 w-10 place-items-center rounded-lg border ${
                  exercise.done ? "border-cyan-300 bg-cyan-300 text-black" : "border-white/15 text-slate-500"
                }`}
                aria-label="Marquer comme fait"
              >
                <Check size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Charge"
                value={exercise.weight}
                placeholder="kg"
                onChange={(value) => onExerciseChange(index, "weight", value)}
              />
              <Input
                label="Reps"
                value={exercise.reps}
                placeholder="total"
                onChange={(value) => onExerciseChange(index, "reps", value)}
              />
            </div>
            <textarea
              value={exercise.notes}
              onChange={(event) => onExerciseChange(index, "notes", event.target.value)}
              placeholder="Notes"
              className="mt-3 min-h-20 w-full resize-none rounded-lg border border-white/10 bg-black/35 px-3 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-300/60"
            />
            <p className="mt-3 text-xs text-slate-400">
              Derniere perf: {lastLog ? `${lastLog.weight || "--"} kg / ${lastLog.reps || "--"} reps` : "aucune"} ·{" "}
              <span className="text-cyan-200">{suggestProgress(lastLog)}</span>
            </p>
          </Card>
        );
      })}

      <button
        type="button"
        onClick={onFinish}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-300 text-sm font-black text-black"
      >
        <Check size={19} />
        Terminer seance
      </button>
    </div>
  );
}

function TrackingView({
  tracking,
  setTracking,
  onSave
}: {
  tracking: DailyTracking;
  setTracking: Dispatch<SetStateAction<DailyTracking>>;
  onSave: () => void;
}) {
  const update = (field: keyof DailyTracking, value: string) => {
    setTracking((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-cyan-200">Suivi quotidien</p>
            <h2 className="text-2xl font-black">{tracking.date}</h2>
          </div>
          <NotebookPen className="text-violet-300" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Poids" value={tracking.weight} placeholder="kg" onChange={(value) => update("weight", value)} />
          <Input
            label="Calories"
            value={tracking.calories}
            placeholder="kcal"
            onChange={(value) => update("calories", value)}
          />
          <Input
            label="Proteines"
            value={tracking.protein}
            placeholder="g"
            onChange={(value) => update("protein", value)}
          />
          <Input label="Steps" value={tracking.steps} placeholder="pas" onChange={(value) => update("steps", value)} />
        </div>
        <textarea
          value={tracking.note}
          onChange={(event) => update("note", event.target.value)}
          placeholder="Note du jour"
          className="mt-3 min-h-24 w-full resize-none rounded-lg border border-white/10 bg-black/35 px-3 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-300/60"
        />
      </Card>
      <button
        type="button"
        onClick={onSave}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 text-sm font-black text-black"
      >
        <Check size={19} />
        Sauvegarder
      </button>
    </div>
  );
}

function HistoryView({ sessions }: { sessions: WorkoutSession[] }) {
  if (!sessions.length) {
    return (
      <Card className="text-center">
        <History className="mx-auto mb-3 text-slate-500" size={32} />
        <h2 className="text-xl font-black">Aucune seance</h2>
        <p className="mt-2 text-sm text-slate-400">Termine une seance pour voir ton historique ici.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Card key={session.id}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-cyan-200">{new Date(session.date).toLocaleDateString("fr-FR")}</p>
              <h2 className="text-xl font-black">{session.workoutTitle}</h2>
            </div>
            <BarChart3 className="text-violet-300" />
          </div>
          <div className="space-y-2">
            {session.exercises
              .filter((exercise) => exercise.done || exercise.weight || exercise.reps || exercise.notes)
              .map((exercise) => (
                <div key={exercise.exerciseId} className="rounded-lg bg-white/6 px-3 py-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold">{exercise.name}</span>
                    <span className="text-slate-400">
                      {exercise.weight || "--"} kg / {exercise.reps || "--"} reps
                    </span>
                  </div>
                  {exercise.notes ? <p className="mt-1 text-xs text-slate-500">{exercise.notes}</p> : null}
                </div>
              ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function Input({
  label,
  value,
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-400">{label}</span>
      <input
        value={value}
        inputMode="decimal"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg border border-white/10 bg-black/35 px-3 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-300/60"
      />
    </label>
  );
}
