import { scoreTypingResult } from "./core/scoring.js";
import type { SaveMode } from "./save/model.js";
import { createSaveStore } from "./save/store.js";
import { formatSceneSequence, renderSceneSequence } from "./scenes/manager.js";
import { defaultScenes } from "./scenes/scenes.js";

export type RunAppOptions = {
  readonly mode: SaveMode;
  readonly saveDirectory: string | undefined;
  readonly now?: Date;
};

export async function runApp(options: RunAppOptions): Promise<string> {
  const now = options.now ?? new Date();
  const saveStore = createSaveStore({
    mode: options.mode,
    ...(options.saveDirectory === undefined ? {} : { directory: options.saveDirectory }),
  });
  const save = await saveStore.loadOrCreate(now);
  await saveStore.write(save);

  const samplePrompt = "f j f j asdf jkl;";
  const previewScore = scoreTypingResult({
    expected: samplePrompt,
    actual: samplePrompt,
    startedAt: now,
    completedAt: new Date(now.getTime() + 20_000),
  });

  const outputs = renderSceneSequence({
    scenes: defaultScenes,
    context: {
      save,
      mode: options.mode,
      now,
      practicePreview: {
        prompt: samplePrompt,
        score: previewScore,
      },
    },
  });

  return formatSceneSequence(outputs);
}
