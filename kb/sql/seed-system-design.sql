-- ============================================================================
-- Seed: system_design_topics
-- Extracted from Interview-Preparation-Notes-master/02.. Interview-Preparation-Content/
--   6. Grokking the System Design Interview - Learn Interactively/
--   source_ref base path: grokking-system-design/<file>.mhtml
-- ============================================================================

-- Design questions (15)
INSERT INTO system_design_topics (id, title, kind, description, key_ideas, source_ref) VALUES
  ('design-pastebin', 'Designing Pastebin', 'design-question',
   'Design a pastebin / text-sharing service where users can store text snippets and share them via short URLs.',
   ARRAY_TO_STRING(ARRAY[
     'Read-heavy service — favor caching and CDN for snippet reads',
     'Generate short unique keys (base62 of a counter or hashed value)',
     'Snippet expiry: TTL via a background sweeper or lazy deletion',
     'Single API: createPaste(text, expiry) returns a URL; getPaste(key) returns content'
   ], '; '),
   'grokking-system-design/3_Designing_Pastebin.mhtml'),
  ('design-instagram', 'Designing Instagram', 'design-question',
   'Design Instagram — a photo/video sharing social network with feeds, followers and likes.',
   ARRAY_TO_STRING(ARRAY[
     'Two core flows: upload photo (write-heavy) and view newsfeed (read-heavy)',
     'Photo storage: object storage (S3) + CDN; metadata in a relational DB',
     'Feed generation: push (fan-out-on-write) for celebrities/high-follower users, pull (fan-out-on-read) otherwise; hybrid approach',
     'Sharding by user_id; timeline caching in memory (Redis)'
   ], '; '),
   'grokking-system-design/4_Designing_Instagram.mhtml'),
  ('design-dropbox', 'Designing Dropbox', 'design-question',
   'Design Dropbox — a cloud file storage and synchronization service.',
   ARRAY_TO_STRING(ARRAY[
     'Metadata service (files, folders, sharing) separate from block storage',
     'Chunk large files into blocks; store blocks once (dedup) via content hashes',
     'Delta sync: only changed blocks are uploaded',
     'Notifications (long-polling or WebSocket) push change events to clients; write-ahead local journal + replay on sync'
   ], '; '),
   'grokking-system-design/5_Designing_Dropbox.mhtml'),
  ('design-facebook-messenger', 'Designing Facebook Messenger', 'design-question',
   'Design Facebook Messenger — a real-time chat application.',
   ARRAY_TO_STRING(ARRAY[
     'Chat history: Cassandra-style wide-column store keyed by (user_id, timestamp)',
     'Real-time delivery: WebSocket / long-polling / SSE per user connection managed by chat servers',
     'Presence: last-seen heartbeats pushed to a Redis presence store',
     'Unread counts + offline queue: message stored once, fan-out on read; group chat read receipts via counters'
   ], '; '),
   'grokking-system-design/6_Designing_Facebook_Messenger.mhtml'),
  ('design-twitter', 'Designing Twitter', 'design-question',
   'Design Twitter — a social network with tweets, followers, timelines and search.',
   ARRAY_TO_STRING(ARRAY[
     'Core entities: users, tweets, follows; timeline = merge of followed users'' tweets',
     'Home timeline: fan-out-on-write (push) to followers'' timelines for regular users; pull/merge for high-follower celebrities',
     'Tweet IDs: snowflake IDs (timestamp + shard + sequence) enable time-ordered pagination',
     'Hot-path caching: tweet IDs in Redis, full tweets hydrated from cache'
   ], '; '),
   'grokking-system-design/7_Designing_Twitter.mhtml'),
  ('design-youtube-netflix', 'Designing YouTube or Netflix', 'design-question',
   'Design a video streaming platform like YouTube or Netflix.',
   ARRAY_TO_STRING(ARRAY[
     'Ingestion pipeline: upload → transcode into multiple resolutions/bitrates → store in object storage',
     'Adaptive bitrate streaming (HLS/DASH): client switches quality based on bandwidth',
     'CDN serves the bulk of watch traffic; only cache popular videos at edge',
     'Metadata service (title, views, likes) is a separate read-heavy store'
   ], '; '),
   'grokking-system-design/8_Designing_Youtube_or_Netflix.mhtml'),
  ('design-typeahead-suggestion', 'Designing Typeahead Suggestion', 'design-question',
   'Design a typeahead / search-as-you-type suggestion system (Google autocomplete).',
   ARRAY_TO_STRING(ARRAY[
     'Trie of top queries; each node stores top-k suggested completions',
     'Cache trie in memory, replicated across servers; shard by first character(s)',
     'Aggregate search logs offline to rebuild the trie (top queries + frequencies)',
     'Client debounces input; server returns suggestions over fast lookup (Redis or in-memory trie)'
   ], '; '),
   'grokking-system-design/9_Designing_Typeahead_Suggestion.mhtml'),
  ('design-api-rate-limiter', 'Designing an API Rate Limiter', 'design-question',
   'Design an API rate limiter that throttles clients exceeding allowed request rates.',
   ARRAY_TO_STRING(ARRAY[
     'Algorithms: fixed window, sliding window, token bucket, leaky bucket',
     'Token bucket is most common: refill tokens at a fixed rate, each request consumes one',
     'Distributed counting: Redis with INCR + expiry per (client, window) key',
     'Respond 429 Too Many Requests; return retry-after header'
   ], '; '),
   'grokking-system-design/10_Designing_an_API_Rate_Limiter.mhtml'),
  ('design-twitter-search', 'Designing Twitter Search', 'design-question',
   'Design search over tweets — index and query millions of tweets in real time.',
   ARRAY_TO_STRING(ARRAY[
     'Inverted index: term → list of tweet IDs (posted lists)',
     'Separate index shards per time bucket (last week, last month) so recent search is fast',
     'Index built via a streaming pipeline (Kafka → indexer)',
     'Query pipeline: parse → retrieve posting lists → merge → rank by recency/relevance'
   ], '; '),
   'grokking-system-design/11_Designing_Twitter_Search.mhtml'),
  ('design-web-crawler', 'Designing a Web Crawler', 'design-question',
   'Design a web crawler that discovers and downloads pages at scale.',
   ARRAY_TO_STRING(ARRAY[
     'URL frontier (priority queue) feeds download workers; workers write to object storage',
     'Politeness: per-domain rate limiting and robots.txt respect',
     'Dedup with a bloom filter of seen URLs; refresh handled by re-crawling with re-visit policies',
     'Extractor (HTML parser) pulls new links and adds them back to the frontier'
   ], '; '),
   'grokking-system-design/12_Designing_a_Web_Crawler.mhtml'),
  ('design-facebook-newsfeed', 'Designing Facebook''s Newsfeed', 'design-question',
   'Design the Facebook newsfeed — a personalized stream of posts from friends/pages.',
   ARRAY_TO_STRING(ARRAY[
     'Fan-out-on-write: when a user posts, push post IDs into followers'' newsfeed caches',
     'Fan-out-on-read: for high-connection users, pull + merge at read time',
     'Ranking: recency, affinity, engagement signals — computed offline or in a pre-compute layer',
     'Newsfeed data: IDs in Redis list per user; hydration fetches full posts from cache/DB'
   ], '; '),
   'grokking-system-design/13_Designing_Facebook_s_Newsfeed.mhtml'),
  ('design-yelp-nearby-friends', 'Designing Yelp or Nearby Friends', 'design-question',
   'Design a location-based service like Yelp or Nearby Friends.',
   ARRAY_TO_STRING(ARRAY[
     'Geohashing or quadtree indexes map (lat, lng) to cells for fast nearby queries',
     'Business/review data: relational DB; geo index: in-memory quadtree or geohash-based shards',
     'Query: compute covering cells for a radius, filter by distance, rank by rating/reviews',
     'Write-heavy reviews are eventually consistent with the search index'
   ], '; '),
   'grokking-system-design/14_Designing_Yelp_or_Nearby_Friends.mhtml'),
  ('design-uber-backend', 'Designing Uber backend', 'design-question',
   'Design the Uber backend — matching riders with drivers, live location, pricing.',
   ARRAY_TO_STRING(ARRAY[
     'Driver location updates streamed (WebSocket) into an in-memory geo-index',
     'Matching: nearby-driver search over geohash cells + ride request queues',
     'State machine for rides (request → matched → en route → completed) in a DB',
     'Pricing: surge pricing service adjusting rates by supply/demand'
   ], '; '),
   'grokking-system-design/15_Designing_Uber_backend.mhtml'),
  ('design-ticketmaster', 'Designing Ticketmaster', 'design-question',
   'Design Ticketmaster — high-concurrency event ticketing with seat reservations.',
   ARRAY_TO_STRING(ARRAY[
     'Seat inventory: pre-allocate seat blocks; block seat in DB before serving the buy flow',
     'Reservation with TTL: hold seats for N minutes while checkout completes, else release',
     'Handle overbooking with atomic conditional updates (optimistic locking) on seat rows',
     'High write contention: shard by event; queue + retry for the checkout pipeline'
   ], '; '),
   'grokking-system-design/16_Design_Ticketmaster___New__.mhtml'),
  ('design-url-shortener', 'Designing a URL Shortening service like TinyURL', 'design-question',
   'Design a URL shortener — map long URLs to short keys and redirect.',
   ARRAY_TO_STRING(ARRAY[
     'Key generation: base62 encoding of a counter, or hash + collision handling',
     'Redirect: 301/302 from short URL to the stored long URL; hot keys cached in Redis',
     'Read-heavy: cache-first reads; writes go to a relational store',
     'Optional analytics: log each redirect for click counts'
   ], '; '),
   'grokking-system-design/2_Designing_a_URL_Shortening_service_like_TinyURL.mhtml') ON CONFLICT (id) DO NOTHING;

