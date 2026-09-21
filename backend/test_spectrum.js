require('dotenv').config({ path: '.env.local' });
const { scoreTrend } = require('./src/services/spectrumScorer');

const testTrend = {
  title: "Niche Sneaker Collaborations and Heritage Drops",
  description: "Limited edition sneaker collaborations between heritage brands and contemporary designers are creating scarcity-driven demand among Gen-Z collectors.",
  category: "fashion",
  source: "Highsnobiety",
  angles: ["UGC campaign showcasing rare drops", "Brand collaboration angle", "Resale/community engagement"]
};

scoreTrend(testTrend).then(result => {
  console.log('SPECTRUM Score Result:', JSON.stringify(result, null, 2));
  process.exit(0);
});
