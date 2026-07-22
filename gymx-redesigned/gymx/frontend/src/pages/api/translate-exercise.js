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

  const { id, name, instructions, steps, formCues, commonMistakes, breathing } = req.body || {};
  if (!id) return res.status(400).json({ error: 'missing exercise id' });

  try {
    // 1) هل التمرين ده اتترجم قبل كده؟
    const { data: cached } = await supabaseAdmin
      .from('exercise_ar_translations')
      .select('*')
      .eq('id', id)
      .single();

    if (cached) {
      return res.status(200).json({
        instructions: cached.instructions,
        steps: cached.steps,
        formCues: cached.form_cues,
        commonMistakes: cached.common_mistakes,
        breathing: cached.breathing,
      });
    }

    // 2) لو مش موجود، ترجمه دلوقتي عن طريق Claude
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    const payload = { instructions, steps, formCues, commonMistakes, breathing };

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system:
          'انت مترجم متخصص في محتوى الجيم والفتنس. مهمتك تترجم نصوص تمارين رياضية من الإنجليزي ' +
          'للعامية المصرية، بأسلوب كابتن جيم بيشرح لمتدرب — واضح ومباشر ومحفّز، من غير فصحى ومن غير ' +
          'ترجمة حرفية جوجل-ترانسليت-ستايل. حافظ على نفس عدد العناصر في كل مصفوفة (steps, formCues, ' +
          'commonMistakes) بنفس الترتيب. رجّع الرد بصيغة JSON فقط من غير أي نص زيادة قبله أو بعده، ' +
          'ونفس الأسماء بالظبط: instructions (string), steps (array of strings), formCues (array of ' +
          'strings), commonMistakes (array of strings), breathing (string).',
        messages: [
          { role: 'user', content: `اسم التمرين: ${name}\n\nترجملي الأوبچكت ده:\n${JSON.stringify(payload)}` },
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
      instructions: translated.instructions || null,
      steps: translated.steps || null,
      form_cues: translated.formCues || null,
      common_mistakes: translated.commonMistakes || null,
      breathing: translated.breathing || null,
    });

    return res.status(200).json({
      instructions: translated.instructions,
      steps: translated.steps,
      formCues: translated.formCues,
      commonMistakes: translated.commonMistakes,
      breathing: translated.breathing,
    });
  } catch (err) {
    console.error('translate-exercise error:', err);
    return res.status(500).json({ error: 'unexpected server error' });
  }
}
