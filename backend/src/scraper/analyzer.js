const { query } = require('../config/supabase.js');
const { v4: uuidv4 } = require('uuid');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

async function analyzeContent(items) {
  try {
    const itemsText = items
      .map((item, i) => `${i + 1}. ${item.title} (${item.source})`)
      .join('\n');

    console.log(`[Analyzer] Sending ${items.length} items to Claude for analysis`);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: `Extract 8-12 cultural trends from these articles. For each trend, generate 2-3 editorial angles that Broadway's content team could execute (UGC ideas, brand collaborations, content series, narrative hooks). Return ONLY valid JSON array (no markdown, no text before/after).

[
  {
    "title": "Trend name",
    "description": "One sentence why it matters",
    "source": "article source",
    "source_url": "https://...",
    "category": "fashion|music|pop-culture|lifestyle|wellness|beauty",
    "velocity": "emerging|established",
    "engagement_metric": 75,
    "cultural_significance": "Brief impact explanation",
    "angles": ["Specific UGC/content hook #1", "Brand collaboration angle", "Content series idea"]
  }
]

Articles:
${itemsText}`
        }
      ]
    });

    let content = response.content[0].type === 'text' ? response.content[0].text : '';
    console.log(`[Analyzer] Response length: ${content.length}`);
    
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('[Analyzer] No JSON array found');
      return [];
    }

    const trends = JSON.parse(jsonMatch[0]);
    console.log(`[Analyzer] Extracted ${trends.length} trends`);
    return trends;
  } catch (err) {
    console.error(`[Analyzer] Error: ${err.message}`);
    return [];
  }
}

async function storeAnalyzedTrends(trends) {
  try {
    console.log(`[Analyzer] Starting to store ${trends.length} trends...`);
    let storedCount = 0;
    
    for (let i = 0; i < trends.length; i++) {
      const trend = trends[i];
      const trendId = uuidv4();
      
      try {
        await query(
          `INSERT INTO trends (id, title, description, source, source_url, category, velocity, engagement_metric, cultural_significance, angles, happening, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (source_url) DO UPDATE SET 
             title = EXCLUDED.title,
             description = EXCLUDED.description,
             cultural_significance = EXCLUDED.cultural_significance,
             angles = EXCLUDED.angles,
             updated_at = NOW()
           RETURNING id`,
          [
            trendId,
            trend.title,
            trend.description,
            trend.source,
            trend.source_url,
            trend.category,
            trend.velocity,
            trend.engagement_metric,
            trend.cultural_significance,
            trend.angles,
            'active',
            new Date().toISOString()
          ]
        );
        storedCount++;
      } catch (insertErr) {
        console.error(`[Analyzer] INSERT failed for "${trend.title}": ${insertErr.message}`);
      }
    }
    
    console.log(`[Analyzer] Stored ${storedCount}/${trends.length} trends`);
    return storedCount;
  } catch (err) {
    console.error(`[Analyzer] Store error: ${err.message}`);
    throw err;
  }
}

module.exports = { analyzeContent, storeAnalyzedTrends };
