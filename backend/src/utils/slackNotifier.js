const https = require('https');

const sendSlackMessage = (channel, blocks) => {
  return new Promise((resolve, reject) => {
    const token = process.env.SLACK_BOT_TOKEN;
    
    if (!token || !channel) {
      const err = `Missing Slack config: token=${!!token}, channel=${!!channel}`;
      console.error('[Slack]', err);
      return reject(new Error(err));
    }
    
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

    console.log(`[Slack] Sending message to channel: ${channel}`);
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          console.log('[Slack] Response:', JSON.stringify(json));
          
          if (json.ok) {
            console.log('[Slack] Message sent successfully');
            resolve(json);
          } else {
            console.error('[Slack] API error:', json.error);
            reject(new Error(json.error || 'Slack API error'));
          }
        } catch (e) {
          console.error('[Slack] Parse error:', e.message);
          reject(e);
        }
      });
    });

    req.on('error', (err) => {
      console.error('[Slack] Request error:', err.message);
      reject(err);
    });
    
    req.write(data);
    req.end();
  });
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
