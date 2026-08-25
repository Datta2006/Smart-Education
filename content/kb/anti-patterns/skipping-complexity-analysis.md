---
id: skipping-complexity-analysis
type: anti_pattern
title: Skipping Time & Space Complexity Analysis
degree: btech
branch: cse
year: 3
phase: placement-prep
goals: [placements]
tags: [dsa, anti-pattern]
priority: high
status: published
---

# Skipping Time & Space Complexity Analysis

## Mistake
Solving problems and never writing down or verbalizing the time/space complexity — treating "it passes the test cases" as the finish line.

## Why It Hurts
Every interview question is followed by "what's the complexity?" — a wrong or hesitant answer can fail an otherwise correct solution. Worse, without complexity analysis you can't notice when your brute force needs optimizing, so you never learn to improve.

## Better Action
Make it a ritual: after every solution, state the complexity out loud before running the code — "O(n) time, O(1) space, because we do one pass and only track two variables." Write it in the problem log. Every Grokking lesson and Python solution in the notes already includes complexity (e.g. `twoSum.py`: O(n)/O(n)); mirror that habit.
