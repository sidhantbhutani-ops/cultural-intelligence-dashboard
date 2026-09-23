const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

async function analyzeContent(items) {
  try {
    // Create item list with source_url included
    const itemsText = items
      .map((item, i) => `${i + 1}. "${item.title}" (${item.source}) - ${item.source_url}`)
      .join('\n');

    console.log(`[Analyzer] Sending ${items.length} items to Claude for analysis`);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 12000,
      messages: [
        {
          role: 'user',
          content: `Extract 8-12 cultural trends from these articles. For each trend, generate 2-3 editorial angles that Broadway's content team could execute (UGC ideas, brand collaborations, content series, narrative hooks). Return ONLY valid JSON array (no markdown, no text before/after).

[
  {
    "title": "Trend name",
    "description": "One sentence why it matters",
    "source": "article source",
    "source_url": "https://exact.url.from.articles.above",
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
    
    // Try to find and parse JSON array more carefully
    let trends = [];
    try {
      // First, try to find a complete JSON array
      const jsonMatch = content.match(/\[\s*\{[\s\S]*?\}\s*\]/);
      if (jsonMatch) {
        trends = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to extract from first [ to last ]
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

    // Map Claude's response trends back to original items to ensure source_url is correct
    const enrichedTrends = trends.map(trend => {
      // Find matching item by title similarity
      const matchingItem = items.find(item => 
        item.title.toLowerCase().includes(trend.title.toLowerCase().substring(0, 20)) ||
        trend.title.toLowerCase().includes(item.title.toLowerCase().substring(0, 20))
      );
      
      return {
        ...trend,
        source_url: matchingItem?.source_url || trend.source_url,
      };
    });

    console.log(`[Analyzer] Extracted ${enrichedTrends.length} trends`);
    return enrichedTrends;
  } catch (err) {
    console.error(`[Analyzer] Error: ${err.message}`);
    return [];
  }
}

module.exports = { analyzeContent };
