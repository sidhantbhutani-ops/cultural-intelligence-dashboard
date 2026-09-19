const Anthropic = require('@anthropic-ai/sdk');
const { query } = require('../config/database.js');

const client = new Anthropic();

const CLAUDE_PROMPT = `You are a cultural critic observing emerging trends in new-age Indian consumer culture.
Analyze the following content and extract the core trend.

For each trend, output ONLY valid JSON (no markdown, no preamble):
{
  "happening": "2-3 sentence concrete description of what's happening",
  "cultural_significance": "Why it matters to new-age Indian consumer — values, anxieties, cultural shifts",
  "angles": ["angle 1", "angle 2", "angle 3", "angle 4"],
  "category": "[one of: sports, pop-culture, movies, music, collectibles, beauty, fashion, lifestyle, wellness]"
}

Tone: Cultural critic — observational, sometimes sharp, connecting dots. Accessible for smart editorial team.`;

async function analyzeContent(items) {
  if (!items || items.length === 0) {
    console.log('[Analyzer] No items to analyze');
    return [];
  }

  const analyzed = [];

  for (const item of items) {
    try {
      console.log(`[Analyzer] Analyzing: "${item.title}"`);

      const contentSummary = `
Title: ${item.title}
Source: ${item.source}
Description: ${item.description || '(no description)'}
`;

      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `${CLAUDE_PROMPT}\n\nContent to analyze:\n${contentSummary}`,
          },
        ],
      });

      const responseText = response.content[0]?.type === 'text' ? response.content[0].text : '';

      let analysis;
      try {
        analysis = JSON.parse(responseText);
      } catch {
        console.error(`[Analyzer] Failed to parse JSON from Claude for "${item.title}"`);
        continue;
      }

      const trend = {
        title: item.title,
        description: item.description || analysis.happening,
        source: item.source,
        source_url: item.source_url,
        happening: analysis.happening,
        cultural_significance: analysis.cultural_significance,
        angles: analysis.angles,
        category: analysis.category,
        engagement_metric: 0,
        velocity: 'emerging',
        picked_up: false,
      };

      analyzed.push(trend);
      console.log(`[Analyzer] ✅ Analyzed: "${trend.title}" (${trend.category})`);
    } catch (err) {
      console.error(`[Analyzer] Failed to analyze "${item.title}": ${err.message}`);
    }
  }

  console.log(`[Analyzer] Completed: ${analyzed.length}/${items.length} items analyzed`);
  return analyzed;
}

async function storeAnalyzedTrends(trends) {
  if (!trends || trends.length === 0) {
    console.log('[Analyzer] No trends to store');
    return [];
  }

  const stored = [];

  for (const trend of trends) {
    try {
      const duplicate = await query(
        `SELECT id FROM trends 
         WHERE title = $1 AND source = $2 AND archived_at IS NULL`,
        [trend.title, trend.source]
      );

      if (duplicate.rows.length > 0) {
        console.log(`[Analyzer] Skipping duplicate: "${trend.title}"`);
        continue;
      }

      const result = await query(
        `INSERT INTO trends 
         (title, description, source, source_url, happening, cultural_significance, angles, category, velocity, engagement_metric, picked_up, scraped_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          trend.title,
          trend.description,
          trend.source,
          trend.source_url,
          trend.happening,
          trend.cultural_significance,
          trend.angles,
          trend.category,
          trend.velocity,
          trend.engagement_metric,
          trend.picked_up,
          'cultural-intelligence-scraper',
        ]
      );

      if (!result || !result.rows || result.rows.length === 0) {
        console.error(`[Analyzer] ❌ INSERT returned no rows for: "${trend.title}"`);
        continue;
      }

      const trendId = result.rows[0].id;
      stored.push({ ...trend, id: trendId });
      console.log(`[Analyzer] ✅ Stored: "${trend.title}" (ID: ${trendId})`);
    } catch (err) {
      console.error(`[Analyzer] ❌ Failed to store "${trend.title}": ${err.message}`);
    }
  }

  console.log(`[Analyzer] Stored ${stored.length} trends`);
  return stored;
}

module.exports = {
  analyzeContent,
  storeAnalyzedTrends,
};
