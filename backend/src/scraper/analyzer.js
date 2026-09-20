const { query } = require('../config/supabase.js');
const { v4: uuidv4 } = require('uuid');
const Anthropic = require('@anthropic-ai/sdk');
const { scoreTrendWithRAD } = require('../services/trendScoringService.js');

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
          content: `Extract 8-12 cultural trends from these articles. Return ONLY valid JSON array (no markdown, no text before/after).

[
  {
    "title": "Trend name",
    "description": "One sentence why it matters",
    "source": "article source",
    "source_url": "https://...",
    "category": "fashion|music|pop-culture|lifestyle|wellness|beauty",
    "velocity": "emerging",
    "engagement_metric": 75,
    "cultural_significance": "One sentence impact",
    "angles": ["key1", "key2"]
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
    const trendIds = [];
    for (const trend of trends) {
      const trendId = uuidv4();
      await query(
        `INSERT INTO trends (id, title, description, source, source_url, category, velocity, engagement_metric, cultural_significance, angles, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
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
          new Date().toISOString()
        ]
      );
      trendIds.push(trendId);
    }
    console.log(`[Analyzer] Stored ${trendIds.length} trends`);
    return trendIds;
  } catch (err) {
    console.error(`[Analyzer] Store error: ${err.message}`);
    throw err;
  }
}

module.exports = { analyzeContent, storeAnalyzedTrends };
