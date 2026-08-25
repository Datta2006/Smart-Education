-- ============================================================================
-- Seed: kb_cards
-- Metadata mirror of the markdown cards in kb/cards/ (content/kb-compatible).
-- The markdown files are the source of truth; `content` is hydrated by a
-- loader from `content_source` (see kb/ARCHITECTURE.md §4).
-- ============================================================================

INSERT INTO kb_cards
  (id, type, title, content_source, year, phase, goals, tags, priority, status,
   estimated_hours, difficulty, trigger_condition)
VALUES
  -- ------------------------------------------------------------------ tasks
  ('solve-love-babbar-450', 'task', 'Solve the Love Babbar 450 DSA Sheet',
   'kb/cards/tasks/solve-love-babbar-450.md', 2, 'dsa-foundation',
   ARRAY['placements','software-internship'], ARRAY['dsa','sheet','placements'], 'high', 'published', 120, 'beginner', NULL),
  ('master-grokking-coding-patterns', 'task', 'Master the 14 Grokking Coding Patterns',
   'kb/cards/tasks/master-grokking-coding-patterns.md', 2, 'dsa-foundation',
   ARRAY['placements','software-internship'], ARRAY['dsa','patterns'], 'high', 'published', 40, 'intermediate', NULL),
  ('learn-dp-patterns-grokking', 'task', 'Learn Dynamic Programming Patterns',
   'kb/cards/tasks/learn-dp-patterns-grokking.md', 2, 'dsa-foundation',
   ARRAY['placements','software-internship'], ARRAY['dsa','dynamic-programming'], 'medium', 'published', 30, 'intermediate', NULL),
  ('study-system-design-grokking', 'task', 'Study Grokking the System Design Interview',
   'kb/cards/tasks/study-system-design-grokking.md', 3, 'placement-prep',
   ARRAY['placements','software-internship'], ARRAY['system-design','interviews'], 'high', 'published', 30, 'intermediate', NULL),
  ('six-week-interview-crash-course', 'task', 'Follow the 6-Week Interview Crash Course',
   'kb/cards/tasks/six-week-interview-crash-course.md', 3, 'placement-prep',
   ARRAY['placements'], ARRAY['interviews','crash-course'], 'high', 'published', 80, 'intermediate', NULL),
  ('practice-top-company-questions', 'task', 'Practice Top Company Interview Questions',
   'kb/cards/tasks/practice-top-company-questions.md', 3, 'placement-prep',
   ARRAY['placements'], ARRAY['interviews','company-questions'], 'medium', 'published', 40, 'intermediate', NULL),
  ('revise-core-cs-concepts', 'task', 'Revise Core CS Concepts (OOPs, OS, DBMS)',
   'kb/cards/tasks/revise-core-cs-concepts.md', 3, 'placement-prep',
   ARRAY['placements'], ARRAY['core-cs','oops','os','dbms'], 'high', 'published', 20, 'beginner', NULL),
  ('maintain-dsa-problem-log', 'task', 'Maintain a Structured DSA Problem Log',
   'kb/cards/tasks/maintain-dsa-problem-log.md', 2, 'dsa-foundation',
   ARRAY['placements','software-internship'], ARRAY['dsa','habits'], 'medium', 'published', 4, 'beginner', NULL),
  ('daily-dsa-consistency-routine', 'task', 'Build a Daily DSA Consistency Routine',
   'kb/cards/tasks/daily-dsa-consistency-routine.md', 2, 'dsa-foundation',
   ARRAY['placements','software-internship'], ARRAY['dsa','habits','consistency'], 'high', 'published', 10, 'beginner', NULL),

  -- ---------------------------------------------------------- anti-patterns
  ('memorizing-solutions-without-patterns', 'anti_pattern', 'Memorizing Solutions Without Learning Patterns',
   'kb/cards/anti-patterns/memorizing-solutions-without-patterns.md', 2, 'dsa-foundation',
   ARRAY['placements','software-internship'], ARRAY['dsa','anti-pattern'], 'high', 'published', NULL, NULL, NULL),
  ('only-solving-easy-problems', 'anti_pattern', 'Sticking to Easy Problems Only',
   'kb/cards/anti-patterns/only-solving-easy-problems.md', 2, 'dsa-foundation',
   ARRAY['placements','software-internship'], ARRAY['dsa','anti-pattern'], 'medium', 'published', NULL, NULL, NULL),
  ('skipping-complexity-analysis', 'anti_pattern', 'Skipping Time & Space Complexity Analysis',
   'kb/cards/anti-patterns/skipping-complexity-analysis.md', 3, 'placement-prep',
   ARRAY['placements'], ARRAY['dsa','anti-pattern'], 'high', 'published', NULL, NULL, NULL),
  ('last-minute-cramming', 'anti_pattern', 'Last-Minute Interview Cramming',
   'kb/cards/anti-patterns/last-minute-cramming.md', 3, 'placement-prep',
   ARRAY['placements'], ARRAY['interviews','anti-pattern'], 'high', 'published', NULL, NULL, NULL),

  -- --------------------------------------------------------------- decisions
  ('dsa-sheet-which-one', 'decision', 'Which DSA Sheet Should You Follow?',
   'kb/cards/decisions/dsa-sheet-which-one.md', 2, 'dsa-foundation',
   ARRAY['placements','software-internship'], ARRAY['dsa','sheet'], 'medium', 'published', NULL, NULL, NULL),
  ('python-vs-cpp-for-interviews', 'decision', 'Python vs C++ for Coding Interviews',
   'kb/cards/decisions/python-vs-cpp-for-interviews.md', 2, 'dsa-foundation',
   ARRAY['placements','software-internship'], ARRAY['dsa','language'], 'medium', 'published', NULL, NULL, NULL),
  ('dsa-vs-system-design-priority', 'decision', 'DSA vs System Design — Where to Spend Time',
   'kb/cards/decisions/dsa-vs-system-design-priority.md', 3, 'placement-prep',
   ARRAY['placements'], ARRAY['dsa','system-design'], 'medium', 'published', NULL, NULL, NULL),

  -- ------------------------------------------------------------- mentor-notes
  ('stuck-on-a-dsa-problem', 'mentor_note', 'Stuck on a DSA Problem',
   'kb/cards/mentor-notes/stuck-on-a-dsa-problem.md', 2, 'dsa-foundation',
   ARRAY['placements','software-internship'], ARRAY['dsa','mentor-note'], 'medium', 'published', NULL, NULL,
   'student_stuck_on_problem_over_30_minutes'),
  ('forgot-previously-solved-problem', 'mentor_note', 'Forgetting Problems You Already Solved',
   'kb/cards/mentor-notes/forgot-previously-solved-problem.md', 2, 'dsa-foundation',
   ARRAY['placements','software-internship'], ARRAY['dsa','mentor-note'], 'medium', 'published', NULL, NULL,
   'student_forgot_solution_to_previously_solved_problem'),
  ('interview-nerves-first-contest', 'mentor_note', 'Nervous Before Your First Contest or Interview',
   'kb/cards/mentor-notes/interview-nerves-first-contest.md', 3, 'placement-prep',
   ARRAY['placements'], ARRAY['interviews','mentor-note'], 'medium', 'published', NULL, NULL,
   'student_anxious_before_first_contest_or_interview'),
  ('placement-prep-behind-peers', 'mentor_note', 'Feeling Behind in Placement Prep',
   'kb/cards/mentor-notes/placement-prep-behind-peers.md', 3, 'placement-prep',
   ARRAY['placements'], ARRAY['placements','mentor-note'], 'medium', 'published', NULL, NULL,
   'student_feels_behind_in_placement_prep'),

  -- ------------------------------------------------------------ opportunities
  ('coding-contests-and-rated-platforms', 'opportunity', 'Coding Contests & Rated Platforms',
   'kb/cards/opportunities/coding-contests-and-rated-platforms.md', 2, 'dsa-foundation',
   ARRAY['placements','software-internship'], ARRAY['contests','cp'], 'high', 'published', NULL, NULL, NULL),
  ('open-source-and-hackathons', 'opportunity', 'Open Source & Hackathons',
   'kb/cards/opportunities/open-source-and-hackathons.md', 2, 'dsa-foundation',
   ARRAY['placements','software-internship'], ARRAY['opensource','hackathon'], 'medium', 'published', NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;

-- Verify:  SELECT type, count(*) FROM kb_cards GROUP BY type;
