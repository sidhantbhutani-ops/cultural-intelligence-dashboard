const Anthropic = require('@anthropic-ai/sdk');
const { supabase } = require('../config/supabase');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const BROADWAY_ANALYSIS_PROMPT = `You are a cultural strategist for Broadway, an experiential retail destination in India featuring 200+ new-age brands across fashion, beauty, streetwear, sneakers, wellness, and lab-grown diamonds.

A cultural trend has been identified and scored. Analyze it from Broadway's perspective and generate:

1. BRAND ACTIVATIONS: Which 3 Broadway partner brands should activate on this trend and why
2. ACTION MAPPING: 3 executable ideas (content, product, in-store experience)
3. CONSUMPTION TRIGGERS: How, when, and where Gen-Z discovers and engages with this trend

TREND DATA:
Title: {title}
Description: {description}
Category: {category}
Spectrum Insight: {spectrum_insight}
Velocity Score: {velocity_score} (adoption speed)
Platform Score: {platform_score} (multi-platform reach)
Novelty Score: {novelty_score} (how new)
Community Score: {community_score} (real community vs. hype)

Respond ONLY with valid JSON (no markdown, no text before/after):
{
  "brand_activations": [
    {
      "brand_name": "Brand Name",
      "reason": "Why this brand should activate on this trend"
    },
    {
      "brand_name": "Brand Name 2",
      "reason": "Why this brand should activate"
    },
    {
      "brand_name": "Brand Name 3",
      "reason": "Why this brand should activate"
    }
  ],
  "action_mapping": {
    "content_idea": "Specific Instagram/TikTok/content strategy angle for Broadway to own this narrative",
    "product_launch": "Limited edition product, bundle, or collaboration idea with price range",
    "in_store_activation": "Physical experience, pop-up, or in-store zone idea for Broadway locations"
  },
  "consumption_triggers": {
    "how": "How Gen-Z discovers this trend (platforms, behaviors, community engagement)",
    "when": "Best timing for engagement (day of week, time of day, seasonality)",
    "where": "Where this happens (specific platforms, communities, locations, events)"
  }
}`;

async function analyzeTrend(trend, retries = 3) {
  try {
    if (!trend.title || !trend.description) {
      throw new Error('Trend missing title or description');
    }

    const prompt = BROADWAY_ANALYSIS_PROMPT
      .replace('{title}', trend.title)
      .replace('{description}', trend.description)
      .replace('{category}', trend.category || 'Uncategorized')
      .replace('{spectrum_insight}', trend.spectrum_insight || 'No insight yet')
      .replace('{velocity_score}', trend.velocity_score || 0)
      .replace('{platform_score}', trend.platform_score || 0)
      .replace('{novelty_score}', trend.novelty_score || 0)
      .replace('{community_score}', trend.community_score || 0);

    console.log(`[BROADWAY] Analyzing trend: "${trend.title.substring(0, 50)}"`);

    let lastError;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const message = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        });

        console.log(`[BROADWAY] API Response received, content length: ${message.content.length}`);

        if (!message.content || message.content.length === 0) {
          throw new Error('Empty response from Claude API');
        }

        const responseText = message.content[0].type === 'text' 
          ? message.content[0].text 
          : '';

        console.log(`[BROADWAY] Response text (first 200 chars): ${responseText.substring(0, 200)}`);

        if (!responseText) {
          throw new Error('Response text is empty');
        }

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error(`No JSON found in response: ${responseText}`);
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Validate structure
        if (!parsed.brand_activations || !Array.isArray(parsed.brand_activations)) {
          throw new Error('Invalid brand_activations structure');
        }
        if (!parsed.action_mapping || typeof parsed.action_mapping !== 'object') {
          throw new Error('Invalid action_mapping structure');
        }
        if (!parsed.consumption_triggers || typeof parsed.consumption_triggers !== 'object') {
          throw new Error('Invalid consumption_triggers structure');
        }

        console.log(`[BROADWAY] ✅ Analysis complete for "${trend.title.substring(0, 40)}"`);
        
        // Update database if trend has ID
        if (trend.id) {
          await updateTrendAnalysis(trend.id, parsed);
        }
        
        return {
          success: true,
          data: parsed
        };

      } catch (error) {
        lastError = error;
        if (attempt < retries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`[BROADWAY] Retry ${attempt + 1}/${retries} after ${delay}ms:`, error.message);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;

  } catch (error) {
    console.error(`[BROADWAY] ❌ Error analyzing "${trend.title}":`, error.message);
    return {
      success: false,
      error: error.message,
      data: getFallbackAnalysis()
    };
  }
}

async function updateTrendAnalysis(trendId, analysis) {
  try {
    const { error } = await supabase
      .from('trends')
      .update({
        brand_activations: JSON.stringify(analysis.brand_activations),
        action_mapping: JSON.stringify(analysis.action_mapping),
        consumption_triggers: JSON.stringify(analysis.consumption_triggers)
      })
      .eq('id', trendId);
    
    if (error) throw error;
    
    console.log(`[BROADWAY] ✅ Updated DB for trend ${trendId}`);
  } catch (error) {
    console.error(`[BROADWAY] Failed to update analysis for trend ${trendId}:`, error.message);
  }
}

function getFallbackAnalysis() {
  return {
    brand_activations: [
      {
        brand_name: "TBD",
        reason: "Analysis pending"
      }
    ],
    action_mapping: {
      content_idea: "Pending analysis",
      product_launch: "Pending analysis",
      in_store_activation: "Pending analysis"
    },
    consumption_triggers: {
      how: "Pending analysis",
      when: "Pending analysis",
      where: "Pending analysis"
    }
  };
}

module.exports = { analyzeTrend, updateTrendAnalysis };
