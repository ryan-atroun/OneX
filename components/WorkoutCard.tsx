import { Clock, Dumbbell, Play } from "lucide-react";
import type { WorkoutDay } from "@/types";
import GlassCard from "./GlassCard";
import PrimaryButton from "./PrimaryButton";
import StatBadge from "./StatBadge";

export default function WorkoutCard({ workout, onStart }: { workout: WorkoutDay; onStart: (workoutId: string) => void }) {
  return (
    <GlassCard className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-cyan-200">{workout.day}</p>
          <h2 className="mt-1 text-2xl font-black leading-tight">{workout.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">{workout.focus}</p>
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-3xl border border-violet-300/20 bg-violet-300/10 text-violet-100">
          <Dumbbell size={22} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {workout.muscleGroups.map((group) => (
          <StatBadge key={group} tone="slate">
            {group}
          </StatBadge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {workout.tags.map((tag) => (
          <StatBadge key={tag} tone={tag === "sprint" ? "cyan" : tag === "rappel" ? "violet" : "slate"}>
            {tag}
          </StatBadge>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-black/25 p-3">
          <p className="text-slate-500">Exercices</p>
          <p className="mt-1 font-black">{workout.exercises.length}</p>
        </div>
        <div className="rounded-2xl bg-black/25 p-3">
          <p className="flex items-center gap-1 text-slate-500">
            <Clock size={14} /> Duree
          </p>
          <p className="mt-1 font-black">~{workout.estimatedMinutes} min</p>
        </div>
      </div>
      <PrimaryButton className="w-full" onClick={() => onStart(workout.id)}>
        <Play size={18} />
        Demarrer cette seance
      </PrimaryButton>
    </GlassCard>
  );
}
