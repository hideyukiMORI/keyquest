export type TypingResult = {
  readonly expected: string;
  readonly actual: string;
  readonly startedAt: Date;
  readonly completedAt: Date;
};

export type Score = {
  readonly totalCharacters: number;
  readonly correctCharacters: number;
  readonly mistakes: number;
  readonly accuracy: number;
  readonly wordsPerMinute: number;
  readonly elapsedSeconds: number;
};

const WORD_LENGTH = 5;
const SECONDS_PER_MINUTE = 60;
const MINIMUM_ELAPSED_MILLISECONDS = 1000;

export function scoreTypingResult(result: TypingResult): Score {
  const elapsedMilliseconds = Math.max(
    MINIMUM_ELAPSED_MILLISECONDS,
    result.completedAt.getTime() - result.startedAt.getTime(),
  );
  const elapsedSeconds = elapsedMilliseconds / 1000;
  const totalCharacters = result.expected.length;
  const correctCharacters = countCorrectCharacters(result.expected, result.actual);
  const mistakes = Math.max(result.actual.length, result.expected.length) - correctCharacters;
  const accuracy = totalCharacters === 0 ? 1 : correctCharacters / totalCharacters;
  const wordsPerMinute = (correctCharacters / WORD_LENGTH / elapsedSeconds) * SECONDS_PER_MINUTE;

  return {
    totalCharacters,
    correctCharacters,
    mistakes,
    accuracy,
    wordsPerMinute,
    elapsedSeconds,
  };
}

function countCorrectCharacters(expected: string, actual: string): number {
  let correct = 0;
  const comparableLength = Math.min(expected.length, actual.length);

  for (let index = 0; index < comparableLength; index += 1) {
    if (expected[index] === actual[index]) {
      correct += 1;
    }
  }

  return correct;
}
