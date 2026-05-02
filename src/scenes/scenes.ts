import type { Scene, SceneContext, SceneOutput } from "./types.js";

export const titleScene: Scene = {
  id: "title",
  render(context: SceneContext): SceneOutput {
    return {
      id: "title",
      lines: [
        "KeyQuest",
        "A terminal typing adventure for steady hands.",
        context.mode === "development" ? "DEV MODE - debug magic is not sung by bards." : "",
      ].filter((line) => line.length > 0),
      next: "story",
    };
  },
};

export const storyScene: Scene = {
  id: "story",
  render(context: SceneContext): SceneOutput {
    return {
      id: "story",
      lines: [
        "Story",
        `Day ${context.save.journey.day}: Novice Hall`,
        "The old instructor points to the home row.",
        '"Before the blade, learn the stance."',
      ],
      next: "status",
    };
  },
};

export const statusScene: Scene = {
  id: "status",
  render(context: SceneContext): SceneOutput {
    const skills = context.save.progress.skills
      .slice(0, 3)
      .map((skill) => `${skill.id} Lv.${skill.level}`)
      .join(" / ");

    return {
      id: "status",
      lines: [
        "Status",
        `Hero: ${context.save.profile.heroName}`,
        `XP: ${context.save.progress.totalXp}`,
        `Streak: ${context.save.progress.streakDays} days`,
        `Training: ${skills}`,
      ],
      next: "practicePreview",
    };
  },
};

export const practicePreviewScene: Scene = {
  id: "practicePreview",
  render(context: SceneContext): SceneOutput {
    const { prompt, score } = context.practicePreview;

    return {
      id: "practicePreview",
      lines: [
        "Practice Preview",
        `Prompt: ${prompt}`,
        `Baseline: ${score.wordsPerMinute.toFixed(1)} WPM / ${Math.round(score.accuracy * 100)}% accuracy`,
        "Next implementation: replace this preview with the interactive typing loop.",
      ],
      next: "exit",
    };
  },
};

export const defaultScenes: readonly Scene[] = [
  titleScene,
  storyScene,
  statusScene,
  practicePreviewScene,
];
