const { isDuplicate } = require('./backend/src/scraper/deduplicator.js');

(async () => {
  // Test one of the new URLs from today's feed
  const newTitle = "Adam Driver, Miles Teller, and Scarlett Johansson Star in Official Trailer for James Gray's Paper Tiger";
  const newUrl = "https://hypebeast.com/2026/9/adam-driver-miles-teller-and-scarlett-johansson-star-in-official-trailer-for-james-grays-paper-tiger";
  
  const isDup = await isDuplicate(newTitle, newUrl, 'Hypebeast');
  
  console.log(`\nTitle: ${newTitle}`);
  console.log(`URL: ${newUrl}`);
  console.log(`\nIs duplicate? ${isDup}`);
  console.log('Expected: false (should NOT be a duplicate)');

  process.exit(0);
})();
