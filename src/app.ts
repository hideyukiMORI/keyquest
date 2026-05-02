import type { TextInput } from "./cli/text-input.js";
import { DEFAULT_LESSON_PATH, loadLessonFromFile, selectPracticePrompt } from "./lessons/loader.js";
import type { Lesson } from "./lessons/schema.js";
import { completePracticeSession } from "./practice/session.js";
import type { SaveMode } from "./save/model.js";
import { createSaveStore } from "./save/store.js";
import { formatSceneSequence, renderSceneSequence } from "./scenes/manager.js";
import { defaultScenes, renderPracticeResult } from "./scenes/scenes.js";

export type RunAppOptions = {
  readonly mode: SaveMode;
  readonly saveDirectory: string | undefined;
  readonly textInput: TextInput;
  readonly lesson: Lesson | undefined;
  readonly lessonPath: string | undefined;
  readonly now?: Date;
  readonly completedAt?: Date;
};

export async function runApp(options: RunAppOptions): Promise<string> {
  const now = options.now ?? new Date();
  const saveStore = createSaveStore({
    mode: options.mode,
    ...(options.saveDirectory === undefined ? {} : { directory: options.saveDirectory }),
  });
  const save = await saveStore.loadOrCreate(now);
  const lesson =
    options.lesson ?? (await loadLessonFromFile(options.lessonPath ?? DEFAULT_LESSON_PATH));
  const practicePrompt = selectPracticePrompt(lesson);

  const outputs = renderSceneSequence({
    scenes: defaultScenes,
    context: {
      save,
      mode: options.mode,
      now,
      lesson,
      practicePrompt,
    },
  });
  const introOutput = formatSceneSequence(outputs);
  const actual = await options.textInput.readLine("> ");
  const completedAt = options.completedAt ?? new Date();
  const result = completePracticeSession({
    save,
    mode: options.mode,
    prompt: practicePrompt,
    actual,
    startedAt: now,
    completedAt,
  });

  await saveStore.write(result.updatedSave);

  return [introOutput, renderPracticeResult({ ...result, mode: options.mode }).join("\n")].join(
    "\n\n",
  );
}
