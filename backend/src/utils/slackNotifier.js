const { WebClient } = require('@slack/web-api');

const sendSlackMessage = async (channel, blocks) => {
  const token = process.env.SLACK_BOT_TOKEN;
  const client = new WebClient(token);

  try {
    console.log(`[Slack] Sending message to channel: ${channel}`);
    const result = await client.chat.postMessage({
      channel,
      blocks,
    });
    console.log('[Slack] Message sent successfully:', result.ts);
    return result;
  } catch (error) {
    console.error('[Slack] Failed to send message:', error.message);
    throw error;
  }
};

const sendDailyTrendsReport = async (trends) => {
  if (!trends || trends.length === 0) {
    console.log('[Slack] No trends to report');
    return;
  }

  // Calculate total RAD score and sort by it
  const trendsWithScores = trends
    .map(t => ({
      ...t,
      total_score: (t.rare_score || 0) + (t.auth_score || 0) + (t.dis_score || 0) + (t.social_score || 0)
    }))
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, 3); // Top 3 only

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🎯 Top Trends by RAD Score',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${new Date().toLocaleDateString('en-IN')}* — Editorial picks for content calendar`,
      },
    },
    {
      type: 'divider',
    },
  ];

  // Add top 3 trends with RAD breakdown
  trendsWithScores.forEach((trend, i) => {
    const radBar = `Rare: ${trend.rare_score || 0} | Auth: ${trend.auth_score || 0} | Dis: ${trend.dis_score || 0} | Social: ${trend.social_score || 0}`;
    
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${i + 1}. ${trend.title}* (RAD: ${trend.total_score})\n_${trend.source}_ • ${trend.category}\n\`${radBar}\`\n*Editorial Angle:* ${trend.editorial_insight || 'Emerging trend with Broadway potential'}`,
      },
    });
    blocks.push({ type: 'divider' });
  });

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '<https://cultural-intelligence-dashboard-frontend.onrender.com/trends|View full dashboard →>',
    },
  });

  try {
    console.log('[Slack] Starting to send daily trends report (top 3)...');
    await sendSlackMessage(process.env.SLACK_CHANNEL, blocks);
    console.log('[Slack] Daily trends report sent successfully');
  } catch (error) {
    console.error('[Slack] Failed to send Slack report:', error.message);
  }
};

module.exports = {
  sendSlackMessage,
  sendDailyTrendsReport,
};
