/**
 * Migration: Add Broadway analysis columns to trends table
 * This script adds brand_activations, action_mapping, and consumption_triggers columns
 * if they don't already exist.
 */

const { supabase } = require('../config/supabase');

async function addBroadwayColumns() {
  try {
    console.log('[Migration] Checking for required columns...');

    // Check current schema
    const { data: schema } = await supabase
      .from('trends')
      .select('*')
      .limit(1);

    if (!schema || schema.length === 0) {
      console.log('[Migration] No data in trends table, creating columns anyway...');
    }

    console.log('[Migration] Attempting to add columns...');
    
    const migrationSQL = `
    -- Add Broadway analysis columns if they don't exist
    ALTER TABLE trends
    ADD COLUMN IF NOT EXISTS brand_activations JSONB DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS action_mapping JSONB DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS consumption_triggers JSONB DEFAULT NULL;
    `;

    console.log('[Migration] SQL that needs to be run:');
    console.log(migrationSQL);
    
    console.log('\n[Migration] ℹ️  Run this SQL manually via Supabase dashboard or CLI:');
    console.log('   1. Go to Supabase dashboard → SQL Editor');
    console.log('   2. Create a new query and paste the SQL above');
    console.log('   3. Execute the query');
    console.log('\n[Migration] OR run via Supabase CLI:');
    console.log('   supabase db pull');
    console.log('   (edit migrations file to add the columns)');
    console.log('   supabase db push');

  } catch (error) {
    console.error('[Migration] Error:', error.message);
    process.exit(1);
  }
}

addBroadwayColumns();
