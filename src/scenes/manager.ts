import type { Scene, SceneContext, SceneId, SceneOutput } from "./types.js";

export function renderSceneSequence(options: {
  readonly scenes: readonly Scene[];
  readonly context: SceneContext;
  readonly startAt?: SceneId;
}): readonly SceneOutput[] {
  const scenesById = new Map(options.scenes.map((scene) => [scene.id, scene]));
  const outputs: SceneOutput[] = [];
  let current: SceneId = options.startAt ?? "title";

  while (current !== "exit") {
    const scene = scenesById.get(current);
    if (scene === undefined) {
      throw new Error(`Unknown scene: ${current}`);
    }

    const output = scene.render(options.context);
    outputs.push(output);
    current = output.next;
  }

  return outputs;
}

export function formatSceneSequence(outputs: readonly SceneOutput[]): string {
  return outputs.map((output) => output.lines.join("\n")).join("\n\n");
}
