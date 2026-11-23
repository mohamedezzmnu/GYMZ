import { validateCalorieInput } from './calories';
export const LEGACY_NUTRITION_KEY = 'gymz_nutrition_userdata';
const PREFIX = 'gymz_nutrition_userdata:v2:';
export function nutritionCacheKey(userId) {
  return typeof userId === 'string' && userId.trim() ? PREFIX + encodeURIComponent(userId) : null;
}
function storageOrNull() {
  try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; }
}
export function removeLegacyNutritionCache(storage = storageOrNull()) {
  try { storage?.removeItem(LEGACY_NUTRITION_KEY); } catch { /* storage can be disabled */ }
}
export function readNutritionCache(userId, storage = storageOrNull()) {
  removeLegacyNutritionCache(storage); // Never migrate unowned legacy data into an account.
  const key = nutritionCacheKey(userId);
  if (!key || !storage) return null;
  try {
    const saved = JSON.parse(storage.getItem(key));
    const checked = validateCalorieInput(saved?.data);
    if (saved?.version !== 2 || saved.userId !== userId || checked.error) return null;
    return checked.data;
  } catch { return null; }
}
export function writeNutritionCache(userId, data, storage = storageOrNull()) {
  const key = nutritionCacheKey(userId);
  const checked = validateCalorieInput(data);
  if (!key || !storage || checked.error) return false;
  try {
    removeLegacyNutritionCache(storage);
    storage.setItem(key, JSON.stringify({ version: 2, userId, data: checked.data }));
    return true;
  } catch { return false; }
}
export function clearNutritionCache(userId, storage = storageOrNull()) {
  removeLegacyNutritionCache(storage);
  const key = nutritionCacheKey(userId);
  try { if (key) storage?.removeItem(key); } catch { /* storage can be disabled */ }
}
