/**
 * Backfill Script: Score all trends with SPECTRUM framework
 * 
 * Usage:
 *   node src/scripts/backfill_spectrum_scores.js [--limit N]
 */

require('dotenv').config();
const { supabase } = require('../config/supabase');
const { scoreTrend } = require('../services/spectrumScorer');

const args = process.argv.slice(2);
const limitIndex = args.indexOf('--limit');
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : null;

async function backfillScores() {
  try {
    console.log('📊 [Spectrum Backfill] Starting SPECTRUM scoring backfill...');

    // Fetch all trends
    const { data: trends, error } = await supabase
      .from('trends')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!trends || trends.length === 0) {
      console.log('❌ [Spectrum Backfill] No trends found');
      process.exit(1);
    }

    console.log(`📋 [Spectrum Backfill] Found ${trends.length} trends in database`);

    // Filter to only trends with zero scores
    const needsScoring = trends.filter(t => 
      (t.velocity_score === 0 || !t.velocity_score) &&
      (t.platform_score === 0 || !t.platform_score) &&
      (t.novelty_score === 0 || !t.novelty_score)
    );

    console.log(`🎯 [Spectrum Backfill] ${needsScoring.length} trends need scoring\n`);

    let trendsToScore = needsScoring;
    if (limit) {
      trendsToScore = trendsToScore.slice(0, limit);
      console.log(`⚙️  [Spectrum Backfill] Limited to ${limit} trends for testing\n`);
    }

    // Score each trend
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < trendsToScore.length; i++) {
      const trend = trendsToScore[i];
      console.log(`[${i + 1}/${trendsToScore.length}] Scoring: "${trend.title.substring(0, 50)}..."`);

      try {
        const result = await scoreTrend(trend);
        
        if (result && result.velocity_score !== undefined) {
          console.log(`  ✅ Score: ${result.total_score}/100`);
          succeeded++;
        } else {
          console.log(`  ⚠️  Scoring failed`);
          failed++;
        }

        // Rate limit: wait 500ms between requests
        if (i < trendsToScore.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        failed++;
      }
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 [Spectrum Backfill] COMPLETE`);
    console.log(`✅ Succeeded: ${succeeded}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Total: ${trendsToScore.length}`);
    console.log(`${'='.repeat(60)}`);

    if (failed === 0) {
      console.log('\n🎉 All trends successfully scored!');
      process.exit(0);
    } else {
      console.log(`\n⚠️  ${failed} trends failed.`);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ [Spectrum Backfill] Fatal error:', error.message);
    process.exit(1);
  }
}

backfillScores();
