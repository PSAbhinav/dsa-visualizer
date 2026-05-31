import { topics } from "./topics";
import type { Quiz, QuizQuestion, Topic } from "./types";

type TopicQuizTemplate = {
  bestScenario: string;
  bestAlgorithm: string;
  codeSnippet: string;
  codeOptions: string[];
  codeAnswer: number;
  codeExplanation: string;
  edgeCaseQuestion: string;
  edgeCaseOptions: string[];
  edgeCaseAnswer: number;
  edgeCaseExplanation: string;
  conceptQuestion: string;
  conceptOptions: string[];
  conceptAnswer: number;
  conceptExplanation: string;
};

const TIME_COMPLEXITY_OPTIONS = [
  "O(1)",
  "O(log n)",
  "O(n)",
  "O(n + m)",
  "O(n log n)",
  "O(n^2)",
  "O(2^n)",
  "O(n!)",
  "O(V + E)",
  "O((V + E) log V)",
  "O(VE)",
  "O(E log E)",
  "O(alpha(n)) amortized",
  "O(n * capacity)",
  "O(n * 2^n)",
  "O(r * c)",
  "O(L)",
  "O(log min(a, b))",
];

const SPACE_COMPLEXITY_OPTIONS = [
  "O(1)",
  "O(log n)",
  "O(n)",
  "O(h)",
  "O(w)",
  "O(k)",
  "O(V)",
  "O(V + E)",
  "O(r * c)",
  "O(L)",
  "O(n * capacity)",
  "O(n * 2^n)",
];

const FALLBACK_ALGORITHM_OPTIONS = [
  "Brute-force scanning",
  "Nested loops only",
  "Randomized guessing",
  "Repeated full recomputation",
];

