import type { WorkoutDay } from "@/types";

export const program: WorkoutDay[] = [
  {
    id: "push",
    day: "Lundi",
    weekdayIndex: 1,
    title: "PUSH",
    shortTitle: "Push",
    muscleGroups: ["Pecs", "Epaules", "Triceps"],
    estimatedMinutes: 70,
    tags: ["force", "hypertrophie", "gainage"],
    focus: "Poussee lourde, amplitude propre, gainage solide.",
    exercises: [
      { id: "dips-lestes", name: "Dips lestes", target: "4x6-10", kind: "weighted", repRange: { min: 6, max: 10 } },
      { id: "developpe-incline-halteres", name: "Developpe incline halteres", target: "4x6-10", kind: "weighted", repRange: { min: 6, max: 10 } },
      { id: "developpe-machine-barre", name: "Developpe machine/barre", target: "3x8-12", kind: "weighted", repRange: { min: 8, max: 12 } },
      { id: "elevations-laterales", name: "Elevations laterales", target: "3x12-15", kind: "weighted", repRange: { min: 12, max: 15 } },
      { id: "pompes", name: "Pompes", target: "2x echec", kind: "bodyweight" },
      { id: "gainage", name: "Gainage", target: "2 series", kind: "core" }
    ]
  },
  {
    id: "pull-sprint",
    day: "Mercredi",
    weekdayIndex: 3,
    title: "PULL + SPRINT",
    shortTitle: "Pull + Sprint",
    muscleGroups: ["Dos", "Biceps", "Vitesse"],
    estimatedMinutes: 80,
    tags: ["force", "hypertrophie", "sprint", "endurance"],
    focus: "Tirage explosif puis sprints courts, recuperation maitrisee.",
    exercises: [
      { id: "tractions-lestees", name: "Tractions lestees", target: "4x6-10", kind: "weighted", repRange: { min: 6, max: 10 } },
      { id: "rowing", name: "Rowing", target: "4x8-12", kind: "weighted", repRange: { min: 8, max: 12 } },
      { id: "tirage-vertical", name: "Tirage vertical", target: "3x10-12", kind: "weighted", repRange: { min: 10, max: 12 } },
      { id: "rowing-poulie", name: "Rowing poulie", target: "2x12-15", kind: "weighted", repRange: { min: 12, max: 15 } },
      { id: "curl-biceps", name: "Curl biceps", target: "3x10-12", kind: "weighted", repRange: { min: 10, max: 12 } },
      { id: "abdos", name: "Abdos", target: "2 series", kind: "core" },
      { id: "sprint", name: "Sprint", target: "6-10 x 10-20 sec", kind: "cardio" },
      { id: "cardio-leger", name: "Cardio leger", target: "10 min", kind: "cardio" }
    ]
  },
  {
    id: "legs",
    day: "Vendredi",
    weekdayIndex: 5,
    title: "LEGS + RAPPEL PEC",
    shortTitle: "Legs + Rappel pec",
    muscleGroups: ["Jambes", "Pecs", "Mollets"],
    estimatedMinutes: 75,
    tags: ["force", "hypertrophie", "rappel"],
    focus: "Jambes lourdes, rappel pec controle, pas de reps brouillonnes.",
    exercises: [
      { id: "hack-squat", name: "Hack squat", target: "4x6-10", kind: "weighted", repRange: { min: 6, max: 10 } },
      { id: "presse", name: "Presse", target: "4x8-12", kind: "weighted", repRange: { min: 8, max: 12 } },
      { id: "leg-extension", name: "Leg extension", target: "3x12-15", kind: "weighted", repRange: { min: 12, max: 15 } },
      { id: "leg-curl", name: "Leg curl", target: "3x10-12", kind: "weighted", repRange: { min: 10, max: 12 } },
      { id: "mollets", name: "Mollets", target: "4x12-15", kind: "weighted", repRange: { min: 12, max: 15 } },
      { id: "developpe-incline-machine", name: "Developpe incline machine", target: "3x10-12", kind: "weighted", repRange: { min: 10, max: 12 } },
      { id: "ecarte-poulie", name: "Ecarte poulie", target: "3x12-15", kind: "weighted", repRange: { min: 12, max: 15 } }
    ]
  },
  {
    id: "haut",
    day: "Dimanche",
    weekdayIndex: 0,
    title: "HAUT + RAPPELS",
    shortTitle: "Haut + rappels",
    muscleGroups: ["Haut du corps", "Jambes leger", "Abdos"],
    estimatedMinutes: 65,
    tags: ["hypertrophie", "rappel", "endurance"],
    focus: "Volume propre, rappels intelligents, sortie de semaine nette.",
    exercises: [
      { id: "dips", name: "Dips poids du corps", target: "3x10-15", kind: "bodyweight", repRange: { min: 10, max: 15 } },
      { id: "tractions", name: "Tractions", target: "3x max", kind: "bodyweight" },
      { id: "tirage-horizontal", name: "Tirage horizontal", target: "3x12-15", kind: "weighted", repRange: { min: 12, max: 15 } },
      { id: "presse-legere", name: "Presse legere", target: "3x20", kind: "weighted", repRange: { min: 20, max: 20 } },
      { id: "leg-curl-leger", name: "Leg curl leger", target: "3x15", kind: "weighted", repRange: { min: 15, max: 15 } },
      { id: "elevations-laterales-haut", name: "Elevations laterales", target: "3x15", kind: "weighted", repRange: { min: 15, max: 15 } },
      { id: "abdos-haut", name: "Abdos", target: "3 series", kind: "core" }
    ]
  }
];
