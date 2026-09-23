const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

async function analyzeContent(items) {
  try {
    // Create item list with indices for Claude to reference
    const itemsText = items
      .map((item, i) => `${i}. "${item.title}" (${item.source}) - ${item.source_url}`)
      .join('\n');

    console.log(`[Analyzer] Sending ${items.length} items to Claude for analysis`);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 12000,
      messages: [
        {
          role: 'user',
          content: `Extract 8-12 cultural trends from these articles. For each trend, identify which articles (by index) support it, and generate 2-3 editorial angles. Return ONLY valid JSON array (no markdown, no text before/after).

[
  {
    "title": "Trend name",
    "description": "One sentence why it matters",
    "primary_source": "article source name",
    "primary_source_url": "https://url.of.primary.article",
    "coverage_article_indices": [0, 3, 5],
    "category": "fashion|music|pop-culture|lifestyle|wellness|beauty",
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
    
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let trends = [];
    try {
      const jsonMatch = content.match(/\[\s*\{[\s\S]*?\}\s*\]/);
      if (jsonMatch) {
        trends = JSON.parse(jsonMatch[0]);
      } else {
        const simpleMatch = content.match(/\[[\s\S]*\]/);
        if (simpleMatch) {
          trends = JSON.parse(simpleMatch[0]);
        }
      }
    } catch (parseErr) {
      console.error(`[Analyzer] JSON parse failed: ${parseErr.message}`);
      console.error(`[Analyzer] Raw response (first 500 chars): ${content.substring(0, 500)}`);
      console.error(`[Analyzer] Raw response (last 500 chars): ${content.substring(Math.max(0, content.length - 500))}`);
      return [];
    }

    if (!trends || trends.length === 0) {
      console.error("[Analyzer] No trends extracted");
      return [];
    }

    // Enrich trends with coverage sources array
    const enrichedTrends = trends.map(trend => {
      const coverageArticles = [];
      
      // Get all articles that support this trend
      if (trend.coverage_article_indices && Array.isArray(trend.coverage_article_indices)) {
        trend.coverage_article_indices.forEach(idx => {
          if (items[idx]) {
            coverageArticles.push({
              title: items[idx].title,
              source: items[idx].source,
              source_url: items[idx].source_url
            });
          }
        });
      }

      return {
        title: trend.title,
        description: trend.description,
        source: trend.primary_source || 'Multiple Sources',
        source_url: trend.primary_source_url || (coverageArticles[0]?.source_url || ''),
        coverage_sources: coverageArticles.length > 0 ? coverageArticles : [{ source: trend.primary_source, source_url: trend.primary_source_url }],
        category: trend.category,
        cultural_significance: trend.cultural_significance,
        angles: trend.angles || []
      };
    });

    console.log(`[Analyzer] Extracted ${enrichedTrends.length} trends with coverage info`);
    return enrichedTrends;

  } catch (error) {
    console.error(`[Analyzer] Error:`, error);
    throw error;
  }
}

module.exports = {
  analyzeContent
};
