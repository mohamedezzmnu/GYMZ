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

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const MODEL = 'claude-haiku-4-5-20251001'; // موديل سريع ورخيص، مناسب لمهمة ترجمة بسيطة

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { id, name, steps } = req.body || {};
  if (!id) return res.status(400).json({ error: 'missing exercise id' });
  if (!steps?.length) return res.status(200).json({ steps: [] });

  try {
    // 1) هل التمرين ده اتترجم قبل كده؟
    const { data: cached } = await supabaseAdmin
      .from('exercise_ar_translations')
      .select('steps')
      .eq('id', id)
      .single();

    if (cached?.steps?.length) {
      return res.status(200).json({ steps: cached.steps });
    }

    // 2) لو مش موجود، ترجمه دلوقتي عن طريق Claude
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
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

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('Anthropic API error:', errText);
      return res.status(502).json({ error: 'translation service failed' });
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
      return res.status(502).json({ error: 'bad translation format' });
    }

    // 3) كاش الناتج في Supabase عشان محدش يترجمه تاني
    await supabaseAdmin.from('exercise_ar_translations').upsert({
      id,
      steps: translated.steps || null,
    });

    return res.status(200).json({ steps: translated.steps || [] });
  } catch (err) {
    console.error('translate-exercise error:', err);
    return res.status(500).json({ error: 'unexpected server error' });
  }
}
