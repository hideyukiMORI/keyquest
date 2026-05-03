import { styleText } from "./ansi.js";
import type { TerminalRuntime } from "./runtime.js";
import type { TerminalColorToken } from "./theme.js";

export type AsciiMeterOptions = {
  readonly current: number;
  readonly max: number;
  readonly width?: number | undefined;
  readonly fillToken?: TerminalColorToken | undefined;
  readonly emptyToken?: TerminalColorToken | undefined;
  readonly fillGlyph?: string | undefined;
  readonly emptyGlyph?: string | undefined;
  readonly runtime?: TerminalRuntime | undefined;
};

export function renderAsciiMeter(options: AsciiMeterOptions): string {
  const width = Math.max(1, options.width ?? 12);
  const ratio = clampRatio(options.max <= 0 ? 0 : options.current / options.max);
  const filledWidth = Math.round(ratio * width);
  const emptyWidth = width - filledWidth;
  const fillGlyph = firstGlyph(options.fillGlyph ?? "#");
  const emptyGlyph = firstGlyph(options.emptyGlyph ?? "-");
  const filled = styleText(
    fillGlyph.repeat(filledWidth),
    options.fillToken ?? "success",
    options.runtime,
  );
  const empty = styleText(
    emptyGlyph.repeat(emptyWidth),
    options.emptyToken ?? "muted",
    options.runtime,
  );

  return `[${filled}${empty}]`;
}

export function renderPercentMeter(options: {
  readonly ratio: number;
  readonly width?: number | undefined;
  readonly fillToken?: TerminalColorToken | undefined;
  readonly runtime?: TerminalRuntime | undefined;
}): string {
  return renderAsciiMeter({
    current: clampRatio(options.ratio),
    max: 1,
    width: options.width,
    fillToken: options.fillToken,
    runtime: options.runtime,
  });
}

export function renderThresholdMeter(options: {
  readonly current: number;
  readonly max: number;
  readonly width?: number | undefined;
  readonly runtime?: TerminalRuntime | undefined;
}): string {
  const ratio = options.max <= 0 ? 0 : options.current / options.max;
  const fillToken: TerminalColorToken =
    ratio <= 0.25 ? "danger" : ratio <= 0.5 ? "warning" : "success";

  return renderAsciiMeter({
    current: options.current,
    max: options.max,
    width: options.width,
    fillToken,
    runtime: options.runtime,
  });
}

function clampRatio(ratio: number): number {
  if (!Number.isFinite(ratio)) {
    return 0;
  }

  return Math.min(1, Math.max(0, ratio));
}

function firstGlyph(glyph: string): string {
  return glyph.length === 0 ? "#" : (glyph[0] ?? "#");
}
