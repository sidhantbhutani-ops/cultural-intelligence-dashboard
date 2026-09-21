const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

const RAD_PROMPT = `You are a cultural trend analyst for Broadway, an experiential retail destination in India featuring 200+ new-age brands (fashion, beauty, streetwear, sneakers, wellness, lab-grown diamonds).

Analyze this trend and score it on the RAD framework:
- Rare (0-25): How uncommon/niche is this trend? Novel angles Broadway hasn't tapped?
- Authentic (0-25): Is this real consumer behavior or hype? Does it have genuine staying power?
- Disruptive (0-25): Will this change how people shop, consume, or interact? Industry-shifting potential?
- Social (0-25): Social media momentum, creator buzz, community engagement potential?

TREND DATA:
Title: {title}
Description: {description}
Category: {category}
Source: {source}
Editorial Angles: {angles}

Respond ONLY with valid JSON (no markdown, no preamble):
{
  "rare_score": <0-25>,
  "auth_score": <0-25>,
  "dis_score": <0-25>,
  "social_score": <0-25>,
  "editorial_insight": "<1-2 sentence hook for Broadway editorial team to execute>"
}`;

async function scoreTrend(trend) {
  try {
    if (!trend.title || !trend.description) {
      throw new Error('Trend missing title or description');
    }

    const angles = Array.isArray(trend.angles) 
      ? trend.angles.join(', ') 
      : trend.angles || 'None';

    const prompt = RAD_PROMPT
      .replace('{title}', trend.title)
      .replace('{description}', trend.description)
      .replace('{category}', trend.category || 'Uncategorized')
      .replace('{source}', trend.source || 'Unknown')
      .replace('{angles}', angles);

    console.log('[RAD Scorer] Starting Claude API call...');

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    console.log('[RAD Scorer] Claude response received');

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`No JSON in response: ${responseText}`);
    }

    const scores = JSON.parse(jsonMatch[0]);

    // Validate scores
    if (typeof scores.rare_score !== 'number' || 
        typeof scores.auth_score !== 'number' ||
        typeof scores.dis_score !== 'number' ||
        typeof scores.social_score !== 'number') {
      throw new Error('Invalid score format');
    }

    // Clamp scores to 0-25
    const clamp = (val) => Math.max(0, Math.min(25, Math.round(val)));

    const result = {
      rare_score: clamp(scores.rare_score),
      auth_score: clamp(scores.auth_score),
      dis_score: clamp(scores.dis_score),
      social_score: clamp(scores.social_score),
      editorial_insight: scores.editorial_insight || 'Emerging trend with Broadway potential',
      total_score: clamp(scores.rare_score) + clamp(scores.auth_score) + clamp(scores.dis_score) + clamp(scores.social_score)
    };

    console.log('[RAD Scorer] Scores calculated:', result);
    return result;

  } catch (error) {
    console.error('[RAD Scorer] Error:', error.message);
    console.error('[RAD Scorer] Stack:', error.stack);
    // Return default scores on error
    return {
      rare_score: 0,
      auth_score: 0,
      dis_score: 0,
      social_score: 0,
      editorial_insight: 'Pending manual review',
      total_score: 0,
      error: error.message
    };
  }
}

module.exports = { scoreTrend };
