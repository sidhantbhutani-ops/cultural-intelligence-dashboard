const Anthropic = require('@anthropic-ai/sdk');
const { query } = require('../config/supabase');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const SPECTRUM_PROMPT = `You are a cultural trend analyst for Broadway, an experiential retail destination in India featuring 200+ new-age brands (fashion, beauty, streetwear, sneakers, wellness, lab-grown diamonds).

Analyze this trend using the SPECTRUM framework — measuring cultural momentum for new-age Indian Gen-Z (ages 18-32, urban metros, digitally native, values authenticity + sustainability).

Each dimension has a max score:

1. VELOCITY (0-25): How fast is Gen-Z in India adopting this right now?
2. CROSS-PLATFORM SPREAD (0-20): Multi-platform presence? (Instagram, TikTok, Reddit, IRL)
3. NOVELTY (0-20): How new is this in Indian Gen-Z context?
4. COMMUNITY DEPTH (0-15): Is this real community or manufactured hype?
5. COMMERCIAL ADOPTION (0-10): Can Broadway brands activate?
6. CATEGORY RELEVANCE (0-10): Does this shift Gen-Z shopping behavior?

TREND DATA:
Title: {title}
Description: {description}
Category: {category}
Source: {source}
Editorial Angles: {angles}

Respond ONLY with valid JSON:
{
  "velocity_score": <0-25>,
  "platform_score": <0-20>,
  "novelty_score": <0-20>,
  "community_score": <0-15>,
  "adoption_score": <0-10>,
  "category_score": <0-10>,
  "spectrum_insight": "<2-3 sentence explanation>"
}`;

async function scoreTrend(trend) {
  try {
    if (!trend.title || !trend.description) {
      throw new Error('Trend missing title or description');
    }

    const angles = Array.isArray(trend.angles) 
      ? trend.angles.join(', ') 
      : trend.angles || 'None';

    const prompt = SPECTRUM_PROMPT
      .replace('{title}', trend.title)
      .replace('{description}', trend.description)
      .replace('{category}', trend.category || 'Uncategorized')
      .replace('{source}', trend.source || 'Unknown')
      .replace('{angles}', angles);

    console.log(`[SPECTRUM] Scoring trend: ${trend.title.substring(0, 50)}`);

    const message = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    console.log(`[SPECTRUM] API Response received, content length: ${message.content.length}`);

    if (!message.content || message.content.length === 0) {
      throw new Error('Empty response from Claude API');
    }

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    console.log(`[SPECTRUM] Response text (first 200 chars): ${responseText.substring(0, 200)}`);

    if (!responseText) {
      throw new Error('Response text is empty');
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`No JSON found in response: ${responseText}`);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    const maxScores = {
      velocity_score: 25,
      platform_score: 20,
      novelty_score: 20,
      community_score: 15,
      adoption_score: 10,
      category_score: 10
    };

    const clamp = (val, max) => Math.max(0, Math.min(max, Math.round(val)));

    const result = {
      velocity_score: clamp(parsed.velocity_score, maxScores.velocity_score),
      platform_score: clamp(parsed.platform_score, maxScores.platform_score),
      novelty_score: clamp(parsed.novelty_score, maxScores.novelty_score),
      community_score: clamp(parsed.community_score, maxScores.community_score),
      adoption_score: clamp(parsed.adoption_score, maxScores.adoption_score),
      category_score: clamp(parsed.category_score, maxScores.category_score),
      spectrum_insight: parsed.spectrum_insight || 'Emerging trend'
    };

    result.total_score = result.velocity_score + result.platform_score + result.novelty_score + 
                         result.community_score + result.adoption_score + result.category_score;

    console.log(`[SPECTRUM] ✅ Scored: ${result.total_score}/100 for "${trend.title.substring(0, 40)}"`);
    
    // Update database with scores
    if (trend.id) {
      await updateTrendScores(trend.id, result);
    }
    
    return result;

  } catch (error) {
    console.error(`[SPECTRUM] ❌ Error scoring "${trend.title}":`, error.message);
    return {
      velocity_score: 0,
      platform_score: 0,
      novelty_score: 0,
      community_score: 0,
      adoption_score: 0,
      category_score: 0,
      spectrum_insight: 'Pending scoring',
      total_score: 0,
      error: error.message
    };
  }
}

async function updateTrendScores(trendId, scores) {
  try {
    await query(
      `UPDATE trends 
       SET velocity_score = $1, 
           platform_score = $2, 
           novelty_score = $3, 
           community_score = $4, 
           adoption_score = $5, 
           category_score = $6,
           spectrum_insight = $7
       WHERE id = $8`,
      [
        scores.velocity_score,
        scores.platform_score,
        scores.novelty_score,
        scores.community_score,
        scores.adoption_score,
        scores.category_score,
        scores.spectrum_insight,
        trendId
      ]
    );
    
    console.log(`[SPECTRUM] ✅ Updated DB for trend ${trendId}`);
  } catch (error) {
    console.error(`[SPECTRUM] Failed to update scores for trend ${trendId}:`, error.message);
  }
}

module.exports = { scoreTrend, updateTrendScores };
