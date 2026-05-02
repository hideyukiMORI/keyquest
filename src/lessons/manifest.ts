export type BundledLessonManifestEntry = {
  readonly day: number;
  readonly id: string;
  readonly filename: string;
  readonly title: string;
};

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
