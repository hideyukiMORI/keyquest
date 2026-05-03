import { PassThrough, Writable } from "node:stream";
import { describe, expect, it } from "vitest";

import { createNodeTextInput } from "./text-input.js";

describe("node text input", () => {
  it("does not attach line listeners until line input is requested", () => {
    const input = new PassThrough();
    const output = createMemoryWritable();
    const textInput = createNodeTextInput({ input, output });

    expect(input.listenerCount("data")).toBe(0);
    expect(input.listenerCount("end")).toBe(0);

    textInput.close();
  });

  it("reads lines lazily for fallback input", async () => {
    const input = new PassThrough();
    const output = createMemoryWritable();
    const textInput = createNodeTextInput({ input, output });
    const line = textInput.readLine("Choose: ");

    input.write("1\n");

    await expect(line).resolves.toBe("1");
    expect(output.text()).toBe("Choose: ");
    textInput.close();
  });
});

function createMemoryWritable(): Writable & { readonly text: () => string } {
  const chunks: string[] = [];

  return Object.assign(
    new Writable({
      write(chunk, _encoding, callback): void {
        chunks.push(Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk));
        callback();
      },
    }),
    {
      text(): string {
        return chunks.join("");
      },
    },
  );
}
