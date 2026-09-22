require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function mapTriggers(trend) {
  const prompt = `You are a Gen-Z behavior analyst for Broadway. Analyze how India's urban Gen-Z (18-32, metros: Delhi, Mumbai, Bangalore, Pune, Hyderabad) engages with this trend.

Trend: ${trend.title}
Description: ${trend.description}
Category: ${trend.category}

Answer these 3 questions for Gen-Z consumption:

1. WHEN: What time/day/context does Gen-Z discover/engage with this? (morning scroll, lunch break, weekend, late night, etc)
2. WHERE: Which platforms/contexts? (Instagram Stories, TikTok FYP, Reddit, IRL in stores/mall, with friends, etc)
3. HOW: What drives engagement? (impulse, research, FOMO, social validation, trend-chasing, peer influence, etc)

Return ONLY this JSON:
{
  "when": "...",
  "where": "...",
  "how": "..."
}`;

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = msg.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    
    const data = JSON.parse(jsonMatch[0]);

    const { error } = await supabase
      .from('trends')
      .update({ consumption_triggers: data })
      .eq('id', trend.id);
    
    if (error) throw error;
    
    console.log(`✅ ${trend.title.substring(0, 40)}`);
  } catch (err) {
    console.log(`❌ ${trend.title}: ${err.message}`);
  }
}

async function main() {
  const { data: trends, error } = await supabase
    .from('trends')
    .select('*')
    .is('archived_at', null);

  if (error) throw error;
  console.log(`\nMapping consumption triggers for ${trends.length} trends...\n`);
  
  for (const trend of trends) {
    await mapTriggers(trend);
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log(`\n✅ Consumption trigger mapping complete!`);
  process.exit(0);
}

main().catch(console.error);
