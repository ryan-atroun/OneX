import type { WorkoutDay } from "@/types";

export const program: WorkoutDay[] = [
  {
    id: "push",
    day: "Lundi",
    title: "PUSH",
    shortTitle: "Push",
    exercises: [
      { id: "dips-lestes", name: "Dips lestes", target: "4x6-10" },
      { id: "developpe-incline-halteres", name: "Developpe incline halteres", target: "4x6-10" },
      { id: "developpe-machine-barre", name: "Developpe machine/barre", target: "3x8-12" },
      { id: "elevations-laterales", name: "Elevations laterales", target: "3x12-15" },
      { id: "pompes", name: "Pompes", target: "2x echec" },
      { id: "gainage", name: "Gainage", target: "2 series" }
    ]
  },
  {
    id: "pull-sprint",
    day: "Mercredi",
    title: "PULL + SPRINT",
    shortTitle: "Pull + Sprint",
    exercises: [
      { id: "tractions-lestees", name: "Tractions lestees", target: "4x6-10" },
      { id: "rowing", name: "Rowing", target: "4x8-12" },
      { id: "tirage-vertical", name: "Tirage vertical", target: "3x10-12" },
      { id: "rowing-poulie", name: "Rowing poulie", target: "2x12-15" },
      { id: "curl-biceps", name: "Curl biceps", target: "3x10-12" },
      { id: "abdos", name: "Abdos", target: "2 series" },
      { id: "sprint", name: "Sprint", target: "6-10 x 10-20 sec" },
      { id: "cardio-leger", name: "Cardio leger", target: "10 min" }
    ]
  },
  {
    id: "legs",
    day: "Vendredi",
    title: "LEGS",
    shortTitle: "Legs + Rappel pec",
    exercises: [
      { id: "hack-squat", name: "Hack squat", target: "4x6-10" },
      { id: "presse", name: "Presse", target: "4x8-12" },
      { id: "leg-extension", name: "Leg extension", target: "3x12-15" },
      { id: "leg-curl", name: "Leg curl", target: "3x10-12" },
      { id: "mollets", name: "Mollets", target: "4x12-15" },
      { id: "developpe-incline-machine", name: "Developpe incline machine", target: "3x10-12" },
      { id: "ecarte-poulie", name: "Ecarte poulie", target: "3x12-15" }
    ]
  },
  {
    id: "haut",
    day: "Dimanche",
    title: "HAUT",
    shortTitle: "Haut + rappels",
    exercises: [
      { id: "dips", name: "Dips", target: "3x10-15" },
      { id: "tractions", name: "Tractions", target: "3x max" },
      { id: "tirage-horizontal", name: "Tirage horizontal", target: "3x12-15" },
      { id: "presse-legere", name: "Presse legere", target: "3x20" },
      { id: "leg-curl-leger", name: "Leg curl leger", target: "3x15" },
      { id: "elevations-laterales-haut", name: "Elevations laterales", target: "3x15" },
      { id: "abdos-haut", name: "Abdos", target: "3 series" }
    ]
  }
];
