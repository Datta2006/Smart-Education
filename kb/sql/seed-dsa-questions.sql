-- ============================================================================
-- Seed: dsa_questions + dsa_sheets
-- Full catalog extracted from Interview-Preparation-Notes-master
--
-- Sources (source_ref base paths):
--   grokking-coding-patterns/  → 02.. Interview-Preparation-Content/4. Grokking the Coding
--                                  Interview Patterns for Coding Questions - Learn Interactively/
--   grokking-dp/               → 02.. Interview-Preparation-Content/9. Grokking Dynamic Programming
--                                  Patterns for Coding Interviews - Learn Interactively/
--   python-solutions           → 20.. Arrays/*.py and 21.. Strings/*.py (full detail rows)
--
-- Idempotent: every INSERT carries ON CONFLICT (id) DO NOTHING, so re-running the
-- seeds is safe (existing rows are left untouched).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- dsa_sheets
-- ----------------------------------------------------------------------------
INSERT INTO dsa_sheets (id, title, source, description, topics) VALUES
  ('love-babbar-450', 'Love Babbar 450 DSA Sheet', 'love-babbar-450',
   'The 450-problem DSA sheet (xlsx in 03.. DSA-SHEETS/). 15 topic groups, ~450 problems, the de-facto placement sheet for Indian engineering students.',
   ARRAY['arrays','matrix','strings','searching-sorting','linked-list','bit-manipulation','greedy','backtracking','dynamic-programming','stacks-queues','heap','graph','tree','trie','miscellaneous']),
  ('grokking-14-patterns', 'Grokking the Coding Interview — 14 Patterns', 'grokking',
   'Pattern-first approach: 16 patterns (sliding window, two pointers, subsets, top K, …) with ~180 lesson files, of which the 77 named problems are seeded in dsa_questions (the rest are intros/reviews/challenges).',
   ARRAY['sliding-window','two-pointers','fast-slow-pointers','merge-intervals','cyclic-sort','in-place-reversal','tree-bfs','tree-dfs','subsets','modified-binary-search','bitwise-xor','top-k-elements','two-heaps','k-way-merge','topological-sort']),
  ('striver-a2z', 'Striver A2Z DSA Course', 'striver-a2z',
   'Step-by-step DSA roadmap (takeuforward.org) — the method the SOS app already recommends to Year 1 students (see content/kb/tasks/start-dsa-striver.md).',
   ARRAY['basics','arrays','binary-search','strings','linked-list','recursion','bit-manipulation','stacks-queues','sliding-window','heaps','greedy','graphs','dp','trie','segment-tree']) ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING CODING PATTERNS (sliding window)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('maximum-sum-subarray-of-size-k', 'Maximum Sum Subarray of Size K', 'sliding-window', 'easy', 'grokking-coding-patterns', NULL, ARRAY['array','sliding-window'], 'grokking-coding-patterns/4_Maximum_Sum_Subarray_of_Size_K__easy_.mhtml'),
  ('smallest-subarray-with-given-sum', 'Smallest Subarray with a given sum', 'sliding-window', 'easy', 'grokking-coding-patterns', 209, ARRAY['array','sliding-window'], 'grokking-coding-patterns/5_Smallest_Subarray_with_a_given_sum__easy_.mhtml'),
  ('longest-substring-k-distinct', 'Longest Substring with K Distinct Characters', 'sliding-window', 'medium', 'grokking-coding-patterns', 340, ARRAY['string','sliding-window','hash-map'], 'grokking-coding-patterns/6_Longest_Substring_with_K_Distinct_Characters__medium_.mhtml'),
  ('fruits-into-baskets', 'Fruits into Baskets', 'sliding-window', 'medium', 'grokking-coding-patterns', 904, ARRAY['array','sliding-window'], 'grokking-coding-patterns/7_Fruits_into_Baskets__medium_.mhtml'),
  ('no-repeat-substring', 'No-repeat Substring (Longest Substring without Repeating Characters)', 'sliding-window', 'hard', 'grokking-coding-patterns', 3, ARRAY['string','sliding-window','hash-map'], 'grokking-coding-patterns/8_No_repeat_Substring__hard_.mhtml'),
  ('longest-substring-same-letters-replacement', 'Longest Substring with Same Letters after Replacement', 'sliding-window', 'hard', 'grokking-coding-patterns', 424, ARRAY['string','sliding-window'], 'grokking-coding-patterns/9_Longest_Substring_with_Same_Letters_after_Replacement__hard_.mhtml'),
  ('longest-subarray-ones-replacement', 'Longest Subarray with Ones after Replacement', 'sliding-window', 'hard', 'grokking-coding-patterns', 1004, ARRAY['array','sliding-window'], 'grokking-coding-patterns/10_Longest_Subarray_with_Ones_after_Replacement__hard_.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING CODING PATTERNS (two pointers)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('pair-with-target-sum', 'Pair with Target Sum (Two Sum II)', 'two-pointers', 'easy', 'grokking-coding-patterns', 167, ARRAY['array','two-pointers'], 'grokking-coding-patterns/20_Pair_with_Target_Sum__easy_.mhtml'),
  ('remove-duplicates', 'Remove Duplicates (from Sorted Array)', 'two-pointers', 'easy', 'grokking-coding-patterns', 26, ARRAY['array','two-pointers'], 'grokking-coding-patterns/21_Remove_Duplicates__easy_.mhtml'),
  ('squaring-a-sorted-array', 'Squaring a Sorted Array', 'two-pointers', 'easy', 'grokking-coding-patterns', 977, ARRAY['array','two-pointers'], 'grokking-coding-patterns/22_Squaring_a_Sorted_Array__easy_.mhtml'),
  ('triplet-sum-to-zero', 'Triplet Sum to Zero (3Sum)', 'two-pointers', 'medium', 'grokking-coding-patterns', 15, ARRAY['array','two-pointers'], 'grokking-coding-patterns/23_Triplet_Sum_to_Zero__medium_.mhtml'),
  ('triplet-sum-close-to-target', 'Triplet Sum Close to Target (3Sum Closest)', 'two-pointers', 'medium', 'grokking-coding-patterns', 16, ARRAY['array','two-pointers'], 'grokking-coding-patterns/24_Triplet_Sum_Close_to_Target__medium_.mhtml'),
  ('triplets-with-smaller-sum', 'Triplets with Smaller Sum', 'two-pointers', 'medium', 'grokking-coding-patterns', 259, ARRAY['array','two-pointers'], 'grokking-coding-patterns/25_Triplets_with_Smaller_Sum__medium_.mhtml'),
  ('subarrays-product-less-than-target', 'Subarrays with Product Less than a Target', 'two-pointers', 'medium', 'grokking-coding-patterns', 713, ARRAY['array','two-pointers'], 'grokking-coding-patterns/26_Subarrays_with_Product_Less_than_a_Target__medium_.mhtml'),
  ('dutch-national-flag', 'Dutch National Flag Problem (Sort Colors)', 'two-pointers', 'medium', 'grokking-coding-patterns', 75, ARRAY['array','two-pointers','sorting'], 'grokking-coding-patterns/27_Dutch_National_Flag_Problem__medium_.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING CODING PATTERNS (fast & slow pointers)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('linked-list-cycle', 'LinkedList Cycle', 'fast-slow-pointers', 'easy', 'grokking-coding-patterns', 141, ARRAY['linked-list','two-pointers'], 'grokking-coding-patterns/35_LinkedList_Cycle__easy_.mhtml'),
  ('start-of-linked-list-cycle', 'Start of LinkedList Cycle', 'fast-slow-pointers', 'medium', 'grokking-coding-patterns', 142, ARRAY['linked-list','two-pointers'], 'grokking-coding-patterns/36_Start_of_LinkedList_Cycle__medium_.mhtml'),
  ('happy-number', 'Happy Number', 'fast-slow-pointers', 'medium', 'grokking-coding-patterns', 202, ARRAY['math','hash-map'], 'grokking-coding-patterns/37_Happy_Number__medium_.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING CODING PATTERNS (merge intervals)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('merge-intervals', 'Merge Intervals', 'merge-intervals', 'medium', 'grokking-coding-patterns', 56, ARRAY['array','sorting','intervals'], 'grokking-coding-patterns/46_Merge_Intervals__medium_.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING CODING PATTERNS (cyclic sort)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('cyclic-sort', 'Cyclic Sort', 'cyclic-sort', 'easy', 'grokking-coding-patterns', NULL, ARRAY['array','sorting'], 'grokking-coding-patterns/57_Cyclic_Sort__easy_.mhtml'),
  ('find-the-missing-number', 'Find the Missing Number', 'cyclic-sort', 'easy', 'grokking-coding-patterns', 268, ARRAY['array','cyclic-sort'], 'grokking-coding-patterns/58_Find_the_Missing_Number__easy_.mhtml'),
  ('find-all-missing-numbers', 'Find all Missing Numbers', 'cyclic-sort', 'easy', 'grokking-coding-patterns', 448, ARRAY['array','cyclic-sort'], 'grokking-coding-patterns/59_Find_all_Missing_Numbers__easy_.mhtml'),
  ('find-the-duplicate-number', 'Find the Duplicate Number', 'cyclic-sort', 'easy', 'grokking-coding-patterns', 287, ARRAY['array','cyclic-sort','two-pointers'], 'grokking-coding-patterns/60_Find_the_Duplicate_Number__easy_.mhtml'),
  ('find-all-duplicate-numbers', 'Find all Duplicate Numbers', 'cyclic-sort', 'easy', 'grokking-coding-patterns', 442, ARRAY['array','cyclic-sort'], 'grokking-coding-patterns/61_Find_all_Duplicate_Numbers__easy_.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING CODING PATTERNS (in-place reversal of a linked list)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('reverse-a-linked-list', 'Reverse a LinkedList', 'in-place-reversal', 'easy', 'grokking-coding-patterns', 206, ARRAY['linked-list'], 'grokking-coding-patterns/69_Reverse_a_LinkedList__easy_.mhtml'),
  ('reverse-a-sub-list', 'Reverse a Sub-list (Reverse Linked List II)', 'in-place-reversal', 'medium', 'grokking-coding-patterns', 92, ARRAY['linked-list'], 'grokking-coding-patterns/70_Reverse_a_Sub-list__medium_.mhtml'),
  ('reverse-every-k-element-sub-list', 'Reverse every K-element Sub-list', 'in-place-reversal', 'medium', 'grokking-coding-patterns', 25, ARRAY['linked-list'], 'grokking-coding-patterns/71_Reverse_every_K_element_Sub-list__medium_.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING CODING PATTERNS (tree BFS)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('binary-tree-level-order-traversal', 'Binary Tree Level Order Traversal', 'tree-bfs', 'easy', 'grokking-coding-patterns', 102, ARRAY['tree','bfs'], 'grokking-coding-patterns/77_Binary_Tree_Level_Order_Traversal__easy_.mhtml'),
  ('reverse-level-order-traversal', 'Reverse Level Order Traversal', 'tree-bfs', 'easy', 'grokking-coding-patterns', 107, ARRAY['tree','bfs'], 'grokking-coding-patterns/78_Reverse_Level_Order_Traversal__easy_.mhtml'),
  ('level-averages-in-a-binary-tree', 'Level Averages in a Binary Tree', 'tree-bfs', 'easy', 'grokking-coding-patterns', 637, ARRAY['tree','bfs'], 'grokking-coding-patterns/80_Level_Averages_in_a_Binary_Tree__easy_.mhtml'),
  ('minimum-depth-of-a-binary-tree', 'Minimum Depth of a Binary Tree', 'tree-bfs', 'easy', 'grokking-coding-patterns', 111, ARRAY['tree','bfs'], 'grokking-coding-patterns/81_Minimum_Depth_of_a_Binary_Tree__easy_.mhtml'),
  ('level-order-successor', 'Level Order Successor', 'tree-bfs', 'easy', 'grokking-coding-patterns', NULL, ARRAY['tree','bfs'], 'grokking-coding-patterns/82_Level_Order_Successor__easy_.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING CODING PATTERNS (tree DFS)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('binary-tree-path-sum', 'Binary Tree Path Sum (Path Sum)', 'tree-dfs', 'easy', 'grokking-coding-patterns', 112, ARRAY['tree','dfs'], 'grokking-coding-patterns/89_Binary_Tree_Path_Sum__easy_.mhtml'),
  ('all-paths-for-a-sum', 'All Paths for a Sum (Path Sum II)', 'tree-dfs', 'medium', 'grokking-coding-patterns', 113, ARRAY['tree','dfs','backtracking'], 'grokking-coding-patterns/90_All_Paths_for_a_Sum__medium_.mhtml'),
  ('sum-of-path-numbers', 'Sum of Path Numbers', 'tree-dfs', 'medium', 'grokking-coding-patterns', 129, ARRAY['tree','dfs'], 'grokking-coding-patterns/91_Sum_of_Path_Numbers__medium_.mhtml'),
  ('path-with-given-sequence', 'Path With Given Sequence', 'tree-dfs', 'medium', 'grokking-coding-patterns', NULL, ARRAY['tree','dfs'], 'grokking-coding-patterns/92_Path_With_Given_Sequence__medium_.mhtml'),
  ('count-paths-for-a-sum', 'Count Paths for a Sum (Path Sum III)', 'tree-dfs', 'medium', 'grokking-coding-patterns', 437, ARRAY['tree','dfs'], 'grokking-coding-patterns/93_Count_Paths_for_a_Sum__medium_.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING CODING PATTERNS (subsets)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('subsets', 'Subsets', 'subsets', 'easy', 'grokking-coding-patterns', 78, ARRAY['backtracking','bit-manipulation'], 'grokking-coding-patterns/105_Subsets__easy_.mhtml'),
  ('subsets-with-duplicates', 'Subsets With Duplicates', 'subsets', 'easy', 'grokking-coding-patterns', 90, ARRAY['backtracking'], 'grokking-coding-patterns/106_Subsets_With_Duplicates__easy_.mhtml'),
  ('permutations', 'Permutations', 'subsets', 'medium', 'grokking-coding-patterns', 46, ARRAY['backtracking'], 'grokking-coding-patterns/107_Permutations__medium_.mhtml'),
  ('string-permutations-by-changing-case', 'String Permutations by changing case', 'subsets', 'medium', 'grokking-coding-patterns', 784, ARRAY['backtracking','string'], 'grokking-coding-patterns/108_String_Permutations_by_changing_case__medium_.mhtml'),
  ('balanced-parentheses', 'Balanced Parentheses (Generate Parentheses)', 'subsets', 'hard', 'grokking-coding-patterns', 22, ARRAY['backtracking','string'], 'grokking-coding-patterns/109_Balanced_Parentheses__hard_.mhtml'),
  ('unique-generalized-abbreviations', 'Unique Generalized Abbreviations', 'subsets', 'hard', 'grokking-coding-patterns', 320, ARRAY['backtracking','string'], 'grokking-coding-patterns/110_Unique_Generalized_Abbreviations__hard_.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING CODING PATTERNS (modified binary search)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('order-agnostic-binary-search', 'Order-agnostic Binary Search (Binary Search)', 'modified-binary-search', 'easy', 'grokking-coding-patterns', 704, ARRAY['binary-search'], 'grokking-coding-patterns/118_Order_agnostic_Binary_Search__easy_.mhtml'),
  ('ceiling-of-a-number', 'Ceiling of a Number (Search Insert Position)', 'modified-binary-search', 'medium', 'grokking-coding-patterns', 35, ARRAY['binary-search'], 'grokking-coding-patterns/119_Ceiling_of_a_Number__medium_.mhtml'),
  ('next-letter', 'Next Letter (Smallest Letter Greater Than Target)', 'modified-binary-search', 'medium', 'grokking-coding-patterns', 744, ARRAY['binary-search','string'], 'grokking-coding-patterns/120_Next_Letter__medium_.mhtml'),
  ('number-range', 'Number Range (First and Last Position)', 'modified-binary-search', 'medium', 'grokking-coding-patterns', 34, ARRAY['binary-search'], 'grokking-coding-patterns/121_Number_Range__medium_.mhtml'),
  ('search-in-sorted-infinite-array', 'Search in a Sorted Infinite Array', 'modified-binary-search', 'medium', 'grokking-coding-patterns', 702, ARRAY['binary-search'], 'grokking-coding-patterns/122_Search_in_a_Sorted_Infinite_Array__medium_.mhtml'),
  ('minimum-difference-element', 'Minimum Difference Element', 'modified-binary-search', 'medium', 'grokking-coding-patterns', NULL, ARRAY['binary-search'], 'grokking-coding-patterns/123_Minimum_Difference_Element__medium_.mhtml'),
  ('bitonic-array-maximum', 'Bitonic Array Maximum (Peak Index in a Mountain Array)', 'modified-binary-search', 'easy', 'grokking-coding-patterns', 852, ARRAY['binary-search'], 'grokking-coding-patterns/124_Bitonic_Array_Maximum__easy_.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING CODING PATTERNS (bitwise XOR)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('single-number', 'Single Number', 'bitwise-xor', 'easy', 'grokking-coding-patterns', 136, ARRAY['bit-manipulation'], 'grokking-coding-patterns/132_Single_Number__easy_.mhtml'),
  ('two-single-numbers', 'Two Single Numbers (Single Number III)', 'bitwise-xor', 'medium', 'grokking-coding-patterns', 260, ARRAY['bit-manipulation'], 'grokking-coding-patterns/133_Two_Single_Numbers__medium_.mhtml'),
  ('complement-of-base-10-number', 'Complement of Base 10 Number (Number Complement)', 'bitwise-xor', 'medium', 'grokking-coding-patterns', 476, ARRAY['bit-manipulation'], 'grokking-coding-patterns/134_Complement_of_Base_10_Number__medium_.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING CODING PATTERNS (top K elements)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('top-k-numbers', 'Top K Numbers', 'top-k-elements', 'easy', 'grokking-coding-patterns', NULL, ARRAY['heap'], 'grokking-coding-patterns/138_Top__K__Numbers__easy_.mhtml'),
  ('kth-smallest-number', 'Kth Smallest Number', 'top-k-elements', 'easy', 'grokking-coding-patterns', NULL, ARRAY['heap'], 'grokking-coding-patterns/139_Kth_Smallest_Number__easy_.mhtml'),
  ('k-closest-points-to-origin', 'K Closest Points to the Origin', 'top-k-elements', 'easy', 'grokking-coding-patterns', 973, ARRAY['heap','geometry'], 'grokking-coding-patterns/140__K__Closest_Points_to_the_Origin__easy_.mhtml'),
  ('connect-ropes', 'Connect Ropes (Minimum Cost to Connect Sticks)', 'top-k-elements', 'easy', 'grokking-coding-patterns', 1167, ARRAY['heap','greedy'], 'grokking-coding-patterns/141_Connect_Ropes__easy_.mhtml'),
  ('top-k-frequent-numbers', 'Top K Frequent Numbers (Top K Frequent Elements)', 'top-k-elements', 'medium', 'grokking-coding-patterns', 347, ARRAY['heap','hash-map'], 'grokking-coding-patterns/142_Top__K__Frequent_Numbers__medium_.mhtml'),
  ('frequency-sort', 'Frequency Sort (Sort Characters By Frequency)', 'top-k-elements', 'medium', 'grokking-coding-patterns', 451, ARRAY['heap','hash-map','string'], 'grokking-coding-patterns/143_Frequency_Sort__medium_.mhtml'),
  ('k-closest-numbers', 'K Closest Numbers (Find K Closest Elements)', 'top-k-elements', 'medium', 'grokking-coding-patterns', 658, ARRAY['heap','binary-search'], 'grokking-coding-patterns/145__K__Closest_Numbers__medium_.mhtml'),
  ('maximum-distinct-elements', 'Maximum Distinct Elements', 'top-k-elements', 'medium', 'grokking-coding-patterns', 1481, ARRAY['heap','greedy'], 'grokking-coding-patterns/146_Maximum_Distinct_Elements__medium_.mhtml'),
  ('rearrange-string', 'Rearrange String', 'top-k-elements', 'hard', 'grokking-coding-patterns', 767, ARRAY['heap','greedy','string'], 'grokking-coding-patterns/148_Rearrange_String__hard_.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING CODING PATTERNS (two heaps)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('find-median-of-number-stream', 'Find the Median of a Number Stream', 'two-heaps', 'medium', 'grokking-coding-patterns', 295, ARRAY['heap'], 'grokking-coding-patterns/99_Find_the_Median_of_a_Number_Stream__medium_.mhtml'),
  ('sliding-window-median', 'Sliding Window Median', 'two-heaps', 'hard', 'grokking-coding-patterns', 480, ARRAY['heap','sliding-window'], 'grokking-coding-patterns/100_Sliding_Window_Median__hard_.mhtml'),
  ('maximize-capital', 'Maximize Capital (IPO)', 'two-heaps', 'hard', 'grokking-coding-patterns', 502, ARRAY['heap','greedy'], 'grokking-coding-patterns/101_Maximize_Capital__hard_.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING CODING PATTERNS (k-way merge)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('merge-k-sorted-lists', 'Merge K Sorted Lists', 'k-way-merge', 'medium', 'grokking-coding-patterns', 23, ARRAY['heap','linked-list'], 'grokking-coding-patterns/156_Merge_K_Sorted_Lists__medium_.mhtml'),
  ('kth-smallest-in-m-sorted-lists', 'Kth Smallest Number in M Sorted Lists', 'k-way-merge', 'medium', 'grokking-coding-patterns', NULL, ARRAY['heap'], 'grokking-coding-patterns/157_Kth_Smallest_Number_in_M_Sorted_Lists__Medium_.mhtml'),
  ('kth-smallest-in-sorted-matrix', 'Kth Smallest Number in a Sorted Matrix', 'k-way-merge', 'hard', 'grokking-coding-patterns', 378, ARRAY['heap','binary-search'], 'grokking-coding-patterns/158_Kth_Smallest_Number_in_a_Sorted_Matrix__Hard_.mhtml'),
  ('smallest-number-range', 'Smallest Number Range (Smallest Range from K Lists)', 'k-way-merge', 'hard', 'grokking-coding-patterns', 632, ARRAY['heap','sliding-window'], 'grokking-coding-patterns/159_Smallest_Number_Range__Hard_.mhtml'),
  ('kth-smallest-number-hard', 'Kth Smallest Number (hard variant)', 'k-way-merge', 'hard', 'grokking-coding-patterns', NULL, ARRAY['heap'], 'grokking-coding-patterns/181_Kth_Smallest_Number__hard_.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING CODING PATTERNS (topological sort)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('topological-sort', 'Topological Sort', 'topological-sort', 'medium', 'grokking-coding-patterns', NULL, ARRAY['graph','bfs','dfs'], 'grokking-coding-patterns/172_Topological_Sort__medium_.mhtml'),
  ('tasks-scheduling', 'Tasks Scheduling (Course Schedule)', 'topological-sort', 'medium', 'grokking-coding-patterns', 207, ARRAY['graph','bfs'], 'grokking-coding-patterns/173_Tasks_Scheduling__medium_.mhtml'),
  ('tasks-scheduling-order', 'Tasks Scheduling Order (Course Schedule II)', 'topological-sort', 'medium', 'grokking-coding-patterns', 210, ARRAY['graph','bfs'], 'grokking-coding-patterns/174_Tasks_Scheduling_Order__medium_.mhtml'),
  ('all-tasks-scheduling-orders', 'All Tasks Scheduling Orders', 'topological-sort', 'hard', 'grokking-coding-patterns', NULL, ARRAY['graph','backtracking'], 'grokking-coding-patterns/175_All_Tasks_Scheduling_Orders__hard_.mhtml'),
  ('alien-dictionary', 'Alien Dictionary', 'topological-sort', 'hard', 'grokking-coding-patterns', 269, ARRAY['graph','bfs'], 'grokking-coding-patterns/176_Alien_Dictionary__hard_.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING CODING PATTERNS (0/1 knapsack, from patterns course)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('equal-subset-sum-partition', 'Equal Subset Sum Partition', '0-1-knapsack', 'medium', 'grokking-coding-patterns', 416, ARRAY['dp'], 'grokking-coding-patterns/164_Equal_Subset_Sum_Partition__medium_.mhtml'),
  ('minimum-subset-sum-difference', 'Minimum Subset Sum Difference', '0-1-knapsack', 'hard', 'grokking-coding-patterns', NULL, ARRAY['dp'], 'grokking-coding-patterns/166_Minimum_Subset_Sum_Difference__hard_.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING DP PATTERNS (0/1 knapsack)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('01-knapsack', '0/1 Knapsack', '0-1-knapsack', 'medium', 'grokking-dp', NULL, ARRAY['dp','knapsack'], 'grokking-dp/2_0_1_Knapsack.mhtml'),
  ('subset-sum', 'Subset Sum', '0-1-knapsack', 'medium', 'grokking-dp', NULL, ARRAY['dp','knapsack'], 'grokking-dp/4_Subset_Sum.mhtml'),
  ('minimum-subset-sum-difference-dp', 'Minimum Subset Sum Difference', '0-1-knapsack', 'hard', 'grokking-dp', NULL, ARRAY['dp','knapsack'], 'grokking-dp/5_Minimum_Subset_Sum_Difference.mhtml'),
  ('count-of-subset-sum', 'Count of Subset Sum', '0-1-knapsack', 'medium', 'grokking-dp', NULL, ARRAY['dp','knapsack'], 'grokking-dp/6_Count_of_Subset_Sum.mhtml'),
  ('target-sum', 'Target Sum', '0-1-knapsack', 'medium', 'grokking-dp', 494, ARRAY['dp','knapsack'], 'grokking-dp/7_Target_Sum.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING DP PATTERNS (unbounded knapsack)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('unbounded-knapsack', 'Unbounded Knapsack', 'unbounded-knapsack', 'medium', 'grokking-dp', NULL, ARRAY['dp','knapsack'], 'grokking-dp/8_Unbounded_Knapsack.mhtml'),
  ('rod-cutting', 'Rod Cutting', 'unbounded-knapsack', 'medium', 'grokking-dp', NULL, ARRAY['dp','knapsack'], 'grokking-dp/9_Rod_Cutting.mhtml'),
  ('coin-change', 'Coin Change (unbounded, count combinations)', 'unbounded-knapsack', 'medium', 'grokking-dp', 518, ARRAY['dp','knapsack'], 'grokking-dp/10_Coin_Change.mhtml'),
  ('minimum-coin-change', 'Minimum Coin Change', 'unbounded-knapsack', 'medium', 'grokking-dp', 322, ARRAY['dp','knapsack'], 'grokking-dp/11_Minimum_Coin_Change.mhtml'),
  ('maximum-ribbon-cut', 'Maximum Ribbon Cut', 'unbounded-knapsack', 'medium', 'grokking-dp', NULL, ARRAY['dp','knapsack'], 'grokking-dp/12_Maximum_Ribbon_Cut.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING DP PATTERNS (Fibonacci numbers)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('fibonacci-numbers', 'Fibonacci Numbers', 'fibonacci-numbers', 'easy', 'grokking-dp', 509, ARRAY['dp'], 'grokking-dp/13_Fibonacci_numbers.mhtml'),
  ('staircase', 'Staircase (Climbing Stairs)', 'fibonacci-numbers', 'easy', 'grokking-dp', 70, ARRAY['dp'], 'grokking-dp/14_Staircase.mhtml'),
  ('number-factors', 'Number factors', 'fibonacci-numbers', 'medium', 'grokking-dp', NULL, ARRAY['dp'], 'grokking-dp/15_Number_factors.mhtml'),
  ('minimum-jumps-to-reach-the-end', 'Minimum jumps to reach the end (Jump Game II)', 'fibonacci-numbers', 'medium', 'grokking-dp', 45, ARRAY['dp','greedy'], 'grokking-dp/16_Minimum_jumps_to_reach_the_end.mhtml'),
  ('minimum-jumps-with-fee', 'Minimum jumps with fee', 'fibonacci-numbers', 'medium', 'grokking-dp', NULL, ARRAY['dp'], 'grokking-dp/17_Minimum_jumps_with_fee.mhtml'),
  ('house-thief', 'House thief (House Robber)', 'fibonacci-numbers', 'medium', 'grokking-dp', 198, ARRAY['dp'], 'grokking-dp/18_House_thief.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING DP PATTERNS (palindromic subsequence)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('longest-palindromic-subsequence', 'Longest Palindromic Subsequence', 'palindromic-subsequence', 'medium', 'grokking-dp', 516, ARRAY['dp','string'], 'grokking-dp/19_Longest_Palindromic_Subsequence.mhtml'),
  ('longest-palindromic-substring-dp', 'Longest Palindromic Substring', 'palindromic-subsequence', 'medium', 'grokking-dp', 5, ARRAY['dp','string'], 'grokking-dp/20_Longest_Palindromic_Substring.mhtml'),
  ('count-of-palindromic-substrings', 'Count of Palindromic Substrings', 'palindromic-subsequence', 'medium', 'grokking-dp', 647, ARRAY['dp','string'], 'grokking-dp/21_Count_of_Palindromic_Substrings.mhtml'),
  ('minimum-deletions-to-make-palindrome', 'Minimum Deletions in a String to make it a Palindrome', 'palindromic-subsequence', 'medium', 'grokking-dp', 1312, ARRAY['dp','string'], 'grokking-dp/22_Minimum_Deletions_in_a_String_to_make_it_a_Palindrome.mhtml'),
  ('palindromic-partitioning', 'Palindromic Partitioning', 'palindromic-subsequence', 'hard', 'grokking-dp', 131, ARRAY['dp','backtracking'], 'grokking-dp/23_Palindromic_Partitioning.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING DP PATTERNS (LCS family)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('longest-common-substring', 'Longest Common Substring', 'lcs', 'medium', 'grokking-dp', NULL, ARRAY['dp','string'], 'grokking-dp/24_Longest_Common_Substring.mhtml'),
  ('longest-common-subsequence', 'Longest Common Subsequence', 'lcs', 'medium', 'grokking-dp', 1143, ARRAY['dp','string'], 'grokking-dp/25_Longest_Common_Subsequence.mhtml'),
  ('min-deletions-insertions-transform', 'Minimum Deletions & Insertions to Transform a String into another', 'lcs', 'medium', 'grokking-dp', 583, ARRAY['dp','string'], 'grokking-dp/26_Minimum_Deletions___Insertions_to_Transform_a_String_into_another.mhtml'),
  ('shortest-common-supersequence', 'Shortest Common Super-sequence', 'lcs', 'medium', 'grokking-dp', 1092, ARRAY['dp','string'], 'grokking-dp/29_Shortest_Common_Super_sequence.mhtml'),
  ('longest-repeating-subsequence', 'Longest Repeating Subsequence', 'lcs', 'medium', 'grokking-dp', NULL, ARRAY['dp','string'], 'grokking-dp/31_Longest_Repeating_Subsequence.mhtml'),
  ('subsequence-pattern-matching', 'Subsequence Pattern Matching (Is Subsequence)', 'lcs', 'medium', 'grokking-dp', 392, ARRAY['dp','string'], 'grokking-dp/32_Subsequence_Pattern_Matching.mhtml'),
  ('strings-interleaving', 'Strings Interleaving (Interleaving String)', 'lcs', 'hard', 'grokking-dp', 97, ARRAY['dp','string'], 'grokking-dp/36_Strings_Interleaving.mhtml'),
  ('edit-distance', 'Edit Distance', 'lcs', 'hard', 'grokking-dp', 72, ARRAY['dp','string'], 'grokking-dp/35_Edit_Distance.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — GROKKING DP PATTERNS (LIS family)
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags, source_ref)
VALUES
  ('longest-increasing-subsequence', 'Longest Increasing Subsequence', 'lis', 'medium', 'grokking-dp', 300, ARRAY['dp'], 'grokking-dp/27_Longest_Increasing_Subsequence.mhtml'),
  ('maximum-sum-increasing-subsequence', 'Maximum Sum Increasing Subsequence', 'lis', 'medium', 'grokking-dp', NULL, ARRAY['dp'], 'grokking-dp/28_Maximum_Sum_Increasing_Subsequence.mhtml'),
  ('minimum-deletions-to-make-sequence-sorted', 'Minimum Deletions to Make a Sequence Sorted', 'lis', 'medium', 'grokking-dp', NULL, ARRAY['dp'], 'grokking-dp/30_Minimum_Deletions_to_Make_a_Sequence_Sorted.mhtml'),
  ('longest-bitonic-subsequence', 'Longest Bitonic Subsequence', 'lis', 'medium', 'grokking-dp', NULL, ARRAY['dp'], 'grokking-dp/33_Longest_Bitonic_Subsequence.mhtml'),
  ('longest-alternating-subsequence', 'Longest Alternating Subsequence', 'lis', 'medium', 'grokking-dp', NULL, ARRAY['dp'], 'grokking-dp/34_Longest_Alternating_Subsequence.mhtml') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — PYTHON SOLUTIONS (20.. Arrays) — full detail rows
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags,
   problem_statement, approach, time_complexity, space_complexity, solution_code, language, source_ref)
VALUES
  ('two-sum', 'Two Sum', 'hashing', 'easy', 'python-solutions', 1, ARRAY['array','hash-map'],
   'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target. Exactly one solution is assumed to exist.',
   'Hash Map (one-pass): store each number with its index; for each element check whether its complement (target - num) was already seen.',
   'O(n)', 'O(n)',
   $code$
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
   $code$,
   'python', '20.. Arrays/twoSum.py'),
  ('best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock', 'arrays', 'easy', 'python-solutions', 121, ARRAY['array','greedy'],
   'Given prices where prices[i] is the price on day i, return the maximum profit from a single buy-sell transaction (0 if none possible).',
   'One-pass greedy: track the minimum price seen so far and the best profit when selling at the current price.',
   'O(n)', 'O(1)',
   $code$
def maxProfit(prices):
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price
    return max_profit
   $code$,
   'python', '20.. Arrays/bestTimeToBuyAndSellStock.py'),
  ('merge-intervals-python', 'Merge Intervals', 'merge-intervals', 'medium', 'python-solutions', 56, ARRAY['array','sorting','intervals'],
   'Given an array of intervals, merge all overlapping intervals and return the non-overlapping intervals covering all inputs.',
   'Sort then merge: sort by start; extend the last merged interval when the next start <= its end, otherwise append a new interval.',
   'O(n log n)', 'O(n)',
   $code$
def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        last_end = merged[-1][1]
        if start <= last_end:
            merged[-1][1] = max(last_end, end)
        else:
            merged.append([start, end])
    return merged
   $code$,
   'python', '20.. Arrays/mergeIntervals.py'),
  ('product-of-array-except-self', 'Product of Array Except Self', 'arrays', 'medium', 'python-solutions', 238, ARRAY['array','prefix-sum'],
   'Return an array answer where answer[i] is the product of all elements of nums except nums[i], without division and in O(n).',
   'Prefix and suffix products: one forward pass stores left products in the result, one backward pass multiplies by right products.',
   'O(n)', 'O(1)',   -- output array not counted
   $code$
def productExceptSelf(nums):
    n = len(nums)
    result = [1] * n
    prefix = 1
    for i in range(n):
        result[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        result[i] *= suffix
        suffix *= nums[i]
    return result
   $code$,
   'python', '20.. Arrays/productExceptSelf.py'),
  ('maximum-subarray', 'Maximum Subarray', 'arrays', 'medium', 'python-solutions', 53, ARRAY['array','kadanes'],
   'Given an integer array nums, find the subarray with the largest sum and return its sum.',
   'Kadane''s algorithm: extend the current subarray only when it improves the running sum; otherwise start fresh from the current element.',
   'O(n)', 'O(1)',
   $code$
def maxSubArray(nums):
    current_sum = nums[0]
    max_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum
   $code$,
   'python', '20.. Arrays/maximumSubarray.py') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- dsa_questions — PYTHON SOLUTIONS (21.. Strings) — full detail rows
-- ----------------------------------------------------------------------------
INSERT INTO dsa_questions
  (id, title, category, difficulty, source, leetcode_number, tags,
   problem_statement, approach, time_complexity, space_complexity, solution_code, language, source_ref)
VALUES
  ('group-anagrams', 'Group Anagrams', 'hashing', 'medium', 'python-solutions', 49, ARRAY['string','hash-map'],
   'Given an array of strings strs, group the anagrams together (return in any order).',
   'Sort each word to build a canonical key; words sharing a key belong to the same anagram group.',
   'O(n * k log k)', 'O(n * k)',
   $code$
def groupAnagrams(strs):
    anagram_map = {}
    for word in strs:
        key = tuple(sorted(word))
        if key not in anagram_map:
            anagram_map[key] = []
        anagram_map[key].append(word)
    return list(anagram_map.values())
   $code$,
   'python', '21.. Strings/groupAnagrams.py'),
  ('longest-substring-without-repeating', 'Longest Substring Without Repeating Characters', 'sliding-window', 'medium', 'python-solutions', 3, ARRAY['string','sliding-window','hash-map'],
   'Given a string s, find the length of the longest substring without repeating characters.',
   'Sliding window with a hash map: track each character''s last index; when a repeat is inside the window, move the left boundary past it.',
   'O(n)', 'O(min(n, m))',
   $code$
def lengthOfLongestSubstring(s):
    char_index = {}
    max_length = 0
    left = 0
    for right, char in enumerate(s):
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
        char_index[char] = right
        max_length = max(max_length, right - left + 1)
    return max_length
   $code$,
   'python', '21.. Strings/longestSubstringWithoutRepeating.py'),
  ('valid-anagram', 'Valid Anagram', 'hashing', 'easy', 'python-solutions', 242, ARRAY['string','hash-map'],
   'Given two strings s and t, return true if t is an anagram of s (same characters, same counts).',
   'Character frequency count: increment for s, decrement for t in one pass; a valid anagram cancels every count to zero.',
   'O(n)', 'O(1)',
   $code$
def isAnagram(s, t):
    if len(s) != len(t):
        return False
    count = {}
    for ch_s, ch_t in zip(s, t):
        count[ch_s] = count.get(ch_s, 0) + 1
        count[ch_t] = count.get(ch_t, 0) - 1
    return all(v == 0 for v in count.values())
   $code$,
   'python', '21.. Strings/validAnagram.py'),
  ('longest-palindromic-substring', 'Longest Palindromic Substring', 'strings', 'medium', 'python-solutions', 5, ARRAY['string','two-pointers'],
   'Given a string s, return the longest palindromic substring in s.',
   'Expand around center: for each index (and each adjacent pair) expand outward while the characters match; track the longest palindrome.',
   'O(n^2)', 'O(1)',
   $code$
def longestPalindrome(s):
    def expandAroundCenter(left, right):
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        return s[left + 1:right]

    longest = ""
    for i in range(len(s)):
        odd = expandAroundCenter(i, i)
        even = expandAroundCenter(i, i + 1)
        if len(odd) > len(longest):
            longest = odd
        if len(even) > len(longest):
            longest = even
    return longest
   $code$,
   'python', '21.. Strings/longestPalindromicSubstring.py'),
  ('valid-palindrome', 'Valid Palindrome', 'strings', 'easy', 'python-solutions', 125, ARRAY['string','two-pointers'],
   'A phrase is a palindrome if, after lowercasing and removing non-alphanumeric characters, it reads the same forward and backward.',
   'Two pointers: skip non-alphanumeric characters from both ends, then compare characters case-insensitively.',
   'O(n)', 'O(1)',
   $code$
def isPalindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        if s[left].lower() != s[right].lower():
            return False
        left += 1
        right -= 1
    return True
   $code$,
   'python', '21.. Strings/validPalindrome.py') ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Verification queries (see ARCHITECTURE.md §5.3)
--   SELECT category, count(*) FROM dsa_questions GROUP BY category ORDER BY 2 DESC;
-- ============================================================================
