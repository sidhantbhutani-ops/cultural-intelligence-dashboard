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

async function mapActions(trend) {
  const prompt = `You are a strategy lead at Broadway, India's experiential retail destination.

Trend: ${trend.title}
Description: ${trend.description}
Category: ${trend.category}
Brands: ${trend.brand_activations?.map(b => b.name).join(', ') || 'N/A'}

For this trend, suggest 3 CONCRETE actionable tactics for Broadway:

1. CONTENT IDEA: A specific social media post, editorial piece, or campaign (max 1 sentence)
2. IN-STORE ACTIVATION: A physical experience or event in Broadway stores (max 1 sentence)
3. PRODUCT LAUNCH: A new product angle, collaboration, or line inspired by this trend (max 1 sentence)

Return ONLY this JSON:
{
  "content_idea": "...",
  "in_store_activation": "...",
  "product_launch": "..."
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
      .update({ action_mapping: data })
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
  console.log(`\nMapping actions for ${trends.length} trends...\n`);
  
  for (const trend of trends) {
    await mapActions(trend);
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log(`\n✅ Action mapping complete!`);
  process.exit(0);
}

main().catch(console.error);
