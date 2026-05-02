export type BundledLessonManifestEntry = {
  readonly day: number;
  readonly id: string;
  readonly filename: string;
  readonly title: string;
};

export const NOVICE_HALL_FINAL_DAY = 7;
export const MEADOW_ROAD_FINAL_DAY = 14;
export const RIVER_GATE_FINAL_DAY = 21;
export const LANTERN_KEEP_FINAL_DAY = 28;

export const BUNDLED_LESSON_MANIFEST = [
  {
    day: 1,
    id: "novice-hall-day-1",
    filename: "novice-hall-day-1.json",
    title: "Novice Hall: Home Position",
  },
  {
    day: 2,
    id: "novice-hall-day-2",
    filename: "novice-hall-day-2.json",
    title: "Novice Hall: Left And Right Balance",
  },
  {
    day: 3,
    id: "novice-hall-day-3",
    filename: "novice-hall-day-3.json",
    title: "Novice Hall: Finger Responsibility",
  },
  {
    day: 4,
    id: "novice-hall-day-4",
    filename: "novice-hall-day-4.json",
    title: "Novice Hall: Rhythm Hall",
  },
  {
    day: 5,
    id: "novice-hall-day-5",
    filename: "novice-hall-day-5.json",
    title: "Novice Hall: First Words",
  },
  {
    day: 6,
    id: "novice-hall-day-6",
    filename: "novice-hall-day-6.json",
    title: "Novice Hall: Repair The Stance",
  },
  {
    day: 7,
    id: "novice-hall-day-7",
    filename: "novice-hall-day-7.json",
    title: "Novice Hall: Gatekeeper Trial",
  },
  {
    day: 8,
    id: "meadow-road-day-8",
    filename: "meadow-road-day-8.json",
    title: "Meadow Road: First Steps Beyond Home",
  },
  {
    day: 9,
    id: "meadow-road-day-9",
    filename: "meadow-road-day-9.json",
    title: "Meadow Road: Ring Finger Reach",
  },
  {
    day: 10,
    id: "meadow-road-day-10",
    filename: "meadow-road-day-10.json",
    title: "Meadow Road: Index Reach",
  },
  {
    day: 11,
    id: "meadow-road-day-11",
    filename: "meadow-road-day-11.json",
    title: "Meadow Road: Outer Watch",
  },
  {
    day: 12,
    id: "meadow-road-day-12",
    filename: "meadow-road-day-12.json",
    title: "Meadow Road: Top Row Trail",
  },
  {
    day: 13,
    id: "meadow-road-day-13",
    filename: "meadow-road-day-13.json",
    title: "Meadow Road: First Flow",
  },
  {
    day: 14,
    id: "meadow-road-day-14",
    filename: "meadow-road-day-14.json",
    title: "Meadow Road: Waystone Trial",
  },
  {
    day: 15,
    id: "river-gate-day-15",
    filename: "river-gate-day-15.json",
    title: "River Gate: Lower Step",
  },
  {
    day: 16,
    id: "river-gate-day-16",
    filename: "river-gate-day-16.json",
    title: "River Gate: Valley Reach",
  },
  {
    day: 17,
    id: "river-gate-day-17",
    filename: "river-gate-day-17.json",
    title: "River Gate: Bridge Keys",
  },
  {
    day: 18,
    id: "river-gate-day-18",
    filename: "river-gate-day-18.json",
    title: "River Gate: Comma And Period",
  },
  {
    day: 19,
    id: "river-gate-day-19",
    filename: "river-gate-day-19.json",
    title: "River Gate: Bottom Row Words",
  },
  {
    day: 20,
    id: "river-gate-day-20",
    filename: "river-gate-day-20.json",
    title: "River Gate: Current Review",
  },
  {
    day: 21,
    id: "river-gate-day-21",
    filename: "river-gate-day-21.json",
    title: "River Gate: Ferryman Trial",
  },
  {
    day: 22,
    id: "lantern-keep-day-22",
    filename: "lantern-keep-day-22.json",
    title: "Lantern Keep: Left Number Row",
  },
  {
    day: 23,
    id: "lantern-keep-day-23",
    filename: "lantern-keep-day-23.json",
    title: "Lantern Keep: Right Number Row",
  },
  {
    day: 24,
    id: "lantern-keep-day-24",
    filename: "lantern-keep-day-24.json",
    title: "Lantern Keep: Center Span",
  },
  {
    day: 25,
    id: "lantern-keep-day-25",
    filename: "lantern-keep-day-25.json",
    title: "Lantern Keep: Counts And Codes",
  },
  {
    day: 26,
    id: "lantern-keep-day-26",
    filename: "lantern-keep-day-26.json",
    title: "Lantern Keep: Map Marks",
  },
  {
    day: 27,
    id: "lantern-keep-day-27",
    filename: "lantern-keep-day-27.json",
    title: "Lantern Keep: Mixed Signals",
  },
  {
    day: 28,
    id: "lantern-keep-day-28",
    filename: "lantern-keep-day-28.json",
    title: "Lantern Keep: Beacon Trial",
  },
] as const satisfies readonly BundledLessonManifestEntry[];

export function getBundledLessonForDay(day: number): BundledLessonManifestEntry {
  if (!Number.isInteger(day) || day < 1) {
    throw new Error(`Lesson day must be a positive integer: ${day}`);
  }

  const lesson = BUNDLED_LESSON_MANIFEST.find((entry) => entry.day === day);
  if (lesson === undefined) {
    throw new Error(`No bundled lesson is available for day ${day}`);
  }

  return lesson;
}

export function getLatestBundledLessonDay(): number {
  const latestLesson = BUNDLED_LESSON_MANIFEST.at(-1);
  if (latestLesson === undefined) {
    throw new Error("Bundled lesson manifest must include at least one lesson");
  }

  return latestLesson.day;
}
