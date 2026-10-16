/**
 * ApexTrack - Fractional Indexing & Issue Ranking Engine
 * Inspired by Linear and Figma's distributed ordering architecture.
 *
 * Supports two interoperable ordering paradigms:
 * 1. String-based Lexicographical Fractional Indexing (infinite precision, CRDT-friendly)
 * 2. Numeric Float/Int Midpoint Ranking with automatic precision exhaustion detection & rebalancing
 */

export const BASE_62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE = BASE_62.length; // 62
const ZERO_DIGIT = '0';

export const DEFAULT_NUMERIC_STEP = 1000;
export const MIN_NUMERIC_DELTA = 1e-9;

/* ------------------------------------------------------------------ */
/* 1. String-based Fractional Indexing                                 */
/* ------------------------------------------------------------------ */

function getIntegerLength(head: string): number {
  if (head >= 'a' && head <= 'z') {
    return head.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
  }
  if (head >= 'A' && head <= 'Z') {
    return 'Z'.charCodeAt(0) - head.charCodeAt(0) + 1;
  }
  throw new Error(`Invalid head character in fractional index: "${head}"`);
}

function getIntegerPart(key: string): string {
  const head = key[0];
  const len = getIntegerLength(head);
  if (key.length < len + 1) {
    throw new Error(`Key too short for encoded integer length: "${key}"`);
  }
  return key.slice(0, len + 1);
}

function incrementInteger(intPart: string): string {
  const head = intPart[0];
  const digits = intPart.slice(1).split('');
  let carry = true;

  for (let i = digits.length - 1; i >= 0 && carry; i--) {
    const idx = BASE_62.indexOf(digits[i]);
    if (idx === BASE - 1) {
      digits[i] = ZERO_DIGIT;
    } else {
      digits[i] = BASE_62[idx + 1];
      carry = false;
    }
  }

  if (carry) {
    if (head === 'z') {
      throw new Error('Fractional index integer overflow');
    }
    if (head >= 'a') {
      const nextHead = String.fromCharCode(head.charCodeAt(0) + 1);
      return nextHead + '1' + ZERO_DIGIT.repeat(digits.length);
    }
    if (head === 'A') {
      return 'a0';
    }
    if (head > 'A' && head <= 'Z') {
      const nextHead = String.fromCharCode(head.charCodeAt(0) + 1);
      return nextHead + ZERO_DIGIT.repeat(digits.length - 1);
    }
  }

  return head + digits.join('');
}

function decrementInteger(intPart: string): string {
  const head = intPart[0];
  const digits = intPart.slice(1).split('');
  let borrow = true;

  for (let i = digits.length - 1; i >= 0 && borrow; i--) {
    const idx = BASE_62.indexOf(digits[i]);
    if (idx === 0) {
      digits[i] = BASE_62[BASE - 1];
    } else {
      digits[i] = BASE_62[idx - 1];
      borrow = false;
    }
  }

  if (borrow) {
    if (head === 'a') {
      return 'Zz';
    }
    if (head > 'a') {
      const prevHead = String.fromCharCode(head.charCodeAt(0) - 1);
      return prevHead + BASE_62[BASE - 1].repeat(digits.length - 1);
    }
    if (head === 'A') {
      throw new Error('Fractional index integer underflow');
    }
    if (head >= 'B' && head <= 'Z') {
      const prevHead = String.fromCharCode(head.charCodeAt(0) - 1);
      return prevHead + BASE_62[BASE - 2] + BASE_62[BASE - 1].repeat(digits.length);
    }
  }

  return head + digits.join('');
}

function midpoint(a: string, b: string | null): string {
  if (b !== null && a >= b) {
    throw new Error(`Midpoint bounds invalid: "${a}" >= "${b}"`);
  }

  if (b !== null) {
    let n = 0;
    while ((a[n] || ZERO_DIGIT) === b[n]) {
      n++;
    }
    if (n > 0) {
      return b.slice(0, n) + midpoint(a.slice(n), b.slice(n));
    }
  }

  const aDigit = a ? BASE_62.indexOf(a[0]) : 0;
  const bDigit = b !== null ? BASE_62.indexOf(b[0]) : BASE;

  if (bDigit - aDigit > 1) {
    const mid = Math.round((aDigit + bDigit) / 2);
    return BASE_62[mid];
  }

  if (b !== null && b.length > 1) {
    return b.slice(0, 1);
  }

  return BASE_62[aDigit] + midpoint(a.slice(1), null);
}

