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

    const response = await client.messages.create({
      model: 'claude-sonnet-5',
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
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('[Analyzer] No valid JSON found in Claude response');
      return [];
    }

    const trends = JSON.parse(jsonMatch[0]);
    console.log(`[Analyzer] Extracted ${trends.length} trends from Claude`);
    return trends;
  } catch (err) {
    console.error(`[Analyzer] Failed to analyze content: ${err.message}`);
    return [];
  }
}

async function storeAnalyzedTrends(trends) {
  const stored = [];
  const scoringPromises = [];

  for (const trend of trends) {
    try {
      const trendId = uuidv4();
      
      await query(
        `INSERT INTO trends 
         (id, title, description, source, source_url, engagement_metric, happening, cultural_significance, angles, category, velocity, picked_up, created_at, source_count, signal_strength, source_names)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13, $14, $15)`,
        [
          trendId,
          trend.title,
          trend.description,
          trend.source,
          trend.source_url,
          trend.engagement_metric || 0,
          null,
          trend.cultural_significance,
          trend.angles || [],
          trend.category,
          trend.velocity,
          false,
          trend.source_count || 1,
          trend.signal_strength || 3,
          trend.source_names || [trend.source]
        ]
      );

      stored.push(trendId);
      console.log(`[Analyzer] Stored trend: "${trend.title}" (signal: ${trend.signal_strength})`);

      // Score the trend asynchronously (non-blocking)
      scoringPromises.push(
        scoreTrendWithRAD(trendId, trend).catch(err => 
          console.error(`[Analyzer] Scoring failed for trend ${trendId}: ${err.message}`)
        )
      );
    } catch (err) {
      console.error(`[Analyzer] Failed to store trend "${trend.title}": ${err.message}`);
    }
  }

  // Fire all scoring requests in parallel without blocking the scraper
  Promise.all(scoringPromises).catch(err => 
    console.error(`[Analyzer] Batch scoring error: ${err.message}`)
  );

  return stored;
}

module.exports = {
  analyzeContent,
  storeAnalyzedTrends
};
