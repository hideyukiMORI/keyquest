import { createTranslator, type LocaleId } from "../i18n/messages.js";
import type { KeyQuestSave } from "../save/model.js";
import type { PracticePrompt } from "../practice/session.js";
import { createWeakKeyReviewPrompt } from "../practice/weak-key-review.js";

export type WeakKeyReviewQuest = {
  readonly id: "weak-key-review";
  readonly title: string;
  readonly prompt: PracticePrompt;
  readonly targetKeys: readonly string[];
  readonly advancesJourney: false;
};

export function createWeakKeyReviewQuest(options: {
  readonly save: KeyQuestSave;
  readonly locale?: LocaleId;
}): WeakKeyReviewQuest | undefined {
  const prompt = createWeakKeyReviewPrompt(options.save);
  if (prompt === undefined) {
    return undefined;
  }

  return {
    id: "weak-key-review",
    title: createTranslator(options.locale ?? options.save.settings.locale).t("review.lessonTitle"),
    prompt,
    targetKeys: prompt.targetKeys,
    advancesJourney: false,
  };
}
