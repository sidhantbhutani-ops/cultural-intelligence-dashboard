/**
 * Backfill Script: Analyze all existing trends with Broadway analyzer
 * 
 * Usage:
 *   node src/scripts/backfill_broadway_analysis.js [--limit N] [--dry-run]
 * 
 * Examples:
 *   node src/scripts/backfill_broadway_analysis.js          # Analyze all trends
 *   node src/scripts/backfill_broadway_analysis.js --limit 5 # Test on first 5
 *   node src/scripts/backfill_broadway_analysis.js --dry-run # Show what would be analyzed
 */

require('dotenv').config();
const { supabase } = require('../config/supabase');
const { analyzeTrend } = require('../services/broadwayAnalyzer');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitIndex = args.indexOf('--limit');
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : null;

async function backfillAnalysis() {
  try {
    console.log('📊 [Backfill] Starting Broadway analysis backfill...');
    if (dryRun) console.log('🔍 [Backfill] DRY RUN MODE - no changes will be made\n');

    // Fetch all trends that don't have analysis yet
    let query = supabase
      .from('trends')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: trends, error } = await query;

    if (error) throw error;
    if (!trends || trends.length === 0) {
      console.log('❌ [Backfill] No trends found');
      process.exit(1);
    }

    console.log(`📋 [Backfill] Found ${trends.length} trends in database`);

    // Filter to only trends missing analysis
    const needsAnalysis = trends.filter(t => 
      !t.brand_activations || !t.action_mapping || !t.consumption_triggers
    );

    console.log(`🎯 [Backfill] ${needsAnalysis.length} trends need analysis\n`);

    let trendsToAnalyze = needsAnalysis;
    if (limit) {
      trendsToAnalyze = trendsToAnalyze.slice(0, limit);
      console.log(`⚙️  [Backfill] Limited to ${limit} trends for testing\n`);
    }

    if (dryRun) {
      console.log('📌 [Backfill] Would analyze these trends:');
      trendsToAnalyze.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.title.substring(0, 60)}... (ID: ${t.id})`);
      });
      console.log(`\n✅ [Backfill] Dry run complete. ${trendsToAnalyze.length} trends would be analyzed.`);
      process.exit(0);
    }

    // Analyze each trend
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < trendsToAnalyze.length; i++) {
      const trend = trendsToAnalyze[i];
      console.log(`\n[${i + 1}/${trendsToAnalyze.length}] Analyzing: "${trend.title.substring(0, 50)}..."`);

      try {
        const result = await analyzeTrend(trend);
        
        if (result.success) {
          console.log(`  ✅ Success`);
          succeeded++;
        } else {
          console.log(`  ⚠️  Analysis failed: ${result.error}`);
          failed++;
        }

        // Rate limit: wait 500ms between requests
        if (i < trendsToAnalyze.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        failed++;
      }
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 [Backfill] COMPLETE`);
    console.log(`✅ Succeeded: ${succeeded}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Total: ${trendsToAnalyze.length}`);
    console.log(`${'='.repeat(60)}`);

    if (failed === 0) {
      console.log('\n🎉 All trends successfully analyzed!');
      process.exit(0);
    } else {
      console.log(`\n⚠️  ${failed} trends failed. Check logs above for details.`);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ [Backfill] Fatal error:', error.message);
    process.exit(1);
  }
}

backfillAnalysis();
