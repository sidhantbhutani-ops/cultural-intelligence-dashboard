const { query } = require('../config/supabase.js');
const { v4: uuidv4 } = require('uuid');
const Anthropic = require('@anthropic-ai/sdk');
const { scoreTrendWithRAD } = require('../services/trendScoringService.js');

const client = new Anthropic();

async function analyzeContent(items) {
  try {
    const itemsText = items
      .map((item, i) => `${i + 1}. Title: ${item.title}\nSource: ${item.source}\nURL: ${item.source_url}\nSummary: ${item.description || 'N/A'}`)
      .join('\n\n');

    console.log(`[Analyzer] Sending ${items.length} items to Claude for analysis`);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `You are a cultural trends analyst for Broadway, India's curated multi-brand experiential retail destination. Analyze these articles and extract the most significant pop culture and consumer culture trends.

Return ONLY a valid JSON array. Use this exact structure with single-line descriptions (no newlines inside text fields):
[
  {
    "title": "Trend name",
    "description": "Why this trend matters for Indian consumers",
    "source": "Source name",
    "source_url": "URL",
    "category": "pop-culture|movies|music|fashion|beauty|wellness|collectibles|sports|lifestyle",
    "velocity": "emerging|peaking|declining",
    "engagement_metric": 85,
    "cultural_significance": "Brief impact explanation",
    "angles": ["angle1", "angle2", "angle3"]
  }
]

Articles:
${itemsText}`
        }
      ]
    });

    let content = response.content[0].type === 'text' ? response.content[0].text : '';
    console.log(`[Analyzer] Claude response length: ${content.length}`);
    
    // Remove markdown code fences
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Extract JSON array
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('[Analyzer] No JSON array found in response');
      return [];
    }

    let jsonStr = jsonMatch[0];
    
    // Sanitize: Fix common JSON formatting issues
    // Replace literal newlines with spaces in string values
    jsonStr = jsonStr.replace(/:\s*"([^"]*\n[^"]*)"/g, (match) => {
      return match.replace(/\n/g, ' ');
    });

    let trends = [];
    try {
      trends = JSON.parse(jsonStr);
      console.log(`[Analyzer] Successfully parsed ${trends.length} trends from Claude`);
      return trends;
    } catch (parseErr) {
      console.error(`[Analyzer] Failed to parse JSON: ${parseErr.message}`);
      console.log('[Analyzer] JSON string (first 500 chars):', jsonStr.substring(0, 500));
      return [];
    }
  } catch (err) {
    console.error(`[Analyzer] Failed to analyze content: ${err.message}`);
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
    console.log(`[Analyzer] Stored ${trendIds.length} trends to database`);
    return trendIds;
  } catch (err) {
    console.error(`[Analyzer] Failed to store trends: ${err.message}`);
    throw err;
  }
}

module.exports = { analyzeContent, storeAnalyzedTrends };