-- Concepts (12)
INSERT INTO system_design_topics (id, title, kind, description, key_ideas, source_ref) VALUES
  ('system-design-interviews-step-by-step', 'System Design Interviews: A step by step guide', 'concept',
   'A repeatable 4-step framework for solving any system design interview question.',
   ARRAY_TO_STRING(ARRAY[
     '1. Requirements: functional + non-functional (scale, latency, availability)',
     '2. Back-of-the-envelope estimation: QPS, storage, bandwidth',
     '3. High-level design: components, data flow, API surface',
     '4. Deep dive: pick 2-3 bottlenecks and detail them'
   ], '; '),
   'grokking-system-design/1_System_Design_Interviews__A_step_by_step_guide.mhtml'),
  ('system-design-basics', 'System Design Basics', 'concept',
   'Core primitives used in every distributed system design.',
   ARRAY_TO_STRING(ARRAY[
     'Client-server, load balancer, application servers, databases',
     'Caching layers, CDNs, message queues, search indexes',
     'Consistency vs availability trade-offs across components'
   ], '; '),
   'grokking-system-design/18_System_Design_Basics.mhtml'),
  ('key-characteristics-of-distributed-systems', 'Key Characteristics of Distributed Systems', 'concept',
   'The properties systems are designed for: scalability, reliability, availability, efficiency, manageability.',
   ARRAY_TO_STRING(ARRAY[
     'Scalability: horizontal (add machines) vs vertical (bigger machines)',
     'Reliability: tolerate hardware/software failures; replicate + detect + recover',
     'Availability: fraction of time the system is functional (SLA nines)',
     'Efficiency: latency and throughput of every operation'
   ], '; '),
   'grokking-system-design/19_Key_Characteristics_of_Distributed_Systems.mhtml'),
  ('load-balancing', 'Load Balancing', 'concept',
   'Distributing client requests across servers to avoid hotspots and enable scaling.',
   ARRAY_TO_STRING(ARRAY[
     'Layers: DNS, L3/L4 (IP/port), L7 (HTTP/application-aware)',
     'Algorithms: round-robin, weighted, least connections, IP hash (sticky sessions)',
     'Health checks remove unhealthy backends; enables horizontal scaling and failover'
   ], '; '),
   'grokking-system-design/20_Load_Balancing.mhtml'),
  ('caching', 'Caching', 'concept',
   'Storing hot data closer to the consumer to cut latency and DB load.',
   ARRAY_TO_STRING(ARRAY[
     'Layers: client cache, CDN, DNS cache, in-memory cache (Redis/Memcached), DB cache',
     'Strategies: cache-aside, write-through, write-back, refresh-ahead',
     'Eviction: LRU, LFU, TTL; cache invalidation is the hard part'
   ], '; '),
   'grokking-system-design/21_Caching.mhtml'),
  ('data-partitioning', 'Data Partitioning', 'concept',
   'Splitting a dataset across machines: horizontal (sharding by key) vs vertical (by feature).',
   ARRAY_TO_STRING(ARRAY[
     'Sharding methods: range-based, hash-based, directory-based (lookup service)',
     'Hash sharding gives even distribution; range sharding allows efficient range scans',
     'Consistent hashing minimizes rebalancing when nodes are added/removed'
   ], '; '),
   'grokking-system-design/22_Data_Partitioning.mhtml'),
  ('indexes', 'Indexes', 'concept',
   'Data structures that speed up lookups at the cost of write overhead.',
   ARRAY_TO_STRING(ARRAY[
     'B-tree: balanced tree used by relational DBs for range + point queries',
     'Bitmap / hash indexes for equality lookups; inverted index for text search',
     'Primary vs secondary indexes; composite indexes respect leftmost-prefix rule',
     'Covering indexes serve queries entirely from the index (no table fetch)'
   ], '; '),
   'grokking-system-design/23_Indexes.mhtml'),
  ('proxies', 'Proxies', 'concept',
   'An intermediary between client and server: forward proxy vs reverse proxy.',
   ARRAY_TO_STRING(ARRAY[
     'Forward proxy: sits in front of clients (filtering, anonymity, caching)',
     'Reverse proxy: sits in front of servers (load balancing, caching, SSL termination, request routing)',
     'NGINX/HAProxy are typical reverse proxy implementations'
   ], '; '),
   'grokking-system-design/24_Proxies.mhtml'),
  ('redundancy-and-replication', 'Redundancy and Replication', 'concept',
   'Having multiple copies of data/components to survive failures.',
   ARRAY_TO_STRING(ARRAY[
     'Redundancy: duplicate servers/components so one failure never takes the system down',
     'Replication: multiple copies of the same data (primary-replica, multi-primary)',
     'Trades consistency for availability; replica lag must be handled'
   ], '; '),
   'grokking-system-design/25_Redundancy_and_Replication.mhtml'),
  ('sql-vs-nosql', 'SQL vs NoSQL', 'concept',
   'Choosing the right storage engine for the workload.',
   ARRAY_TO_STRING(ARRAY[
     'SQL: ACID, strong consistency, joins, structured schema (users, orders, transactions)',
     'NoSQL: horizontal scale, flexible schema, eventual consistency (key-value, document, wide-column, graph)',
     'Choose by access patterns: relational integrity → SQL; massive scale + flexible models → NoSQL'
   ], '; '),
   'grokking-system-design/26_SQL_vs__NoSQL.mhtml'),
  ('cap-theorem', 'CAP Theorem', 'concept',
   'Under a partition, a distributed system must choose between consistency and availability.',
   ARRAY_TO_STRING(ARRAY[
     'Consistency: every read sees the latest write',
     'Availability: every request gets a non-error response (may be stale)',
     'Partition tolerance: system keeps working despite network partitions',
     'CP systems (HBase, MongoDB with strong reads) vs AP systems (Cassandra, DynamoDB)'
   ], '; '),
   'grokking-system-design/27_CAP_Theorem.mhtml'),
  ('consistent-hashing', 'Consistent Hashing', 'concept',
   'A hash-ring technique that keeps key distribution stable when nodes join/leave.',
   ARRAY_TO_STRING(ARRAY[
     'Hash servers and keys onto the same ring; each key maps to the next server clockwise',
     'Adding/removing a node only rehashes ~1/n of keys (vs all keys in plain modulo)',
     'Virtual nodes spread load evenly and reduce hotspots'
   ], '; '),
   'grokking-system-design/28_Consistent_Hashing.mhtml'),
  ('long-polling-vs-websockets-vs-sse', 'Long Polling vs WebSockets vs Server Sent Events', 'concept',
   'Push-notification mechanisms and when to use each.',
   ARRAY_TO_STRING(ARRAY[
     'Long polling: client polls; server holds the request until data exists — simple, HTTP-only',
     'WebSockets: full-duplex persistent connection — real-time chat, games, collaborative tools',
     'SSE: one-way server→client stream over HTTP — feeds, notifications, live scores'
   ], '; '),
   'grokking-system-design/29_Long_Polling_vs_WebSockets_vs_Server_Sent_Events.mhtml') ON CONFLICT (id) DO NOTHING;

-- Verify:
--   SELECT kind, count(*) FROM system_design_topics GROUP BY kind;
