require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const clusters = {
  'Collab Economy and Brand Partnerships': 'Collaboration & Partnerships',
  'Celebrity-Designer Brand Launches': 'Collaboration & Partnerships',
  'Cross-Category Tech Collaborations': 'Collaboration & Partnerships',
  
  'Comeback Narratives in Established Brands': 'Heritage & Nostalgia',
  'Heritage Footwear Revival': 'Heritage & Nostalgia',
  
  'Fashion Week Convergence and Accessibility': 'Democratization & Access',
  'Experiential Brand Events and Community': 'Democratization & Access',
  
  'Bold, Optimistic Fashion Forward': 'Personal Expression & Customization',
  'Art Car and Customization Culture': 'Personal Expression & Customization',
  'Unpredictable, AI-Resistant Fashion Trends': 'Personal Expression & Customization',
  
  'Sustainability as Fashion Aesthetic': 'Values-Driven Consumption',
  'Narrative-Driven Fragrance and Wellness': 'Values-Driven Consumption'
};

async function addClusters() {
  for (const [title, cluster] of Object.entries(clusters)) {
    const { error } = await supabase
      .from('trends')
      .update({ cluster })
      .eq('title', title);
    
    if (error) {
      console.log(`❌ ${title}: ${error.message}`);
    } else {
      console.log(`✅ ${title} → ${cluster}`);
    }
  }
  
  console.log('\n✅ All trends clustered!');
  process.exit(0);
}

addClusters().catch(console.error);
