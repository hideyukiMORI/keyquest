import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import {
  decodeDevelopmentSave,
  decodeNormalSave,
  encodeDevelopmentSave,
  encodeNormalSave,
} from "./codec.js";
import { createNewSave, touchSave, type KeyQuestSave, type SaveMode } from "./model.js";

export type SaveStore = {
  readonly mode: SaveMode;
  readonly filePath: string;
  readonly loadOrCreate: (now: Date) => Promise<KeyQuestSave>;
  readonly write: (save: KeyQuestSave) => Promise<void>;
};

export function createSaveStore(options: {
  readonly mode: SaveMode;
  readonly directory?: string;
}): SaveStore {
  const directory = options.directory ?? defaultSaveDirectory();
  const fileName = options.mode === "development" ? "save.dev.json" : "save.kq";
  const filePath = join(directory, fileName);

  return {
    mode: options.mode,
    filePath,
    async loadOrCreate(now: Date): Promise<KeyQuestSave> {
      try {
        const content = await readFile(filePath, "utf8");
        const loaded =
          options.mode === "development"
            ? decodeDevelopmentSave(content)
            : decodeNormalSave(content.trim());

        return touchSave(loaded, now, options.mode);
      } catch (error) {
        if (isNotFoundError(error)) {
          return createNewSave(now, options.mode);
        }

        throw error;
      }
    },
    async write(save: KeyQuestSave): Promise<void> {
      await mkdir(directory, { recursive: true });
      const content =
        options.mode === "development" ? encodeDevelopmentSave(save) : encodeNormalSave(save);

      await writeFile(filePath, content, "utf8");
    },
  };
}

export function defaultSaveDirectory(): string {
  return join(homedir(), ".keyquest");
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { readonly code?: string }).code === "ENOENT"
  );
}
