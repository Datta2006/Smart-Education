import type { Difficulty } from "./types";

/**
 * Random text generator for the typing test.
 * Deliberately NOT real words — every token is generated at test time so the
 * student types characters, never memorized sentences.
 */

interface DifficultySpec {
  label: string;
  description: string;
  charset: string;
  targetChars: [number, number];
  tokenMin: number;
  tokenMax: number;
}

const LOW = "abcdefghijklmnopqrstuvwxyz";
const UP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";

export const DIFFICULTIES: Record<Difficulty, DifficultySpec> = {
  easy: {
    label: "Easy",
    description: "lowercase",
    charset: LOW,
    targetChars: [44, 60],
    tokenMin: 3,
    tokenMax: 6,
  },
  medium: {
    label: "Medium",
    description: "Mixed case",
    charset: LOW + UP,
    targetChars: [58, 78],
    tokenMin: 4,
    tokenMax: 7,
  },
  hard: {
    label: "Hard",
    description: "+ numbers",
    charset: LOW + UP + DIGITS,
    targetChars: [72, 94],
    tokenMin: 4,
    tokenMax: 8,
  },
  extreme: {
    label: "Extreme",
    description: "+ symbols",
    charset: LOW + UP + DIGITS + SYMBOLS,
    targetChars: [84, 110],
    tokenMin: 5,
    tokenMax: 9,
  },
};

export const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard", "extreme"];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(charset: string): string {
  return charset[Math.floor(Math.random() * charset.length)];
}

function randToken(charset: string, min: number, max: number): string {
  const len = rand(min, max);
  let token = "";
  for (let i = 0; i < len; i++) token += pick(charset);
  return token;
}

export function generateText(difficulty: Difficulty): string {
  const spec = DIFFICULTIES[difficulty];
  const [minChars, maxChars] = spec.targetChars;
  const goal = rand(minChars, maxChars);

  const tokens: string[] = [];
  let length = 0;
  let prev = "";
  while (length < goal) {
    let token = randToken(spec.charset, spec.tokenMin, spec.tokenMax);
    if (token === prev) token = prev + pick(spec.charset);
    tokens.push(token);
    prev = token;
    length += token.length + 1;
  }
  return tokens.join(" ");
}

export function nextDifficulty(d: Difficulty): Difficulty | null {
  const i = DIFFICULTY_ORDER.indexOf(d);
  return i < DIFFICULTY_ORDER.length - 1 ? DIFFICULTY_ORDER[i + 1] : null;
}