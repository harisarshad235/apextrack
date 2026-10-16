import {
  generateKeyBetween,
  generateNKeysBetween,
  calculateRankBetween,
  rebalanceRanks,
} from '../lib/fractionalIndexing';

console.log('========================================================');
console.log(' ApexTrack Fractional Indexing & Ranking Verification ');
console.log('========================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}`);
    if (detail) console.error(`       Detail: ${detail}`);
  }
}

// ---------------------------------------------------------
// 1. String-based Fractional Indexing Tests
// ---------------------------------------------------------
console.log('--- 1. Testing String Fractional Indexing ---');

// Test 1: Empty list returns initial key
const initialKey = generateKeyBetween(null, null);
assert(initialKey === 'a0', 'Initial item in empty list is "a0"', `got ${initialKey}`);

// Test 2: Append at end
const k1 = generateKeyBetween('a0', null);
const k2 = generateKeyBetween(k1, null);
assert(k1 === 'a1' && k2 === 'a2', 'Appending produces "a1", "a2"', `k1=${k1}, k2=${k2}`);

// Test 3: Prepend at top
const kTop1 = generateKeyBetween(null, 'a0');
const kTop2 = generateKeyBetween(null, kTop1);
assert(kTop1 === 'Zz' && kTop2 === 'Zy', 'Prepending before "a0" produces "Zz", "Zy"', `kTop1=${kTop1}, kTop2=${kTop2}`);

// Test 4: Midpoint between adjacent integer keys
const kMid = generateKeyBetween('a0', 'a1');
assert(kMid > 'a0' && kMid < 'a1', 'Midpoint "a0V" is strictly between "a0" and "a1"', `kMid=${kMid}`);

// Test 5: Subdivisions between fractional keys
const kSub1 = generateKeyBetween('a0', kMid);
const kSub2 = generateKeyBetween(kMid, 'a1');
assert('a0' < kSub1 && kSub1 < kMid && kMid < kSub2 && kSub2 < 'a1', 'Subdivision preserves strict ordering', `kSub1=${kSub1}, kSub2=${kSub2}`);

// Test 6: Infinite subdivision stress test (100 consecutive drops between the same two items)
let lo = 'a0';
let hi = 'a1';
const generated: string[] = [];
for (let i = 0; i < 100; i++) {
  const next = generateKeyBetween(lo, hi);
  generated.push(next);
  hi = next; // insert right before current hi
}
const fullSeries = ['a0', ...generated.reverse(), 'a1'];
let strictlyAscending = true;
for (let i = 0; i < fullSeries.length - 1; i++) {
  if (fullSeries[i] >= fullSeries[i + 1]) {
    strictlyAscending = false;
    break;
  }
}
assert(strictlyAscending, '100 consecutive subdivisions between "a0" and "a1" are strictly sorted', `Failed at index ${generated.length}`);

// Test 7: Multi-key generation
const bulk = generateNKeysBetween('a0', 'a5', 5);
assert(bulk.length === 5 && bulk.every((k, i) => i === 0 || bulk[i - 1] < k) && bulk[0] > 'a0' && bulk[4] < 'a5', 'generateNKeysBetween generates 5 sorted keys');

// ---------------------------------------------------------
// 2. Numeric Midpoint Ranking Tests
// ---------------------------------------------------------
console.log('\n--- 2. Testing Numeric Midpoint Ranking ---');

// Test 8: Empty list default rank
const rEmpty = calculateRankBetween(null, null);
assert(rEmpty.rank === 1000 && !rEmpty.needsRebalance, 'Empty container starts at rank 1000', `rank=${rEmpty.rank}`);

// Test 9: Dropping at top
const rTop = calculateRankBetween(null, 1000);
assert(rTop.rank === 500, 'Dropping before 1000 results in rank 500', `rank=${rTop.rank}`);

// Test 10: Dropping at bottom
const rBottom = calculateRankBetween(1000, null);
assert(rBottom.rank === 2000, 'Dropping after 1000 results in rank 2000', `rank=${rBottom.rank}`);

// Test 11: Midpoint calculation
const rMid = calculateRankBetween(1000, 2000);
assert(rMid.rank === 1500 && !rMid.needsRebalance, 'Midpoint between 1000 and 2000 is 1500', `rank=${rMid.rank}`);

// Test 12: Rebalance detection on tight bounds
const rTight = calculateRankBetween(1000, 1000.5);
assert(rTight.needsRebalance, 'Tight gap triggers needsRebalance=true', `rank=${rTight.rank}`);

// Test 13: Array rebalance helper
const mockItems = [
  { id: '1', rank: 1.0001 },
  { id: '2', rank: 1.0002 },
  { id: '3', rank: 1.0003 },
];
const rebalanced = rebalanceRanks(mockItems, (item, rank) => ({ ...item, rank }));
assert(
  rebalanced[0].rank === 1000 && rebalanced[1].rank === 2000 && rebalanced[2].rank === 3000,
  'rebalanceRanks redistributes items evenly with step 1000'
);

console.log('\n========================================================');
console.log(` Summary: ${passedTests} / ${totalTests} tests passed.`);
console.log('========================================================');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