const topicTemplates: Record<string, TopicQuizTemplate> = {
  "arrays": {
    "bestScenario": "you must answer many range-sum queries after one preprocessing pass",
    "bestAlgorithm": "Prefix Sum Construction",
    "codeSnippet": "const arr = [4, 1, 7];\nconsole.log(arr[1] + arr[arr.length - 1]);",
    "codeOptions": ["5", "7", "8", "11"],
    "codeAnswer": 2,
    "codeExplanation": "arr[1] is 1 and the last element is 7, so the printed sum is 8.",
    "edgeCaseQuestion": "Which edge case should you guard against before reading arr[0] in an array algorithm?",
    "edgeCaseOptions": ["The array is empty", "The array is already sorted", "The array contains duplicates", "The array is stored contiguously"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "Accessing arr[0] on an empty array is invalid, so the empty-input case should be checked first.",
    "conceptQuestion": "Why is direct array access by index so fast?",
    "conceptOptions": ["Because arrays store elements contiguously and compute an offset", "Because arrays automatically stay sorted", "Because arrays never resize", "Because arrays avoid hashing"],
    "conceptAnswer": 0,
    "conceptExplanation": "Indexing computes a memory offset from the base address, which gives constant-time access."
  },
  "strings": {
    "bestScenario": "you need to decide whether two words are rearrangements of the same letters",
    "bestAlgorithm": "Anagram Frequency Count",
    "codeSnippet": "const word = \"level\";\nconsole.log(word.split(\"\").reverse().join(\"\"));",
    "codeOptions": ["level", "lelev", "velle", "error"],
    "codeAnswer": 0,
    "codeExplanation": "Reversing \"level\" still produces \"level\" because it is a palindrome.",
    "edgeCaseQuestion": "Which edge case often matters first when writing string-pointer logic?",
    "edgeCaseOptions": ["An empty string", "A string with only lowercase letters", "A string stored in UTF-8", "A string longer than 3 characters"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "Empty strings can make loops skip entirely or cause invalid indexing if not handled cleanly.",
    "conceptQuestion": "Which statement about strings in many languages is most accurate?",
    "conceptOptions": ["Strings are often immutable, so repeated concatenation may allocate new memory", "Strings always support O(1) insertion in the middle", "Strings cannot be traversed with two pointers", "Strings automatically ignore case"],
    "conceptAnswer": 0,
    "conceptExplanation": "Many languages treat strings as immutable, so building new strings repeatedly can create extra overhead."
  },
  "linked-lists": {
    "bestScenario": "you need to detect whether a singly linked list contains a cycle without extra memory",
    "bestAlgorithm": "Detect Cycle (Floyd's Algorithm)",
    "codeSnippet": "const head = { val: 1, next: { val: 2, next: null } };\nconsole.log(head.next?.val ?? -1);",
    "codeOptions": ["1", "2", "-1", "null"],
    "codeAnswer": 1,
    "codeExplanation": "head.next points to the second node, whose value is 2.",
    "edgeCaseQuestion": "Which linked-list edge case must be handled before reversing nodes?",
    "edgeCaseOptions": ["head is null", "The values are unsorted", "The list length is even", "There are no duplicate values"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "An empty list has no nodes to reverse, so the null-head case should return immediately.",
    "conceptQuestion": "Why are linked lists good at head insertion?",
    "conceptOptions": ["The new node can be wired in with pointer updates only", "The nodes automatically rebalance", "Binary search works on linked lists", "Middle elements never move in arrays"],
    "conceptAnswer": 0,
    "conceptExplanation": "Inserting at the head only changes pointers, so it avoids shifting many elements."
  },
  "stacks": {
    "bestScenario": "you need to validate nested brackets in a string",
    "bestAlgorithm": "Balanced Parentheses",
    "codeSnippet": "const stack = [];\nstack.push(3);\nstack.push(5);\nconsole.log(stack.pop());",
    "codeOptions": ["3", "5", "8", "undefined"],
    "codeAnswer": 1,
    "codeExplanation": "Stacks are LIFO, so the last pushed value (5) is popped first.",
    "edgeCaseQuestion": "Which stack edge case should be checked before calling pop()?",
    "edgeCaseOptions": ["The stack is empty", "The stack is sorted", "The stack contains duplicates", "The stack has an even size"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "Popping from an empty stack causes underflow or invalid access.",
    "conceptQuestion": "Why does a monotonic stack solve next-greater problems efficiently?",
    "conceptOptions": ["Each element is pushed and popped at most once", "It sorts the array instantly", "It uses recursion to skip comparisons", "It requires random access"],
    "conceptAnswer": 0,
    "conceptExplanation": "The monotonic invariant ensures each element is handled a constant number of times, giving linear complexity."
  },
  "queues": {
    "bestScenario": "you need to process nodes level by level in the order they are discovered",
    "bestAlgorithm": "Level Order Processing",
    "codeSnippet": "const queue = [10, 20];\nconst removed = queue.shift();\nconsole.log(removed);",
    "codeOptions": ["10", "20", "30", "undefined"],
    "codeAnswer": 0,
    "codeExplanation": "Queues are FIFO, so the first inserted element (10) leaves first.",
    "edgeCaseQuestion": "Which circular-queue edge case needs explicit handling?",
    "edgeCaseOptions": ["The queue is full or empty when front and rear wrap around", "The queue contains negative numbers", "The queue is implemented with objects", "The queue length is prime"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "Circular queues reuse indices, so full and empty states must be distinguished carefully.",
    "conceptQuestion": "What makes queues the natural fit for BFS?",
    "conceptOptions": ["They preserve the discovery order layer by layer", "They always keep data sorted", "They support O(1) random access", "They avoid visited arrays"],
    "conceptAnswer": 0,
    "conceptExplanation": "BFS needs first-discovered nodes to be processed first, which is exactly FIFO behavior."
  },
  "sorting-algorithms": {
    "bestScenario": "you need a guaranteed O(n log n) stable sort for large input",
    "bestAlgorithm": "Merge Sort",
    "codeSnippet": "const nums = [3, 1, 2];\nnums.sort((a, b) => a - b);\nconsole.log(nums[1]);",
    "codeOptions": ["1", "2", "3", "undefined"],
    "codeAnswer": 1,
    "codeExplanation": "After sorting, nums becomes [1, 2, 3], so index 1 stores 2.",
    "edgeCaseQuestion": "Which case is a strong match for insertion sort?",
    "edgeCaseOptions": ["A nearly sorted array", "A graph with cycles", "A disconnected tree", "A set of hash collisions"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "Insertion sort performs especially well on nearly sorted input because each element moves only a little.",
    "conceptQuestion": "Why is quick sort often fast in practice despite its worst case?",
    "conceptOptions": ["Its partitions are usually balanced enough on average", "It never uses recursion", "It is always stable", "It uses O(n) auxiliary arrays"],
    "conceptAnswer": 0,
    "conceptExplanation": "Quick sort tends to create reasonably balanced partitions on average, leading to O(n log n) expected time."
  },
  "searching": {
    "bestScenario": "you have a sorted array and need repeated exact lookups quickly",
    "bestAlgorithm": "Binary Search",
    "codeSnippet": "const arr = [1, 3, 5, 7, 9];\nconst mid = Math.floor((0 + arr.length - 1) / 2);\nconsole.log(arr[mid]);",
    "codeOptions": ["3", "5", "7", "9"],
    "codeAnswer": 1,
    "codeExplanation": "The middle index is 2, and arr[2] is 5.",
    "edgeCaseQuestion": "Which edge case must binary search handle correctly?",
    "edgeCaseOptions": ["The target is absent and low crosses high", "The array contains only positive numbers", "The array uses zero-based indexing", "The array length is odd"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "When low exceeds high, the search interval is empty and the target is not present.",
    "conceptQuestion": "What property makes binary search valid?",
    "conceptOptions": ["The search space is sorted or monotonic", "The array contains unique values", "The input is a linked list", "The data structure is a heap"],
    "conceptAnswer": 0,
    "conceptExplanation": "Binary search relies on order to discard half of the remaining space after each comparison."
  },
  "basic-math": {
    "bestScenario": "you need the greatest common divisor of two numbers efficiently",
    "bestAlgorithm": "Euclidean GCD",
    "codeSnippet": "let a = 48;\nlet b = 18;\nwhile (b !== 0) {\n  [a, b] = [b, a % b];\n}\nconsole.log(a);",
    "codeOptions": ["3", "6", "12", "18"],
    "codeAnswer": 1,
    "codeExplanation": "The Euclidean algorithm reduces the pair until b becomes 0, leaving gcd(48, 18) = 6.",
    "edgeCaseQuestion": "Which edge case matters when implementing gcd(a, b)?",
    "edgeCaseOptions": ["One value may be 0", "Both values may be even", "The numbers may be sorted", "The numbers may be prime"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "gcd(a, 0) is a valid base case and should return |a| immediately.",
    "conceptQuestion": "Why does fast modular exponentiation beat repeated multiplication?",
    "conceptOptions": ["It squares the base while halving the exponent", "It stores every intermediate result", "It requires prime exponents", "It replaces multiplication with addition only"],
    "conceptAnswer": 0,
    "conceptExplanation": "Exponentiation by squaring reduces the exponent logarithmically, making the process much faster."
  },
  "matrix-2d-arrays": {
    "bestScenario": "you need many submatrix-sum queries after preprocessing",
    "bestAlgorithm": "2D Prefix Sum",
    "codeSnippet": "const grid = [[1, 2], [3, 4]];\nconsole.log(grid[1][0] + grid[0][1]);",
    "codeOptions": ["3", "4", "5", "6"],
    "codeAnswer": 2,
    "codeExplanation": "grid[1][0] is 3 and grid[0][1] is 2, so the sum is 5.",
    "edgeCaseQuestion": "Which edge case is important before accessing matrix[0][0]?",
    "edgeCaseOptions": ["The matrix may be empty", "The matrix may be square", "The values may be positive", "The rows may already be sorted"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "An empty matrix has no first row or first element, so indexing must be guarded.",
    "conceptQuestion": "Why are row and column bounds checks critical in grid problems?",
    "conceptOptions": ["Neighbors can fall outside the matrix", "Matrices always resize automatically", "2D arrays only support diagonal moves", "Bounds checks make all algorithms O(1)"],
    "conceptAnswer": 0,
    "conceptExplanation": "Every move must stay within valid row and column ranges to avoid invalid access."
  },
  "binary-trees": {
    "bestScenario": "you need to process nodes one level at a time from top to bottom",
    "bestAlgorithm": "Level Order Traversal",
    "codeSnippet": "const root = { val: 1, left: { val: 2 }, right: { val: 3 } };\nconsole.log(root.left.val + root.right.val);",
    "codeOptions": ["3", "4", "5", "6"],
    "codeAnswer": 2,
    "codeExplanation": "The left child is 2 and the right child is 3, so the sum is 5.",
    "edgeCaseQuestion": "Which binary-tree edge case should traversal code handle first?",
    "edgeCaseOptions": ["The root is null", "The tree is balanced", "The node values are distinct", "The tree has leaves"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "A null root means the tree is empty, so traversal should stop immediately.",
    "conceptQuestion": "What does h usually represent in DFS space complexity O(h)?",
    "conceptOptions": ["The height of the tree", "The number of leaves", "The width of the widest level", "The hash-map size"],
    "conceptAnswer": 0,
    "conceptExplanation": "Recursive DFS keeps a stack along one root-to-leaf path, whose size is bounded by tree height."
  },
  "binary-search-trees": {
    "bestScenario": "you want to exploit ordered left/right subtree rules to find a value quickly",
    "bestAlgorithm": "Search in BST",
    "codeSnippet": "const root = { val: 8, left: { val: 3 }, right: { val: 10 } };\nconsole.log(10 > root.val ? root.right.val : root.left.val);",
    "codeOptions": ["3", "8", "10", "undefined"],
    "codeAnswer": 2,
    "codeExplanation": "Because 10 > 8, the expression follows the right child and prints 10.",
    "edgeCaseQuestion": "Which BST edge case often breaks validation logic?",
    "edgeCaseOptions": ["A node violates an ancestor bound even if it fits its parent", "The tree has exactly three nodes", "The values are positive", "The tree is complete"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "BST validation must respect the full valid range from ancestors, not just the direct parent.",
    "conceptQuestion": "Why can BST search degrade to O(n)?",
    "conceptOptions": ["The tree can become skewed like a linked list", "BSTs cannot store duplicates", "Traversals require a queue", "Every insertion rebalances automatically"],
    "conceptAnswer": 0,
    "conceptExplanation": "If the tree becomes highly unbalanced, its height grows to n and searches lose their logarithmic benefit."
  },
  "hash-tables": {
    "bestScenario": "you need near-constant-time membership checks and updates by key",
    "bestAlgorithm": "Hash Table Insert / Update",
    "codeSnippet": "const counts = new Map();\ncounts.set(\"a\", 1);\ncounts.set(\"a\", (counts.get(\"a\") ?? 0) + 2);\nconsole.log(counts.get(\"a\"));",
    "codeOptions": ["1", "2", "3", "undefined"],
    "codeAnswer": 2,
    "codeExplanation": "The second update raises the stored value from 1 to 3.",
    "edgeCaseQuestion": "Which edge case should a hash-table design account for?",
    "edgeCaseOptions": ["Different keys may collide into the same bucket", "All keys are always unique hashes", "Buckets never resize", "Lookups require sorted keys"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "Collisions are normal, so chaining or probing is needed to handle them correctly.",
    "conceptQuestion": "Why does rehashing improve average performance?",
    "conceptOptions": ["It lowers the load factor and shortens collision chains", "It sorts the keys lexicographically", "It removes the need for a hash function", "It makes worst-case lookups impossible"],
    "conceptAnswer": 0,
    "conceptExplanation": "Growing the table reduces crowding, which helps keep average insert and lookup costs close to O(1)."
  },
  "heaps": {
    "bestScenario": "you repeatedly need the smallest or largest element while data keeps changing",
    "bestAlgorithm": "Extract Min / Max",
    "codeSnippet": "const heap = [1, 3, 5, 7];\nconsole.log(heap[0]);",
    "codeOptions": ["1", "3", "5", "7"],
    "codeAnswer": 0,
    "codeExplanation": "In a min-heap, the root at index 0 stores the minimum element.",
    "edgeCaseQuestion": "Which heap edge case should be handled during extract?",
    "edgeCaseOptions": ["The heap contains only one element", "The heap values are unsorted", "The heap array length is even", "The heap contains duplicates"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "Removing the only element should leave an empty heap without further sift operations.",
    "conceptQuestion": "Why is heap sort not stable by default?",
    "conceptOptions": ["Swaps can change the relative order of equal keys", "It uses recursion", "It requires extra arrays", "It only works on integers"],
    "conceptAnswer": 0,
    "conceptExplanation": "Repeated root swaps and heapify steps can reorder equal elements, so stability is not guaranteed."
  },
  "recursion-backtracking": {
    "bestScenario": "you need to explore every valid choice path and undo decisions cleanly",
    "bestAlgorithm": "Generate All Subsets",
    "codeSnippet": "function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\nconsole.log(factorial(4));",
    "codeOptions": ["6", "12", "24", "120"],
    "codeAnswer": 2,
    "codeExplanation": "factorial(4) = 4 × 3 × 2 × 1 = 24.",
    "edgeCaseQuestion": "Which recursive edge case must be defined clearly?",
    "edgeCaseOptions": ["The base case that stops further calls", "Whether the array is sorted", "Whether values are unique", "Whether the recursion depth is even"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "Without a correct base case, recursion can continue indefinitely or compute wrong answers.",
    "conceptQuestion": "What does backtracking do after trying a choice?",
    "conceptOptions": ["It undoes the choice before exploring the next branch", "It sorts the remaining input", "It memoizes every branch automatically", "It converts recursion into iteration"],
    "conceptAnswer": 0,
    "conceptExplanation": "Backtracking explores one choice, then restores the state so other choices can be tried correctly."
  },
  "two-pointers-sliding-window": {
    "bestScenario": "you need the longest substring without repeating characters",
    "bestAlgorithm": "Longest Unique Substring",
    "codeSnippet": "const nums = [1, 2, 3, 4];\nlet left = 0;\nlet right = nums.length - 1;\nconsole.log(nums[left] + nums[right]);",
    "codeOptions": ["3", "4", "5", "6"],
    "codeAnswer": 2,
    "codeExplanation": "The two pointers start at 1 and 4, so the printed sum is 5.",
    "edgeCaseQuestion": "Which sliding-window edge case commonly requires care?",
    "edgeCaseOptions": ["The left pointer must advance when the window becomes invalid", "The input must always be sorted", "The window can never shrink", "The algorithm only works on trees"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "When a window violates the constraint, moving only the right pointer is not enough; the left side must be adjusted.",
    "conceptQuestion": "Why are two pointers effective on sorted arrays for pair problems?",
    "conceptOptions": ["Pointer moves can be guided by whether the current sum is too small or too large", "Sorting is unnecessary for pointer movement", "The method depends on hashing only", "It guarantees O(log n) time"],
    "conceptAnswer": 0,
    "conceptExplanation": "Order lets you decide which pointer to move after each comparison, often yielding a linear scan."
  },
  "greedy-algorithms": {
    "bestScenario": "items can be split and you want maximum value under a weight limit",
    "bestAlgorithm": "Fractional Knapsack",
    "codeSnippet": "const intervals = [[1, 3], [2, 4], [4, 5]];\nconst sorted = intervals.sort((a, b) => a[1] - b[1]);\nconsole.log(sorted[0][1]);",
    "codeOptions": ["1", "2", "3", "4"],
    "codeAnswer": 2,
    "codeExplanation": "Sorting by end time places [1, 3] first, so the first ending value is 3.",
    "edgeCaseQuestion": "Which warning applies to greedy strategies?",
    "edgeCaseOptions": ["A locally best choice is only safe when the problem has the right greedy property", "Greedy methods always give optimal answers", "Greedy solutions require dynamic programming tables", "Greedy methods cannot sort input"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "Greedy works only when local optimal choices can be proven to lead to a global optimum.",
    "conceptQuestion": "Why does activity selection sort by finishing time?",
    "conceptOptions": ["Finishing earlier leaves room for more future activities", "It guarantees activities start earlier", "It removes the need for comparisons", "It maximizes activity duration"],
    "conceptAnswer": 0,
    "conceptExplanation": "Choosing the activity that ends first preserves the most remaining schedule space."
  },
  "oops-concepts": {
    "bestScenario": "you want a stack abstraction that hides internal representation details",
    "bestAlgorithm": "Encapsulated Stack ADT",
    "codeSnippet": "class Stack {\n  items = [];\n  push(value) { this.items.push(value); }\n  pop() { return this.items.pop(); }\n}\nconst stack = new Stack();\nstack.push(9);\nstack.push(4);\nconsole.log(stack.pop());",
    "codeOptions": ["4", "9", "13", "undefined"],
    "codeAnswer": 0,
    "codeExplanation": "The stack pops the most recently pushed value, which is 4.",
    "edgeCaseQuestion": "Which design edge case should encapsulation prevent?",
    "edgeCaseOptions": ["External code mutating internal state in invalid ways", "Objects storing methods", "Classes using constructors", "Algorithms returning values"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "Encapsulation protects invariants by controlling how the internal state can be modified.",
    "conceptQuestion": "What is polymorphism useful for in DSA code?",
    "conceptOptions": ["Swapping different traversal or strategy implementations behind a common interface", "Guaranteeing O(1) time for all methods", "Avoiding all inheritance", "Removing the need for data structures"],
    "conceptAnswer": 0,
    "conceptExplanation": "Polymorphism lets multiple implementations share one interface, which is useful for interchangeable strategies."
  },
  "graphs": {
    "bestScenario": "you need the shortest path in an unweighted graph",
    "bestAlgorithm": "Breadth-First Search",
    "codeSnippet": "const graph = { A: [\"B\", \"C\"], B: [], C: [] };\nconsole.log(graph.A.length);",
    "codeOptions": ["0", "1", "2", "3"],
    "codeAnswer": 2,
    "codeExplanation": "Node A has two neighbors: B and C.",
    "edgeCaseQuestion": "Which graph edge case is easy to miss in traversal code?",
    "edgeCaseOptions": ["The graph may be disconnected", "The graph always has weights", "Every graph is a tree", "Every node has the same degree"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "A single DFS/BFS from one source may leave other components unvisited if the graph is disconnected.",
    "conceptQuestion": "Why is a visited set important in graph traversal?",
    "conceptOptions": ["It prevents revisiting nodes and getting stuck in cycles", "It sorts adjacency lists", "It guarantees a minimum spanning tree", "It stores edge weights"],
    "conceptAnswer": 0,
    "conceptExplanation": "Visited tracking stops repeated work and avoids infinite loops in cyclic graphs."
  },
  "dynamic-programming": {
    "bestScenario": "subproblems overlap and you want to avoid solving the same state repeatedly",
    "bestAlgorithm": "Fibonacci Tabulation",
    "codeSnippet": "const dp = [0, 1];\nfor (let i = 2; i <= 5; i += 1) dp[i] = dp[i - 1] + dp[i - 2];\nconsole.log(dp[5]);",
    "codeOptions": ["3", "5", "8", "13"],
    "codeAnswer": 1,
    "codeExplanation": "The table builds Fibonacci values up to dp[5] = 5.",
    "edgeCaseQuestion": "Which DP edge case should be defined before filling states?",
    "edgeCaseOptions": ["Base cases such as n = 0 or empty capacity", "Whether the input is sorted", "Whether the answer is unique", "Whether values are negative"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "Correct base cases anchor the recurrence and prevent invalid transitions.",
    "conceptQuestion": "Which technique specifically avoids recomputation in top-down DP?",
    "conceptOptions": ["Memoization", "Partitioning", "Binary search", "Heapify"],
    "conceptAnswer": 0,
    "conceptExplanation": "Memoization stores solved states so repeated recursive calls can reuse previous results."
  },
  "tries": {
    "bestScenario": "you need fast prefix checks across many words",
    "bestAlgorithm": "Prefix Query",
    "codeSnippet": "const word = \"tree\";\nconsole.log(word.startsWith(\"tr\"));",
    "codeOptions": ["true", "false", "tr", "undefined"],
    "codeAnswer": 0,
    "codeExplanation": "\"tree\" does start with the prefix \"tr\".",
    "edgeCaseQuestion": "Which trie edge case matters when distinguishing a full word from a prefix?",
    "edgeCaseOptions": ["A node path may exist without the end-of-word marker being set", "All prefixes are automatically valid words", "Tries cannot store repeated letters", "Each node has exactly two children"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "A path for a prefix can exist even when the exact word was never inserted, so an end marker is required.",
    "conceptQuestion": "What does L usually represent in trie complexity O(L)?",
    "conceptOptions": ["The length of the query string", "The number of stored words", "The maximum branching factor", "The tree height in edges"],
    "conceptAnswer": 0,
    "conceptExplanation": "Trie operations follow one character at a time, so the cost depends on the word or prefix length."
  },
  "divide-and-conquer": {
    "bestScenario": "you can split the problem into independent halves and combine their answers efficiently",
    "bestAlgorithm": "Merge Sort as Divide & Conquer",
    "codeSnippet": "function splitSize(n) {\n  const mid = Math.floor(n / 2);\n  return mid;\n}\nconsole.log(splitSize(5));",
    "codeOptions": ["1", "2", "3", "4"],
    "codeAnswer": 1,
    "codeExplanation": "Math.floor(5 / 2) is 2.",
    "edgeCaseQuestion": "Which divide-and-conquer edge case must stop further splitting?",
    "edgeCaseOptions": ["Subproblems of size 0 or 1", "Arrays with duplicates", "Inputs with negative numbers", "Sorted inputs"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "A subproblem with at most one element is already solved and becomes the base case.",
    "conceptQuestion": "Why is merge sort a classic divide-and-conquer algorithm?",
    "conceptOptions": ["It splits the array, sorts both halves recursively, then merges", "It uses a queue instead of recursion", "It depends on hash-table collisions", "It only works for linked lists"],
    "conceptAnswer": 0,
    "conceptExplanation": "Merge sort follows the divide, conquer, and combine pattern exactly."
  },
  "bit-manipulation": {
    "bestScenario": "every number appears twice except one, and you need the unique value",
    "bestAlgorithm": "XOR for Single Number",
    "codeSnippet": "console.log(5 ^ 3);",
    "codeOptions": ["2", "6", "8", "15"],
    "codeAnswer": 1,
    "codeExplanation": "In binary, 0101 XOR 0011 = 0110, which is 6.",
    "edgeCaseQuestion": "Which edge case should bit code handle carefully?",
    "edgeCaseOptions": ["Shifting or masking around 0 bits and sign-sensitive values", "Arrays being sorted", "Trees having leaves", "Graphs being disconnected"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "Bit tricks can behave differently around zero, sign bits, and language-specific shift rules.",
    "conceptQuestion": "Why does XOR isolate the single number when all others appear twice?",
    "conceptOptions": ["Equal values cancel out because x ^ x = 0", "XOR automatically sorts the array", "XOR uses extra memory for counts", "XOR only works on prime numbers"],
    "conceptAnswer": 0,
    "conceptExplanation": "Pairs vanish under XOR, leaving only the unmatched value."
  },
  "segment-trees": {
    "bestScenario": "you need fast range queries together with point or range updates",
    "bestAlgorithm": "Range Query with Lazy Propagation",
    "codeSnippet": "const index = 6;\nconsole.log(index & -index);",
    "codeOptions": ["1", "2", "3", "6"],
    "codeAnswer": 1,
    "codeExplanation": "For a Fenwick tree, index & -index extracts the least significant set bit, which is 2 for 6.",
    "edgeCaseQuestion": "Which implementation edge case commonly causes bugs in trees for ranges?",
    "edgeCaseOptions": ["Mixing 0-based and 1-based indexing conventions", "Using addition in queries", "Building the tree before querying", "Storing integers"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "Fenwick trees especially depend on indexing conventions, so off-by-one errors are common.",
    "conceptQuestion": "Why use lazy propagation in a segment tree?",
    "conceptOptions": ["To postpone updates until a segment is actually needed", "To sort query endpoints", "To remove the tree structure", "To make every query O(1)"],
    "conceptAnswer": 0,
    "conceptExplanation": "Lazy tags avoid touching every element in an updated range immediately, preserving logarithmic behavior."
  },
  "disjoint-set": {
    "bestScenario": "you need to track connected components while processing many union operations",
    "bestAlgorithm": "Union by Rank",
    "codeSnippet": "const parent = [0, 1, 1];\nlet node = 2;\nwhile (parent[node] !== node) node = parent[node];\nconsole.log(node);",
    "codeOptions": ["0", "1", "2", "3"],
    "codeAnswer": 1,
    "codeExplanation": "Node 2 points to 1, and 1 is its own parent, so the root is 1.",
    "edgeCaseQuestion": "Which DSU edge case should union(x, y) handle quickly?",
    "edgeCaseOptions": ["x and y are already in the same set", "The set size is prime", "The graph is directed", "The values are negative"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "If both elements already share a root, no structural change is needed.",
    "conceptQuestion": "Why does path compression help DSU performance?",
    "conceptOptions": ["It flattens parent chains during find operations", "It sorts all set members", "It removes the need for union", "It stores edges in a heap"],
    "conceptAnswer": 0,
    "conceptExplanation": "Path compression points visited nodes closer to the root, making future finds much faster."
  },
  "advanced-graph-algorithms": {
    "bestScenario": "you need shortest paths even when some edge weights are negative",
    "bestAlgorithm": "Bellman-Ford Relaxation",
    "codeSnippet": "const indegree = new Map([[\"A\", 0], [\"B\", 1]]);\nconsole.log(indegree.get(\"A\"));",
    "codeOptions": ["0", "1", "2", "undefined"],
    "codeAnswer": 0,
    "codeExplanation": "The map stores indegree 0 for node A.",
    "edgeCaseQuestion": "Which advanced-graph edge case must Bellman-Ford detect?",
    "edgeCaseOptions": ["A reachable negative cycle", "An isolated source node", "An even number of edges", "Duplicate vertices"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "An extra relaxation after V - 1 rounds reveals whether a negative cycle is reachable.",
    "conceptQuestion": "When is topological sort the right tool?",
    "conceptOptions": ["When the graph is a DAG with dependency ordering", "When all edges are undirected", "When you need a minimum spanning tree", "When edge weights are negative"],
    "conceptAnswer": 0,
    "conceptExplanation": "Topological ordering exists only for directed acyclic graphs and is ideal for dependency problems."
  },
  "advanced-string-algorithms": {
    "bestScenario": "you want to search for a pattern without re-checking characters unnecessarily",
    "bestAlgorithm": "Knuth-Morris-Pratt (KMP)",
    "codeSnippet": "const text = \"abracadabra\";\nconsole.log(text.indexOf(\"cad\"));",
    "codeOptions": ["2", "3", "4", "5"],
    "codeAnswer": 2,
    "codeExplanation": "The substring \"cad\" starts at index 4 in \"abracadabra\".",
    "edgeCaseQuestion": "Which edge case is important in pattern-matching algorithms like KMP?",
    "edgeCaseOptions": ["Overlapping prefixes and suffixes inside the pattern", "The text being sorted", "Characters being only lowercase", "The pattern always being shorter than 2"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "KMP is valuable precisely because it handles overlap information through the prefix-function/LPS array.",
    "conceptQuestion": "Why is Rabin-Karp often good for multiple pattern-like comparisons?",
    "conceptOptions": ["Rolling hashes update the window quickly", "It never has hash collisions", "It always beats KMP in worst case", "It uses a trie internally"],
    "conceptAnswer": 0,
    "conceptExplanation": "Rolling hashes let you compare moving windows efficiently, though collisions still need verification."
  },
  "advanced-dp": {
    "bestScenario": "the state depends on which subset of items has already been used",
    "bestAlgorithm": "Bitmask DP for Subset States",
    "codeSnippet": "const mask = (1 << 3) | (1 << 1);\nconsole.log(mask);",
    "codeOptions": ["6", "8", "10", "12"],
    "codeAnswer": 2,
    "codeExplanation": "(1 << 3) is 8 and (1 << 1) is 2, so the combined bitmask is 10.",
    "edgeCaseQuestion": "Which advanced-DP edge case must you watch carefully?",
    "edgeCaseOptions": ["State definitions that omit part of the information needed for transitions", "Using arrays instead of maps", "Inputs smaller than 10", "Duplicate values"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "If the state does not capture every necessary variable, the recurrence becomes incorrect.",
    "conceptQuestion": "Why is bitmask DP powerful for small n?",
    "conceptOptions": ["A subset can be encoded compactly as bits", "It makes exponential problems linear", "It removes recursion entirely", "It only works on graphs"],
    "conceptAnswer": 0,
    "conceptExplanation": "Bitmasks represent subsets efficiently, which is perfect when n is small enough for 2^n states."
  },
  "network-flow": {
    "bestScenario": "you need the maximum amount of flow from a source to a sink through capacities",
    "bestAlgorithm": "Dinic's Algorithm",
    "codeSnippet": "const capacities = [7, 4, 6];\nconsole.log(Math.min(...capacities));",
    "codeOptions": ["4", "6", "7", "17"],
    "codeAnswer": 0,
    "codeExplanation": "The bottleneck of those edge capacities is the minimum value, which is 4.",
    "edgeCaseQuestion": "Which network-flow edge case is essential after sending flow through a path?",
    "edgeCaseOptions": ["Updating reverse edges in the residual graph", "Resorting the vertices alphabetically", "Removing the sink", "Making every capacity equal"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "Residual reverse edges allow future paths to cancel or reroute previously sent flow.",
    "conceptQuestion": "Why does Edmonds-Karp use BFS on the residual graph?",
    "conceptOptions": ["It finds the shortest augmenting path in edge count", "It guarantees O(log n) complexity", "It avoids residual capacities", "It works only on undirected graphs"],
    "conceptAnswer": 0,
    "conceptExplanation": "Edmonds-Karp chooses shortest augmenting paths by edges, which yields its polynomial-time guarantee."
  },
  "computational-geometry": {
    "bestScenario": "you need to determine whether three points turn clockwise or counterclockwise",
    "bestAlgorithm": "Orientation Test",
    "codeSnippet": "const cross = (1 - 0) * (1 - 0) - (0 - 0) * (1 - 0);\nconsole.log(cross > 0 ? \"left\" : \"right\");",
    "codeOptions": ["left", "right", "collinear", "error"],
    "codeAnswer": 0,
    "codeExplanation": "The cross product is positive, so the turn is to the left (counterclockwise).",
    "edgeCaseQuestion": "Which geometry edge case frequently needs special handling?",
    "edgeCaseOptions": ["Collinear points", "Arrays with duplicates", "Graphs with weights", "Negative capacities"],
    "edgeCaseAnswer": 0,
    "edgeCaseExplanation": "Collinear points can break assumptions in hull-building or intersection logic if not handled explicitly.",
    "conceptQuestion": "Why does Graham scan begin with sorting points?",
    "conceptOptions": ["It processes candidates in angular order around the pivot", "It guarantees constant space", "It removes all collinear cases", "It avoids stack operations"],
    "conceptAnswer": 0,
    "conceptExplanation": "Sorting by angle lets the algorithm sweep around the hull boundary while using orientation checks."
  }
};

const buildOptions = (correct: string, pool: string[]) => {
  const distractors = pool.filter((item) => item !== correct);
  return [correct, ...distractors].slice(0, 4);
};

const buildAlgorithmOptions = (topic: Topic, correct: string) => {
  const options = [
    correct,
    ...topic.algorithms.map((algorithm) => algorithm.name).filter((name) => name !== correct),
    ...FALLBACK_ALGORITHM_OPTIONS,
  ];

  return Array.from(new Set(options)).slice(0, 4);
};

const createQuestion = (
  id: string,
  question: string,
  options: string[],
  correctOption: string,
  explanation: string,
  difficulty: QuizQuestion["difficulty"],
  codeSnippet?: string
): QuizQuestion => ({
  id,
  question,
  codeSnippet,
  options,
  correctAnswer: options.indexOf(correctOption),
  explanation,
  difficulty,
});

const buildQuiz = (topic: Topic): Quiz => {
  const template = topicTemplates[topic.slug];
  const primaryAlgorithm = topic.algorithms[0];
  const secondaryAlgorithm = topic.algorithms[1] ?? topic.algorithms[0];
  const bestAlgorithmOptions = buildAlgorithmOptions(topic, template.bestAlgorithm);

  return {
    topicSlug: topic.slug,
    questions: [
      createQuestion(
        `${topic.slug}-time-primary`,
        `What is the time complexity of ${primaryAlgorithm.name} in the ${topic.title} topic?`,
        buildOptions(primaryAlgorithm.timeComplexity, TIME_COMPLEXITY_OPTIONS),
        primaryAlgorithm.timeComplexity,
        `${primaryAlgorithm.name} is documented in this topic with time complexity ${primaryAlgorithm.timeComplexity}.`,
        "easy"
      ),
      createQuestion(
        `${topic.slug}-space-secondary`,
        `What is the extra space complexity of ${secondaryAlgorithm.name}?`,
        buildOptions(secondaryAlgorithm.spaceComplexity, SPACE_COMPLEXITY_OPTIONS),
        secondaryAlgorithm.spaceComplexity,
        `${secondaryAlgorithm.name} uses ${secondaryAlgorithm.spaceComplexity} extra memory according to the lesson data.`,
        "medium"
      ),
      createQuestion(
        `${topic.slug}-best-fit`,
        `Which ${topic.title.toLowerCase()} approach is the best choice when ${template.bestScenario}?`,
        bestAlgorithmOptions,
        template.bestAlgorithm,
        `${template.bestAlgorithm} is the best fit here because it directly targets that scenario.`,
        "medium"
      ),
      createQuestion(
        `${topic.slug}-code-output`,
        `What is the output of this ${topic.title.toLowerCase()} snippet?`,
        template.codeOptions,
        template.codeOptions[template.codeAnswer],
        template.codeExplanation,
        "medium",
        template.codeSnippet
      ),
      createQuestion(
        `${topic.slug}-edge-case`,
        template.edgeCaseQuestion,
        template.edgeCaseOptions,
        template.edgeCaseOptions[template.edgeCaseAnswer],
        template.edgeCaseExplanation,
        "hard"
      ),
      createQuestion(
        `${topic.slug}-concept`,
        template.conceptQuestion,
        template.conceptOptions,
        template.conceptOptions[template.conceptAnswer],
        template.conceptExplanation,
        "hard"
      ),
    ],
  };
};

export const quizzes: Quiz[] = topics.map(buildQuiz);

export const getQuizByTopicSlug = (topicSlug: string): Quiz | undefined => quizzes.find((quiz) => quiz.topicSlug === topicSlug);
