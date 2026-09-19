-- Streetwear & Design Authority
INSERT INTO scraper_sources (name, source_type, base_url, scrape_strategy, engagement_metric, rate_limit_per_hour, priority, description, is_active) VALUES
('Hypebeast Instagram', 'instagram', 'https://instagram.com/hypebeast', 'hashtag', 'likes', 100, 1, 'Streetwear and design trends', true),
('Highsnobiety Instagram', 'instagram', 'https://instagram.com/highsnobiety', 'hashtag', 'likes', 100, 1, 'High fashion and lifestyle', true),
('Complex Instagram', 'instagram', 'https://instagram.com/complex', 'hashtag', 'likes', 100, 1, 'Culture and entertainment', true),
('Popeye Magazine Instagram', 'instagram', 'https://instagram.com/popeye_magazine_official', 'hashtag', 'likes', 100, 2, 'Japanese design and culture', true),
('Hidden NY Instagram', 'instagram', 'https://instagram.com/hidden.ny', 'hashtag', 'likes', 100, 2, 'NYC underground culture', true),
('David Kyle Choe Instagram', 'instagram', 'https://instagram.com/davidkylechoe', 'hashtag', 'likes', 100, 2, 'Artist and cultural commentary', true);

-- Indian Indie Culture & Lifestyle
INSERT INTO scraper_sources (name, source_type, base_url, scrape_strategy, engagement_metric, rate_limit_per_hour, priority, description, is_active) VALUES
('Homegrown India Instagram', 'instagram', 'https://instagram.com/homegrownin', 'hashtag', 'likes', 100, 1, 'Indian culture and creativity', true),
('Somewhere India Instagram', 'instagram', 'https://instagram.com/somewhere.ind', 'hashtag', 'likes', 100, 2, 'Indian lifestyle and travel', true),
('Oren Meets World Instagram', 'instagram', 'https://instagram.com/orenmeetsworld', 'hashtag', 'likes', 100, 2, 'Global culture observer', true),
('The Commons Culture Instagram', 'instagram', 'https://instagram.com/thecommons.culture', 'hashtag', 'likes', 100, 2, 'Shared cultural spaces', true),
('Death to Stock Instagram', 'instagram', 'https://instagram.com/deathtostock', 'hashtag', 'likes', 100, 2, 'Creative imagery and culture', true),
('Side Quest Instagram', 'instagram', 'https://instagram.com/side.quest', 'hashtag', 'likes', 100, 2, 'Gaming and culture', true);

-- Brand Strategy & Marketing
INSERT INTO scraper_sources (name, source_type, base_url, scrape_strategy, engagement_metric, rate_limit_per_hour, priority, description, is_active) VALUES
('Eugene Brand Strategy Instagram', 'instagram', 'https://instagram.com/eugbrandstrat', 'hashtag', 'likes', 100, 2, 'Brand strategy insights', true),
('Marketing Maxxed Instagram', 'instagram', 'https://instagram.com/marketingmaxxed', 'hashtag', 'likes', 100, 2, 'Marketing trends', true),
('Because of Marketing Instagram', 'instagram', 'https://instagram.com/becauseofmarketing', 'hashtag', 'likes', 100, 2, 'Marketing commentary', true),
('DTC Newsletter Instagram', 'instagram', 'https://instagram.com/dtcnewsletter', 'hashtag', 'likes', 100, 2, 'Direct to consumer trends', true),
('Showcase Pod Instagram', 'instagram', 'https://instagram.com/showcase.pod', 'hashtag', 'likes', 100, 2, 'Product and design showcase', true),
('Source Material Instagram', 'instagram', 'https://instagram.com/sourcematerial___', 'hashtag', 'likes', 100, 2, 'Creative source material', true),
('What Zara Loves Instagram', 'instagram', 'https://instagram.com/whatzaraloves', 'hashtag', 'likes', 100, 2, 'Fashion curator perspective', true);

-- Publications & News Sites
INSERT INTO scraper_sources (name, source_type, base_url, scrape_strategy, engagement_metric, rate_limit_per_hour, priority, description, is_active) VALUES
('The Morning Context Newsletter', 'rss', 'https://themorningcontext.com', 'rss_feed', 'views', 50, 1, 'Daily business and culture commentary', true),
('Design Observer', 'news', 'https://designobserver.com', 'api', 'views', 50, 2, 'Design criticism and culture', true),
('Eye on Design', 'news', 'https://eyeondesign.aiga.org', 'api', 'views', 50, 2, 'Design journalism', true),
('Variety', 'news', 'https://variety.com', 'api', 'views', 50, 2, 'Entertainment and culture', true),
('Pitchfork', 'news', 'https://pitchfork.com', 'api', 'views', 50, 2, 'Music and culture', true),
('Rolling Stone', 'news', 'https://rollingstone.com', 'api', 'views', 50, 2, 'Music and pop culture', true),
('WIRED', 'news', 'https://wired.com', 'api', 'views', 50, 2, 'Technology and culture', true),
('Architectural Digest India', 'news', 'https://www.architecturaldigestindia.com', 'api', 'views', 50, 2, 'Design and lifestyle India', true),
('Mint Lounge', 'news', 'https://lifestyle.livemint.com', 'api', 'views', 50, 2, 'Lifestyle journalism India', true),
('Sequoia Capital Essays', 'news', 'https://www.sequoiacap.com/articles', 'api', 'views', 50, 3, 'VC perspective on trends', true),
('Y Combinator Startup School', 'news', 'https://www.startupschool.org', 'api', 'views', 50, 3, 'Startup and innovation trends', true),
('Collab Substack', 'rss', 'https://collab.substack.com', 'rss_feed', 'views', 50, 2, 'Indian creator culture', true),
('Cosmetics Business', 'news', 'https://cosmeticsbusiness.com', 'api', 'views', 50, 2, 'Beauty industry news', true),
('Trend Watching', 'news', 'https://trendwatching.com', 'api', 'views', 50, 3, 'Global trend forecasting', true);
