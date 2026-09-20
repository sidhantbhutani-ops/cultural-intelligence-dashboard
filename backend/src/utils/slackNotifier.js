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

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🌅 Daily Trends Report',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${new Date().toLocaleDateString('en-IN')}* • ${trends.length} new trends scraped`,
      },
    },
    {
      type: 'divider',
    },
  ];

  // Add each trend
  trends.slice(0, 15).forEach((trend, i) => {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${i + 1}. ${trend.title}*\n_${trend.source}_ • ${trend.category} • ${trend.velocity}\n${trend.cultural_significance || trend.happening || 'No description'}`,
      },
    });
    blocks.push({ type: 'divider' });
  });

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '<https://cultural-intelligence-dashboard-frontend.onrender.com/trends|View all trends on dashboard →>',
    },
  });

  try {
    console.log('[Slack] Starting to send daily trends report...');
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
