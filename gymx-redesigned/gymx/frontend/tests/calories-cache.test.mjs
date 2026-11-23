import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const asModule = text => 'data:text/javascript;base64,' + Buffer.from(text).toString('base64');
const source = await fs.readFile(new URL('../src/utils/calories.js', import.meta.url), 'utf8');
const moduleUrl = asModule(source);
const { calculateCalorieEstimate: estimate, validateCalorieInput: validate } = await import(moduleUrl);
const cacheSource = (await fs.readFile(new URL('../src/utils/nutritionCache.js', import.meta.url), 'utf8')).replace("'./calories'", JSON.stringify(moduleUrl));
const cache = await import(asModule(cacheSource));
const standard = { age: 25, weight: 80, height: 175, gender: 'male', activity: 'moderate' };
const storage = () => { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, val) => data.set(key, val), removeItem: key => data.delete(key) }; };
test('shared standard estimate and goal rounding', () => {
  const result = estimate(standard);
  assert.equal(result.tdee, 2749);
  assert.deepEqual(Object.values(result.goals).map(g => g.targetCal), [2199, 2474, 2749, 3024, 3299]);
});
for (const field of ['age', 'weight', 'height']) for (const value of ['', ' ', undefined, null, -1, 0, NaN, Infinity, -Infinity, 'abc', '80kg', 999999]) {
  test(`reject ${field} ${String(value)}`, () => assert.ok(validate({ ...standard, [field]: value }).error));
}
for (const age of [10, 17, 17.9, 25.5, 101]) test(`adult integer age excludes ${age}`, () => assert.ok(validate({ ...standard, age }).error));
for (const gender of ['other', '', null]) test(`reject gender ${gender}`, () => assert.ok(validate({ ...standard, gender }).error));
for (const activity of ['1.55', 'unknown', '', null, '__proto__']) test(`reject activity ${activity}`, () => assert.ok(validate({ ...standard, activity }).error));
test('valid decimal body measurements', () => assert.ok(validate({ ...standard, weight: 80.5, height: 175.5 }).data));
test('older small adult gets no automated cut below app floor', () => {
  const r = estimate({ ...standard, age: 60, weight: 50, height: 160, gender: 'female', activity: 'sedentary' });
  assert.equal(r.tdee, 1247);
  assert.equal(r.goals.cut_strong.targetCal, 998);
  assert.equal(r.goals.cut_strong.available, false);
  assert.equal(r.goals.cut_light.available, false);
});
test('underweight cut blocked even if calories exceed floor', () => {
  const r = estimate({ ...standard, weight: 50, height: 180, activity: 'veryActive' });
  assert.equal(r.goals.cut_strong.available, false);
  assert.equal(r.goals.cut_light.available, false);
});
test('cache identity isolation, clear and legacy discard', () => {
  const s = storage();
  s.setItem(cache.LEGACY_NUTRITION_KEY, JSON.stringify(standard));
  assert.equal(cache.readNutritionCache('B', s), null);
  assert.equal(s.getItem(cache.LEGACY_NUTRITION_KEY), null);
  assert.equal(cache.writeNutritionCache('A', standard, s), true);
  assert.deepEqual(cache.readNutritionCache('A', s), standard);
  assert.equal(cache.readNutritionCache('B', s), null);
  assert.equal(cache.readNutritionCache(null, s), null);
  cache.clearNutritionCache('A', s);
  assert.equal(cache.readNutritionCache('A', s), null);
});
test('corrupt, mismatched owner, invalid and unavailable storage fail closed', () => {
  const s = storage(), key = cache.nutritionCacheKey('A');
  for (const val of ['{broken', 'null', JSON.stringify({ version: 2, userId: 'B', data: standard }), JSON.stringify({ version: 2, userId: 'A', data: { ...standard, age: 12 } })]) {
    s.setItem(key, val); assert.equal(cache.readNutritionCache('A', s), null);
  }
  const broken = { getItem: () => { throw Error('disabled'); }, setItem: () => { throw Error('full'); }, removeItem: () => { throw Error('disabled'); } };
  assert.equal(cache.readNutritionCache('A', broken), null);
  assert.equal(cache.writeNutritionCache('A', standard, broken), false);
  assert.equal(cache.writeNutritionCache(null, standard, s), false);
  assert.equal(cache.writeNutritionCache('A', { ...standard, weight: -80 }, s), false);
});
