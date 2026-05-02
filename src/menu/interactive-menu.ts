import type { ScreenRenderer } from "../terminal/screen.js";
import type { RealtimeTypingInput } from "../realtime/input.js";

export type InteractiveMenuItem<T extends string> = {
  readonly value: T;
  readonly label: string;
};

export async function runInteractiveMenu<T extends string>(options: {
  readonly input: RealtimeTypingInput;
  readonly screen: ScreenRenderer;
  readonly items: readonly InteractiveMenuItem<T>[];
  readonly render: (selectedIndex: number) => readonly string[];
  readonly initialIndex?: number;
}): Promise<T> {
  if (options.items.length === 0) {
    throw new Error("Interactive menu requires at least one item");
  }

  return options.input.withRawMode(async () => {
    let selectedIndex = clampIndex(options.initialIndex ?? 0, options.items.length);
    options.screen.render(options.render(selectedIndex));

    for (;;) {
      const key = await options.input.readKey();
      const action = toMenuAction(key, options.items.length);
      if (action === undefined) {
        continue;
      }
      if (action.kind === "cancel") {
        throw new Error("Menu cancelled");
      }
      if (action.kind === "select") {
        return getItemValue(options.items, selectedIndex);
      }
      if (action.kind === "jump") {
        selectedIndex = action.index;
        return getItemValue(options.items, selectedIndex);
      }

      selectedIndex =
        action.direction === "next"
          ? (selectedIndex + 1) % options.items.length
          : (selectedIndex - 1 + options.items.length) % options.items.length;
      options.screen.render(options.render(selectedIndex));
    }
  });
}

export function renderSelectableItems<T extends string>(options: {
  readonly items: readonly InteractiveMenuItem<T>[];
  readonly selectedIndex: number;
}): readonly string[] {
  return options.items.map(
    (item, index) => `${index === options.selectedIndex ? ">" : " "} ${item.label}`,
  );
}

type MenuAction =
  | {
      readonly kind: "move";
      readonly direction: "next" | "previous";
    }
  | {
      readonly kind: "select";
    }
  | {
      readonly kind: "jump";
      readonly index: number;
    }
  | {
      readonly kind: "cancel";
    };

function toMenuAction(key: string, itemCount: number): MenuAction | undefined {
  if (key === "\u0003") {
    return { kind: "cancel" };
  }
  if (key === "j" || key === "J" || key === "\u001b[B") {
    return { kind: "move", direction: "next" };
  }
  if (key === "k" || key === "K" || key === "\u001b[A") {
    return { kind: "move", direction: "previous" };
  }
  if (key === "\r" || key === "\n" || key === " ") {
    return { kind: "select" };
  }

  const index = Number.parseInt(key, 10) - 1;
  if (Number.isInteger(index) && index >= 0 && index < itemCount) {
    return { kind: "jump", index };
  }

  return undefined;
}

function clampIndex(index: number, itemCount: number): number {
  return Math.min(Math.max(index, 0), itemCount - 1);
}

function getItemValue<T extends string>(
  items: readonly InteractiveMenuItem<T>[],
  index: number,
): T {
  const item = items[index];
  if (item === undefined) {
    throw new Error(`Interactive menu item ${index} is unavailable`);
  }

  return item.value;
}
