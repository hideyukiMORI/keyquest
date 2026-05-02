export type TypingInput =
  | {
      readonly kind: "character";
      readonly value: string;
    }
  | {
      readonly kind: "backspace";
    }
  | {
      readonly kind: "submit";
    }
  | {
      readonly kind: "cancel";
    };

export type TypingRunStatus = "active" | "completed" | "cancelled";

export type TypingCharacterState = "pending" | "correct" | "wrong" | "extra";

export type TypingCharacterView = {
  readonly index: number;
  readonly expected: string | null;
  readonly actual: string | null;
  readonly state: TypingCharacterState;
};

export type TypingState = {
  readonly expected: string;
  readonly actual: string;
  readonly status: TypingRunStatus;
};

export function createTypingState(expected: string): TypingState {
  return {
    expected,
    actual: "",
    status: "active",
  };
}

export function applyTypingInput(state: TypingState, input: TypingInput): TypingState {
  if (state.status !== "active") {
    return state;
  }

  if (input.kind === "cancel") {
    return {
      ...state,
      status: "cancelled",
    };
  }

  if (input.kind === "submit") {
    return {
      ...state,
      status: "completed",
    };
  }

  if (input.kind === "backspace") {
    return {
      ...state,
      actual: state.actual.slice(0, -1),
    };
  }

  if (input.value.length !== 1) {
    throw new Error("Character input must contain exactly one character");
  }

  return {
    ...state,
    actual: `${state.actual}${input.value}`,
  };
}

export function deriveTypingCharacterViews(state: TypingState): readonly TypingCharacterView[] {
  const length = Math.max(state.expected.length, state.actual.length);
  const views: TypingCharacterView[] = [];

  for (let index = 0; index < length; index += 1) {
    const expected = state.expected[index] ?? null;
    const actual = state.actual[index] ?? null;

    views.push({
      index,
      expected,
      actual,
      state: deriveCharacterState(expected, actual),
    });
  }

  return views;
}

function deriveCharacterState(
  expected: string | null,
  actual: string | null,
): TypingCharacterState {
  if (expected === null) {
    return "extra";
  }

  if (actual === null) {
    return "pending";
  }

  return expected === actual ? "correct" : "wrong";
}
