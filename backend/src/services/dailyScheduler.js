const cron = require('node-cron');
const { query } = require('../config/supabase.js');
const { sendDailyTrendsReport } = require('../utils/slackNotifier');

let scheduledJob = null;

const startDailyScheduler = () => {
  if (scheduledJob) {
    console.log('[Scheduler] Daily job already running');
    return;
  }

  // Schedule for 8am IST every day (2:30am UTC)
  // IST = UTC + 5:30, so 8am IST = 2:30am UTC
  scheduledJob = cron.schedule('30 2 * * *', async () => {
    console.log('[Scheduler] Running daily trends digest at 2:30 UTC (8am IST)...');
    
    try {
      // Fetch top 3 trends by RAD score from today
      const today = new Date().toISOString().split('T')[0];
      
      const result = await query(
        `SELECT id, title, description, source, source_url, category, velocity, 
                rare_score, auth_score, dis_score, social_score, editorial_insight, 
                cultural_significance
         FROM trends
         WHERE happening = 'active' 
           AND created_at::date >= $1
         ORDER BY (rare_score + auth_score + dis_score + social_score) DESC
         LIMIT 3`,
        [today]
      );

      if (result.rows && result.rows.length > 0) {
        const trendsToReport = result.rows.map(row => ({
          id: row.id,
          title: row.title,
          description: row.description,
          source: row.source,
          source_url: row.source_url,
          category: row.category,
          velocity: row.velocity,
          rare_score: row.rare_score,
          auth_score: row.auth_score,
          dis_score: row.dis_score,
          social_score: row.social_score,
          editorial_insight: row.editorial_insight,
          cultural_significance: row.cultural_significance
        }));

        console.log(`[Scheduler] Found ${trendsToReport.length} trends from today, sending to Slack...`);
        await sendDailyTrendsReport(trendsToReport);
        console.log('[Scheduler] ✓ Daily digest sent successfully');
      } else {
        console.log('[Scheduler] No trends found for today');
      }
    } catch (error) {
      console.error('[Scheduler] Failed to send daily digest:', error.message);
    }
  });

  console.log('[Scheduler] Daily trends digest scheduled for 2:30 UTC (8am IST)');
};

const stopDailyScheduler = () => {
  if (scheduledJob) {
    scheduledJob.stop();
    scheduledJob = null;
    console.log('[Scheduler] Daily job stopped');
  }
};

module.exports = {
  startDailyScheduler,
  stopDailyScheduler,
};
