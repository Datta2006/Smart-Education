---
id: learn-dp-patterns-grokking
type: task
title: Learn Dynamic Programming Patterns
degree: btech
branch: cse
year: 2
phase: dsa-foundation
goals: [placements, software-internship]
tags: [dsa, dynamic-programming]
priority: medium
estimatedHours: 30
difficulty: intermediate
status: published
---
# Learn Dynamic Programming Patterns

## Objective
Master DP through the pattern-based course *Grokking Dynamic Programming Patterns* (`02.. Interview-Preparation-Content/9. Grokking DP Patterns.../`) instead of memorizing random problems.

## Steps
1. Study the 5 DP families: 0/1 Knapsack, Unbounded Knapsack, Fibonacci Numbers, Longest Common Subsequence (LCS), Longest Increasing Subsequence (LIS), and Palindromic Subsequence.
2. For each family, learn the recursive brute-force first, then memoization, then bottom-up tabulation — the notes folder has each problem as an `.mhtml` lesson (e.g. `2_0_1_Knapsack.mhtml`, `25_Longest_Common_Subsequence.mhtml`).
3. Internalize the core recurrence for each family (e.g. LCS: `dp[i][j] = 1 + dp[i-1][j-1]` when chars match, else `max(dp[i-1][j], dp[i][j-1])`).
4. Practice by re-deriving the recurrence from the problem statement, not from memory of the code.

## Proof
- Wrote the recurrence + time/space complexity for each of the ~30 DP lessons in your problem log.
- Can convert any of the 5 families between recursive, memoized, and tabulated forms.

## Mentor Note
DP looks scary until you realize there are only ~6 families. If you can recognize "this is a knapsack variant" you already know 80% of the solution. Tabulation is great for interviews — it avoids stack overflow and is easy to dry-run.
