const Anthropic = require("@anthropic-ai/sdk").default;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeContent(items) {
  try {
    if (!items || items.length === 0) {
      console.log("[Analyzer] No items to analyze");
      return [];
    }

    console.log(`[Analyzer] Analyzing ${items.length} items`);

    const itemsText = items
      .map(
        (item, idx) =>
          `[${idx}] Title: ${item.title}\nSource: ${item.source}\nURL: ${item.source_url}\nContent: ${item.content?.substring(0, 300) || "N/A"}`
      )
      .join("\n\n");

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 12000,
      messages: [
        {
          role: "user",
          content: `Extract 8-12 cultural trends from these articles. For EACH trend, identify which articles (by index) support it. Return ONLY valid JSON array (no markdown, no text before/after).

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
    console.log(`[Analyzer] Raw response length: ${content.length}`);
    console.log(`[Analyzer] First 1000 chars:\n${content.substring(0, 1000)}`);
    console.log(`[Analyzer] Last 1000 chars:\n${content.substring(Math.max(0, content.length - 1000))}`);
    
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
      return [];
    }

    console.log(`[Analyzer] Parsed ${trends.length} trends`);
    
    // Log each trend's coverage_article_indices
    trends.forEach((t, i) => {
      console.log(`  Trend ${i}: "${t.title}" - coverage_article_indices: ${JSON.stringify(t.coverage_article_indices)}`);
    });

    return trends;

  } catch (error) {
    console.error(`[Analyzer] Error:`, error);
    throw error;
  }
}

module.exports = {
  analyzeContent
};
