// Simple keyword-based clustering to group related articles

function extractKeywords(title) {
  // Remove common words, extract meaningful keywords
  const stopwords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'was', 'are', 'be',
    'how', 'why', 'what', 'when', 'where', 'who', 'which', 'this', 'that', 'it', 'as', 'by', 'from',
    'with', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down',
    'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'watch',
    'how', 'online', 'streaming', 'your', 'you', 'i', 'we', 'he', 'she', 'they', 'them'
  ]);

  return title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopwords.has(word))
    .map(word => word.replace(/[^\w]/g, ''))
    .filter(word => word.length > 0);
}

function calculateSimilarity(keywords1, keywords2) {
  // Jaccard similarity: common keywords / total unique keywords
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x))).size;
  const union = new Set([...set1, ...set2]).size;
  
  return union > 0 ? intersection / union : 0;
}

async function clusterArticles(articles) {
  if (!articles || articles.length === 0) {
    return [];
  }

  const clusters = [];
  const processed = new Set();

  for (let i = 0; i < articles.length; i++) {
    if (processed.has(i)) continue;

    const article = articles[i];
    const keywords = extractKeywords(article.title);
    const cluster = {
      articles: [article],
      keywords,
      sources: new Set([article.source]),
      similarity: 0
    };

    processed.add(i);

    // Find related articles
    for (let j = i + 1; j < articles.length; j++) {
      if (processed.has(j)) continue;

      const otherArticle = articles[j];
      const otherKeywords = extractKeywords(otherArticle.title);
      const similarity = calculateSimilarity(keywords, otherKeywords);

      // If similarity > 0.3, consider it related
      if (similarity > 0.3) {
        cluster.articles.push(otherArticle);
        cluster.sources.add(otherArticle.source);
        processed.add(j);
      }
    }

    clusters.push(cluster);
  }

  console.log(`[Clustering] Grouped ${articles.length} articles → ${clusters.length} topics`);
  return clusters;
}

function calculateSignalStrength(sourceCount) {
  // Convert source count to 1-10 signal strength
  // 1 source = 3, 2 sources = 6, 3+ sources = 10
  if (sourceCount >= 3) return 10;
  if (sourceCount === 2) return 6;
  return 3;
}

module.exports = {
  clusterArticles,
  calculateSignalStrength,
  extractKeywords
};
