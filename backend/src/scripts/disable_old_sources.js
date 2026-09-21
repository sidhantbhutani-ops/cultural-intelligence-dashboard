const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const oldSources = ["Variety", "Rolling Stone", "WIRED", "Design Observer", "The Morning Context Newsletter", "Collab Substack", "Hypebeast", "Highsnobiety"];

async function disableOldSources() {
  console.log("Disabling old seed sources...");
  
  for (const name of oldSources) {
    const { error } = await supabase
      .from("scraper_sources")
      .update({ is_active: false })
      .eq("name", name);

    if (error) {
      console.error(`Error disabling ${name}:`, error.message);
    } else {
      console.log(`✅ Disabled: ${name}`);
    }
  }
  
  console.log("Done!");
  process.exit(0);
}

disableOldSources().catch(console.error);
