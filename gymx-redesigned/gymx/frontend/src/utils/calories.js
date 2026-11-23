// Product estimates, not a medical prescription. Policy changes require owner review.
// Mifflin-St Jeor: https://pubmed.ncbi.nlm.nih.gov/15883556/
// Adult scope: https://www.niddk.nih.gov/health-information/weight-management/body-weight-planner?dkrd=lgdmn0001
export const ACTIVITY_FACTORS = Object.freeze({ sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 });
export const CALORIE_SCOPE = 'تقدير للبالغين فقط، مش وصفة طبية. مش مناسب للحمل أو الرضاعة أو اضطرابات الأكل أو الحالات والأدوية اللي تحتاج نظام خاص. استشر مختص لو ده ينطبق عليك.';
export const SCOPE_CONFIRMATION = 'أنا بالغ، والشروط دي مش بتنطبق عليّ، وفاهم إن النتيجة تقديرية.';
export const GOAL_RATIOS = Object.freeze({ cut_strong: 0.8, cut_light: 0.9, maintain: 1, bulk_lean: 1.1, bulk_strong: 1.2 });

export function validateCalorieInput(input = {}) {
  const data = { weight: Number(input.weight), height: Number(input.height), age: Number(input.age), gender: input.gender, activity: input.activity };
  if (!Number.isInteger(data.age) || data.age < 18 || data.age > 100) return { error: 'اكتب سن صحيح من 18 إلى 100 سنة. الأداة للبالغين فقط.' };
  if (!Number.isFinite(data.weight) || data.weight < 30 || data.weight > 250) return { error: 'اكتب وزن من 30 إلى 250 كجم. خارج النطاق ده تحتاج تقييم مختص.' };
  if (!Number.isFinite(data.height) || data.height < 100 || data.height > 250) return { error: 'اكتب طول من 100 إلى 250 سم. اتأكد من الوحدة.' };
  if (!['male', 'female'].includes(data.gender) || !Object.hasOwn(ACTIVITY_FACTORS, data.activity)) return { error: 'اختار الجنس ومستوى النشاط من الاختيارات المتاحة.' };
  return { data };
}

export function calculateCalorieEstimate(input) {
  const checked = validateCalorieInput(input);
  if (checked.error) throw new RangeError(checked.error);
  const { weight, height, age, gender, activity } = checked.data;
  const bmr = 10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161);
  const tdee = Math.round(bmr * ACTIVITY_FACTORS[activity]);
  if (!Number.isFinite(tdee) || tdee <= 0) throw new RangeError('البيانات دي محتاجة تقييم مختص بدل تقدير آلي.');
  const bmi = weight / ((height / 100) ** 2);
  // Conservative app limits, not universal clinical safety floors.
  // Typical adult weight-loss intake ranges: https://doi.org/10.1002/oby.20821
  const minimum = gender === 'male' ? 1500 : 1200;
  const goals = Object.fromEntries(Object.entries(GOAL_RATIOS).map(([key, ratio]) => {
    const targetCal = Math.round(tdee * ratio);
    const reason = targetCal < minimum
      ? 'مش هنعرض خطة بالسعرات دي لأنها أقل من حد العرض المحافظ للتطبيق. راجع مختص لتقييم احتياجك.'
      : key.startsWith('cut') && bmi < 18.5
        ? 'مش هنعرض هدف نزول وزن مع مؤشر كتلة أقل من 18.5. محتاج تقييم مختص.'
        : '';
    return [key, { targetCal, deficit: targetCal - tdee, available: !reason, reason }];
  }));
  return { tdee, bmr, bmi, minimum, goals };
      }
