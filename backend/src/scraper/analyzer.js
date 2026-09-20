const { query } = require('../config/supabase.js');
const { v4: uuidv4 } = require('uuid');
const Anthropic = require('@anthropic-ai/sdk');
const { scoreTrendWithRAD } = require('../services/trendScoringService.js');

const client = new Anthropic();

async function analyzeContent(items) {
  try {
    const itemsText = items
      .map((item, i) => `${i + 1}. Title: ${item.title}\nSource: ${item.source}\nURL: ${item.url}\nSummary: ${item.description || 'N/A'}`)
      .join('\n\n');

    console.log(`[Analyzer] Sending ${items.length} items to Claude for analysis`);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `You are a cultural trends analyst for Broadway, India's curated multi-brand experiential retail destination. Analyze these articles and extract the most significant pop culture and consumer culture trends.

For each trend, return ONLY valid JSON with no markdown or extra text. Use this exact structure:
[
  {
    "title": "Trend name",
    "description": "Why this trend matters for new-age Indian consumers",
    "source": "Primary source name",
    "source_url": "URL of primary article",
    "category": "pop-culture|movies|music|fashion|beauty|wellness|collectibles|sports|lifestyle",
    "velocity": "emerging|peaking|declining",
    "engagement_metric": 85,
    "cultural_significance": "Brief explanation of cultural impact",
    "angles": ["angle1", "angle2", "angle3"]
  }
]

Articles:
${itemsText}`
        }
      ]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    console.log(`[Analyzer] Claude response length: ${content.length}, first 300 chars: ${content.substring(0, 300)}`);
    
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('[Analyzer] No valid JSON found in Claude response');
      console.log('[Analyzer] Full response:', content);
      return [];
    }

    const trends = JSON.parse(jsonMatch[0]);
    console.log(`[Analyzer] Extracted ${trends.length} trends from Claude`);
    return trends;
  } catch (err) {
    console.error(`[Analyzer] Failed to analyze content: ${err.message}`);
    console.error('[Analyzer] Full error:', err);
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
          JSON.stringify(trend.angles),
          new Date().toISOString()
        ]
      );
      trendIds.push(trendId);
    }
    console.log(`[Analyzer] Stored ${trendIds.length} trends to database`);
    return trendIds;
  } catch (err) {
    console.error(`[Analyzer] Failed to store trends: ${err.message}`);
    throw err;
  }
}

module.exports = { analyzeContent, storeAnalyzedTrends };
