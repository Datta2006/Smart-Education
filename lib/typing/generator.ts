import type { Difficulty } from "./types";

/**
 * Real-word typing generator. Difficulty controls word complexity and the
 * character classes mixed in — practice transfers to real writing, unlike
 * random character strings.
 */

interface DifficultySpec {
  label: string;
  description: string;
  /** Max word length included from the frequency list. */
  maxWordLen: number;
  /** Probability [0,1] a word is capitalized (medium+). */
  capChance: number;
  /** Probability [0,1] a token is a number (hard+). */
  numChance: number;
  /** Probability [0,1] a token carries punctuation (extreme). */
  punctChance: number;
  targetWords: [number, number];
}

const EASY_WORDS =
  "the of and to in is you that it he was for on are as with his they at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part over new sound take only little work know place year live me back give most very after thing our just name good sentence man think say great where help through much before line right too mean old any same tell boy follow came want show also around form three small set put end does another well large must big even such because turn here why ask went men read need land different home us move try kind hand picture again change off play spell air away animal house point page letter mother answer found study still learn should world high every near add plant last school father keep tree never start city earth light under story saw left few while along might close something seem next hard open example begin life always those both paper together got group often run".split(
    " "
  );

const COMMON_WORDS =
  "time year people way day man thing woman life child world school state family student group country problem hand part place case week company system program question work government number night point home water room mother area money story fact month lot right study book eye job word business issue side kind head house service friend father power hour game line end member law car city community name president team minute idea kid body information back parent face others level office door health person art war history party result change morning reason research girl guy moment air teacher force education".split(
    " "
  );

const TECH_WORDS =
  "server client browser function variable database network memory process thread kernel compiler runtime array object string boolean integer protocol router cache queue stack graph binary algorithm recursion pointer framework endpoint latency throughput deployment container repository commit branch merge refactor async promise component render state props schema index query transaction migration token session request response header payload docker kubernetes".split(
    " "
  );

const PUNCTUATION = [".", ",", "?", "!", ";", ":", "'", '"', "(", ")", "-"];

function pick<T>(arr: Array<T>): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function maybeCapitalize(word: string, chance: number): string {
  return Math.random() < chance ? word[0].toUpperCase() + word.slice(1) : word;
}

function asDigits(len: number): string {
  let out = "";
  for (let i = 0; i < len; i++) out += randInt(0, 9);
  return out;
}

const SPECS: Record<Difficulty, DifficultySpec> = {
  easy: {
    label: "Easy",
    description: "Common words",
    maxWordLen: 5,
    capChance: 0,
    numChance: 0,
    punctChance: 0,
    targetWords: [18, 24],
  },
  medium: {
    label: "Medium",
    description: "Everyday vocabulary",
    maxWordLen: 8,
    capChance: 0.1,
    numChance: 0,
    punctChance: 0,
    targetWords: [22, 30],
  },
  hard: {
    label: "Hard",
    description: "+ numbers & long words",
    maxWordLen: 11,
    capChance: 0.15,
    numChance: 0.12,
    punctChance: 0.08,
    targetWords: [26, 34],
  },
  extreme: {
    label: "Extreme",
    description: "+ punctuation & tech terms",
    maxWordLen: 14,
    capChance: 0.2,
    numChance: 0.15,
    punctChance: 0.15,
    targetWords: [28, 38],
  },
};

export const DIFFICULTIES: Record<
  Difficulty,
  { label: string; description: string }
> = {
  easy: { label: SPECS.easy.label, description: SPECS.easy.description },
  medium: { label: SPECS.medium.label, description: SPECS.medium.description },
  hard: { label: SPECS.hard.label, description: SPECS.hard.description },
  extreme: { label: SPECS.extreme.label, description: SPECS.extreme.description },
};

export const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard", "extreme"];

const WORDS_BY_LEVEL: Record<Difficulty, string[]> = {
  easy: EASY_WORDS.filter((w) => w.length <= SPECS.easy.maxWordLen),
  medium: [...EASY_WORDS, ...COMMON_WORDS].filter(
    (w) => w.length <= SPECS.medium.maxWordLen
  ),
  hard: [...EASY_WORDS, ...COMMON_WORDS, ...TECH_WORDS].filter(
    (w) => w.length <= SPECS.hard.maxWordLen
  ),
  extreme: [...EASY_WORDS, ...COMMON_WORDS, ...TECH_WORDS],
};

export function generateText(difficulty: Difficulty): string {
  const spec = SPECS[difficulty];
  const words = WORDS_BY_LEVEL[difficulty];
  const [minWords, maxWords] = spec.targetWords;
  const count = randInt(minWords, maxWords);

  const tokens: string[] = [];
  for (let i = 0; i < count; i++) {
    if (Math.random() < spec.numChance) {
      tokens.push(asDigits(randInt(2, 4)));
      continue;
    }
    let word = pick(words);
    if (i === 0) word = word[0].toUpperCase() + word.slice(1);
    else word = maybeCapitalize(word, spec.capChance);
    if (Math.random() < spec.punctChance) word += pick(PUNCTUATION);
    tokens.push(word);
  }
  return tokens.join(" ");
}

export function nextDifficulty(d: Difficulty): Difficulty | null {
  const i = DIFFICULTY_ORDER.indexOf(d);
  return i < DIFFICULTY_ORDER.length - 1 ? DIFFICULTY_ORDER[i + 1] : null;
}
