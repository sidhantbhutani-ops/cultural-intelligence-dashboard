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

const BROADWAY_BRANDS = {
  'Fashion': ['Lovebirds', 'Rahul Mishra', 'Karva Cinna', 'Psych', 'Nykaa Fashion'],
  'Beauty': ['Nykaa', 'Purplle', 'Mama Earth', 'The Derma Co', 'Minimalist'],
  'Wellness': ['Curefoods', 'Neuherbs', 'Wellnesscare', 'Yoga Bar'],
  'Lifestyle': ['Urban Ladder', 'Craftroots', 'Wunderlust', 'The Jute Works'],
  'Streetwear': ['Bewakoof', 'Garage Grown', 'Cosmic Fusion'],
  'Footwear': ['Sole Story', 'Khadim', 'Campus']
};

const brandList = Object.values(BROADWAY_BRANDS).flat().join(', ');

async function mapBrands(trend) {
  const prompt = `You are a brand strategist for Broadway, India's experiential retail destination.

Trend: ${trend.title}
Description: ${trend.description}
Category: ${trend.category}

Broadway carries these brands: ${brandList}

Which 2-4 of these brands should activate this trend? Return ONLY this JSON:
{
  "brands": [
    {"name": "Brand Name", "reason": "Why this brand fits (1 sentence)"},
    ...
  ]
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
      .update({ brand_activations: data.brands })
      .eq('id', trend.id);
    
    if (error) throw error;
    
    console.log(`✅ ${trend.title.substring(0, 40)}: ${data.brands.map(b => b.name).join(', ')}`);
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
  console.log(`\nMapping ${trends.length} trends to brands...\n`);
  
  for (const trend of trends) {
    await mapBrands(trend);
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log(`\n✅ Brand mapping complete!`);
  process.exit(0);
}

main().catch(console.error);
