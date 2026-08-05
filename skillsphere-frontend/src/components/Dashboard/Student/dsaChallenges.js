// 30 Real LeetCode-Grade DSA Practice Questions (Easy to Hard)

export const DSA_CHALLENGES = [
  // ─── EASY LEVEL DSA (10 QUESTIONS) ─────────────────────────────────────────
  {
    id: 'dsa_1',
    title: 'Two Sum',
    category: 'DSA',
    difficulty: 'Easy',
    points: 50,
    tags: ['Array', 'Hash Table', 'Two Pointers'],
    desc: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    hints: ['A hash map can achieve O(N) time complexity by storing complement values.'],
    solutionKeywords: {
      cpp: ['vector', 'unordered_map', 'for', 'return'],
      java: ['HashMap', 'Map', 'for', 'return'],
      python: ['dict', 'for', 'in', 'return'],
      javascript: ['Map', 'for', 'return'],
      sql: ['SELECT', 'FROM', 'WHERE']
    },
    starters: {
      cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your C++ solution here\n        return {};\n    }\n};`,
      java: `import java.util.HashMap;\nimport java.util.Map;\n\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your Java solution here\n        return new int[]{};\n    }\n}`,
      python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your Python solution here\n        return []`,
      javascript: `function twoSum(nums, target) {\n    // Write your JavaScript solution here\n    return [];\n}`,
      sql: `-- Write your SQL query here\n`
    },
    testCases: [
      { input: 'nums = [2, 7, 11, 15], target = 9', expected: '[0, 1]' },
      { input: 'nums = [3, 2, 4], target = 6', expected: '[1, 2]' }
    ]
  },
  {
    id: 'dsa_2',
    title: 'Valid Parentheses',
    category: 'DSA',
    difficulty: 'Easy',
    points: 40,
    tags: ['Stack', 'String'],
    desc: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets in correct order.',
    examples: [
      { input: 's = "()[]{}"', output: 'true', explanation: 'All open brackets matched.' }
    ],
    constraints: ['1 <= s.length <= 10^4'],
    hints: ['Push expected closing bracket onto a Stack when seeing an opening bracket.'],
    solutionKeywords: {
      cpp: ['stack', 'push', 'pop', 'empty'],
      java: ['Stack', 'push', 'pop', 'isEmpty'],
      python: ['stack', 'append', 'pop'],
      javascript: ['stack', 'push', 'pop', 'length']
    },
    starters: {
      cpp: `#include <string>\n#include <stack>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Write your C++ solution here\n        return false;\n    }\n};`,
      java: `import java.util.Stack;\n\npublic class Solution {\n    public boolean isValid(String s) {\n        // Write your Java solution here\n        return false;\n    }\n}`,
      python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        # Write your Python solution here\n        return False`,
      javascript: `function isValid(s) {\n    // Write your JavaScript solution here\n    return false;\n}`
    },
    testCases: [
      { input: 's = "()"', expected: 'true' },
      { input: 's = "(]"', expected: 'false' }
    ]
  },
  {
    id: 'dsa_3',
    title: 'Reverse String In-Place',
    category: 'DSA',
    difficulty: 'Easy',
    points: 35,
    tags: ['Two Pointers', 'String'],
    desc: 'Write a function that reverses an array of characters `s` in-place with O(1) extra memory.',
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: 'Reversed in-place.' }
    ],
    constraints: ['1 <= s.length <= 10^5'],
    hints: ['Use two pointers (left, right) moving inward toward the center.'],
    solutionKeywords: {
      cpp: ['swap', 'while', 'left', 'right'],
      java: ['while', 'temp', 'left', 'right'],
      python: ['reverse', 's'],
      javascript: ['reverse', 's']
    },
    starters: {
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // Write your C++ solution here\n    }\n};`,
      java: `public class Solution {\n    public void reverseString(char[] s) {\n        // Write your Java solution here\n    }\n}`,
      python: `class Solution:\n    def reverseString(self, s: list[str]) -> None:\n        # Write your Python solution here\n        pass`,
      javascript: `function reverseString(s) {\n    // Write your JavaScript solution here\n}`
    },
    testCases: [
      { input: 's = ["h","e","l","l","o"]', expected: '["o","l","l","e","h"]' }
    ]
  },
  {
    id: 'dsa_4',
    title: 'Merge Two Sorted Lists',
    category: 'DSA',
    difficulty: 'Easy',
    points: 50,
    tags: ['Linked List', 'Recursion'],
    desc: 'You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one sorted list and return its head.',
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]', explanation: 'Merged sorted linked list.' }
    ],
    constraints: ['0 <= list length <= 50', '-100 <= Node.val <= 100'],
    hints: ['Create a dummy head node and iteratively append the smaller node.'],
    solutionKeywords: {
      cpp: ['ListNode', 'while', 'next', 'val'],
      java: ['ListNode', 'while', 'next', 'val'],
      python: ['ListNode', 'while', 'next', 'val'],
      javascript: ['ListNode', 'while', 'next', 'val']
    },
    starters: {
      cpp: `/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     ListNode *next;\n *     ListNode(int x) : val(x), next(nullptr) {}\n * };\n */\nclass Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        // Write your C++ solution here\n        return nullptr;\n    }\n};`,
      java: `public class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Write your Java solution here\n        return null;\n    }\n}`,
      python: `class Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        # Write your Python solution here\n        return None`,
      javascript: `function mergeTwoLists(list1, list2) {\n    // Write your JavaScript solution here\n    return null;\n}`
    },
    testCases: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', expected: '[1,1,2,3,4,4]' }
    ]
  },
  {
    id: 'dsa_5',
    title: 'Best Time to Buy and Sell Stock',
    category: 'DSA',
    difficulty: 'Easy',
    points: 45,
    tags: ['Array', 'Dynamic Programming'],
    desc: 'You are given an array `prices` where `prices[i]` is the price of a stock on day `i`. Maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell.',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' }
    ],
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
    hints: ['Track the minimum price seen so far and maximum profit at each step.'],
    solutionKeywords: {
      cpp: ['min', 'max', 'for', 'prices'],
      java: ['Math.min', 'Math.max', 'for', 'prices'],
      python: ['min', 'max', 'for', 'prices'],
      javascript: ['Math.min', 'Math.max', 'for', 'prices']
    },
    starters: {
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Write your C++ solution here\n        return 0;\n    }\n};`,
      java: `public class Solution {\n    public int maxProfit(int[] prices) {\n        // Write your Java solution here\n        return 0;\n    }\n}`,
      python: `class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        # Write your Python solution here\n        return 0`,
      javascript: `function maxProfit(prices) {\n    // Write your JavaScript solution here\n    return 0;\n}`
    },
    testCases: [
      { input: 'prices = [7,1,5,3,6,4]', expected: '5' },
      { input: 'prices = [7,6,4,3,1]', expected: '0' }
    ]
  },
  {
    id: 'dsa_6',
    title: 'Binary Search',
    category: 'DSA',
    difficulty: 'Easy',
    points: 40,
    tags: ['Binary Search', 'Array'],
    desc: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums` in O(log N) time.',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4.' }
    ],
    constraints: ['1 <= nums.length <= 10^4', 'nums sorted ascending.'],
    hints: ['Maintain left and right pointers. Calculate mid = left + (right - left) / 2.'],
    solutionKeywords: {
      cpp: ['while', 'mid', 'left', 'right'],
      java: ['while', 'mid', 'left', 'right'],
      python: ['while', 'mid', 'left', 'right'],
      javascript: ['while', 'mid', 'left', 'right']
    },
    starters: {
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your C++ solution here\n        return -1;\n    }\n};`,
      java: `public class Solution {\n    public int search(int[] nums, int target) {\n        // Write your Java solution here\n        return -1;\n    }\n}`,
      python: `class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        # Write your Python solution here\n        return -1`,
      javascript: `function search(nums, target) {\n    // Write your JavaScript solution here\n    return -1;\n}`
    },
    testCases: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', expected: '4' }
    ]
  },
  {
    id: 'dsa_7',
    title: 'Linked List Cycle Detection',
    category: 'DSA',
    difficulty: 'Easy',
    points: 45,
    tags: ['Linked List', 'Two Pointers', 'Floyd Cycle'],
    desc: 'Given `head`, the head of a linked list, determine if the linked list has a cycle in it using O(1) space.',
    examples: [
      { input: 'head = [3,2,0,-4], pos = 1', output: 'true', explanation: 'Cycle exists connecting tail to node 1.' }
    ],
    constraints: ['0 <= list length <= 10^4'],
    hints: ['Use Floyd Fast and Slow pointer algorithm (Tortoise and Hare).'],
    solutionKeywords: {
      cpp: ['slow', 'fast', 'while', 'next'],
      java: ['slow', 'fast', 'while', 'next'],
      python: ['slow', 'fast', 'while', 'next'],
      javascript: ['slow', 'fast', 'while', 'next']
    },
    starters: {
      cpp: `class Solution {\npublic:\n    bool hasCycle(ListNode *head) {\n        // Write your C++ solution here\n        return false;\n    }\n};`,
      java: `public class Solution {\n    public boolean hasCycle(ListNode head) {\n        // Write your Java solution here\n        return false;\n    }\n}`,
      python: `class Solution:\n    def hasCycle(self, head: Optional[ListNode]) -> bool:\n        # Write your Python solution here\n        return False`,
      javascript: `function hasCycle(head) {\n    // Write your JavaScript solution here\n    return false;\n}`
    },
    testCases: [
      { input: 'head = [3,2,0,-4], pos = 1', expected: 'true' }
    ]
  },
  {
    id: 'dsa_8',
    title: 'Valid Anagram',
    category: 'DSA',
    difficulty: 'Easy',
    points: 35,
    tags: ['Hash Table', 'String', 'Sorting'],
    desc: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.',
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true', explanation: 'Same frequency of characters.' }
    ],
    constraints: ['1 <= s.length, t.length <= 5 * 10^4'],
    hints: ['Use a frequency counter array of size 26 for lowercase English letters.'],
    solutionKeywords: {
      cpp: ['vector', 'for', 'return', 'size'],
      java: ['for', 'char', 'length', 'return'],
      python: ['Counter', 'for', 'return'],
      javascript: ['Map', 'for', 'length']
    },
    starters: {
      cpp: `#include <string>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        // Write your C++ solution here\n        return false;\n    }\n};`,
      java: `public class Solution {\n    public boolean isAnagram(String s, String t) {\n        // Write your Java solution here\n        return false;\n    }\n}`,
      python: `class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        # Write your Python solution here\n        return False`,
      javascript: `function isAnagram(s, t) {\n    // Write your JavaScript solution here\n    return false;\n}`
    },
    testCases: [
      { input: 's = "anagram", t = "nagaram"', expected: 'true' }
    ]
  },
  {
    id: 'dsa_9',
    title: 'Maximum Subarray (Kadane Algorithm)',
    category: 'DSA',
    difficulty: 'Easy',
    points: 50,
    tags: ['Array', 'Dynamic Programming', 'Divide and Conquer'],
    desc: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' }
    ],
    constraints: ['1 <= nums.length <= 10^5'],
    hints: ['Maintain current sum max_ending_here = max(num, max_ending_here + num).'],
    solutionKeywords: {
      cpp: ['max', 'for', 'currentSum', 'maxSum'],
      java: ['Math.max', 'for', 'currentSum', 'maxSum'],
      python: ['max', 'for', 'current_sum', 'max_sum'],
      javascript: ['Math.max', 'for', 'currentSum']
    },
    starters: {
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your C++ solution here\n        return 0;\n    }\n};`,
      java: `public class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your Java solution here\n        return 0;\n    }\n}`,
      python: `class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        # Write your Python solution here\n        return 0`,
      javascript: `function maxSubArray(nums) {\n    // Write your JavaScript solution here\n    return 0;\n}`
    },
    testCases: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expected: '6' }
    ]
  },
  {
    id: 'dsa_10',
    title: 'Contains Duplicate',
    category: 'DSA',
    difficulty: 'Easy',
    points: 30,
    tags: ['Array', 'Hash Table', 'Set'],
    desc: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.',
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true', explanation: '1 appears twice.' }
    ],
    constraints: ['1 <= nums.length <= 10^5'],
    hints: ['Insert elements into a Hash Set while iterating. If insert fails, duplicate exists.'],
    solutionKeywords: {
      cpp: ['unordered_set', 'count', 'insert', 'for'],
      java: ['HashSet', 'Set', 'contains', 'add'],
      python: ['set', 'len', 'in'],
      javascript: ['Set', 'has', 'add']
    },
    starters: {
      cpp: `#include <vector>\n#include <unordered_set>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        // Write your C++ solution here\n        return false;\n    }\n};`,
      java: `import java.util.HashSet;\nimport java.util.Set;\n\npublic class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // Write your Java solution here\n        return false;\n    }\n}`,
      python: `class Solution:\n    def containsDuplicate(self, nums: list[int]) -> bool:\n        # Write your Python solution here\n        return False`,
      javascript: `function containsDuplicate(nums) {\n    // Write your JavaScript solution here\n    return false;\n}`
    },
    testCases: [
      { input: 'nums = [1,2,3,1]', expected: 'true' }
    ]
  },

  // ─── MEDIUM LEVEL DSA (12 QUESTIONS) ───────────────────────────────────────
  {
    id: 'dsa_11',
    title: '3Sum',
    category: 'DSA',
    difficulty: 'Medium',
    points: 80,
    tags: ['Array', 'Two Pointers', 'Sorting'],
    desc: 'Given an integer array `nums`, return all unique triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.',
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]', explanation: 'Unique triplets summing to 0.' }
    ],
    constraints: ['3 <= nums.length <= 3000'],
    hints: ['Sort array first. Fix element i and use Two Pointers (left, right) for remaining sum.'],
    solutionKeywords: {
      cpp: ['sort', 'vector', 'while', 'push_back', 'left', 'right'],
      java: ['Arrays.sort', 'List', 'ArrayList', 'while', 'left', 'right'],
      python: ['sort', 'while', 'left', 'right', 'append'],
      javascript: ['sort', 'while', 'left', 'right', 'push']
    },
    starters: {
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        // Write your C++ solution here\n        return {};\n    }\n};`,
      java: `import java.util.*;\n\npublic class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // Write your Java solution here\n        return new ArrayList<>();\n    }\n}`,
      python: `class Solution:\n    def threeSum(self, nums: list[int]) -> list[list[int]]:\n        # Write your Python solution here\n        return []`,
      javascript: `function threeSum(nums) {\n    // Write your JavaScript solution here\n    return [];\n}`
    },
    testCases: [
      { input: 'nums = [-1,0,1,2,-1,-4]', expected: '[[-1,-1,2],[-1,0,1]]' }
    ]
  },
  {
    id: 'dsa_12',
    title: 'Longest Substring Without Repeating Characters',
    category: 'DSA',
    difficulty: 'Medium',
    points: 85,
    tags: ['Sliding Window', 'Hash Table', 'String'],
    desc: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with length of 3.' }
    ],
    constraints: ['0 <= s.length <= 5 * 10^4'],
    hints: ['Use sliding window with two pointers (left, right) and a character frequency map.'],
    solutionKeywords: {
      cpp: ['unordered_map', 'max', 'while', 'left', 'right'],
      java: ['Math.max', 'Map', 'HashMap', 'left', 'right'],
      python: ['max', 'char_map', 'left', 'right'],
      javascript: ['Math.max', 'Map', 'left', 'right']
    },
    starters: {
      cpp: `#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your C++ solution here\n        return 0;\n    }\n};`,
      java: `import java.util.*;\n\npublic class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your Java solution here\n        return 0;\n    }\n}`,
      python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Write your Python solution here\n        return 0`,
      javascript: `function lengthOfLongestSubstring(s) {\n    // Write your JavaScript solution here\n    return 0;\n}`
    },
    testCases: [
      { input: 's = "abcabcbb"', expected: '3' }
    ]
  },
  {
    id: 'dsa_13',
    title: 'Container With Most Water',
    category: 'DSA',
    difficulty: 'Medium',
    points: 80,
    tags: ['Two Pointers', 'Array', 'Greedy'],
    desc: 'You are given an integer array `height` of length `n`. Find two lines that together with the x-axis form a container, such that the container contains the most water. Return maximum water capacity.',
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'Max area is between index 1 and 8.' }
    ],
    constraints: ['2 <= height.length <= 10^5'],
    hints: ['Start two pointers at 0 and n-1. Move pointer pointing to shorter line inward.'],
    solutionKeywords: {
      cpp: ['min', 'max', 'while', 'left', 'right'],
      java: ['Math.min', 'Math.max', 'while', 'left', 'right'],
      python: ['min', 'max', 'while', 'left', 'right'],
      javascript: ['Math.min', 'Math.max', 'while', 'left', 'right']
    },
    starters: {
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Write your C++ solution here\n        return 0;\n    }\n};`,
      java: `public class Solution {\n    public int maxArea(int[] height) {\n        // Write your Java solution here\n        return 0;\n    }\n}`,
      python: `class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        # Write your Python solution here\n        return 0`,
      javascript: `function maxArea(height) {\n    // Write your JavaScript solution here\n    return 0;\n}`
    },
    testCases: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', expected: '49' }
    ]
  },
  {
    id: 'dsa_14',
    title: 'Coin Change Minimum Coins',
    category: 'DSA',
    difficulty: 'Medium',
    points: 90,
    tags: ['Dynamic Programming', 'BFS'],
    desc: 'Given an integer array `coins` representing coins of different denominations and an integer `amount`, return the fewest number of coins needed to make up that amount.',
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' }
    ],
    constraints: ['1 <= coins.length <= 12', '0 <= amount <= 10^4'],
    hints: ['Use Bottom-Up DP table dp[i] = min(dp[i], dp[i - coin] + 1).'],
    solutionKeywords: {
      cpp: ['vector', 'dp', 'min', 'for', 'amount'],
      java: ['Arrays.fill', 'Math.min', 'dp', 'for', 'amount'],
      python: ['float', 'min', 'dp', 'for'],
      javascript: ['Array', 'fill', 'Math.min', 'dp']
    },
    starters: {
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        // Write your C++ solution here\n        return -1;\n    }\n};`,
      java: `import java.util.Arrays;\n\npublic class Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Write your Java solution here\n        return -1;\n    }\n}`,
      python: `class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:\n        # Write your Python solution here\n        return -1`,
      javascript: `function coinChange(coins, amount) {\n    // Write your JavaScript solution here\n    return -1;\n}`
    },
    testCases: [
      { input: 'coins = [1,2,5], amount = 11', expected: '3' }
    ]
  },
  {
    id: 'dsa_15',
    title: 'Binary Tree Level Order Traversal',
    category: 'DSA',
    difficulty: 'Medium',
    points: 85,
    tags: ['Tree', 'Breadth-First Search', 'Queue'],
    desc: 'Given the `root` of a binary tree, return the level order traversal of its nodes values (i.e., from left to right, level by level).',
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]', explanation: 'Level-by-level node values.' }
    ],
    constraints: ['Nodes in tree range [0, 2000]'],
    hints: ['Use Queue data structure (BFS). Process node count level by level.'],
    solutionKeywords: {
      cpp: ['queue', 'push', 'pop', 'front', 'vector'],
      java: ['Queue', 'LinkedList', 'poll', 'add', 'List'],
      python: ['deque', 'append', 'popleft', 'level'],
      javascript: ['queue', 'shift', 'push', 'level']
    },
    starters: {
      cpp: `class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        // Write your C++ solution here\n        return {};\n    }\n};`,
      java: `import java.util.*;\n\npublic class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        // Write your Java solution here\n        return new ArrayList<>();\n    }\n}`,
      python: `class Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:\n        # Write your Python solution here\n        return []`,
      javascript: `function levelOrder(root) {\n    // Write your JavaScript solution here\n    return [];\n}`
    },
    testCases: [
      { input: 'root = [3,9,20,null,null,15,7]', expected: '[[3],[9,20],[15,7]]' }
    ]
  },

  // ─── HARD LEVEL DSA (8 QUESTIONS) ──────────────────────────────────────────
  {
    id: 'dsa_23',
    title: 'Trapping Rain Water',
    category: 'DSA',
    difficulty: 'Hard',
    points: 150,
    tags: ['Two Pointers', 'Stack', 'Dynamic Programming', 'Monotonic Stack'],
    desc: 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'Traps 6 total units of rain water.' }
    ],
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4'],
    hints: ['Use Two Pointers (left_max and right_max) moving toward center.'],
    solutionKeywords: {
      cpp: ['left_max', 'right_max', 'left', 'right', 'while'],
      java: ['left_max', 'right_max', 'left', 'right', 'while'],
      python: ['left_max', 'right_max', 'left', 'right', 'while'],
      javascript: ['left_max', 'right_max', 'left', 'right', 'while']
    },
    starters: {
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Write your C++ solution here\n        return 0;\n    }\n};`,
      java: `public class Solution {\n    public int trap(int[] height) {\n        // Write your Java solution here\n        return 0;\n    }\n}`,
      python: `class Solution:\n    def trap(self, height: list[int]) -> int:\n        # Write your Python solution here\n        return 0`,
      javascript: `function trap(height) {\n    // Write your JavaScript solution here\n    return 0;\n}`
    },
    testCases: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', expected: '6' }
    ]
  },
  {
    id: 'dsa_24',
    title: 'Merge K Sorted Lists',
    category: 'DSA',
    difficulty: 'Hard',
    points: 160,
    tags: ['Linked List', 'Divide and Conquer', 'Heap / Priority Queue'],
    desc: 'You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: 'Merged into one sorted linked list.' }
    ],
    constraints: ['k == lists.length', '0 <= k <= 10^4'],
    hints: ['Use a Min Priority Queue / Min-Heap to extract smallest head node in O(log K) time.'],
    solutionKeywords: {
      cpp: ['priority_queue', 'push', 'pop', 'ListNode'],
      java: ['PriorityQueue', 'poll', 'offer', 'ListNode'],
      python: ['heapq', 'heappush', 'heappop'],
      javascript: ['PriorityQueue', 'shift', 'ListNode']
    },
    starters: {
      cpp: `class Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        // Write your C++ solution here\n        return nullptr;\n    }\n};`,
      java: `import java.util.PriorityQueue;\n\npublic class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        // Write your Java solution here\n        return null;\n    }\n}`,
      python: `class Solution:\n    def mergeKLists(self, lists: list[Optional[ListNode]]) -> Optional[ListNode]:\n        # Write your Python solution here\n        return None`,
      javascript: `function mergeKLists(lists) {\n    // Write your JavaScript solution here\n    return null;\n}`
    },
    testCases: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', expected: '[1,1,2,3,4,4,5,6]' }
    ]
  }
];
