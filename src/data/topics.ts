export type { Level, ProgrammingLanguage, CodeImplementation, Algorithm, Problem, Topic, YouTubeVideo } from "./types";
import type { Level, Algorithm, Problem, Topic } from "./types";
import * as algoCode from "./algorithmCode";

export const levels: { id: Level; title: string; description: string; icon: string; color: string }[] = [
  {
    id: "beginner",
    title: "Beginner",
    description: "Start your DSA journey with fundamental data structures and basic algorithms",
    icon: "🌱",
    color: "from-green-400 to-emerald-600",
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "Level up with trees, heaps, and more complex problem-solving patterns",
    icon: "🚀",
    color: "from-blue-400 to-indigo-600",
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "Master graphs, dynamic programming, and advanced algorithmic techniques",
    icon: "⚡",
    color: "from-purple-400 to-violet-600",
  },
  {
    id: "pro",
    title: "Pro",
    description: "Conquer competitive programming with cutting-edge algorithms",
    icon: "👑",
    color: "from-amber-400 to-orange-600",
  },
];

export const topics: Topic[] = [
  // ===== BEGINNER TOPICS =====
  {
    slug: "arrays",
    title: "Arrays",
    level: "beginner",
    icon: "📦",
    color: "from-green-400 to-emerald-500",
    shortDescription: "Sequential containers that make index-based access fast and predictable",
    detailedExplanation: `Arrays store data in a logically ordered sequence, making them the first building block for most DSA problems.

Key Concepts:
• Direct access by index lets you read or update elements quickly
• Insertions and deletions in the middle require shifting elements
• Prefix aggregates, partitioning, and scanning patterns are array fundamentals
• Many advanced techniques such as sliding window and DP are built on arrays`,
    realWorldAnalogy: "A row of numbered lockers where you can instantly open locker 17, but reorganizing lockers in the middle takes effort.",
    visualizerType: "array",
    youtubeVideos: [
      {
        id: "5tPLyHCZdU0",
        title: "Arrays in programming - fundamentals",
        channel: "mycodeschool",
        duration: "10:14",
      },
      {
        id: "KLlXCFG5TnA",
        title: "Two Sum - Leetcode 1 - HashMap - Python",
        channel: "NeetCode",
        duration: "8:26",
      },
    ],
    algorithms: [
      {
        name: "Kadane's Algorithm",
        pseudocode: `function kadane(arr):
    best = arr[0]
    current = arr[0]
    for i = 1 to arr.length - 1:
        current = max(arr[i], current + arr[i])
        best = max(best, current)
    return best`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "Kadane's algorithm keeps the best subarray ending at each position and updates the global best in one pass.",
      },
      {
        name: "Prefix Sum Construction",
        pseudocode: `function buildPrefix(arr):
    prefix = new array of size arr.length + 1
    prefix[0] = 0
    for i = 0 to arr.length - 1:
        prefix[i + 1] = prefix[i] + arr[i]
    return prefix`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Prefix sums preprocess cumulative totals so any range sum can be answered in constant time.",
      },
      {
        name: "Dutch National Flag Partition",
        pseudocode: `function sortColors(nums):
    low = 0
    mid = 0
    high = nums.length - 1
    while mid <= high:
        if nums[mid] == 0:
            swap(nums[low], nums[mid])
            low++, mid++
        else if nums[mid] == 1:
            mid++
        else:
            swap(nums[mid], nums[high])
            high--`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "Three regions are maintained so 0s, 1s, and 2s are partitioned in a single scan.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "two-sum",
        title: "Two Sum",
        difficulty: "Easy",
        description: "Find two indices whose values add up to the given target.",
        leetcodeUrl: "https://leetcode.com/problems/two-sum/",
        hints: ["Track seen values with a map", "Look for target - current before inserting current"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "maximum-subarray",
        title: "Maximum Subarray",
        difficulty: "Medium",
        description: "Return the largest possible sum of any contiguous subarray.",
        leetcodeUrl: "https://leetcode.com/problems/maximum-subarray/",
        hints: ["Decide whether to extend the current segment", "Track a running best and a global best"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "three-sum-array",
        title: "3Sum",
        difficulty: "Medium",
        description: "Find all unique triplets in the array whose values add up to zero. Avoid returning duplicate combinations.",
        leetcodeUrl: "https://leetcode.com/problems/3sum/",
        hints: ["Sort the array first to make duplicate handling easier", "Fix one number and use two pointers for the remaining pair", "Skip repeated values for both the fixed index and pointers"],
        expectedTimeComplexity: "O(n^2)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "container-with-most-water-array",
        title: "Container With Most Water",
        difficulty: "Medium",
        description: "Given heights of vertical lines, choose two lines that form the container holding the most water.",
        leetcodeUrl: "https://leetcode.com/problems/container-with-most-water/",
        hints: ["Start with pointers at both ends", "Area depends on width and the shorter line", "Move the shorter line inward to search for a taller boundary"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "product-of-array-except-self",
        title: "Product of Array Except Self",
        difficulty: "Medium",
        description: "Build an output array where each position contains the product of every other element except itself, without using division.",
        leetcodeUrl: "https://leetcode.com/problems/product-of-array-except-self/",
        hints: ["Compute prefix products from the left", "Compute suffix products from the right", "Combine both passes without allocating extra full arrays"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "rotate-array",
        title: "Rotate Array",
        difficulty: "Medium",
        description: "Rotate the array to the right by k steps while keeping the operation in place.",
        leetcodeUrl: "https://leetcode.com/problems/rotate-array/",
        hints: ["Reduce k with modulo by the array length", "Reversing sections can simulate the rotation", "Think about reversing the whole array and then both partitions"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "merge-intervals-array",
        title: "Merge Intervals",
        difficulty: "Medium",
        description: "Merge all overlapping intervals and return a list of disjoint intervals covering the same ranges.",
        leetcodeUrl: "https://leetcode.com/problems/merge-intervals/",
        hints: ["Sort intervals by start time first", "Compare each interval with the last merged interval", "Extend the current merged end when overlaps appear"],
        expectedTimeComplexity: "O(n log n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "trapping-rain-water",
        title: "Trapping Rain Water",
        difficulty: "Hard",
        description: "Given an elevation map, compute how much rain water can be trapped between the bars after raining.",
        leetcodeUrl: "https://leetcode.com/problems/trapping-rain-water/",
        hints: ["Water above a bar is limited by the shorter side maximum", "Two pointers can track leftMax and rightMax in one pass", "Only move the side with the smaller boundary"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "first-missing-positive",
        title: "First Missing Positive",
        difficulty: "Hard",
        description: "Find the smallest missing positive integer using linear time and constant extra space.",
        leetcodeUrl: "https://leetcode.com/problems/first-missing-positive/",
        hints: ["Values in the range 1..n are the only ones that matter", "Try placing each value at its correct index position", "After reordering, scan for the first index whose value is wrong"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "strings",
    title: "Strings",
    level: "beginner",
    icon: "🔤",
    color: "from-teal-400 to-cyan-500",
    shortDescription: "Character sequences with rich pattern-matching and transformation operations",
    detailedExplanation: `Strings represent text and often require careful pointer movement, frequency counting, or pattern discovery.

Key Concepts:
• Strings are indexed like arrays of characters
• Many languages treat strings as immutable, so edits create new values
• Character frequency, normalization, and matching patterns appear often
• Efficient string work avoids repeated concatenation and unnecessary copies`,
    realWorldAnalogy: "A sentence on magnetic letter tiles where you can inspect positions, compare patterns, and rearrange characters to reveal hidden structure.",
    visualizerType: "string",
    youtubeVideos: [
      {
        id: "jJXJ16kPFWg",
        title: "Valid Palindrome - Leetcode 125 - Python",
        channel: "NeetCode",
        duration: "14:58",
      },
      {
        id: "9UtInBqnCgA",
        title: "Valid Anagram - Leetcode 242 - Python",
        channel: "NeetCode",
        duration: "12:01",
      },
    ],
    algorithms: [
      {
        name: "String Reversal",
        pseudocode: `function reverseString(text):
    chars = text.toCharArray()
    left = 0
    right = chars.length - 1
    while left < right:
        swap(chars[left], chars[right])
        left++
        right--
    return chars.join("")`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Two pointers swap characters from the outside toward the middle.",
        code: algoCode.stringReversalCode,
      },
      {
        name: "Palindrome Check",
        pseudocode: `function isPalindrome(text):
    left = 0
    right = text.length - 1
    while left < right:
        if text[left] != text[right]:
            return false
        left++
        right--
    return true`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "Matching pairs from both ends confirm whether the string reads the same forward and backward.",
        code: algoCode.palindromeCheckCode,
      },
      {
        name: "Anagram Frequency Count",
        pseudocode: `function areAnagrams(a, b):
    if a.length != b.length:
        return false
    count = empty map
    for ch in a:
        count[ch] = count.get(ch, 0) + 1
    for ch in b:
        count[ch] = count.get(ch, 0) - 1
        if count[ch] < 0:
            return false
    return true`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(k)",
        explanation: "Anagrams contain the same multiset of characters, so balanced frequency counts solve the problem directly.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "valid-palindrome",
        title: "Valid Palindrome",
        difficulty: "Easy",
        description: "Check whether a string is a palindrome after ignoring non-alphanumeric characters.",
        leetcodeUrl: "https://leetcode.com/problems/valid-palindrome/",
        hints: ["Use two pointers", "Skip irrelevant characters as you scan inward"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "valid-anagram",
        title: "Valid Anagram",
        difficulty: "Easy",
        description: "Determine if two strings use exactly the same letters with the same counts.",
        leetcodeUrl: "https://leetcode.com/problems/valid-anagram/",
        hints: ["Compare character frequencies", "Sorting also works but costs extra time"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(k)",
      },
      {
        id: "longest-substring-without-repeating-characters",
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        description: "Find the length of the longest substring that contains no repeated characters.",
        leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
        hints: ["Use a sliding window", "Track the most recent index of each character", "Shrink or jump the left boundary when a duplicate enters the window"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(k)",
      },
      {
        id: "group-anagrams",
        title: "Group Anagrams",
        difficulty: "Medium",
        description: "Group strings that are anagrams of one another into separate buckets.",
        leetcodeUrl: "https://leetcode.com/problems/group-anagrams/",
        hints: ["Use a canonical key for each word", "Sorted characters or frequency counts can identify anagrams", "Store grouped words in a hash map keyed by that signature"],
        expectedTimeComplexity: "O(n * k log k)",
        expectedSpaceComplexity: "O(n * k)",
      },
      {
        id: "longest-palindromic-substring",
        title: "Longest Palindromic Substring",
        difficulty: "Medium",
        description: "Return the longest contiguous substring that reads the same forward and backward.",
        leetcodeUrl: "https://leetcode.com/problems/longest-palindromic-substring/",
        hints: ["Expand around each possible center", "Check both odd-length and even-length palindromes", "Track the best start and end indices found so far"],
        expectedTimeComplexity: "O(n^2)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "minimum-window-substring",
        title: "Minimum Window Substring",
        difficulty: "Hard",
        description: "Find the smallest substring of s that contains every character of t with the needed frequencies.",
        leetcodeUrl: "https://leetcode.com/problems/minimum-window-substring/",
        hints: ["Use a sliding window with frequency counts", "Track how many required characters are currently satisfied", "Shrink the left side while the window remains valid"],
        expectedTimeComplexity: "O(m + n)",
        expectedSpaceComplexity: "O(k)",
      },
      {
        id: "edit-distance",
        title: "Edit Distance",
        difficulty: "Hard",
        description: "Compute the minimum number of insertions, deletions, and replacements needed to transform one word into another.",
        leetcodeUrl: "https://leetcode.com/problems/edit-distance/",
        hints: ["Dynamic programming works on prefixes of both words", "If the current letters match, reuse the diagonal state", "Otherwise consider insert, delete, and replace transitions"],
        expectedTimeComplexity: "O(m * n)",
        expectedSpaceComplexity: "O(m * n)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "linked-lists",
    title: "Linked Lists",
    level: "beginner",
    icon: "🔗",
    color: "from-lime-400 to-green-500",
    shortDescription: "Node-based sequences that trade random access for flexible pointer updates",
    detailedExplanation: `Linked lists store elements as nodes connected by references rather than contiguous memory.

Key Concepts:
• Insertions and deletions are cheap once the target node is known
• Traversal is sequential, so random access is slow
• Pointer updates are the main source of bugs and interview questions
• Variants include singly, doubly, and circular linked lists`,
    realWorldAnalogy: "A treasure hunt where each clue points to the next location, but you cannot jump directly to clue 20 without following the chain.",
    visualizerType: "linkedlist",
    youtubeVideos: [
      {
        id: "NobHlGUjV3g",
        title: "Introduction to linked list",
        channel: "mycodeschool",
        duration: "17:13",
      },
      {
        id: "G0_I-ZF0S38",
        title: "Reverse Linked List - Iterative AND Recursive - Leetcode 206 - Python",
        channel: "NeetCode",
        duration: "11:07",
      },
    ],
    algorithms: [
      {
        name: "Reverse Linked List",
        pseudocode: `function reverseList(head):
    prev = null
    current = head
    while current != null:
        nextNode = current.next
        current.next = prev
        prev = current
        current = nextNode
    return prev`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "Each pointer is flipped once so the list direction is reversed in-place.",
        code: algoCode.reverseLinkedListCode,
      },
      {
        name: "Detect Cycle (Floyd's Algorithm)",
        pseudocode: `function hasCycle(head):
    slow = head
    fast = head
    while fast != null AND fast.next != null:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return true
    return false`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "A fast pointer eventually laps a slow pointer if the list contains a cycle.",
        code: algoCode.detectCycleCode,
      },
      {
        name: "Merge Two Sorted Lists",
        pseudocode: `function mergeLists(a, b):
    dummy = new Node(0)
    tail = dummy
    while a != null AND b != null:
        if a.value <= b.value:
            tail.next = a
            a = a.next
        else:
            tail.next = b
            b = b.next
        tail = tail.next
    tail.next = a if a != null else b
    return dummy.next`,
        timeComplexity: "O(n + m)",
        spaceComplexity: "O(1)",
        explanation: "The merge step from merge sort works naturally on linked lists using only pointer rewiring.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "reverse-linked-list",
        title: "Reverse Linked List",
        difficulty: "Easy",
        description: "Reverse a singly linked list and return the new head.",
        leetcodeUrl: "https://leetcode.com/problems/reverse-linked-list/",
        hints: ["Track previous, current, and next nodes", "Update one pointer at a time"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "linked-list-cycle",
        title: "Linked List Cycle",
        difficulty: "Easy",
        description: "Determine whether a linked list contains a cycle.",
        leetcodeUrl: "https://leetcode.com/problems/linked-list-cycle/",
        hints: ["Use slow and fast pointers", "Meeting implies a cycle"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "merge-two-sorted-lists",
        title: "Merge Two Sorted Lists",
        difficulty: "Easy",
        description: "Merge two sorted linked lists into one sorted list by rearranging next pointers.",
        leetcodeUrl: "https://leetcode.com/problems/merge-two-sorted-lists/",
        hints: ["Use a dummy head to simplify pointer handling", "Always attach the smaller current node", "Append the remaining list when one side is exhausted"],
        expectedTimeComplexity: "O(n + m)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "remove-nth-node-from-end-of-list",
        title: "Remove Nth Node From End of List",
        difficulty: "Medium",
        description: "Delete the nth node from the end of a linked list and return the updated head.",
        leetcodeUrl: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
        hints: ["Use two pointers with a fixed gap of n nodes", "A dummy node helps when the head must be removed", "Move both pointers until the lead pointer reaches the end"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "lru-cache",
        title: "LRU Cache",
        difficulty: "Hard",
        description: "Design a cache that supports O(1) get and put while evicting the least recently used key first.",
        leetcodeUrl: "https://leetcode.com/problems/lru-cache/",
        hints: ["Combine a hash map with a doubly linked list", "Move recently used entries to the front", "Keep the least recently used entry at the tail for fast eviction"],
        expectedTimeComplexity: "O(1)",
        expectedSpaceComplexity: "O(capacity)",
      },
      {
        id: "copy-list-with-random-pointer",
        title: "Copy List with Random Pointer",
        difficulty: "Medium",
        description: "Create a deep copy of a linked list where each node also has a random pointer.",
        leetcodeUrl: "https://leetcode.com/problems/copy-list-with-random-pointer/",
        hints: ["Map original nodes to copied nodes or interleave copied nodes in place", "Copy next pointers before resolving random pointers", "Ensure random references point to copied nodes, not originals"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(n)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "stacks",
    title: "Stacks",
    level: "beginner",
    icon: "📚",
    color: "from-orange-400 to-red-500",
    shortDescription: "LIFO structures that excel at nested processing and backtracking state",
    detailedExplanation: `Stacks follow the Last-In, First-Out rule, which is perfect for nested structures and reversible actions.

Key Concepts:
• Push and pop happen at one end only
• Call stacks, undo systems, and expression parsing are natural stack uses
• Monotonic stacks solve many next-greater and next-smaller problems
• Stack-based scans often reduce quadratic brute force to linear time`,
    realWorldAnalogy: "A stack of trays in a cafeteria: the last tray placed on top is the first one removed.",
    visualizerType: "stack",
    youtubeVideos: [
      {
        id: "sFVxsglODoo",
        title: "Data structures: Array implementation of stacks",
        channel: "mycodeschool",
        duration: "13:09",
      },
      {
        id: "WTzjTskDFMg",
        title: "Valid Parentheses - Stack - Leetcode 20 - Python",
        channel: "NeetCode",
        duration: "10:43",
      },
    ],
    algorithms: [
      {
        name: "Basic Stack Operations",
        pseudocode: `class Stack:
    data = []
    function push(value):
        data.append(value)
    function pop():
        return data.removeLast()
    function peek():
        return data.last()`,
        timeComplexity: "O(1)",
        spaceComplexity: "O(n)",
        explanation: "A stack only exposes operations at the top, which keeps pushes and pops constant time.",
        code: algoCode.stackOperationsCode,
      },
      {
        name: "Balanced Parentheses",
        pseudocode: `function isBalanced(text):
    stack = empty stack
    pairs = map of closing to opening brackets
    for ch in text:
        if ch is opening bracket:
            stack.push(ch)
        else if ch is closing bracket:
            if stack is empty OR stack.pop() != pairs[ch]:
                return false
    return stack is empty`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Opening brackets are saved until the matching closing bracket appears in the correct order.",
      },
      {
        name: "Monotonic Stack for Next Greater Element",
        pseudocode: `function nextGreater(nums):
    result = array filled with -1
    stack = empty stack of indices
    for i = 0 to nums.length - 1:
        while stack not empty AND nums[stack.top()] < nums[i]:
            index = stack.pop()
            result[index] = nums[i]
        stack.push(i)
    return result`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "A decreasing stack keeps only unresolved indices, so each item is pushed and popped at most once.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "valid-parentheses",
        title: "Valid Parentheses",
        difficulty: "Easy",
        description: "Check if a sequence of brackets is properly matched and nested.",
        leetcodeUrl: "https://leetcode.com/problems/valid-parentheses/",
        hints: ["Push openings and verify each closing bracket", "The stack must be empty at the end"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "daily-temperatures",
        title: "Daily Temperatures",
        difficulty: "Medium",
        description: "For each day, find how many days until a warmer temperature appears.",
        leetcodeUrl: "https://leetcode.com/problems/daily-temperatures/",
        hints: ["Use a decreasing stack of indices", "Resolve earlier days when a warmer day arrives"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "valid-parentheses",
        title: "Valid Parentheses",
        difficulty: "Easy",
        description: "Determine whether every opening bracket in the string is closed in the correct order.",
        leetcodeUrl: "https://leetcode.com/problems/valid-parentheses/",
        hints: ["Use a stack of opening brackets", "Only a matching closing bracket may pop the top", "Any leftover openings mean the string is invalid"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "min-stack",
        title: "Min Stack",
        difficulty: "Medium",
        description: "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.",
        leetcodeUrl: "https://leetcode.com/problems/min-stack/",
        hints: ["Track the current minimum alongside each pushed value", "A second stack can store running minimums", "Keep all required operations O(1)"],
        expectedTimeComplexity: "O(1)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "daily-temperatures",
        title: "Daily Temperatures",
        difficulty: "Medium",
        description: "For each day, find how many days you must wait until a warmer temperature appears.",
        leetcodeUrl: "https://leetcode.com/problems/daily-temperatures/",
        hints: ["Use a monotonic decreasing stack of indices", "When a warmer day arrives, resolve earlier colder days", "Store indices so you can compute waiting distances"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "largest-rectangle-in-histogram",
        title: "Largest Rectangle in Histogram",
        difficulty: "Hard",
        description: "Given bar heights in a histogram, find the area of the largest rectangle that can be formed.",
        leetcodeUrl: "https://leetcode.com/problems/largest-rectangle-in-histogram/",
        hints: ["A monotonic increasing stack helps find boundaries", "When height drops, finalize rectangles for taller bars", "Treat each bar as the limiting height of a maximal width"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(n)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "queues",
    title: "Queues",
    level: "beginner",
    icon: "🚶",
    color: "from-yellow-400 to-amber-500",
    shortDescription: "FIFO structures used for scheduling, buffering, and breadth-first processing",
    detailedExplanation: `Queues follow the First-In, First-Out rule and model processing tasks in arrival order.

Key Concepts:
• Enqueue adds to the back and dequeue removes from the front
• Breadth-first search relies on queue order to process level by level
• Circular queues reuse space efficiently in fixed-size buffers
• Deques extend queues with operations on both ends`,
    realWorldAnalogy: "A line at a ticket counter where the first person to arrive is served first.",
    visualizerType: "queue",
    youtubeVideos: [
      {
        id: "XuCbpw6Bj1U",
        title: "Data structures: Introduction to Queues",
        channel: "mycodeschool",
        duration: "9:19",
      },
      {
        id: "KxzhEQ-zpDc",
        title: "Queue Introduction",
        channel: "WilliamFiset",
        duration: "6:26",
      },
    ],
    algorithms: [
      {
        name: "Basic Queue Operations",
        pseudocode: `class Queue:
    data = []
    function enqueue(value):
        data.append(value)
    function dequeue():
        return data.removeFirst()
    function front():
        return data[0]`,
        timeComplexity: "O(1)",
        spaceComplexity: "O(n)",
        explanation: "Queues preserve insertion order so older elements leave before newer ones.",
        code: algoCode.queueOperationsCode,
      },
      {
        name: "Circular Queue",
        pseudocode: `class CircularQueue:
    data = array of size k
    head = 0
    tail = 0
    size = 0
    function enqueue(value):
        if size == k: return false
        data[tail] = value
        tail = (tail + 1) mod k
        size++`,
        timeComplexity: "O(1)",
        spaceComplexity: "O(k)",
        explanation: "Head and tail wrap around so a fixed-size array can behave like a continuous queue.",
      },
      {
        name: "Level Order Processing",
        pseudocode: `function processLevels(graph, source):
    queue = empty queue
    seen = set with source
    queue.enqueue(source)
    while queue not empty:
        node = queue.dequeue()
        visit(node)
        for neighbor in graph[node]:
            if neighbor not in seen:
                seen.add(neighbor)
                queue.enqueue(neighbor)`,
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        explanation: "Queue order guarantees that all items at one distance are processed before deeper layers.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "design-circular-queue",
        title: "Design Circular Queue",
        difficulty: "Medium",
        description: "Implement a fixed-size circular queue with efficient operations.",
        leetcodeUrl: "https://leetcode.com/problems/design-circular-queue/",
        hints: ["Track size separately from head and tail", "Use modulo arithmetic for wrap-around"],
        expectedTimeComplexity: "O(1)",
        expectedSpaceComplexity: "O(k)",
      },
      {
        id: "number-of-recent-calls",
        title: "Number of Recent Calls",
        difficulty: "Easy",
        description: "Maintain only requests from the last 3000 milliseconds.",
        leetcodeUrl: "https://leetcode.com/problems/number-of-recent-calls/",
        hints: ["A queue naturally stores calls in order", "Remove expired timestamps from the front"],
        expectedTimeComplexity: "O(1) amortized",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "sliding-window-maximum",
        title: "Sliding Window Maximum",
        difficulty: "Hard",
        description: "Return the maximum value in every contiguous subarray of size k.",
        leetcodeUrl: "https://leetcode.com/problems/sliding-window-maximum/",
        hints: ["Maintain a deque of candidate indices in decreasing order", "Remove indices that fall out of the current window", "The front of the deque always holds the current maximum"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(k)",
      },
      {
        id: "design-circular-queue",
        title: "Design Circular Queue",
        difficulty: "Medium",
        description: "Implement a circular queue supporting fixed-size enqueue, dequeue, and front/rear operations.",
        leetcodeUrl: "https://leetcode.com/problems/design-circular-queue/",
        hints: ["Track front index, rear index, and current size", "Wrap indices with modulo arithmetic", "Distinguish full and empty states carefully"],
        expectedTimeComplexity: "O(1)",
        expectedSpaceComplexity: "O(k)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "sorting-algorithms",
    title: "Sorting Algorithms",
    level: "beginner",
    icon: "🔀",
    color: "from-pink-400 to-rose-500",
    shortDescription: "Core comparison-based methods for ordering data from simple to divide-and-conquer sorts",
    detailedExplanation: `Sorting is a foundational topic because ordered data unlocks binary search, easier merging, and clearer structure.

Key Concepts:
• Stable vs unstable sorting matters when equal keys preserve relative order
• In-place methods save memory but may do more comparisons or swaps
• Divide-and-conquer sorting improves asymptotic performance
• Basic sorts are ideal for learning swap, insertion, and partition ideas`,
    realWorldAnalogy: "Organizing books on a shelf: some methods compare neighbors repeatedly, while others split the shelf into smaller groups and merge the results.",
    visualizerType: "sorting",
    youtubeVideos: [
      {
        id: "mB5HXBb_HY8",
        title: "2.7.2.  Merge Sort Algorithm",
        channel: "Abdul Bari",
        duration: "20:23",
      },
      {
        id: "7h1s2SojIRw",
        title: "2.8.1  QuickSort Algorithm",
        channel: "Abdul Bari",
        duration: "13:43",
      },
    ],
    algorithms: [
      {
        name: "Bubble Sort",
        pseudocode: `function bubbleSort(nums):
    for pass = 0 to nums.length - 1:
        swapped = false
        for i = 0 to nums.length - pass - 2:
            if nums[i] > nums[i + 1]:
                swap(nums[i], nums[i + 1])
                swapped = true
        if not swapped:
            break
    return nums`,
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(1)",
        explanation: "Bubble sort repeatedly swaps adjacent out-of-order elements so the largest item bubbles to the end each pass.",
        code: algoCode.bubbleSortCode,
      },
      {
        name: "Insertion Sort",
        pseudocode: `function insertionSort(nums):
    for i = 1 to nums.length - 1:
        key = nums[i]
        j = i - 1
        while j >= 0 AND nums[j] > key:
            nums[j + 1] = nums[j]
            j--
        nums[j + 1] = key
    return nums`,
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(1)",
        explanation: "Insertion sort grows a sorted prefix by inserting each new element into its correct spot.",
      },
      {
        name: "Merge Sort",
        pseudocode: `function mergeSort(nums):
    if nums.length <= 1:
        return nums
    mid = floor(nums.length / 2)
    left = mergeSort(nums[0..mid-1])
    right = mergeSort(nums[mid..end])
    return merge(left, right)`,
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        explanation: "Merge sort divides the array recursively and merges sorted halves efficiently.",
        code: algoCode.mergeSortCode,
      },
      {
        name: "Quick Sort",
        pseudocode: `function quickSort(nums, low, high):
    if low >= high:
        return
    pivotIndex = partition(nums, low, high)
    quickSort(nums, low, pivotIndex - 1)
    quickSort(nums, pivotIndex + 1, high)

function partition(nums, low, high):
    pivot = nums[high]
    store = low
    for i = low to high - 1:
        if nums[i] <= pivot:
            swap(nums[i], nums[store])
            store++
    swap(nums[store], nums[high])
    return store`,
        timeComplexity: "O(n log n) average",
        spaceComplexity: "O(log n)",
        explanation: "Quick sort partitions around a pivot so smaller items go left and larger items go right before recursing.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "sort-an-array",
        title: "Sort an Array",
        difficulty: "Medium",
        description: "Implement an efficient sorting algorithm to sort the given array.",
        leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
        hints: ["Aim for O(n log n)", "Merge sort and heap sort both work well"],
        expectedTimeComplexity: "O(n log n)",
        expectedSpaceComplexity: "O(n) or O(1) depending on approach",
      },
      {
        id: "merge-intervals",
        title: "Merge Intervals",
        difficulty: "Medium",
        description: "Sort intervals by start time, then merge overlapping ranges.",
        leetcodeUrl: "https://leetcode.com/problems/merge-intervals/",
        hints: ["Sorting by start is the key first step", "Compare with the last merged interval"],
        expectedTimeComplexity: "O(n log n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "sort-colors",
        title: "Sort Colors",
        difficulty: "Medium",
        description: "Sort an array containing only 0s, 1s, and 2s in place without using the library sort.",
        leetcodeUrl: "https://leetcode.com/problems/sort-colors/",
        hints: ["Use three regions for 0s, 1s, and 2s", "The Dutch National Flag partition solves this in one pass", "Swap values into the correct region as you scan"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "sort-an-array-merge-sort",
        title: "Sort an Array",
        difficulty: "Medium",
        description: "Practice implementing merge sort to sort the array in ascending order.",
        leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
        hints: ["Divide the array into halves until subarrays are size one", "Merge two sorted halves back together", "Use an auxiliary array to simplify the merge step"],
        expectedTimeComplexity: "O(n log n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "sort-an-array-quick-sort",
        title: "Sort an Array",
        difficulty: "Medium",
        description: "Practice implementing quick sort by partitioning the array around a pivot value.",
        leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
        hints: ["Choose a pivot and partition smaller values to one side", "Recursively sort the partitions", "Good pivot selection helps avoid worst-case performance"],
        expectedTimeComplexity: "O(n log n)",
        expectedSpaceComplexity: "O(log n)",
      },
      {
        id: "kth-largest-element-in-an-array-sorting",
        title: "Kth Largest Element in an Array",
        difficulty: "Medium",
        description: "Find the kth largest element and compare sorting-based reasoning with heap or quickselect approaches.",
        leetcodeUrl: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
        hints: ["A full sort gives the answer directly", "Quickselect can avoid sorting everything", "Think about where the kth largest sits in sorted order"],
        expectedTimeComplexity: "O(n log n)",
        expectedSpaceComplexity: "O(1)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "searching",
    title: "Searching",
    level: "beginner",
    icon: "🔎",
    color: "from-sky-400 to-blue-500",
    shortDescription: "Techniques for locating data efficiently in unsorted or ordered collections",
    detailedExplanation: `Searching is about choosing the right strategy based on how the data is organized.

Key Concepts:
• Linear search works everywhere but scans one by one
• Binary search needs sorted data and cuts the search space in half
• Boundary searches find first or last valid positions, not just exact matches
• Search design often starts by identifying monotonic behavior`,
    realWorldAnalogy: "Finding a word in an unsorted notebook takes page-by-page scanning, but a dictionary lets you jump to the middle and narrow down quickly.",
    visualizerType: "searching",
    youtubeVideos: [
      {
        id: "C2apEw9pgtw",
        title: "2.6.1 Binary Search Iterative Method",
        channel: "Abdul Bari",
        duration: "19:36",
      },
      {
        id: "s4DPM8ct1pI",
        title: "Binary Search - Leetcode 704 - Python",
        channel: "NeetCode",
        duration: "9:40",
      },
    ],
    algorithms: [
      {
        name: "Linear Search",
        pseudocode: `function linearSearch(nums, target):
    for i = 0 to nums.length - 1:
        if nums[i] == target:
            return i
    return -1`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "Linear search checks each item until the target is found or the data ends.",
        code: algoCode.linearSearchCode,
      },
      {
        name: "Binary Search",
        pseudocode: `function binarySearch(nums, target):
    left = 0
    right = nums.length - 1
    while left <= right:
        mid = floor((left + right) / 2)
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        explanation: "Binary search repeatedly eliminates half of a sorted search space.",
        code: algoCode.binarySearchCode,
      },
      {
        name: "Lower Bound Search",
        pseudocode: `function lowerBound(nums, target):
    left = 0
    right = nums.length
    while left < right:
        mid = floor((left + right) / 2)
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid
    return left`,
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        explanation: "Lower bound returns the first index where the target could be inserted without breaking sorted order.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "binary-search",
        title: "Binary Search",
        difficulty: "Easy",
        description: "Find the target in a sorted array or return -1 if absent.",
        leetcodeUrl: "https://leetcode.com/problems/binary-search/",
        hints: ["Keep left and right inclusive", "Move the midpoint carefully to avoid infinite loops"],
        expectedTimeComplexity: "O(log n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "search-insert-position",
        title: "Search Insert Position",
        difficulty: "Easy",
        description: "Return the target index or the position where it should be inserted.",
        leetcodeUrl: "https://leetcode.com/problems/search-insert-position/",
        hints: ["This is a boundary-search problem", "Think in terms of first position >= target"],
        expectedTimeComplexity: "O(log n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "search-in-rotated-sorted-array",
        title: "Search in Rotated Sorted Array",
        difficulty: "Medium",
        description: "Search for a target value in a sorted array that has been rotated at an unknown pivot.",
        leetcodeUrl: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
        hints: ["Modified binary search still works", "At each step one half is guaranteed to be sorted", "Use the sorted half to decide where the target can lie"],
        expectedTimeComplexity: "O(log n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "find-peak-element",
        title: "Find Peak Element",
        difficulty: "Medium",
        description: "Return the index of any peak element, where a peak is greater than its neighbors.",
        leetcodeUrl: "https://leetcode.com/problems/find-peak-element/",
        hints: ["Binary search can use the slope between mid and mid+1", "If the sequence is rising, a peak exists to the right", "You only need to return one valid peak"],
        expectedTimeComplexity: "O(log n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "search-a-2d-matrix",
        title: "Search a 2D Matrix",
        difficulty: "Medium",
        description: "Determine whether a target exists in a matrix whose rows are sorted and whose first values are larger than the previous row's last value.",
        leetcodeUrl: "https://leetcode.com/problems/search-a-2d-matrix/",
        hints: ["View the matrix as one sorted 1D array", "Binary search over virtual indices and map them back to row and column", "Use division and modulo with the number of columns"],
        expectedTimeComplexity: "O(log(m * n))",
        expectedSpaceComplexity: "O(1)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "basic-math",
    title: "Basic Math & Number Theory",
    level: "beginner",
    icon: "➗",
    color: "from-emerald-400 to-teal-500",
    shortDescription: "Essential arithmetic tools such as gcd, primes, and modular reasoning",
    detailedExplanation: `Basic math techniques appear surprisingly often in coding interviews and contests.

Key Concepts:
• Greatest common divisor captures shared factors efficiently
• Prime sieves preprocess divisibility information for many queries
• Modular arithmetic keeps huge numbers manageable
• Fast exponentiation turns repeated multiplication into logarithmic work`,
    realWorldAnalogy: "Like simplifying fractions, checking divisibility, and using clock arithmetic to avoid counting forever.",
    visualizerType: "math",
    youtubeVideos: [
      {
        id: "eKp56OLhoQs",
        title: "Finding Prime numbers - Sieve of Eratosthenes",
        channel: "mycodeschool",
        duration: "9:54",
      },
      {
        id: "g9YQyYi4IQQ",
        title: "Pow(x, n) - X to the power of N - Leetcode 50 - Python",
        channel: "NeetCode",
        duration: "12:37",
      },
    ],
    algorithms: [
      {
        name: "Euclidean GCD",
        pseudocode: `function gcd(a, b):
    while b != 0:
        temp = a mod b
        a = b
        b = temp
    return a`,
        timeComplexity: "O(log min(a, b))",
        spaceComplexity: "O(1)",
        explanation: "The gcd does not change if the larger number is replaced with its remainder modulo the smaller one.",
        code: algoCode.euclideanGcdCode,
      },
      {
        name: "Sieve of Eratosthenes",
        pseudocode: `function sieve(n):
    isPrime = array of size n + 1 filled with true
    isPrime[0] = false
    isPrime[1] = false
    for p = 2 to floor(sqrt(n)):
        if isPrime[p]:
            for multiple = p * p to n step p:
                isPrime[multiple] = false
    return isPrime`,
        timeComplexity: "O(n log log n)",
        spaceComplexity: "O(n)",
        explanation: "Each prime marks its multiples, leaving only prime numbers unmarked.",
        code: algoCode.sieveOfEratosthenesCode,
      },
      {
        name: "Fast Modular Exponentiation",
        pseudocode: `function modPow(base, exp, mod):
    result = 1
    base = base mod mod
    while exp > 0:
        if exp is odd:
            result = (result * base) mod mod
        base = (base * base) mod mod
        exp = floor(exp / 2)
    return result`,
        timeComplexity: "O(log exp)",
        spaceComplexity: "O(1)",
        explanation: "Exponentiation by squaring halves the exponent at each step while applying modulo throughout.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "count-primes",
        title: "Count Primes",
        difficulty: "Medium",
        description: "Count the number of prime numbers smaller than n.",
        leetcodeUrl: "https://leetcode.com/problems/count-primes/",
        hints: ["A sieve is faster than checking each number independently", "Start marking from p * p"],
        expectedTimeComplexity: "O(n log log n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "powx-n",
        title: "Pow(x, n)",
        difficulty: "Medium",
        description: "Compute x raised to n efficiently, including negative exponents.",
        leetcodeUrl: "https://leetcode.com/problems/powx-n/",
        hints: ["Use exponentiation by squaring", "Handle negative powers by inverting the base"],
        expectedTimeComplexity: "O(log n)",
        expectedSpaceComplexity: "O(1)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "matrix-2d-arrays",
    title: "Matrix / 2D Arrays",
    level: "beginner",
    icon: "🧮",
    color: "from-cyan-400 to-blue-500",
    shortDescription: "Grid-based data where row-column traversal and neighborhood logic matter",
    detailedExplanation: `Matrices extend array thinking into two dimensions, which introduces row-column indexing and directional movement.

Key Concepts:
• Coordinates and bounds checks are central to correctness
• Traversal order can be row-major, column-major, diagonal, or spiral
• Prefix sums generalize to 2D for constant-time submatrix queries
• Many graph problems on grids are disguised matrix problems`,
    realWorldAnalogy: "A spreadsheet where every cell has a row and column address and nearby cells influence one another.",
    visualizerType: "matrix",
    youtubeVideos: [
      {
        id: "BJnMZNwUk1M",
        title: "Spiral Matrix - Microsoft Interview Question - Leetcode 54",
        channel: "NeetCode",
        duration: "16:46",
      },
      {
        id: "T41rL0L3Pnw",
        title: "Set Matrix Zeroes - In-place - Leetcode 73",
        channel: "NeetCode",
        duration: "18:05",
      },
    ],
    algorithms: [
      {
        name: "Row-Major Traversal",
        pseudocode: `function traverseGrid(grid):
    for row = 0 to grid.rows - 1:
        for col = 0 to grid.cols - 1:
            visit(grid[row][col])`,
        timeComplexity: "O(r * c)",
        spaceComplexity: "O(1)",
        explanation: "The most basic grid scan visits each cell exactly once in natural table order.",
      },
      {
        name: "Spiral Traversal",
        pseudocode: `function spiralOrder(grid):
    top = 0, bottom = rows - 1
    left = 0, right = cols - 1
    while top <= bottom AND left <= right:
        traverse top row from left to right
        top++
        traverse right column from top to bottom
        right--
        if top <= bottom: traverse bottom row from right to left
        if left <= right: traverse left column from bottom to top
        bottom--, left++`,
        timeComplexity: "O(r * c)",
        spaceComplexity: "O(1)",
        explanation: "Boundary pointers shrink inward after each layer of the spiral is processed.",
        code: algoCode.spiralMatrixTraversalCode,
      },
      {
        name: "2D Prefix Sum",
        pseudocode: `function buildPrefix2D(grid):
    prefix = matrix of size (rows + 1) x (cols + 1) filled with 0
    for r = 1 to rows:
        for c = 1 to cols:
            prefix[r][c] = grid[r - 1][c - 1]
                + prefix[r - 1][c]
                + prefix[r][c - 1]
                - prefix[r - 1][c - 1]
    return prefix`,
        timeComplexity: "O(r * c)",
        spaceComplexity: "O(r * c)",
        explanation: "2D prefix sums reuse overlap correction to answer any submatrix sum quickly.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "spiral-matrix",
        title: "Spiral Matrix",
        difficulty: "Medium",
        description: "Return all matrix elements in spiral order.",
        leetcodeUrl: "https://leetcode.com/problems/spiral-matrix/",
        hints: ["Track top, bottom, left, and right boundaries", "Shrink the rectangle after each sweep"],
        expectedTimeComplexity: "O(r * c)",
        expectedSpaceComplexity: "O(1) excluding output",
      },
      {
        id: "set-matrix-zeroes",
        title: "Set Matrix Zeroes",
        difficulty: "Medium",
        description: "If a cell is zero, set its entire row and column to zero in-place.",
        leetcodeUrl: "https://leetcode.com/problems/set-matrix-zeroes/",
        hints: ["Reuse the first row and column as markers", "Track whether the first row or column originally contained zero"],
        expectedTimeComplexity: "O(r * c)",
        expectedSpaceComplexity: "O(1)",
      },
    ] satisfies Problem[],
  },

  // ===== INTERMEDIATE TOPICS =====
  {
    slug: "binary-trees",
    title: "Binary Trees",
    level: "intermediate",
    icon: "🌳",
    color: "from-blue-400 to-indigo-500",
    shortDescription: "Hierarchical structures where each node has at most two children",
    detailedExplanation: `Binary trees organize data hierarchically instead of linearly, which makes recursive reasoning very natural.

Key Concepts:
• Every node can branch to a left and right child
• Traversals reveal the tree in different logical orders
• Height, depth, and balance affect performance and recursion depth
• Many interview problems rely on divide-and-combine reasoning on subtrees`,
    realWorldAnalogy: "A family tree where each person branches downward into smaller subfamilies that can be processed independently.",
    visualizerType: "binarytree",
    youtubeVideos: [
      {
        id: "H5JubkIy_p8",
        title: "Data structures: Binary Tree",
        channel: "mycodeschool",
        duration: "16:17",
      },
      {
        id: "6ZnyEApgFYg",
        title: "Binary Tree Level Order Traversal - BFS - Leetcode 102",
        channel: "NeetCode",
        duration: "9:36",
      },
    ],
    algorithms: [
      {
        name: "Inorder Traversal",
        pseudocode: `function inorder(node):
    if node == null:
        return
    inorder(node.left)
    visit(node.value)
    inorder(node.right)`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(h)",
        explanation: "Inorder traversal visits left subtree, root, then right subtree recursively.",
        code: algoCode.inorderTraversalCode,
      },
      {
        name: "Level Order Traversal",
        pseudocode: `function levelOrder(root):
    if root == null:
        return []
    queue = [root]
    while queue not empty:
        size = queue.length
        repeat size times:
            node = queue.dequeue()
            visit(node)
            if node.left != null: queue.enqueue(node.left)
            if node.right != null: queue.enqueue(node.right)`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(w)",
        explanation: "Breadth-first traversal processes the tree level by level using a queue.",
      },
      {
        name: "Height of Binary Tree",
        pseudocode: `function height(node):
    if node == null:
        return 0
    leftHeight = height(node.left)
    rightHeight = height(node.right)
    return 1 + max(leftHeight, rightHeight)`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(h)",
        explanation: "Tree height is computed by asking each node for the taller of its two subtrees.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "binary-tree-inorder-traversal",
        title: "Binary Tree Inorder Traversal",
        difficulty: "Easy",
        description: "Return the inorder traversal of a binary tree.",
        leetcodeUrl: "https://leetcode.com/problems/binary-tree-inorder-traversal/",
        hints: ["Recursive and iterative stack solutions both work", "Remember the left-root-right order"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(h)",
      },
      {
        id: "binary-tree-level-order-traversal",
        title: "Binary Tree Level Order Traversal",
        difficulty: "Medium",
        description: "Group tree nodes by depth using breadth-first search.",
        leetcodeUrl: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
        hints: ["Use a queue", "Process one layer at a time by snapshotting queue size"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(w)",
      },
      {
        id: "invert-binary-tree",
        title: "Invert Binary Tree",
        difficulty: "Easy",
        description: "Swap the left and right child of every node in the binary tree.",
        leetcodeUrl: "https://leetcode.com/problems/invert-binary-tree/",
        hints: ["Recursive DFS naturally visits each node once", "Swap children before or after recursing", "A queue-based BFS also works level by level"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(h)",
      },
      {
        id: "maximum-depth-of-binary-tree",
        title: "Maximum Depth of Binary Tree",
        difficulty: "Easy",
        description: "Return the number of nodes along the longest path from the root down to a leaf.",
        leetcodeUrl: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
        hints: ["The depth of a node is one plus the deeper child", "Use DFS recursion or BFS by levels", "Base case for a null node contributes zero depth"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(h)",
      },
      {
        id: "same-tree",
        title: "Same Tree",
        difficulty: "Easy",
        description: "Check whether two binary trees have identical structure and node values.",
        leetcodeUrl: "https://leetcode.com/problems/same-tree/",
        hints: ["Compare corresponding nodes recursively", "Null pairs are equal but mismatched nulls are not", "Values must match before exploring both subtrees"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(h)",
      },
      {
        id: "serialize-and-deserialize-binary-tree",
        title: "Serialize and Deserialize Binary Tree",
        difficulty: "Hard",
        description: "Convert a binary tree into a string representation and rebuild the same tree from that encoding.",
        leetcodeUrl: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
        hints: ["Choose a traversal order and include null markers", "Preorder traversal is convenient for reconstruction", "The decoder must consume values in the exact same order they were written"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "binary-tree-maximum-path-sum",
        title: "Binary Tree Maximum Path Sum",
        difficulty: "Hard",
        description: "Find the maximum path sum in a binary tree, where a path may start and end at any nodes.",
        leetcodeUrl: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
        hints: ["A DFS can return the best downward path from each node", "Negative child gains should be ignored", "Track a global answer that may use both children through the current node"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(h)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "binary-search-trees",
    title: "Binary Search Trees",
    level: "intermediate",
    icon: "🌲",
    color: "from-indigo-400 to-purple-500",
    shortDescription: "Ordered binary trees where left values are smaller and right values are larger",
    detailedExplanation: `A binary search tree adds an ordering invariant to a binary tree, enabling fast search-like behavior.

Key Concepts:
• Left subtree values are smaller than the node and right subtree values are larger
• Inorder traversal of a BST produces sorted order
• Search, insertion, and deletion depend on the ordering rule
• Balance matters because skewed BSTs behave like linked lists`,
    realWorldAnalogy: "A decision tree in a guessing game where each choice sends you left or right depending on whether the target is smaller or larger.",
    visualizerType: "bst",
    youtubeVideos: [
      {
        id: "pYT9F8_LFTM",
        title: "Data structures: Binary Search Tree",
        channel: "mycodeschool",
        duration: "19:28",
      },
      {
        id: "s6ATEkipzow",
        title: "Validate Binary Search Tree - Depth First Search - Leetcode 98",
        channel: "NeetCode",
        duration: "9:56",
      },
    ],
    algorithms: [
      {
        name: "Search in BST",
        pseudocode: `function searchBST(root, target):
    current = root
    while current != null:
        if current.value == target:
            return current
        if target < current.value:
            current = current.left
        else:
            current = current.right
    return null`,
        timeComplexity: "O(h)",
        spaceComplexity: "O(1)",
        explanation: "The BST property lets you discard half of the remaining tree at every step.",
      },
      {
        name: "Insert into BST",
        pseudocode: `function insertBST(root, value):
    if root == null:
        return new Node(value)
    if value < root.value:
        root.left = insertBST(root.left, value)
    else:
        root.right = insertBST(root.right, value)
    return root`,
        timeComplexity: "O(h)",
        spaceComplexity: "O(h)",
        explanation: "Insertion recursively walks the unique path where the new value belongs.",
      },
      {
        name: "Validate BST",
        pseudocode: `function isValidBST(node, low, high):
    if node == null:
        return true
    if node.value <= low OR node.value >= high:
        return false
    return isValidBST(node.left, low, node.value)
        AND isValidBST(node.right, node.value, high)`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(h)",
        explanation: "Each node must respect a valid range inherited from all ancestors, not just its parent.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "validate-binary-search-tree",
        title: "Validate Binary Search Tree",
        difficulty: "Medium",
        description: "Determine whether a binary tree satisfies the BST ordering property.",
        leetcodeUrl: "https://leetcode.com/problems/validate-binary-search-tree/",
        hints: ["Carry a valid range down the tree", "Local parent checks are not enough"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(h)",
      },
      {
        id: "search-in-a-binary-search-tree",
        title: "Search in a Binary Search Tree",
        difficulty: "Easy",
        description: "Locate a value in a BST and return the subtree rooted at that node.",
        leetcodeUrl: "https://leetcode.com/problems/search-in-a-binary-search-tree/",
        hints: ["Use the ordering property to move left or right", "No need to scan the whole tree"],
        expectedTimeComplexity: "O(h)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "validate-binary-search-tree",
        title: "Validate Binary Search Tree",
        difficulty: "Medium",
        description: "Determine whether a binary tree satisfies the strict ordering rules of a binary search tree.",
        leetcodeUrl: "https://leetcode.com/problems/validate-binary-search-tree/",
        hints: ["Each node must stay within an allowed value range", "Pass lower and upper bounds down the recursion", "An inorder traversal should also appear strictly increasing"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(h)",
      },
      {
        id: "kth-smallest-element-in-a-bst",
        title: "Kth Smallest Element in a BST",
        difficulty: "Medium",
        description: "Return the kth smallest value in a binary search tree.",
        leetcodeUrl: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
        hints: ["Inorder traversal visits BST nodes in sorted order", "Count visited nodes until you reach k", "You can stop early once the answer is found"],
        expectedTimeComplexity: "O(h + k)",
        expectedSpaceComplexity: "O(h)",
      },
      {
        id: "lowest-common-ancestor-of-a-binary-search-tree",
        title: "Lowest Common Ancestor of a Binary Search Tree",
        difficulty: "Medium",
        description: "Find the lowest node in a BST that has both target nodes in its subtree.",
        leetcodeUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
        hints: ["Use the BST ordering to decide which direction to move", "If both targets are smaller, go left; if both are larger, go right", "The split point is the answer"],
        expectedTimeComplexity: "O(h)",
        expectedSpaceComplexity: "O(1)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "hash-tables",
    title: "Hash Tables",
    level: "intermediate",
    icon: "#️⃣",
    color: "from-violet-400 to-fuchsia-500",
    shortDescription: "Key-value structures that trade ordering for near-constant-time access",
    detailedExplanation: `Hash tables map keys to buckets using hash functions so insert, find, and delete are usually fast.

Key Concepts:
• A hash function converts keys into bucket indices
• Collisions are unavoidable and must be resolved
• Common strategies include chaining and open addressing
• Frequency counting and membership tests are classic hash table applications`,
    realWorldAnalogy: "A mailroom where each name is transformed into a mailbox number, so you can usually jump straight to the right slot.",
    visualizerType: "hashtable",
    youtubeVideos: [
      {
        id: "knV86FlSXJ8",
        title: "Hash tables in 4 minutes",
        channel: "Michael Sambol",
        duration: "3:52",
      },
      {
        id: "vzdNOK2oB2E",
        title: "Group Anagrams - Categorize Strings by Count - Leetcode 49",
        channel: "NeetCode",
        duration: "8:12",
      },
    ],
    algorithms: [
      {
        name: "Hash Table Insert / Update",
        pseudocode: `function put(table, key, value):
    index = hash(key) mod table.capacity
    bucket = table[index]
    for pair in bucket:
        if pair.key == key:
            pair.value = value
            return
    bucket.append([key, value])`,
        timeComplexity: "O(1) average",
        spaceComplexity: "O(1) auxiliary",
        explanation: "A hashed bucket is checked first, then the key is updated or appended inside that bucket.",
        code: algoCode.hashTableInsertCode,
      },
      {
        name: "Separate Chaining Lookup",
        pseudocode: `function get(table, key):
    index = hash(key) mod table.capacity
    for pair in table[index]:
        if pair.key == key:
            return pair.value
    return null`,
        timeComplexity: "O(1) average",
        spaceComplexity: "O(1)",
        explanation: "Colliding entries live in the same bucket, so lookup scans only that small local chain on average.",
      },
      {
        name: "Rehash on Load Factor",
        pseudocode: `function resize(table):
    oldBuckets = table.buckets
    table.capacity = table.capacity * 2
    table.buckets = empty bucket array of new capacity
    for bucket in oldBuckets:
        for pair in bucket:
            put(table, pair.key, pair.value)`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Rehashing redistributes keys when the table becomes crowded so average performance stays fast.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "group-anagrams",
        title: "Group Anagrams",
        difficulty: "Medium",
        description: "Group words that are permutations of one another.",
        leetcodeUrl: "https://leetcode.com/problems/group-anagrams/",
        hints: ["Use a canonical key such as sorted letters or a frequency signature", "Hash the signature to a list"],
        expectedTimeComplexity: "O(n * k log k)",
        expectedSpaceComplexity: "O(n * k)",
      },
      {
        id: "design-hashmap",
        title: "Design HashMap",
        difficulty: "Easy",
        description: "Implement a hash map without using built-in libraries.",
        leetcodeUrl: "https://leetcode.com/problems/design-hashmap/",
        hints: ["Think about collisions", "Buckets plus chaining are the most direct solution"],
        expectedTimeComplexity: "O(1) average",
        expectedSpaceComplexity: "O(n)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "heaps",
    title: "Heaps",
    level: "intermediate",
    icon: "⛰️",
    color: "from-purple-400 to-pink-500",
    shortDescription: "Tree-backed priority structures for repeatedly extracting extreme values",
    detailedExplanation: `Heaps are complete binary trees usually stored in arrays, optimized for repeated min or max extraction.

Key Concepts:
• Parent-child relationships are maintained through the heap property
• Insert and extract operations adjust structure with sift-up or sift-down
• Priority queues are heap-based in most libraries
• Heaps are ideal for streaming top-k and scheduling problems`,
    realWorldAnalogy: "A tournament podium where the champion is always at the top, and the structure is quickly repaired after every change.",
    visualizerType: "heap",
    youtubeVideos: [
      {
        id: "wptevk0bshY",
        title: "Priority Queue Introduction",
        channel: "WilliamFiset",
        duration: "13:18",
      },
      {
        id: "XEmy13g1Qxc",
        title: "Kth Largest Element in an Array - Quick Select - Leetcode 215 - Python",
        channel: "NeetCode",
        duration: "18:48",
      },
    ],
    algorithms: [
      {
        name: "Heapify",
        pseudocode: `function heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    if left < n AND arr[left] > arr[largest]:
        largest = left
    if right < n AND arr[right] > arr[largest]:
        largest = right
    if largest != i:
        swap(arr[i], arr[largest])
        heapify(arr, n, largest)`,
        timeComplexity: "O(log n)",
        spaceComplexity: "O(log n)",
        explanation: "Heapify restores the heap property by moving one out-of-place node down the tree.",
        code: algoCode.heapifyCode,
      },
      {
        name: "Heap Sort",
        pseudocode: `function heapSort(arr):
    build max heap from arr
    for end = arr.length - 1 down to 1:
        swap(arr[0], arr[end])
        heapify(arr, end, 0)
    return arr`,
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(1)",
        explanation: "Heap sort repeatedly moves the largest element to the end, then repairs the remaining heap.",
        code: algoCode.heapSortCode,
      },
      {
        name: "Extract Min / Max",
        pseudocode: `function extractTop(heap):
    top = heap[0]
    heap[0] = heap[lastIndex]
    remove last element
    heapify(heap, heap.length, 0)
    return top`,
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        explanation: "After removing the root, the last element is moved to the top and sifted down to restore order.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "kth-largest-element-in-an-array",
        title: "Kth Largest Element in an Array",
        difficulty: "Medium",
        description: "Find the kth largest value efficiently using a heap or selection technique.",
        leetcodeUrl: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
        hints: ["A size-k min heap keeps only the largest k values", "Quickselect is another option"],
        expectedTimeComplexity: "O(n log k)",
        expectedSpaceComplexity: "O(k)",
      },
      {
        id: "top-k-frequent-elements",
        title: "Top K Frequent Elements",
        difficulty: "Medium",
        description: "Return the k most frequent values from the array.",
        leetcodeUrl: "https://leetcode.com/problems/top-k-frequent-elements/",
        hints: ["Count frequencies first", "Use a heap or bucket-style grouping"],
        expectedTimeComplexity: "O(n log k)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "kth-largest-element-in-an-array-heap",
        title: "Kth Largest Element in an Array",
        difficulty: "Medium",
        description: "Find the kth largest number in an unsorted array without fully sorting the array.",
        leetcodeUrl: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
        hints: ["A min-heap of size k keeps the current k largest values", "Discard smaller values once the heap grows beyond k", "The heap top is the kth largest after processing all numbers"],
        expectedTimeComplexity: "O(n log k)",
        expectedSpaceComplexity: "O(k)",
      },
      {
        id: "merge-k-sorted-lists",
        title: "Merge k Sorted Lists",
        difficulty: "Hard",
        description: "Merge k sorted linked lists into one sorted list efficiently.",
        leetcodeUrl: "https://leetcode.com/problems/merge-k-sorted-lists/",
        hints: ["Push the head of each list into a min-heap", "Repeatedly pop the smallest node and add its next node", "Divide and conquer merging is another strong approach"],
        expectedTimeComplexity: "O(n log k)",
        expectedSpaceComplexity: "O(k)",
      },
      {
        id: "find-median-from-data-stream",
        title: "Find Median from Data Stream",
        difficulty: "Hard",
        description: "Design a structure that supports inserting numbers and returning the median at any time.",
        leetcodeUrl: "https://leetcode.com/problems/find-median-from-data-stream/",
        hints: ["Use one max-heap for the lower half and one min-heap for the upper half", "Rebalance heaps so their sizes differ by at most one", "The median comes from the heap tops"],
        expectedTimeComplexity: "O(log n)",
        expectedSpaceComplexity: "O(n)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "recursion-backtracking",
    title: "Recursion & Backtracking",
    level: "intermediate",
    icon: "🪜",
    color: "from-fuchsia-400 to-rose-500",
    shortDescription: "Techniques that solve problems by exploring smaller states and undoing choices",
    detailedExplanation: `Recursion solves a problem in terms of smaller copies of itself, while backtracking explores a decision tree.

Key Concepts:
• Every recursive solution needs a base case and a shrinking subproblem
• Backtracking chooses, explores, and then un-chooses
• State representation determines whether search is elegant or messy
• Pruning invalid states early saves enormous amounts of work`,
    realWorldAnalogy: "Walking through a maze, marking a path, and stepping back whenever you hit a dead end.",
    visualizerType: "recursion",
    youtubeVideos: [
      {
        id: "REOH22Xwdkk",
        title: "Subsets - Backtracking - Leetcode 78",
        channel: "NeetCode",
        duration: "8:47",
      },
      {
        id: "xouin83ebxE",
        title: "N Queen Problem Using Backtracking Algorithm",
        channel: "Tushar Roy - Coding Made Simple",
        duration: "18:04",
      },
    ],
    algorithms: [
      {
        name: "Recursive Factorial",
        pseudocode: `function factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "A classic example where the solution for n depends directly on the solution for n - 1.",
      },
      {
        name: "Generate All Subsets",
        pseudocode: `function subsets(index, path):
    if index == nums.length:
        answer.add(copy(path))
        return
    subsets(index + 1, path)
    path.push(nums[index])
    subsets(index + 1, path)
    path.pop()`,
        timeComplexity: "O(2^n)",
        spaceComplexity: "O(n)",
        explanation: "Each element creates two branches: exclude it or include it.",
      },
      {
        name: "N-Queens Backtracking",
        pseudocode: `function placeQueens(row):
    if row == n:
        save board
        return
    for col = 0 to n - 1:
        if position is safe:
            place queen at (row, col)
            placeQueens(row + 1)
            remove queen from (row, col)`,
        timeComplexity: "O(n!)",
        spaceComplexity: "O(n)",
        explanation: "The board is filled row by row, and unsafe placements are pruned immediately.",
        code: algoCode.nQueensCode,
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "letter-combinations-of-a-phone-number",
        title: "Letter Combinations of a Phone Number",
        difficulty: "Medium",
        description: "Generate every possible letter string from digit mappings.",
        leetcodeUrl: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
        hints: ["Build the answer one digit at a time", "Backtracking is a natural fit"],
        expectedTimeComplexity: "O(4^n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "n-queens",
        title: "N-Queens",
        difficulty: "Hard",
        description: "Place n queens so that none attack one another.",
        leetcodeUrl: "https://leetcode.com/problems/n-queens/",
        hints: ["Track used columns and diagonals", "Undo each queen placement after recursion returns"],
        expectedTimeComplexity: "O(n!)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "generate-parentheses",
        title: "Generate Parentheses",
        difficulty: "Medium",
        description: "Generate all combinations of n pairs of valid parentheses.",
        leetcodeUrl: "https://leetcode.com/problems/generate-parentheses/",
        hints: ["Build the string one character at a time", "Never place more closing parentheses than opening ones used", "Backtrack after exploring each choice"],
        expectedTimeComplexity: "O(4^n / sqrt(n))",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "subsets",
        title: "Subsets",
        difficulty: "Medium",
        description: "Return every possible subset of the given array of unique numbers.",
        leetcodeUrl: "https://leetcode.com/problems/subsets/",
        hints: ["Each element can be either included or excluded", "Use backtracking or iterative subset expansion", "Record the current path at every recursion level"],
        expectedTimeComplexity: "O(n * 2^n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "permutations",
        title: "Permutations",
        difficulty: "Medium",
        description: "Generate all possible orderings of the numbers in the array.",
        leetcodeUrl: "https://leetcode.com/problems/permutations/",
        hints: ["Choose one unused number for the next position", "Swap-based backtracking is another common pattern", "Undo the choice before exploring the next branch"],
        expectedTimeComplexity: "O(n * n!)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "n-queens",
        title: "N-Queens",
        difficulty: "Hard",
        description: "Place n queens on an n x n chessboard so that no two queens attack each other.",
        leetcodeUrl: "https://leetcode.com/problems/n-queens/",
        hints: ["Place queens row by row", "Track used columns and diagonals for O(1) conflict checks", "Backtrack as soon as a placement becomes invalid"],
        expectedTimeComplexity: "O(n!)",
        expectedSpaceComplexity: "O(n)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "two-pointers-sliding-window",
    title: "Two Pointers & Sliding Window",
    level: "intermediate",
    icon: "↔️",
    color: "from-sky-400 to-cyan-500",
    shortDescription: "Pointer-based patterns for shrinking search space and maintaining moving ranges",
    detailedExplanation: `Two pointers and sliding windows are among the most reusable interview patterns for arrays and strings.

Key Concepts:
• Opposite-direction pointers solve sorted pair problems efficiently
• Same-direction pointers maintain dynamic windows over contiguous ranges
• The trick is keeping the window valid as it expands and contracts
• Many O(n^2) brute force scans become O(n) with these patterns`,
    realWorldAnalogy: "Like adjusting the left and right edges of a camera frame until the scene inside the frame satisfies your condition.",
    visualizerType: "twopointers",
    youtubeVideos: [
      {
        id: "jzZsG8n2R9A",
        title: "3Sum - Leetcode 15 - Python",
        channel: "NeetCode",
        duration: "12:54",
      },
      {
        id: "wiGpQwVHdE0",
        title: "Longest Substring Without Repeating Characters - Leetcode 3 - Python",
        channel: "NeetCode",
        duration: "6:46",
      },
    ],
    algorithms: [
      {
        name: "Two Sum in Sorted Array",
        pseudocode: `function twoSumSorted(nums, target):
    left = 0
    right = nums.length - 1
    while left < right:
        total = nums[left] + nums[right]
        if total == target:
            return [left, right]
        if total < target:
            left++
        else:
            right--
    return [-1, -1]`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "The sorted order tells you which pointer to move after each comparison.",
        code: algoCode.twoPointerCode,
      },
      {
        name: "Longest Unique Substring",
        pseudocode: `function longestUnique(text):
    lastSeen = empty map
    left = 0
    best = 0
    for right = 0 to text.length - 1:
        if text[right] in lastSeen:
            left = max(left, lastSeen[text[right]] + 1)
        lastSeen[text[right]] = right
        best = max(best, right - left + 1)
    return best`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(k)",
        explanation: "The window expands rightward and jumps its left edge forward when duplicates appear.",
      },
      {
        name: "Sliding Window Maximum",
        pseudocode: `function maxSlidingWindow(nums, k):
    deque = empty deque of indices
    for i = 0 to nums.length - 1:
        while deque not empty AND deque.front() <= i - k:
            deque.popFront()
        while deque not empty AND nums[deque.back()] <= nums[i]:
            deque.popBack()
        deque.pushBack(i)
        if i >= k - 1:
            answer.add(nums[deque.front()])
    return answer`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(k)",
        explanation: "A deque stores only useful candidates for the current window maximum.",
        code: algoCode.slidingWindowMaximumCode,
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "3sum",
        title: "3Sum",
        difficulty: "Medium",
        description: "Find all unique triplets that sum to zero.",
        leetcodeUrl: "https://leetcode.com/problems/3sum/",
        hints: ["Sort first", "Fix one element and solve the rest with two pointers"],
        expectedTimeComplexity: "O(n^2)",
        expectedSpaceComplexity: "O(1) excluding output",
      },
      {
        id: "longest-substring-without-repeating-characters",
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        description: "Find the longest substring containing all distinct characters.",
        leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
        hints: ["Keep a moving window", "Track the most recent position of each character"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(k)",
      },
      {
        id: "container-with-most-water-two-pointers",
        title: "Container With Most Water",
        difficulty: "Medium",
        description: "Use a two-pointer strategy to find the pair of lines that traps the maximum water.",
        leetcodeUrl: "https://leetcode.com/problems/container-with-most-water/",
        hints: ["Initialize pointers at both ends of the array", "The shorter line limits the current area", "Move inward from the shorter side to search for a better answer"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "three-sum-closest",
        title: "3Sum Closest",
        difficulty: "Medium",
        description: "Find three numbers whose sum is closest to the target value.",
        leetcodeUrl: "https://leetcode.com/problems/3sum-closest/",
        hints: ["Sort the array first", "Fix one number and use two pointers for the remaining pair", "Update the best answer whenever you find a closer sum"],
        expectedTimeComplexity: "O(n^2)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "remove-duplicates-from-sorted-array",
        title: "Remove Duplicates from Sorted Array",
        difficulty: "Easy",
        description: "Remove duplicates in place from a sorted array and return the length of the unique prefix.",
        leetcodeUrl: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
        hints: ["Use one pointer to read and one pointer to write", "A new unique value should be copied to the next write position", "Because the array is sorted, duplicates appear consecutively"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "greedy-algorithms",
    title: "Greedy Algorithms",
    level: "intermediate",
    icon: "💰",
    color: "from-amber-400 to-yellow-500",
    shortDescription: "Strategies that make the best local choice while aiming for a global optimum",
    detailedExplanation: `Greedy algorithms work when a locally optimal decision can be proven to lead to a globally optimal solution.

Key Concepts:
• Greedy choice property means a best local move stays safe
• Exchange arguments are common proof techniques
• Sorting often reveals the correct order for decisions
• Not every optimization problem is greedy-solvable, so proof matters`,
    realWorldAnalogy: "Packing the most valuable items first when you know that each local choice cannot hurt the final best outcome.",
    visualizerType: "greedy",
    youtubeVideos: [
      {
        id: "ARvQcqJ_-NY",
        title: "3. Greedy Method -  Introduction",
        channel: "Abdul Bari",
        duration: "12:02",
      },
      {
        id: "Yan0cv2cLy8",
        title: "Jump Game - Greedy - Leetcode 55",
        channel: "NeetCode",
        duration: "16:28",
      },
    ],
    algorithms: [
      {
        name: "Activity Selection",
        pseudocode: `function selectActivities(intervals):
    sort intervals by end time ascending
    chosen = []
    lastEnd = -infinity
    for interval in intervals:
        if interval.start >= lastEnd:
            chosen.add(interval)
            lastEnd = interval.end
    return chosen`,
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(1) auxiliary",
        explanation: "Choosing the activity that ends earliest leaves the most room for future choices.",
        code: algoCode.activitySelectionCode,
      },
      {
        name: "Fractional Knapsack",
        pseudocode: `function fractionalKnapsack(items, capacity):
    sort items by value / weight descending
    totalValue = 0
    for item in items:
        if capacity == 0:
            break
        take = min(item.weight, capacity)
        totalValue += take * item.value / item.weight
        capacity -= take
    return totalValue`,
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(1) auxiliary",
        explanation: "The best immediate ratio is always safe when fractions of items are allowed.",
        code: algoCode.fractionalKnapsackCode,
      },
      {
        name: "Huffman Coding Merge",
        pseudocode: `function huffman(freqs):
    heap = min-heap of all frequencies
    while heap.size() > 1:
        a = heap.pop()
        b = heap.pop()
        merged = a + b
        heap.push(merged)
    return heap.pop()`,
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        explanation: "Repeatedly merging the two lightest subtrees creates an optimal prefix code.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "jump-game",
        title: "Jump Game",
        difficulty: "Medium",
        description: "Determine whether the end of the array is reachable.",
        leetcodeUrl: "https://leetcode.com/problems/jump-game/",
        hints: ["Track the farthest reachable index", "A greedy scan is enough"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "non-overlapping-intervals",
        title: "Non-overlapping Intervals",
        difficulty: "Medium",
        description: "Remove the fewest intervals so the rest no longer overlap.",
        leetcodeUrl: "https://leetcode.com/problems/non-overlapping-intervals/",
        hints: ["Sort by finishing time", "Keep the interval that ends earliest when conflicts appear"],
        expectedTimeComplexity: "O(n log n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "jump-game",
        title: "Jump Game",
        difficulty: "Medium",
        description: "Determine whether you can reach the last index when each value gives the maximum jump length from that position.",
        leetcodeUrl: "https://leetcode.com/problems/jump-game/",
        hints: ["Track the farthest index reachable so far", "If you ever land beyond the farthest reachable point, the answer is false", "A backward greedy view also works by shrinking the goal"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "jump-game-ii",
        title: "Jump Game II",
        difficulty: "Medium",
        description: "Find the minimum number of jumps needed to reach the last index.",
        leetcodeUrl: "https://leetcode.com/problems/jump-game-ii/",
        hints: ["Think of each jump as expanding a reachable range", "Greedily track the farthest index you can reach within the current jump", "When you leave the current range, increment the jump count"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "meeting-rooms-ii",
        title: "Meeting Rooms II",
        difficulty: "Medium",
        description: "Given meeting time intervals, compute the minimum number of conference rooms required.",
        leetcodeUrl: "https://leetcode.com/problems/meeting-rooms-ii/",
        hints: ["Sort meetings by start time", "Track ongoing meetings by their ending times", "A min-heap makes it easy to reuse the earliest finishing room"],
        expectedTimeComplexity: "O(n log n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "task-scheduler",
        title: "Task Scheduler",
        difficulty: "Medium",
        description: "Schedule tasks with a cooldown so the total intervals needed to finish all tasks is minimized.",
        leetcodeUrl: "https://leetcode.com/problems/task-scheduler/",
        hints: ["The most frequent task determines the bottleneck", "Count task frequencies first", "Compare the bucket formula with the total number of tasks"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "oops-concepts",
    title: "OOP Concepts for DSA",
    level: "intermediate",
    icon: "🏗️",
    color: "from-slate-400 to-gray-500",
    shortDescription: "Using classes, inheritance, encapsulation, and polymorphism to model data structures cleanly",
    detailedExplanation: `Object-oriented design helps represent nodes, collections, and operations in a structured and reusable way.

Key Concepts:
• Encapsulation hides internal representation behind a clean interface
• Inheritance lets specialized data structures extend base behavior
• Polymorphism supports interchangeable strategies and comparators
• Good OOP design makes DSA implementations easier to test and maintain`,
    realWorldAnalogy: "A toolbox where every drawer has a clear interface, specialized tools extend standard handles, and you can swap compatible tools without changing the whole workshop.",
    visualizerType: "oop",
    youtubeVideos: [
      {
        id: "pTB0EiLXUC8",
        title: "Object-Oriented Programming, Simplified",
        channel: "Programming with Mosh",
        duration: "7:34",
      },
      {
        id: "SiBw7os-_zI",
        title: "Intro to Object Oriented Programming - Crash Course",
        channel: "freeCodeCamp.org",
        duration: "30:18",
      },
    ],
    algorithms: [
      {
        name: "Encapsulated Stack ADT",
        pseudocode: `class Stack:
    private data = []
    function push(value):
        data.append(value)
    function pop():
        if data is empty: return null
        return data.removeLast()
    function size():
        return data.length`,
        timeComplexity: "O(1)",
        spaceComplexity: "O(n)",
        explanation: "Encapsulation keeps the internal array hidden so clients use a safe public interface.",
      },
      {
        name: "Inheritance for Specialized Nodes",
        pseudocode: `class TreeNode:
    value
    left
    right

class ColoredNode extends TreeNode:
    color
    metadata`,
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
        explanation: "Inheritance lets advanced structures such as red-black trees enrich a basic node with extra state.",
      },
      {
        name: "Polymorphic Traversal Strategy",
        pseudocode: `interface TraversalStrategy:
    function traverse(root)

class InorderStrategy implements TraversalStrategy:
    function traverse(root):
        perform inorder traversal

class LevelOrderStrategy implements TraversalStrategy:
    function traverse(root):
        perform queue-based traversal`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(h) or O(w)",
        explanation: "Polymorphism lets the caller swap traversal behavior without changing the surrounding code.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "design-browser-history",
        title: "Design Browser History",
        difficulty: "Medium",
        description: "Design a browser history class that supports visit, back, and forward operations.",
        leetcodeUrl: "https://leetcode.com/problems/design-browser-history/",
        hints: ["Encapsulate state inside a class", "Think about how navigation updates the active pointer"],
        expectedTimeComplexity: "O(1)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "design-linked-list",
        title: "Design Linked List",
        difficulty: "Medium",
        description: "Implement a linked list API with insertion, retrieval, and deletion methods.",
        leetcodeUrl: "https://leetcode.com/problems/design-linked-list/",
        hints: ["A dummy head can simplify edge cases", "Hide internal node manipulation behind methods"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(n)",
      },
    ] satisfies Problem[],
  },

  // ===== ADVANCED TOPICS =====
  {
    slug: "graphs",
    title: "Graphs",
    level: "advanced",
    icon: "🕸️",
    color: "from-purple-400 to-violet-500",
    shortDescription: "Flexible node-edge models for networks, dependencies, and shortest paths",
    detailedExplanation: `Graphs generalize trees by allowing arbitrary connections, cycles, and weighted relationships.

Key Concepts:
• Graphs may be directed, undirected, weighted, or unweighted
• Traversal discovers connectivity and structure
• Path algorithms answer reachability and optimization questions
• Representations such as adjacency lists trade memory for traversal convenience`,
    realWorldAnalogy: "A city map where intersections are nodes, roads are edges, and different problems ask for reachability, shortest paths, or connectivity.",
    visualizerType: "graph",
    youtubeVideos: [
      {
        id: "eQA-m22wjTQ",
        title: "Graph Theory Introduction",
        channel: "WilliamFiset",
        duration: "14:08",
      },
      {
        id: "7fujbpJ0LB4",
        title: "Depth First Search Algorithm | Graph Theory",
        channel: "WilliamFiset",
        duration: "10:20",
      },
    ],
    algorithms: [
      {
        name: "Depth-First Search",
        pseudocode: `function dfs(node):
    mark node as visited
    visit(node)
    for neighbor in graph[node]:
        if neighbor not visited:
            dfs(neighbor)`,
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        explanation: "DFS explores as far as possible along one branch before backtracking.",
        code: algoCode.dfsCode,
      },
      {
        name: "Breadth-First Search",
        pseudocode: `function bfs(start):
    queue = [start]
    mark start as visited
    while queue not empty:
        node = queue.dequeue()
        visit(node)
        for neighbor in graph[node]:
            if neighbor not visited:
                mark neighbor as visited
                queue.enqueue(neighbor)`,
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        explanation: "BFS expands uniformly by distance, which makes it ideal for shortest paths in unweighted graphs.",
      },
      {
        name: "Dijkstra's Shortest Path",
        pseudocode: `function dijkstra(source):
    dist = map filled with infinity
    dist[source] = 0
    pq = min-heap with [0, source]
    while pq not empty:
        [d, node] = pq.pop()
        if d > dist[node]: continue
        for [neighbor, weight] in graph[node]:
            if d + weight < dist[neighbor]:
                dist[neighbor] = d + weight
                pq.push([dist[neighbor], neighbor])
    return dist`,
        timeComplexity: "O((V + E) log V)",
        spaceComplexity: "O(V)",
        explanation: "The closest unsettled node is finalized first, which works because edge weights are non-negative.",
        code: algoCode.dijkstraCode,
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "number-of-islands",
        title: "Number of Islands",
        difficulty: "Medium",
        description: "Count connected components in a 2D grid using graph traversal.",
        leetcodeUrl: "https://leetcode.com/problems/number-of-islands/",
        hints: ["Treat land cells as graph nodes", "DFS or BFS can mark one island at a time"],
        expectedTimeComplexity: "O(r * c)",
        expectedSpaceComplexity: "O(r * c)",
      },
      {
        id: "network-delay-time",
        title: "Network Delay Time",
        difficulty: "Medium",
        description: "Find the time needed for a signal to reach all nodes in a weighted directed graph.",
        leetcodeUrl: "https://leetcode.com/problems/network-delay-time/",
        hints: ["Use Dijkstra from the source node", "The answer is the maximum finalized distance"],
        expectedTimeComplexity: "O((V + E) log V)",
        expectedSpaceComplexity: "O(V)",
      },
      {
        id: "number-of-islands",
        title: "Number of Islands",
        difficulty: "Medium",
        description: "Count how many connected groups of land cells exist in a 2D grid.",
        leetcodeUrl: "https://leetcode.com/problems/number-of-islands/",
        hints: ["Treat each land cell as part of a graph component", "Run DFS or BFS when you find unvisited land", "Mark visited cells so each island is counted once"],
        expectedTimeComplexity: "O(m * n)",
        expectedSpaceComplexity: "O(m * n)",
      },
      {
        id: "clone-graph",
        title: "Clone Graph",
        difficulty: "Medium",
        description: "Create a deep copy of a connected graph while preserving all node values and neighbor relationships.",
        leetcodeUrl: "https://leetcode.com/problems/clone-graph/",
        hints: ["Use DFS or BFS to traverse the original graph", "Store a mapping from original nodes to cloned nodes", "Create each clone once and then wire up its neighbors"],
        expectedTimeComplexity: "O(V + E)",
        expectedSpaceComplexity: "O(V)",
      },
      {
        id: "course-schedule",
        title: "Course Schedule",
        difficulty: "Medium",
        description: "Decide whether all courses can be finished given prerequisite relationships.",
        leetcodeUrl: "https://leetcode.com/problems/course-schedule/",
        hints: ["Model prerequisites as a directed graph", "Detect cycles with DFS states or topological sorting", "A cycle means not all courses can be completed"],
        expectedTimeComplexity: "O(V + E)",
        expectedSpaceComplexity: "O(V + E)",
      },
      {
        id: "word-ladder",
        title: "Word Ladder",
        difficulty: "Hard",
        description: "Find the length of the shortest transformation sequence from beginWord to endWord, changing one letter at a time.",
        leetcodeUrl: "https://leetcode.com/problems/word-ladder/",
        hints: ["Breadth-first search finds the shortest number of transformations", "Preprocess wildcard patterns or generate neighbors efficiently", "Visit each word at most once to avoid repeated work"],
        expectedTimeComplexity: "O(n * m^2)",
        expectedSpaceComplexity: "O(n * m)",
      },
      {
        id: "alien-dictionary",
        title: "Alien Dictionary",
        difficulty: "Hard",
        description: "Derive a valid character ordering from a sorted list of words in an unknown language.",
        leetcodeUrl: "https://leetcode.com/problems/alien-dictionary/",
        hints: ["Compare adjacent words to infer ordering edges", "Build a directed graph over characters", "Topological sorting detects invalid cycles and produces one valid order"],
        expectedTimeComplexity: "O(C)",
        expectedSpaceComplexity: "O(1)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "dynamic-programming",
    title: "Dynamic Programming",
    level: "advanced",
    icon: "🧠",
    color: "from-violet-400 to-purple-500",
    shortDescription: "Breaking problems into overlapping subproblems and reusing computed answers",
    detailedExplanation: `Dynamic programming turns exponential recursion into polynomial solutions by caching repeated work.

Key Concepts:
• Define the state carefully: what information uniquely describes a subproblem
• Recurrence relations connect bigger answers to smaller ones
• Memoization is top-down, tabulation is bottom-up
• Space optimization is often possible when only recent states matter`,
    realWorldAnalogy: "Climbing a staircase while writing down the best answer for each step so you never recompute the same partial journey twice.",
    visualizerType: "dp",
    youtubeVideos: [
      {
        id: "8LusJS5-AGo",
        title: "0/1 Knapsack Problem Dynamic Programming",
        channel: "Tushar Roy - Coding Made Simple",
        duration: "15:50",
      },
      {
        id: "Y0lT9Fck7qI",
        title: "Climbing Stairs - Dynamic Programming - Leetcode 70 - Python",
        channel: "NeetCode",
        duration: "18:08",
      },
    ],
    algorithms: [
      {
        name: "Fibonacci Tabulation",
        pseudocode: `function fib(n):
    if n <= 1:
        return n
    dp = array of size n + 1
    dp[0] = 0
    dp[1] = 1
    for i = 2 to n:
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Each Fibonacci number depends on only two earlier states, making it the classic DP example.",
        code: algoCode.fibonacciDPCode,
      },
      {
        name: "0/1 Knapsack DP",
        pseudocode: `function knapsack(weights, values, capacity):
    dp = matrix of size (n + 1) x (capacity + 1) filled with 0
    for i = 1 to n:
        for w = 0 to capacity:
            dp[i][w] = dp[i - 1][w]
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i][w], values[i - 1] + dp[i - 1][w - weights[i - 1]])
    return dp[n][capacity]`,
        timeComplexity: "O(n * capacity)",
        spaceComplexity: "O(n * capacity)",
        explanation: "For each item and capacity, choose whether taking the item improves the best known value.",
      },
      {
        name: "Longest Increasing Subsequence",
        pseudocode: `function lis(nums):
    dp = array of size nums.length filled with 1
    best = 1
    for i = 0 to nums.length - 1:
        for j = 0 to i - 1:
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
        best = max(best, dp[i])
    return best`,
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(n)",
        explanation: "The best subsequence ending at i depends on earlier positions that can legally precede nums[i].",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "climbing-stairs",
        title: "Climbing Stairs",
        difficulty: "Easy",
        description: "Count the number of ways to reach the top when you can climb 1 or 2 steps.",
        leetcodeUrl: "https://leetcode.com/problems/climbing-stairs/",
        hints: ["The last move came from one step below or two steps below", "This is Fibonacci in disguise"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "longest-increasing-subsequence",
        title: "Longest Increasing Subsequence",
        difficulty: "Medium",
        description: "Find the length of the longest strictly increasing subsequence.",
        leetcodeUrl: "https://leetcode.com/problems/longest-increasing-subsequence/",
        hints: ["Define dp[i] as the best subsequence ending at i", "There is also an O(n log n) patience sorting method"],
        expectedTimeComplexity: "O(n log n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "climbing-stairs",
        title: "Climbing Stairs",
        difficulty: "Easy",
        description: "Count how many distinct ways there are to reach the top when you can climb one or two steps at a time.",
        leetcodeUrl: "https://leetcode.com/problems/climbing-stairs/",
        hints: ["Ways to reach step i depend on the previous two steps", "This is a Fibonacci-style recurrence", "You only need the last two computed values"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "house-robber",
        title: "House Robber",
        difficulty: "Medium",
        description: "Maximize the amount of money robbed from houses without robbing two adjacent houses.",
        leetcodeUrl: "https://leetcode.com/problems/house-robber/",
        hints: ["At each house choose between robbing it or skipping it", "Track the best answers for previous positions", "The recurrence only depends on the last two states"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "coin-change",
        title: "Coin Change",
        difficulty: "Medium",
        description: "Given coin denominations and a target amount, find the fewest coins needed to make that amount.",
        leetcodeUrl: "https://leetcode.com/problems/coin-change/",
        hints: ["Build DP answers from amount 0 up to the target", "Each coin can improve larger amounts based on smaller solved amounts", "Use a sentinel value for unreachable totals"],
        expectedTimeComplexity: "O(amount * n)",
        expectedSpaceComplexity: "O(amount)",
      },
      {
        id: "longest-increasing-subsequence",
        title: "Longest Increasing Subsequence",
        difficulty: "Medium",
        description: "Find the length of the longest subsequence whose values are strictly increasing.",
        leetcodeUrl: "https://leetcode.com/problems/longest-increasing-subsequence/",
        hints: ["A quadratic DP compares each pair of indices", "There is also a faster greedy plus binary search approach", "Track the best subsequence length ending at each position"],
        expectedTimeComplexity: "O(n log n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "unique-paths",
        title: "Unique Paths",
        difficulty: "Medium",
        description: "Count the number of ways to move from the top-left to the bottom-right of a grid using only right and down moves.",
        leetcodeUrl: "https://leetcode.com/problems/unique-paths/",
        hints: ["Each cell can be reached from the top or left", "Dynamic programming on the grid accumulates path counts", "The first row and first column have only one way to reach them"],
        expectedTimeComplexity: "O(m * n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "word-break",
        title: "Word Break",
        difficulty: "Medium",
        description: "Determine whether a string can be segmented into a sequence of words from a dictionary.",
        leetcodeUrl: "https://leetcode.com/problems/word-break/",
        hints: ["DP over prefixes works well here", "A prefix is valid if it ends with a dictionary word after another valid prefix", "Checking shorter prefixes first can simplify the transitions"],
        expectedTimeComplexity: "O(n^2)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "longest-common-subsequence",
        title: "Longest Common Subsequence",
        difficulty: "Hard",
        description: "Find the length of the longest subsequence that appears in both strings in the same relative order.",
        leetcodeUrl: "https://leetcode.com/problems/longest-common-subsequence/",
        hints: ["Use dynamic programming on prefixes of the two strings", "Matching characters extend the diagonal answer by one", "Otherwise take the better answer from skipping one character from either string"],
        expectedTimeComplexity: "O(m * n)",
        expectedSpaceComplexity: "O(m * n)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "tries",
    title: "Tries",
    level: "advanced",
    icon: "🌐",
    color: "from-indigo-400 to-blue-500",
    shortDescription: "Prefix trees that organize strings character by character",
    detailedExplanation: `A trie stores strings by shared prefixes, which makes prefix queries especially efficient.

Key Concepts:
• Each edge usually represents one character transition
• Shared prefixes reuse nodes and save repeated comparisons
• Prefix search is often faster and cleaner than scanning whole strings repeatedly
• Variants support autocomplete, XOR queries, and compressed representations`,
    realWorldAnalogy: "An autocomplete menu that groups words by their common beginnings so matching prefixes instantly narrows the search.",
    visualizerType: "trie",
    youtubeVideos: [
      {
        id: "AXjmTQ8LEoI",
        title: "Trie Data Structure",
        channel: "Tushar Roy - Coding Made Simple",
        duration: "19:40",
      },
      {
        id: "oobqoCJlHA0",
        title: "Implement Trie (Prefix Tree) - Leetcode 208",
        channel: "NeetCode",
        duration: "18:56",
      },
    ],
    algorithms: [
      {
        name: "Insert and Search in Trie",
        pseudocode: `function insert(word):
    node = root
    for ch in word:
        if ch not in node.children:
            node.children[ch] = new TrieNode()
        node = node.children[ch]
    node.isWord = true

function search(word):
    node = walk(word)
    return node != null AND node.isWord`,
        timeComplexity: "O(L)",
        spaceComplexity: "O(L)",
        explanation: "Characters are followed one by one, creating nodes only when needed.",
        code: algoCode.trieInsertSearchCode,
      },
      {
        name: "Prefix Query",
        pseudocode: `function startsWith(prefix):
    node = root
    for ch in prefix:
        if ch not in node.children:
            return false
        node = node.children[ch]
    return true`,
        timeComplexity: "O(L)",
        spaceComplexity: "O(1)",
        explanation: "A prefix exists if the trie can follow every character of that prefix.",
      },
      {
        name: "Delete from Trie",
        pseudocode: `function delete(node, word, depth):
    if node == null:
        return null
    if depth == word.length:
        node.isWord = false
    else:
        ch = word[depth]
        node.children[ch] = delete(node.children[ch], word, depth + 1)
    if node has no children AND node.isWord == false:
        return null
    return node`,
        timeComplexity: "O(L)",
        spaceComplexity: "O(L)",
        explanation: "Deletion clears the terminal marker and prunes nodes that no longer serve any word.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "implement-trie-prefix-tree",
        title: "Implement Trie (Prefix Tree)",
        difficulty: "Medium",
        description: "Build a trie that supports insert, search, and prefix queries.",
        leetcodeUrl: "https://leetcode.com/problems/implement-trie-prefix-tree/",
        hints: ["Store children by character", "Mark nodes that end complete words"],
        expectedTimeComplexity: "O(L)",
        expectedSpaceComplexity: "O(total characters)",
      },
      {
        id: "word-search-ii",
        title: "Word Search II",
        difficulty: "Hard",
        description: "Find multiple dictionary words on a board by combining DFS with a trie.",
        leetcodeUrl: "https://leetcode.com/problems/word-search-ii/",
        hints: ["Use a trie to prune impossible prefixes early", "Mark cells as visited during DFS"],
        expectedTimeComplexity: "O(m * n * 4^L) worst case",
        expectedSpaceComplexity: "O(total characters)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "divide-and-conquer",
    title: "Divide & Conquer",
    level: "advanced",
    icon: "🪓",
    color: "from-rose-400 to-pink-500",
    shortDescription: "Solving problems by splitting them into smaller independent parts and combining answers",
    detailedExplanation: `Divide and conquer breaks a big problem into smaller subproblems of the same shape, solves them recursively, and combines the results.

Key Concepts:
• Split, solve, and combine is the core template
• Balanced splits often lead to logarithmic recursion depth
• Merge sort, closest pair, and fast multiplication are classic examples
• Master theorem often analyzes the recurrence created by the split`,
    realWorldAnalogy: "Organizing a huge stack of papers by splitting it into smaller piles, sorting each pile, and then merging them back together.",
    visualizerType: "divideconquer",
    youtubeVideos: [
      {
        id: "2Rr2tW9zvRg",
        title: "2 Divide And Conquer",
        channel: "Abdul Bari",
        duration: "7:04",
      },
      {
        id: "0oJyNmEbS4w",
        title: "2.9 Strassens Matrix Multiplication",
        channel: "Abdul Bari",
        duration: "23:40",
      },
    ],
    algorithms: [
      {
        name: "Merge Sort as Divide & Conquer",
        pseudocode: `function mergeSort(nums):
    if nums.length <= 1:
        return nums
    mid = floor(nums.length / 2)
    left = mergeSort(nums[0..mid-1])
    right = mergeSort(nums[mid..end])
    return merge(left, right)`,
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        explanation: "The array is divided into halves, each half is solved recursively, and a linear merge combines them.",
        code: algoCode.mergeSortCode,
      },
      {
        name: "Closest Pair of Points",
        pseudocode: `function closestPair(points):
    sort points by x-coordinate
    split into left and right halves
    dLeft = closestPair(left)
    dRight = closestPair(right)
    d = min(dLeft, dRight)
    build strip of points within distance d of middle line
    check limited neighboring points inside strip
    return minimum distance found`,
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        explanation: "Most work is solved in halves, and only a narrow strip around the split needs careful cross-checking.",
      },
      {
        name: "Divide-and-Conquer Matrix Multiplication",
        pseudocode: `function multiply(A, B):
    if matrix size is 1:
        return [[A[0][0] * B[0][0]]]
    split A into A11, A12, A21, A22
    split B into B11, B12, B21, B22
    C11 = multiply(A11, B11) + multiply(A12, B21)
    C12 = multiply(A11, B12) + multiply(A12, B22)
    C21 = multiply(A21, B11) + multiply(A22, B21)
    C22 = multiply(A21, B12) + multiply(A22, B22)
    combine C11, C12, C21, C22`,
        timeComplexity: "O(n^3)",
        spaceComplexity: "O(n^2)",
        explanation: "The matrices are partitioned into quadrants and multiplied recursively before the results are stitched together.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "sort-an-array-divide-and-conquer",
        title: "Sort an Array",
        difficulty: "Medium",
        description: "A standard place to apply merge sort or other divide-and-conquer sorting methods.",
        leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
        hints: ["Split the array until base cases are trivial", "Merging two sorted halves is the key combine step"],
        expectedTimeComplexity: "O(n log n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "maximum-subarray-divide-and-conquer",
        title: "Maximum Subarray",
        difficulty: "Medium",
        description: "Besides Kadane's algorithm, this problem also has a classic divide-and-conquer solution.",
        leetcodeUrl: "https://leetcode.com/problems/maximum-subarray/",
        hints: ["Combine left, right, and crossing answers", "Track best prefix and suffix around the midpoint"],
        expectedTimeComplexity: "O(n log n)",
        expectedSpaceComplexity: "O(log n)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "bit-manipulation",
    title: "Bit Manipulation",
    level: "advanced",
    icon: "⚙️",
    color: "from-slate-500 to-zinc-600",
    shortDescription: "Working directly with binary representation for compact and powerful solutions",
    detailedExplanation: `Bit manipulation treats integers as collections of binary flags, enabling concise and efficient operations.

Key Concepts:
• AND, OR, XOR, and shifts are the core primitives
• Individual bits can encode subsets, states, or parity
• Many counting and uniqueness problems collapse to bit tricks
• Understanding binary representation often reveals elegant optimizations`,
    realWorldAnalogy: "A panel of light switches where each switch represents one yes-or-no fact and combinations of switches represent whole states.",
    visualizerType: "bitmanip",
    youtubeVideos: [
      {
        id: "qMPX1AOa83k",
        title: "Single Number - Leetcode 136 - Python",
        channel: "NeetCode",
        duration: "7:09",
      },
      {
        id: "5Km3utixwZs",
        title: "Number of 1 Bits - Leetcode 191 - Python",
        channel: "NeetCode",
        duration: "11:59",
      },
    ],
    algorithms: [
      {
        name: "XOR for Single Number",
        pseudocode: `function singleNumber(nums):
    answer = 0
    for value in nums:
        answer = answer XOR value
    return answer`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "Equal numbers cancel under XOR, leaving only the unique value behind.",
        code: algoCode.xorSingleNumberCode,
      },
      {
        name: "Counting Set Bits",
        pseudocode: `function countBits(x):
    count = 0
    while x > 0:
        x = x AND (x - 1)
        count++
    return count`,
        timeComplexity: "O(number of set bits)",
        spaceComplexity: "O(1)",
        explanation: "The expression x AND (x - 1) removes the lowest set bit each time.",
        code: algoCode.countSetBitsCode,
      },
      {
        name: "Subset Enumeration with Bitmask",
        pseudocode: `function enumerateSubsets(items):
    total = 1 << items.length
    for mask = 0 to total - 1:
        subset = []
        for bit = 0 to items.length - 1:
            if mask AND (1 << bit):
                subset.add(items[bit])
        output subset`,
        timeComplexity: "O(n * 2^n)",
        spaceComplexity: "O(n)",
        explanation: "Each mask is a binary recipe indicating which elements belong to one subset.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "single-number",
        title: "Single Number",
        difficulty: "Easy",
        description: "Find the element that appears once when every other element appears twice.",
        leetcodeUrl: "https://leetcode.com/problems/single-number/",
        hints: ["XOR equal values together", "Pairs disappear in binary"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)",
      },
      {
        id: "counting-bits",
        title: "Counting Bits",
        difficulty: "Easy",
        description: "Return the number of set bits for every value from 0 through n.",
        leetcodeUrl: "https://leetcode.com/problems/counting-bits/",
        hints: ["Use relationships between nearby numbers", "Dropping the lowest set bit gives a recurrence"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(n)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "segment-trees",
    title: "Segment Trees & Binary Indexed Trees",
    level: "advanced",
    icon: "📊",
    color: "from-emerald-500 to-green-600",
    shortDescription: "Range-query data structures that support fast updates and aggregations",
    detailedExplanation: `Segment trees and Fenwick trees preprocess range information so repeated updates and queries stay efficient.

Key Concepts:
• Segment trees break an array into hierarchical intervals
• Fenwick trees store partial sums using binary index jumps
• Lazy propagation postpones expensive updates until a query needs them
• These structures shine when both updates and range queries are frequent`,
    realWorldAnalogy: "A reporting dashboard that stores summaries for every region and subregion so totals can be updated quickly without recomputing everything.",
    visualizerType: "segmenttree",
    youtubeVideos: [
      {
        id: "ZBHKZF5w4YU",
        title: "Segment Tree Range Minimum Query",
        channel: "Tushar Roy - Coding Made Simple",
        duration: "27:44",
      },
      {
        id: "CWDQJGaN1gY",
        title: "Fenwick Tree or Binary Indexed Tree",
        channel: "Tushar Roy - Coding Made Simple",
        duration: "22:43",
      },
    ],
    algorithms: [
      {
        name: "Build Segment Tree",
        pseudocode: `function build(node, left, right):
    if left == right:
        tree[node] = arr[left]
        return
    mid = floor((left + right) / 2)
    build(node * 2, left, mid)
    build(node * 2 + 1, mid + 1, right)
    tree[node] = merge(tree[node * 2], tree[node * 2 + 1])`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Each node stores a summary for one interval, built from its two children.",
        code: algoCode.buildSegmentTreeCode,
      },
      {
        name: "Range Query with Lazy Propagation",
        pseudocode: `function query(node, left, right, ql, qr):
    if query range fully covers current segment:
        return tree[node]
    push pending lazy updates to children
    mid = floor((left + right) / 2)
    result = identity value
    if ql <= mid: result = merge(result, query(left child))
    if qr > mid: result = merge(result, query(right child))
    return result`,
        timeComplexity: "O(log n)",
        spaceComplexity: "O(log n)",
        explanation: "Lazy tags defer interval updates so each query touches only the relevant logarithmic path.",
        code: algoCode.rangeQueryCode,
      },
      {
        name: "Fenwick Tree Update and Prefix Sum",
        pseudocode: `function update(index, delta):
    while index <= n:
        bit[index] += delta
        index += index & -index

function prefixSum(index):
    total = 0
    while index > 0:
        total += bit[index]
        index -= index & -index
    return total`,
        timeComplexity: "O(log n)",
        spaceComplexity: "O(n)",
        explanation: "Fenwick trees hop through ranges using the lowest set bit of the index.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "range-sum-query-mutable",
        title: "Range Sum Query - Mutable",
        difficulty: "Medium",
        description: "Support point updates and range sum queries efficiently.",
        leetcodeUrl: "https://leetcode.com/problems/range-sum-query-mutable/",
        hints: ["Prefix sums alone fail once updates become frequent", "Use a Fenwick tree or segment tree"],
        expectedTimeComplexity: "O(log n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "count-of-smaller-numbers-after-self",
        title: "Count of Smaller Numbers After Self",
        difficulty: "Hard",
        description: "For each element, count how many smaller elements appear to its right.",
        leetcodeUrl: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
        hints: ["Fenwick trees and segment trees both help with prefix-count queries", "Coordinate compression is useful"],
        expectedTimeComplexity: "O(n log n)",
        expectedSpaceComplexity: "O(n)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "disjoint-set",
    title: "Disjoint Set (Union-Find)",
    level: "advanced",
    icon: "🧷",
    color: "from-blue-500 to-sky-600",
    shortDescription: "A structure for tracking dynamic connectivity among groups of elements",
    detailedExplanation: `Disjoint set union maintains components under repeated merge and connectivity queries.

Key Concepts:
• Each set has a representative root
• Path compression flattens trees during find operations
• Union by rank or size keeps trees shallow
• DSU is essential in connectivity, cycle detection, and MST algorithms`,
    realWorldAnalogy: "Managing friend circles where every person eventually points to one representative of their group, and merging two circles updates only a small amount of structure.",
    visualizerType: "disjointset",
    youtubeVideos: [
      {
        id: "ibjEGG7ylHk",
        title: "Union Find Introduction",
        channel: "WilliamFiset",
        duration: "5:46",
      },
      {
        id: "0jNmHPfA_yE",
        title: "Union Find - Union and Find Operations",
        channel: "WilliamFiset",
        duration: "10:53",
      },
    ],
    algorithms: [
      {
        name: "Find with Path Compression",
        pseudocode: `function find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])
    return parent[x]`,
        timeComplexity: "O(alpha(n)) amortized",
        spaceComplexity: "O(alpha(n)) recursion",
        explanation: "Every find call shortens future paths by pointing nodes directly closer to the representative.",
        code: algoCode.unionFindWithPathCompressionCode,
      },
      {
        name: "Union by Rank",
        pseudocode: `function union(a, b):
    rootA = find(a)
    rootB = find(b)
    if rootA == rootB:
        return false
    if rank[rootA] < rank[rootB]:
        swap(rootA, rootB)
    parent[rootB] = rootA
    if rank[rootA] == rank[rootB]:
        rank[rootA]++
    return true`,
        timeComplexity: "O(alpha(n)) amortized",
        spaceComplexity: "O(1)",
        explanation: "Attaching the shallower tree under the deeper tree keeps future operations fast.",
        code: algoCode.unionFindWithPathCompressionCode,
      },
      {
        name: "Cycle Detection with DSU",
        pseudocode: `function hasCycle(edges):
    initialize parent and rank
    for [u, v] in edges:
        if find(u) == find(v):
            return true
        union(u, v)
    return false`,
        timeComplexity: "O(E * alpha(V))",
        spaceComplexity: "O(V)",
        explanation: "An edge creates a cycle exactly when its endpoints are already in the same component.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "number-of-provinces",
        title: "Number of Provinces",
        difficulty: "Medium",
        description: "Count connected components in an undirected graph represented by an adjacency matrix.",
        leetcodeUrl: "https://leetcode.com/problems/number-of-provinces/",
        hints: ["Union cities that are directly connected", "Count distinct representatives at the end"],
        expectedTimeComplexity: "O(n^2 * alpha(n))",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "redundant-connection",
        title: "Redundant Connection",
        difficulty: "Medium",
        description: "Return the edge that introduces a cycle in a nearly-tree graph.",
        leetcodeUrl: "https://leetcode.com/problems/redundant-connection/",
        hints: ["Process edges one by one", "If two endpoints already share a root, that edge is redundant"],
        expectedTimeComplexity: "O(n * alpha(n))",
        expectedSpaceComplexity: "O(n)",
      },
    ] satisfies Problem[],
  },

  // ===== PRO TOPICS =====
  {
    slug: "advanced-graph-algorithms",
    title: "Advanced Graph Algorithms",
    level: "pro",
    icon: "🛰️",
    color: "from-amber-400 to-orange-500",
    shortDescription: "Graph techniques for ordering, spanning, and optimizing complex networks",
    detailedExplanation: `This level moves beyond basic traversal into graph algorithms with stronger optimization guarantees and richer structure.

Key Concepts:
• Minimum spanning tree algorithms optimize connectivity cost
• Topological ordering solves dependency scheduling in DAGs
• Shortest paths with negative edges require more careful relaxation logic
• Advanced graph problems often combine multiple core patterns`,
    realWorldAnalogy: "Planning airline routes where you may need the cheapest network, a valid dependency order, or path rules that basic traversal alone cannot handle.",
    visualizerType: "advancedgraph",
    youtubeVideos: [
      {
        id: "pSqmAO-m7Lk",
        title: "Dijkstra's Shortest Path Algorithm | Graph Theory",
        channel: "WilliamFiset",
        duration: "24:47",
      },
      {
        id: "eL-KzMXSXXI",
        title: "Topological Sort Algorithm | Graph Theory",
        channel: "WilliamFiset",
        duration: "14:09",
      },
    ],
    algorithms: [
      {
        name: "Kruskal's Minimum Spanning Tree",
        pseudocode: `function kruskal(edges, n):
    sort edges by weight ascending
    initialize DSU of size n
    mstWeight = 0
    for edge in edges:
        if union(edge.u, edge.v):
            mstWeight += edge.weight
    return mstWeight`,
        timeComplexity: "O(E log E)",
        spaceComplexity: "O(V)",
        explanation: "Kruskal greedily adds the lightest safe edge that does not create a cycle.",
        code: algoCode.kruskalCode,
      },
      {
        name: "Topological Sort",
        pseudocode: `function topoSort(graph):
    indegree = count incoming edges for each node
    queue = all nodes with indegree 0
    order = []
    while queue not empty:
        node = queue.dequeue()
        order.add(node)
        for neighbor in graph[node]:
            indegree[neighbor]--
            if indegree[neighbor] == 0:
                queue.enqueue(neighbor)
    return order`,
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        explanation: "Nodes with no unresolved prerequisites are repeatedly scheduled first.",
        code: algoCode.topologicalSortCode,
      },
      {
        name: "Bellman-Ford Relaxation",
        pseudocode: `function bellmanFord(source):
    dist = array filled with infinity
    dist[source] = 0
    repeat V - 1 times:
        updated = false
        for [u, v, w] in edges:
            if dist[u] != infinity AND dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                updated = true
        if not updated:
            break
    return dist`,
        timeComplexity: "O(VE)",
        spaceComplexity: "O(V)",
        explanation: "Repeated relaxation propagates shorter paths even when some edges have negative weights.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "course-schedule-ii",
        title: "Course Schedule II",
        difficulty: "Medium",
        description: "Return a valid ordering of courses given prerequisite constraints.",
        leetcodeUrl: "https://leetcode.com/problems/course-schedule-ii/",
        hints: ["Model prerequisites as a DAG", "Use Kahn's algorithm or DFS topological sort"],
        expectedTimeComplexity: "O(V + E)",
        expectedSpaceComplexity: "O(V)",
      },
      {
        id: "min-cost-to-connect-all-points",
        title: "Min Cost to Connect All Points",
        difficulty: "Medium",
        description: "Connect all points with minimum total Manhattan distance.",
        leetcodeUrl: "https://leetcode.com/problems/min-cost-to-connect-all-points/",
        hints: ["This is an MST problem", "Kruskal and Prim are both valid approaches"],
        expectedTimeComplexity: "O(n^2 log n)",
        expectedSpaceComplexity: "O(n^2)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "advanced-string-algorithms",
    title: "Advanced String Algorithms",
    level: "pro",
    icon: "🧵",
    color: "from-orange-400 to-amber-500",
    shortDescription: "Pattern-matching techniques such as KMP and rolling hashes for fast text search",
    detailedExplanation: `Advanced string algorithms preprocess patterns or windows so repeated matching becomes much faster.

Key Concepts:
• Failure functions let KMP skip unnecessary comparisons
• Rolling hashes compare substrings efficiently with low collision probability
• Prefix-function style thinking reveals repeated structure inside strings
• These tools are essential in search engines, compilers, and bioinformatics`,
    realWorldAnalogy: "Scanning a giant book with a smart bookmark system that remembers what part of the pattern already matched so you never restart from scratch.",
    visualizerType: "stringalgo",
    youtubeVideos: [
      {
        id: "GTJr8OvyEVQ",
        title: "Knuth–Morris–Pratt(KMP) Pattern Matching(Substring search)",
        channel: "Tushar Roy - Coding Made Simple",
        duration: "12:50",
      },
      {
        id: "H4VrKHVG5qI",
        title: "Rabin Karp Substring Search Pattern Matching",
        channel: "Tushar Roy - Coding Made Simple",
        duration: "16:57",
      },
    ],
    algorithms: [
      {
        name: "Knuth-Morris-Pratt (KMP)",
        pseudocode: `function kmpSearch(text, pattern):
    lps = buildLongestPrefixSuffix(pattern)
    i = 0
    j = 0
    while i < text.length:
        if text[i] == pattern[j]:
            i++, j++
            if j == pattern.length:
                report match at i - j
                j = lps[j - 1]
        else if j > 0:
            j = lps[j - 1]
        else:
            i++`,
        timeComplexity: "O(n + m)",
        spaceComplexity: "O(m)",
        explanation: "KMP reuses previously matched prefix information instead of rechecking text characters.",
        code: algoCode.kmpCode,
      },
      {
        name: "Rabin-Karp Rolling Hash",
        pseudocode: `function rabinKarp(text, pattern):
    compute hash of pattern and first window
    for start = 0 to text.length - pattern.length:
        if window hash == pattern hash:
            verify characters to avoid collisions
        slide window by removing old char and adding new char
    return matches`,
        timeComplexity: "O(n + m) average",
        spaceComplexity: "O(1)",
        explanation: "Rolling hashes let consecutive substring windows be compared in constant time on average.",
      },
      {
        name: "Z-Algorithm",
        pseudocode: `function zAlgorithm(s):
    z = array of size s.length filled with 0
    left = 0
    right = 0
    for i = 1 to s.length - 1:
        if i <= right:
            z[i] = min(right - i + 1, z[i - left])
        while i + z[i] < s.length AND s[z[i]] == s[i + z[i]]:
            z[i]++
        if i + z[i] - 1 > right:
            left = i
            right = i + z[i] - 1
    return z`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Z values capture how much of the prefix matches starting at every position, useful for fast pattern reasoning.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "find-the-index-of-the-first-occurrence-in-a-string",
        title: "Find the Index of the First Occurrence in a String",
        difficulty: "Easy",
        description: "Implement substring search efficiently.",
        leetcodeUrl: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
        hints: ["KMP or Rabin-Karp both fit well", "Preprocessing the pattern avoids wasted comparisons"],
        expectedTimeComplexity: "O(n + m)",
        expectedSpaceComplexity: "O(m)",
      },
      {
        id: "repeated-substring-pattern",
        title: "Repeated Substring Pattern",
        difficulty: "Easy",
        description: "Check whether a string can be constructed by repeating one of its substrings.",
        leetcodeUrl: "https://leetcode.com/problems/repeated-substring-pattern/",
        hints: ["Prefix-function style reasoning works well", "Think about proper prefix and suffix overlap"],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(n)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "advanced-dp",
    title: "Advanced Dynamic Programming",
    level: "pro",
    icon: "♟️",
    color: "from-orange-500 to-red-500",
    shortDescription: "Bitmask, digit, and state-compression techniques for hard optimization problems",
    detailedExplanation: `Advanced DP expands the state space and requires deeper thinking about compression, transitions, and constraints.

Key Concepts:
• Bitmask DP tracks subsets compactly in a single integer
• Digit DP counts numbers with positional restrictions
• State compression reduces infeasible dimensions into manageable representations
• Transition design and memo key choice make or break the solution`,
    realWorldAnalogy: "A strategy game where your score depends not just on where you are, but on which items you have collected and what digits or states remain possible.",
    visualizerType: "advanceddp",
    youtubeVideos: [
      {
        id: "CE2b_-XfVDk",
        title: "Longest Increasing Subsequence",
        channel: "Tushar Roy - Coding Made Simple",
        duration: "7:09",
      },
      {
        id: "We3YDTzNXEk",
        title: "Minimum Edit Distance Dynamic Programming",
        channel: "Tushar Roy - Coding Made Simple",
        duration: "9:47",
      },
    ],
    algorithms: [
      {
        name: "Bitmask DP for Subset States",
        pseudocode: `function tsp(mask, last):
    if mask has all cities:
        return cost to return home
    if memo[mask][last] exists:
        return memo[mask][last]
    answer = infinity
    for next = 0 to n - 1:
        if next not in mask:
            answer = min(answer, dist[last][next] + tsp(mask OR (1 << next), next))
    memo[mask][last] = answer
    return answer`,
        timeComplexity: "O(n^2 * 2^n)",
        spaceComplexity: "O(n * 2^n)",
        explanation: "The bitmask compactly records which states are already used, making subset transitions explicit.",
        code: algoCode.bitmaskDPCode,
      },
      {
        name: "Digit DP",
        pseudocode: `function digitDP(pos, tight, started, state):
    if pos == digits.length:
        return value based on state
    limit = digits[pos] if tight else 9
    answer = 0
    for digit = 0 to limit:
        nextTight = tight AND (digit == limit)
        nextStarted = started OR (digit != 0)
        answer += digitDP(pos + 1, nextTight, nextStarted, transition(state, digit, nextStarted))
    return answer`,
        timeComplexity: "O(positions * states * 10)",
        spaceComplexity: "O(positions * states)",
        explanation: "Digit DP counts valid numbers by building them digit by digit under an upper-bound constraint.",
      },
      {
        name: "Tree DP Rerooting",
        pseudocode: `function dfs1(node, parent):
    compute dp values from children upward

function dfs2(node, parent):
    propagate parent contribution into children
    reroot answer for each child`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Rerooting derives answers for every root choice by reusing work from neighboring roots.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "partition-to-k-equal-sum-subsets",
        title: "Partition to K Equal Sum Subsets",
        difficulty: "Medium",
        description: "Determine whether the array can be partitioned into k subsets with equal sums.",
        leetcodeUrl: "https://leetcode.com/problems/partition-to-k-equal-sum-subsets/",
        hints: ["Bitmask DP can represent which elements are already used", "Sorting larger numbers first can prune faster"],
        expectedTimeComplexity: "O(n * 2^n)",
        expectedSpaceComplexity: "O(2^n)",
      },
      {
        id: "number-of-digit-one",
        title: "Number of Digit One",
        difficulty: "Hard",
        description: "Count how many times digit 1 appears in all non-negative integers up to n.",
        leetcodeUrl: "https://leetcode.com/problems/number-of-digit-one/",
        hints: ["Think position by position", "A digit-DP or mathematical place-value analysis both work"],
        expectedTimeComplexity: "O(log n)",
        expectedSpaceComplexity: "O(log n)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "network-flow",
    title: "Network Flow",
    level: "pro",
    icon: "🚰",
    color: "from-red-400 to-orange-500",
    shortDescription: "Algorithms for moving maximum feasible flow through capacitated directed networks",
    detailedExplanation: `Network flow models how much resource can move from a source to a sink through capacity-limited edges.

Key Concepts:
• Residual graphs represent how much additional flow can still be pushed
• Augmenting paths improve the current solution step by step
• Max-flow min-cut connects feasible transport to structural bottlenecks
• Matching, circulation, and assignment problems often reduce to flow`,
    realWorldAnalogy: "A water pipeline system where every pipe has a capacity and you want to maximize how much water reaches the destination.",
    visualizerType: "networkflow",
    youtubeVideos: [
      {
        id: "LdOnanfc5TM",
        title: "Max Flow Ford Fulkerson | Network Flow | Graph Theory",
        channel: "WilliamFiset",
        duration: "13:25",
      },
      {
        id: "M6cm8UeeziI",
        title: "Dinic's Algorithm | Network Flow | Graph Theory",
        channel: "WilliamFiset",
        duration: "11:49",
      },
    ],
    algorithms: [
      {
        name: "Ford-Fulkerson Method",
        pseudocode: `function maxFlow(source, sink):
    flow = 0
    while there exists augmenting path in residual graph:
        bottleneck = minimum residual capacity on path
        push bottleneck along path
        update residual capacities
        flow += bottleneck
    return flow`,
        timeComplexity: "O(E * maxFlow) in integer-capacity cases",
        spaceComplexity: "O(V + E)",
        explanation: "Each augmenting path sends extra flow until no path from source to sink remains.",
      },
      {
        name: "Edmonds-Karp",
        pseudocode: `function edmondsKarp(source, sink):
    flow = 0
    while bfs finds shortest augmenting path by edges:
        bottleneck = residual minimum on that path
        augment path by bottleneck
        flow += bottleneck
    return flow`,
        timeComplexity: "O(VE^2)",
        spaceComplexity: "O(V + E)",
        explanation: "Using BFS for augmenting paths gives a provable polynomial-time max-flow algorithm.",
      },
      {
        name: "Dinic's Algorithm",
        pseudocode: `function dinic(source, sink):
    flow = 0
    while bfs builds level graph:
        pointer = array filled with 0
        while pushed = dfsBlockingFlow(source, sink, infinity):
            flow += pushed
    return flow`,
        timeComplexity: "O(V^2 E) general case",
        spaceComplexity: "O(V + E)",
        explanation: "Dinic speeds up flow by sending blocking flows through layered residual graphs.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "maximum-number-of-accepted-invitations",
        title: "Maximum Number of Accepted Invitations",
        difficulty: "Hard",
        description: "Match as many boys and girls as possible, which can be modeled as bipartite matching and solved via flow ideas.",
        leetcodeUrl: "https://leetcode.com/problems/maximum-number-of-accepted-invitations/",
        hints: ["This is maximum bipartite matching", "Flow or augmenting-path thinking applies directly"],
        expectedTimeComplexity: "O(VE)",
        expectedSpaceComplexity: "O(V + E)",
      },
      {
        id: "maximum-compatibility-score-sum",
        title: "Maximum Compatibility Score Sum",
        difficulty: "Medium",
        description: "Assign students to mentors to maximize total compatibility, a setting closely related to matching and flow formulations.",
        leetcodeUrl: "https://leetcode.com/problems/maximum-compatibility-score-sum/",
        hints: ["Model assignment quality between two partitions", "Bitmask DP and matching perspectives are both useful"],
        expectedTimeComplexity: "O(n^2 * 2^n)",
        expectedSpaceComplexity: "O(2^n)",
      },
    ] satisfies Problem[],
  },
  {
    slug: "computational-geometry",
    title: "Computational Geometry",
    level: "pro",
    icon: "📐",
    color: "from-yellow-400 to-orange-600",
    shortDescription: "Algorithms for points, lines, hulls, and spatial relationships in 2D space",
    detailedExplanation: `Computational geometry reasons about shapes, orientations, and relative positions with algorithmic precision.

Key Concepts:
• Cross products reveal turn direction and orientation
• Convex hull algorithms wrap the outer boundary of points
• Sorting by angle or coordinate is a frequent first step
• Numerical robustness matters because geometry is sensitive to edge cases`,
    realWorldAnalogy: "Surveying land with compass turns and boundary lines to determine the exact outer fence and relationships between points.",
    visualizerType: "geometry",
    youtubeVideos: [
      {
        id: "Vu84lmMzP2o",
        title: "Convex Hull Jarvis March(Gift wrapping algorithm)",
        channel: "Tushar Roy - Coding Made Simple",
        duration: "18:04",
      },
      {
        id: "B2AJoQSZf4M",
        title: "Convex Hull Algorithm - Graham Scan and Jarvis March tutorial",
        channel: "Stable Sort",
        duration: "7:24",
      },
    ],
    algorithms: [
      {
        name: "Orientation Test",
        pseudocode: `function orientation(a, b, c):
    value = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
    if value > 0: return counterclockwise
    if value < 0: return clockwise
    return collinear`,
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
        explanation: "The sign of the cross product tells whether three points turn left, right, or stay on one line.",
      },
      {
        name: "Graham Scan Convex Hull",
        pseudocode: `function grahamScan(points):
    choose lowest point as pivot
    sort remaining points by polar angle around pivot
    stack = [pivot]
    for point in sorted points:
        while stack has at least 2 points AND turn formed is not counterclockwise:
            stack.pop()
        stack.push(point)
    return stack`,
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        explanation: "Points are added in angular order while non-hull turns are removed from the stack.",
      },
      {
        name: "Line Sweep for Events",
        pseudocode: `function sweep(events):
    sort events by x-coordinate
    active = ordered structure
    for event in events:
        if event is opening:
            add object to active
        else if event is closing:
            remove object from active
        query nearby objects in active if needed`,
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        explanation: "A sweep line transforms spatial reasoning into a sorted event-processing problem.",
      },
    ] satisfies Algorithm[],
    problems: [
      {
        id: "erect-the-fence",
        title: "Erect the Fence",
        difficulty: "Hard",
        description: "Return all trees that lie on the convex hull of the given set of points.",
        leetcodeUrl: "https://leetcode.com/problems/erect-the-fence/",
        hints: ["Convex hull algorithms such as Graham scan or monotonic chain apply", "Keep collinear boundary points when required"],
        expectedTimeComplexity: "O(n log n)",
        expectedSpaceComplexity: "O(n)",
      },
      {
        id: "max-points-on-a-line",
        title: "Max Points on a Line",
        difficulty: "Hard",
        description: "Find the largest number of points that lie on the same straight line.",
        leetcodeUrl: "https://leetcode.com/problems/max-points-on-a-line/",
        hints: ["Normalize slopes carefully", "Anchor one point and count matching directions"],
        expectedTimeComplexity: "O(n^2)",
        expectedSpaceComplexity: "O(n)",
      },
    ] satisfies Problem[],
  },
];

export function getTopicsByLevel(level: Level): Topic[] {
  return topics.filter((t) => t.level === level);
}

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}
