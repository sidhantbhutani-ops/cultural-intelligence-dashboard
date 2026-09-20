const Anthropic = require('@anthropic-ai/sdk');
const { query } = require('../config/supabase');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function scoreTrendWithRAD(trendId, trend) {
  try {
    const prompt = `Analyze this trend through the RAD framework (Rare, Authentic, Disruptive, Social).

TREND: ${trend.title}
DESCRIPTION: ${trend.description}

Score each dimension 0-25. Return ONLY valid JSON (no markdown, no explanations):
{
  "rare_score": <0-25>,
  "auth_score": <0-25>,
  "dis_score": <0-25>,
  "social_score": <0-25>,
  "editorial_insight": "<1-2 sentences on why this trend matters for new-age consumer behavior>"
}`;

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Claude');
    }

    const scores = JSON.parse(jsonMatch[0]);

    // Validate scores
    if (!scores.rare_score || !scores.auth_score || !scores.dis_score || !scores.social_score) {
      throw new Error('Missing RAD scores in response');
    }

    // Update trend with scores
    await query(
      `UPDATE trends 
       SET rare_score = $1, auth_score = $2, dis_score = $3, social_score = $4, editorial_insight = $5
       WHERE id = $6`,
      [
        scores.rare_score,
        scores.auth_score,
        scores.dis_score,
        scores.social_score,
        scores.editorial_insight,
        trendId,
      ]
    );

    console.log(`[RAD Scorer] ✅ Scored trend "${trend.title}" - Total: ${scores.rare_score + scores.auth_score + scores.dis_score + scores.social_score}/100`);
    return scores;
  } catch (err) {
    console.error(`[RAD Scorer] ❌ Failed to score trend "${trend.title}": ${err.message}`);
    // Non-blocking: log error but don't fail the scraper
    return null;
  }
}

module.exports = { scoreTrendWithRAD };
