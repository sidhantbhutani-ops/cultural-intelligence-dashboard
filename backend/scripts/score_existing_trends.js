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

async function scoreTrend(trend) {
  const prompt = `Score this trend (velocity:0-25, platform:0-20, novelty:0-20, community:0-15, adoption:0-10, category:0-10):
Title: ${trend.title}
Description: ${trend.description}
Category: ${trend.category}
Respond ONLY: {"velocity_score":X,"platform_score":X,"novelty_score":X,"community_score":X,"adoption_score":X,"category_score":X,"spectrum_insight":"X"}`;

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }]
    });

    console.log(`\n📝 ${trend.title.substring(0, 40)}`);
    console.log(`   Response content:`, msg.content);
    
    if (!msg.content || !msg.content[0]) {
      throw new Error('No content in Claude response');
    }

    const text = msg.content[0].text;
    if (!text) {
      throw new Error('Response text is empty');
    }

    console.log(`   Raw text (first 300 chars):`, text.substring(0, 300));
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`No JSON found in response: ${text}`);
    }

    const json = JSON.parse(jsonMatch[0]);
    
    const { error } = await supabase.from('trends').update({
      velocity_score: json.velocity_score,
      platform_score: json.platform_score,
      novelty_score: json.novelty_score,
      community_score: json.community_score,
      adoption_score: json.adoption_score,
      category_score: json.category_score,
      spectrum_insight: json.spectrum_insight
    }).eq('id', trend.id);
    
    if (error) throw error;
    
    const total = json.velocity_score + json.platform_score + json.novelty_score + json.community_score + json.adoption_score + json.category_score;
    console.log(`✅ ${trend.title.substring(0, 40)}: ${total}/100`);
  } catch (err) {
    console.log(`❌ ${trend.title}: ${err.message}`);
  }
}

async function main() {
  const { data: trends, error } = await supabase
    .from('trends')
    .select('*')
    .is('archived_at', null)
    .lte('velocity_score', 0);

  if (error) throw error;
  console.log(`Scoring ${trends.length} trends...\n`);
  
  for (const trend of trends) {
    await scoreTrend(trend);
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log(`\n✅ All ${trends.length} trends scored!`);
  process.exit(0);
}

main().catch(console.error);
