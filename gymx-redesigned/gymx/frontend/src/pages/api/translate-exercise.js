// src/pages/api/translate-exercise.js
// ── ترجمة تعليمات التمرين للعامية المصرية ───────────────────
//
// بياخد نص التمرين بالإنجليزي (اللي جاي من مكتبة arhxam/free-exercise-db-with-videos)
// ويترجمه بالعامية المصرية عن طريق Anthropic API، ويكاش الناتج في Supabase
// جدول exercise_ar_translations عشان كل تمرين يترجم مرة واحدة بس مهما عدد
// المستخدمين اللي فتحوه — مفيش تكلفة ترجمة متكررة.
//
// لازم تضيف في Vercel environment variables:
//   ANTHROPIC_API_KEY            → مفتاح الـ API بتاعك من console.anthropic.com
//   SUPABASE_SERVICE_ROLE_KEY    → موجود في Supabase → Project Settings → API
// (الاتنين سيرفر-أونلي، متتحطش في NEXT_PUBLIC_*)
//
// ⚠️ كل رد فشل بيرجع فيه "reason" فيه سبب الفشل الحقيقي (مفيش مفاتيح سرية
// فيه) عشان لو حصل عطل يبان السبب على طول في الواجهة من غير ما تدور في
// Vercel logs.

import { createClient } from '@supabase/supabase-js';

const MODEL = 'claude-haiku-4-5-20251001'; // موديل سريع ورخيص، مناسب لمهمة ترجمة بسيطة

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed', reason: 'wrong HTTP method' });
  }

  const { id, name, steps } = req.body || {};
  if (!id) return res.status(400).json({ error: 'missing exercise id', reason: 'no id in request body' });
  if (!steps?.length) return res.status(200).json({ steps: [] });

  // تحقق مبكر من الإعدادات عشان الرسالة تكون واضحة من أول خطوة
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({
      error: 'supabase not configured',
      reason: !process.env.SUPABASE_SERVICE_ROLE_KEY
        ? 'SUPABASE_SERVICE_ROLE_KEY env var مش موجودة في Vercel'
        : 'NEXT_PUBLIC_SUPABASE_URL env var مش موجودة في Vercel',
    });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'anthropic not configured', reason: 'ANTHROPIC_API_KEY env var مش موجودة في Vercel' });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  // 1) هل التمرين ده اتترجم قبل كده؟ (لو الجدول مش موجود هيرمي إكسبشن هنا،
  // فبنمسكه لوحده عشان الرسالة توضح إن المشكلة في الجدول مش في الترجمة)
  let cached = null;
  try {
    const { data, error } = await supabaseAdmin
      .from('exercise_ar_translations')
      .select('steps')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = لسه مفيش صف، ده طبيعي
    cached = data;
  } catch (err) {
    return res.status(500).json({
      error: 'supabase select failed',
      reason: `مقدرش يقرا من جدول exercise_ar_translations: ${err.message || err.code || 'خطأ غير معروف'}. اتأكد إنك شغّلت ملف الـ SQL في Supabase.`,
    });
  }

  if (cached?.steps?.length) {
    return res.status(200).json({ steps: cached.steps });
  }

  // 2) لو مش موجود، ترجمه دلوقتي عن طريق Claude
  let aiRes;
  try {
    aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        system:
          'انت مدرب جيم بتشرح خطوات أداء تمرين لمتدرب. مهمتك تترجم مصفوفة خطوات أداء تمرين من ' +
          'الإنجليزي للعامية المصرية، بأسلوب واضح ومباشر ومحفّز، من غير فصحى ومن غير ترجمة حرفية ' +
          'جوجل-ترانسليت-ستايل. حافظ على نفس عدد العناصر بالظبط وبنفس الترتيب. رجّع الرد بصيغة JSON ' +
          'فقط من غير أي نص زيادة قبله أو بعده، بالشكل ده بالظبط: {"steps": ["...", "..."]}.',
        messages: [
          { role: 'user', content: `اسم التمرين: ${name}\n\nترجملي خطوات الأداء دي:\n${JSON.stringify(steps)}` },
        ],
      }),
    });
  } catch (err) {
    return res.status(502).json({ error: 'anthropic fetch failed', reason: `مقدرش يوصل لـ api.anthropic.com: ${err.message}` });
  }

  if (!aiRes.ok) {
    const errText = await aiRes.text();
    console.error('Anthropic API error:', aiRes.status, errText);
    return res.status(502).json({
      error: 'anthropic api error',
      reason: `Anthropic رد بـ status ${aiRes.status}: ${errText.slice(0, 300)}`,
    });
  }

  const aiData = await aiRes.json();
  const rawText = (aiData.content || [])
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .replace(/```json|```/g, '')
    .trim();

  let translated;
  try {
    translated = JSON.parse(rawText);
  } catch {
    console.error('Could not parse translation JSON:', rawText);
    return res.status(502).json({
      error: 'bad translation format',
      reason: `الرد اللي جه من الموديل مش JSON صالح: ${rawText.slice(0, 300)}`,
    });
  }

  if (!Array.isArray(translated.steps) || !translated.steps.length) {
    return res.status(502).json({ error: 'empty translation', reason: 'الموديل رجّع steps فاضية أو مش array' });
  }

  // 3) كاش الناتج في Supabase عشان محدش يترجمه تاني (لو فشل الكاش مش
  // مشكلة كبيرة، هنرجع الترجمة برضه للمستخدم بس نسجل الخطأ في اللوج)
  const { error: upsertError } = await supabaseAdmin
    .from('exercise_ar_translations')
    .upsert({ id, steps: translated.steps });
  if (upsertError) console.error('Supabase upsert error:', upsertError.message);

  return res.status(200).json({ steps: translated.steps });
}