/**
 * Computes a fractional index string between two existing keys.
 * All keys sort strictly in standard lexicographical ASCII order (a < b).
 *
 * @param a The key immediately preceding the new item (null if inserting at top of list)
 * @param b The key immediately following the new item (null if inserting at bottom of list)
 * @returns A string key lexicographically strictly between a and b
 */
export function generateKeyBetween(a: string | null, b: string | null): string {
  if (a !== null && b !== null && a >= b) {
    throw new Error(`Predecessor key "${a}" must be strictly less than successor key "${b}"`);
  }

  // 1. Initial item in an empty list
  if (a === null && b === null) {
    return 'a0';
  }

  // 2. Prepend before the very first item
  if (a === null) {
    const bInt = getIntegerPart(b!);
    if (bInt === b) {
      return decrementInteger(bInt);
    }
    return bInt;
  }

  // 3. Append after the very last item
  if (b === null) {
    const aInt = getIntegerPart(a);
    return incrementInteger(aInt);
  }

  // 4. Insert between two items
  const aInt = getIntegerPart(a);
  const bInt = getIntegerPart(b);

  if (aInt !== bInt) {
    const nextInt = incrementInteger(aInt);
    if (nextInt < b) {
      return nextInt;
    }
    return aInt + midpoint(a.slice(aInt.length), null);
  }

  return aInt + midpoint(a.slice(aInt.length), b.slice(bInt.length));
}

/**
 * Generates N evenly distributed keys between two bounds.
 */
export function generateNKeysBetween(a: string | null, b: string | null, n: number): string[] {
  if (n <= 0) return [];
  if (n === 1) return [generateKeyBetween(a, b)];

  if (b === null) {
    let c = a;
    const result: string[] = [];
    for (let i = 0; i < n; i++) {
      c = generateKeyBetween(c, null);
      result.push(c);
    }
    return result;
  }

  if (a === null) {
    let c = b;
    const result: string[] = [];
    for (let i = 0; i < n; i++) {
      c = generateKeyBetween(null, c);
      result.unshift(c);
    }
    return result;
  }

  const mid = Math.floor(n / 2);
  const c = generateKeyBetween(a, b);
  return [
    ...generateNKeysBetween(a, c, mid),
    c,
    ...generateNKeysBetween(c, b, n - mid - 1),
  ];
}

/* ------------------------------------------------------------------ */
/* 2. Numeric Midpoint Ranking (for Float / Int DB columns)            */
/* ------------------------------------------------------------------ */

/**
 * Calculates a numeric rank between two existing items.
 *
 * @param prevRank Rank of the item before the drop target (null/undefined if dropped at top)
 * @param nextRank Rank of the item after the drop target (null/undefined if dropped at bottom)
 * @param step Default spacing step (defaults to 1000)
 */
export function calculateRankBetween(
  prevRank?: number | null,
  nextRank?: number | null,
  step = DEFAULT_NUMERIC_STEP
): { rank: number; needsRebalance: boolean } {
  // Empty container / first item
  if (prevRank == null && nextRank == null) {
    return { rank: step, needsRebalance: false };
  }

  // Dropping at the very top (before first item)
  if (prevRank == null) {
    const target = nextRank!;
    const rank = target > 0 && target <= step ? Math.round(target / 2) : target - step;
    return { rank, needsRebalance: Math.abs(target - rank) < 1 };
  }

  // Dropping at the very bottom (after last item)
  if (nextRank == null) {
    return { rank: prevRank + step, needsRebalance: false };
  }

  // Dropping between two items
  const delta = nextRank - prevRank;
  if (delta <= 0) {
    // Items are already tied or out of order -> requires immediate rebalance
    return { rank: Math.round(prevRank + step / 2), needsRebalance: true };
  }

  const rank = prevRank + delta / 2;
  const needsRebalance = delta <= 1 || delta < MIN_NUMERIC_DELTA;

  return { rank: Math.round(rank * 1e6) / 1e6, needsRebalance };
}

/**
 * Rebalances ranks in an array so items are evenly distributed with a clean step.
 */
export function rebalanceRanks<T>(
  items: T[],
  setRank: (item: T, newRank: number) => T,
  step = DEFAULT_NUMERIC_STEP
): T[] {
  return items.map((item, index) => setRank(item, (index + 1) * step));
}
