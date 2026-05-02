import type { TextInput } from "./cli/text-input.js";
import { completePracticeSession, type PracticePrompt } from "./practice/session.js";
import type { SaveMode } from "./save/model.js";
import { createSaveStore } from "./save/store.js";
import { formatSceneSequence, renderSceneSequence } from "./scenes/manager.js";
import { defaultScenes, renderPracticeResult } from "./scenes/scenes.js";

export type RunAppOptions = {
  readonly mode: SaveMode;
  readonly saveDirectory: string | undefined;
  readonly textInput: TextInput;
  readonly now?: Date;
  readonly completedAt?: Date;
};

const FIRST_PRACTICE_PROMPT: PracticePrompt = {
  id: "novice-hall-home-position-1",
  text: "f j f j asdf jkl;",
  skillIds: ["homePosition", "fingerResponsibility", "homeRow", "accuracy", "rhythm"],
};

export async function runApp(options: RunAppOptions): Promise<string> {
  const now = options.now ?? new Date();
  const saveStore = createSaveStore({
    mode: options.mode,
    ...(options.saveDirectory === undefined ? {} : { directory: options.saveDirectory }),
  });
  const save = await saveStore.loadOrCreate(now);

  const outputs = renderSceneSequence({
    scenes: defaultScenes,
    context: {
      save,
      mode: options.mode,
      now,
      practicePrompt: FIRST_PRACTICE_PROMPT,
    },
  });
  const introOutput = formatSceneSequence(outputs);
  const actual = await options.textInput.readLine("> ");
  const completedAt = options.completedAt ?? new Date();
  const result = completePracticeSession({
    save,
    mode: options.mode,
    prompt: FIRST_PRACTICE_PROMPT,
    actual,
    startedAt: now,
    completedAt,
  });

  await saveStore.write(result.updatedSave);

  return [introOutput, renderPracticeResult({ ...result, mode: options.mode }).join("\n")].join(
    "\n\n",
  );
}
