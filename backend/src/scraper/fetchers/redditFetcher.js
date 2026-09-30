// Reddit Fetcher - Supports both real API and mock data for testing
const MOCK_POSTS = [
  {
    id: 'post_001',
    subreddit: 'r/IndianMakeupAddicts',
    title: 'Niacinamide + seaweed combo changed my skin completely',
    url: 'https://reddit.com/r/IndianMakeupAddicts/comments/mock_001',
    author: 'skincare_junkie',
    created_utc: Math.floor(Date.now() / 1000) - 3600,
    score: 87,
    num_comments: 24,
    selftext: 'Finally found a combination that works. The Derma Co Niacinamide with Plum seaweed mask. Budget-friendly and actually works.',
    comments: [
      { author: 'user1', body: 'This combo is game-changing for sensitive skin', score: 45 },
      { author: 'user2', body: 'Finally affordable alternative to expensive serums', score: 38 }
    ]
  },
  {
    id: 'post_002',
    subreddit: 'r/IndianFashion',
    title: '80s aesthetic is having a major moment - here\'s why',
    url: 'https://reddit.com/r/IndianFashion/comments/mock_002',
    author: 'fashion_explorer',
    created_utc: Math.floor(Date.now() / 1000) - 7200,
    score: 156,
    num_comments: 67,
    selftext: 'Seeing tons of 80s inspired fits everywhere. Oversized blazers, neon accents, vintage denim.',
    comments: [
      { author: 'user3', body: 'Stranger Things S4 totally sparked this', score: 89 },
      { author: 'user4', body: 'Indie brands already cashing in on this trend', score: 52 }
    ]
  },
  {
    id: 'post_003',
    subreddit: 'r/Sneakers',
    title: 'Air Jordan collabs dropping next week - is anyone copping?',
    url: 'https://reddit.com/r/Sneakers/comments/mock_003',
    author: 'sneaker_head',
    created_utc: Math.floor(Date.now() / 1000) - 5400,
    score: 203,
    num_comments: 92,
    selftext: 'The new Jordan x Brand collab is looking clean. Price point is solid at ₹12,000.',
    comments: [
      { author: 'user5', body: 'Resale value on Jordans is insane right now', score: 76 },
      { author: 'user6', body: 'Campus alternatives are better value', score: 58 }
    ]
  },
  {
    id: 'post_004',
    subreddit: 'r/SkincareAddiction',
    title: 'Blind box collectible skincare - genius or gimmick?',
    url: 'https://reddit.com/r/SkincareAddiction/comments/mock_004',
    author: 'skincare_critic',
    created_utc: Math.floor(Date.now() / 1000) - 10800,
    score: 124,
    num_comments: 48,
    selftext: 'Brands are now doing blind box skincare sets. Is this a collector\'s trend or actual marketing genius?',
    comments: [
      { author: 'user7', body: 'Millennial desire for collectibles meets self-care', score: 63 },
      { author: 'user8', body: 'This is definitely tapping into the blind box obsession', score: 41 }
    ]
  }
];

async function fetchReddit(config = {}) {
  const { useMockData = true, clientId, clientSecret, username, password } = config;
  
  if (useMockData) {
    console.log('[Reddit Fetcher] Using mock data (waiting for API credentials)');
    return MOCK_POSTS.map(post => ({
      title: post.title,
      description: post.selftext,
      url: post.url,
      source: 'reddit',
      subreddit: post.subreddit,
      post_id: post.id,
      author: post.author,
      posted_at: new Date(post.created_utc * 1000).toISOString(),
      upvotes: post.score,
      comments_count: post.num_comments,
      top_comments: post.comments,
      engagement_score: post.score + (post.num_comments * 2)
    }));
  }

  // Real Reddit API (when credentials available)
  console.log('[Reddit Fetcher] Using real Reddit API');
  // TODO: Implement real PRAW/Reddit API client here
  return [];
}

module.exports = { fetchReddit };
