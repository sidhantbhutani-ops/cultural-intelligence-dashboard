const supabase = require("../src/config/supabase");

async function fixSources() {
  // Disable broken ones
  const toDisable = ["Homegrown", "Vogue India", "Grazia India", "UGRA India", "BUNA Studio", "r/IndianFashion", "r/IndianFashionAddicts", "r/IndianMakeupAddicts"];
  
  for (const name of toDisable) {
    await supabase
      .from("sources")
      .update({ is_active: false })
      .eq("name", name);
  }
  
  // Add working Substacks
  const newSources = [
    { name: "Fashion Forward India", source_type: "rss", base_url: "https://fashionforwardindia.substack.com/feed", scrape_strategy: "rss", is_active: true },
    { name: "The Bombay Edition", source_type: "rss", base_url: "https://thebombayedition.substack.com/feed", scrape_strategy: "rss", is_active: true },
    { name: "Untag India", source_type: "rss", base_url: "https://untag.co/feed", scrape_strategy: "rss", is_active: true }
  ];
  
  for (const source of newSources) {
    await supabase.from("sources").insert([source]);
  }
  
  console.log("✅ Fixed sources");
  process.exit(0);
}

fixSources().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
