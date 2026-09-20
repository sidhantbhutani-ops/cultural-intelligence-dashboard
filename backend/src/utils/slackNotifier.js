const https = require('https');

const sendSlackMessage = (channel, blocks) => {
  return new Promise((resolve, reject) => {
    const token = process.env.SLACK_BOT_TOKEN;
    const data = JSON.stringify({
      channel,
      blocks,
    });

    const options = {
      hostname: 'slack.com',
      path: '/api/chat.postMessage',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.ok) {
            resolve(json);
          } else {
            reject(new Error(json.error || 'Slack API error'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

const sendDailyTrendsReport = async (trends) => {
  if (!trends || trends.length === 0) {
    console.log('No trends to report');
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
    await sendSlackMessage(process.env.SLACK_CHANNEL, blocks);
    console.log('Daily trends report sent to Slack');
  } catch (error) {
    console.error('Failed to send Slack report:', error.message);
  }
};

module.exports = {
  sendSlackMessage,
  sendDailyTrendsReport,
};
