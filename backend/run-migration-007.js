const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ojfnsyvlbbfumdglmfds.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZGVtb0Bicm9hZHdheS5jb20iLCJlbWFpbCI6ImRlbW9AYnJvYWR3YXkuY29tIiwibmFtZSI6IkRlbW8iLCJpYXQiOjE3ODk5NzMyMzUsImV4cCI6MTc5MDA1OTYzNX0.JBw4Zj7dJitny-zKkH3AMKU7q6ohr2qHbU2Egxw_hyo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Running migration 007...');
    
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE trends ADD COLUMN IF NOT EXISTS rare_score INTEGER DEFAULT 0;
        ALTER TABLE trends ADD COLUMN IF NOT EXISTS auth_score INTEGER DEFAULT 0;
        ALTER TABLE trends ADD COLUMN IF NOT EXISTS dis_score INTEGER DEFAULT 0;
        ALTER TABLE trends ADD COLUMN IF NOT EXISTS social_score INTEGER DEFAULT 0;
        ALTER TABLE trends ADD COLUMN IF NOT EXISTS editorial_insight TEXT;
      `
    });

    if (error) throw error;
    console.log('✅ Migration 007 applied successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  }
}

runMigration();
