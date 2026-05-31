import { topics, type ProgrammingLanguage } from "@/data/topics";

export interface PlaygroundTopicOption {
  slug: string;
  title: string;
  description: string;
}

type TemplateFamily =
  | "array"
  | "string"
  | "linked-list"
  | "stack"
  | "queue"
  | "tree"
  | "hash"
  | "heap"
  | "dp"
  | "graph"
  | "trie"
  | "bit"
  | "segment-tree"
  | "geometry"
  | "oop"
  | "math";

export const playgroundTopicOptions: PlaygroundTopicOption[] = topics.map((topic) => ({
  slug: topic.slug,
  title: topic.title,
  description: topic.shortDescription,
}));

const topicLookup = new Map(playgroundTopicOptions.map((topic) => [topic.slug, topic]));
const DEFAULT_TOPIC = "arrays";

const templateFamilies: Record<string, TemplateFamily> = {
  arrays: "array",
  strings: "string",
  "linked-lists": "linked-list",
  stacks: "stack",
  queues: "queue",
  "sorting-algorithms": "array",
  searching: "array",
  "basic-math": "math",
  "matrix-2d-arrays": "array",
  "binary-trees": "tree",
  "binary-search-trees": "tree",
  "hash-tables": "hash",
  heaps: "heap",
  "recursion-backtracking": "dp",
  "two-pointers-sliding-window": "array",
  "greedy-algorithms": "dp",
  "oops-concepts": "oop",
  graphs: "graph",
  "dynamic-programming": "dp",
  tries: "trie",
  "divide-and-conquer": "dp",
  "bit-manipulation": "bit",
  "segment-trees": "segment-tree",
  "disjoint-set": "graph",
  "advanced-graph-algorithms": "graph",
  "advanced-string-algorithms": "string",
  "advanced-dp": "dp",
  "network-flow": "graph",
  "computational-geometry": "geometry",
};

export function resolvePlaygroundTopic(value?: string | null): string {
  if (value && topicLookup.has(value)) {
    return value;
  }

  return DEFAULT_TOPIC;
}

function getTopicTitle(topicSlug: string): string {
  return topicLookup.get(resolvePlaygroundTopic(topicSlug))?.title ?? "DSA Topic";
}

function getTemplateFamily(topicSlug: string): TemplateFamily {
  return templateFamilies[resolvePlaygroundTopic(topicSlug)] ?? "array";
}

function pythonTemplate(family: TemplateFamily, title: string): string {
  switch (family) {
    case "string":
      return `# ${title} playground template\n\ndef longest_unique_substring(text: str) -> int:\n    seen = {}\n    left = 0\n    best = 0\n\n    for right, ch in enumerate(text):\n        if ch in seen and seen[ch] >= left:\n            left = seen[ch] + 1\n        seen[ch] = right\n        best = max(best, right - left + 1)\n\n    return best\n\n\ntext = "datastructures"\nprint("text:", text)\nprint("longest unique substring length:", longest_unique_substring(text))\n`;
    case "linked-list":
      return `# ${title} playground template\n\nclass ListNode:\n    def __init__(self, value: int, next_node: "ListNode | None" = None):\n        self.value = value\n        self.next = next_node\n\n\ndef reverse_list(head: ListNode | None) -> ListNode | None:\n    previous = None\n    current = head\n\n    while current is not None:\n        next_node = current.next\n        current.next = previous\n        previous = current\n        current = next_node\n\n    return previous\n\n\ndef to_list(head: ListNode | None) -> list[int]:\n    values = []\n    while head is not None:\n        values.append(head.value)\n        head = head.next\n    return values\n\n\nhead = ListNode(1, ListNode(2, ListNode(3, ListNode(4))))\nprint("original:", to_list(head))\nprint("reversed:", to_list(reverse_list(head)))\n`;
    case "stack":
      return `# ${title} playground template\n\ndef is_balanced(expression: str) -> bool:\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack: list[str] = []\n\n    for ch in expression:\n        if ch in "([{":\n            stack.append(ch)\n        elif ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n\n    return len(stack) == 0\n\n\nexpression = "([{}])()"\nprint("expression:", expression)\nprint("balanced:", is_balanced(expression))\n`;
    case "queue":
      return `# ${title} playground template\n\nfrom collections import deque\n\n\ndef bfs_levels(graph: dict[str, list[str]], start: str) -> list[str]:\n    order: list[str] = []\n    queue = deque([start])\n    seen = {start}\n\n    while queue:\n        node = queue.popleft()\n        order.append(node)\n\n        for neighbor in graph.get(node, []):\n            if neighbor not in seen:\n                seen.add(neighbor)\n                queue.append(neighbor)\n\n    return order\n\n\ngraph = {"A": ["B", "C"], "B": ["D"], "C": ["E"], "D": [], "E": []}\nprint("level order:", bfs_levels(graph, "A"))\n`;
    case "tree":
      return `# ${title} playground template\n\nclass TreeNode:\n    def __init__(self, value: int, left: "TreeNode | None" = None, right: "TreeNode | None" = None):\n        self.value = value\n        self.left = left\n        self.right = right\n\n\ndef inorder(node: TreeNode | None) -> list[int]:\n    if node is None:\n        return []\n    return inorder(node.left) + [node.value] + inorder(node.right)\n\n\nroot = TreeNode(8, TreeNode(3, TreeNode(1), TreeNode(6)), TreeNode(10, None, TreeNode(14)))\nprint("binary tree inorder traversal:", inorder(root))\n`;
    case "hash":
      return `# ${title} playground template\n\ndef group_anagrams(words: list[str]) -> dict[tuple[str, ...], list[str]]:\n    groups: dict[tuple[str, ...], list[str]] = {}\n\n    for word in words:\n        signature = tuple(sorted(word))\n        groups.setdefault(signature, []).append(word)\n\n    return groups\n\n\nwords = ["eat", "tea", "tan", "ate", "nat", "bat"]\nprint("groups:", list(group_anagrams(words).values()))\n`;
    case "heap":
      return `# ${title} playground template\n\nimport heapq\n\n\ndef kth_largest(values: list[int], k: int) -> int:\n    min_heap: list[int] = []\n\n    for value in values:\n        heapq.heappush(min_heap, value)\n        if len(min_heap) > k:\n            heapq.heappop(min_heap)\n\n    return min_heap[0]\n\n\nvalues = [7, 2, 9, 4, 1, 12, 8]\nprint("values:", values)\nprint("3rd largest:", kth_largest(values, 3))\n`;
    case "dp":
      return `# ${title} playground template\n\ndef climb_stairs(steps: int) -> int:\n    if steps <= 2:\n        return steps\n\n    previous, current = 1, 2\n    for _ in range(3, steps + 1):\n        previous, current = current, previous + current\n\n    return current\n\n\nsteps = 7\nprint("steps:", steps)\nprint("ways to climb:", climb_stairs(steps))\n`;
    case "graph":
      return `# ${title} playground template\n\nfrom collections import deque\n\n\ndef shortest_path(graph: dict[str, list[str]], start: str) -> dict[str, int]:\n    distances = {start: 0}\n    queue = deque([start])\n\n    while queue:\n        node = queue.popleft()\n        for neighbor in graph.get(node, []):\n            if neighbor not in distances:\n                distances[neighbor] = distances[node] + 1\n                queue.append(neighbor)\n\n    return distances\n\n\nadjacency_list = {\n    "A": ["B", "C"],\n    "B": ["D", "E"],\n    "C": ["F"],\n    "D": [],\n    "E": ["F"],\n    "F": [],\n}\nprint("adjacency list:", adjacency_list)\nprint("distances from A:", shortest_path(adjacency_list, "A"))\n`;
    case "trie":
      return `# ${title} playground template\n\nclass TrieNode:\n    def __init__(self):\n        self.children: dict[str, TrieNode] = {}\n        self.is_word = False\n\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word: str) -> None:\n        node = self.root\n        for ch in word:\n            node = node.children.setdefault(ch, TrieNode())\n        node.is_word = True\n\n    def starts_with(self, prefix: str) -> bool:\n        node = self.root\n        for ch in prefix:\n            if ch not in node.children:\n                return False\n            node = node.children[ch]\n        return True\n\n\ntrie = Trie()\nfor word in ["tree", "trie", "algo", "assoc"]:\n    trie.insert(word)\n\nprint("prefix 'tr':", trie.starts_with("tr"))\nprint("prefix 'ds':", trie.starts_with("ds"))\n`;
    case "bit":
      return `# ${title} playground template\n\ndef count_bits(value: int) -> int:\n    count = 0\n    while value:\n        value &= value - 1\n        count += 1\n    return count\n\n\nvalue = 29\nprint("value:", value)\nprint("binary:", bin(value))\nprint("set bits:", count_bits(value))\n`;
    case "segment-tree":
      return `# ${title} playground template\n\nclass SegmentTree:\n    def __init__(self, values: list[int]):\n        self.size = 1\n        while self.size < len(values):\n            self.size *= 2\n        self.tree = [0] * (2 * self.size)\n        for index, value in enumerate(values):\n            self.tree[self.size + index] = value\n        for index in range(self.size - 1, 0, -1):\n            self.tree[index] = self.tree[index * 2] + self.tree[index * 2 + 1]\n\n    def range_sum(self, left: int, right: int) -> int:\n        left += self.size\n        right += self.size\n        total = 0\n\n        while left <= right:\n            if left % 2 == 1:\n                total += self.tree[left]\n                left += 1\n            if right % 2 == 0:\n                total += self.tree[right]\n                right -= 1\n            left //= 2\n            right //= 2\n\n        return total\n\n\nvalues = [2, 1, 5, 3, 4]\nsegment_tree = SegmentTree(values)\nprint("range sum [1, 3]:", segment_tree.range_sum(1, 3))\n`;
    case "geometry":
      return `# ${title} playground template\n\ndef cross(o: tuple[int, int], a: tuple[int, int], b: tuple[int, int]) -> int:\n    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])\n\n\npoints = [(0, 0), (1, 1), (2, 0)]\nprint("points:", points)\nprint("orientation value:", cross(points[0], points[1], points[2]))\n`;
    case "oop":
      return `# ${title} playground template\n\nclass Stack:\n    def __init__(self):\n        self._values: list[int] = []\n\n    def push(self, value: int) -> None:\n        self._values.append(value)\n\n    def pop(self) -> int | None:\n        return self._values.pop() if self._values else None\n\n\nstack = Stack()\nfor value in [3, 5, 8]:\n    stack.push(value)\n\nprint("top item removed:", stack.pop())\nprint("next item removed:", stack.pop())\n`;
    case "math":
      return `# ${title} playground template\n\ndef gcd(a: int, b: int) -> int:\n    while b:\n        a, b = b, a % b\n    return a\n\n\ndef sieve(limit: int) -> list[int]:\n    is_prime = [True] * (limit + 1)\n    is_prime[0] = is_prime[1] = False\n\n    for number in range(2, int(limit ** 0.5) + 1):\n        if is_prime[number]:\n            for multiple in range(number * number, limit + 1, number):\n                is_prime[multiple] = False\n\n    return [number for number in range(2, limit + 1) if is_prime[number]]\n\n\nprint("gcd(48, 18):", gcd(48, 18))\nprint("primes up to 20:", sieve(20))\n`;
    case "array":
    default:
      return `# ${title} playground template\n\ndef build_prefix_sum(values: list[int]) -> list[int]:\n    prefix = [0]\n    for value in values:\n        prefix.append(prefix[-1] + value)\n    return prefix\n\n\ndef range_sum(prefix: list[int], left: int, right: int) -> int:\n    return prefix[right + 1] - prefix[left]\n\n\nvalues = [4, 2, 7, 1, 9]\nprefix = build_prefix_sum(values)\nprint("values:", values)\nprint("prefix sums:", prefix)\nprint("sum from index 1 to 3:", range_sum(prefix, 1, 3))\n`;
  }
}

function javascriptTemplate(family: TemplateFamily, title: string): string {
  switch (family) {
    case "string":
      return `// ${title} playground template\nfunction longestUniqueSubstring(text) {\n  const seen = new Map();\n  let left = 0;\n  let best = 0;\n\n  for (let right = 0; right < text.length; right += 1) {\n    const ch = text[right];\n    if (seen.has(ch) && seen.get(ch) >= left) {\n      left = seen.get(ch) + 1;\n    }\n    seen.set(ch, right);\n    best = Math.max(best, right - left + 1);\n  }\n\n  return best;\n}\n\nconst text = "datastructures";\nconsole.log("text:", text);\nconsole.log("longest unique substring length:", longestUniqueSubstring(text));\n`;
    case "linked-list":
      return `// ${title} playground template\nclass ListNode {\n  constructor(value, next = null) {\n    this.value = value;\n    this.next = next;\n  }\n}\n\nfunction reverseList(head) {\n  let previous = null;\n  let current = head;\n\n  while (current) {\n    const nextNode = current.next;\n    current.next = previous;\n    previous = current;\n    current = nextNode;\n  }\n\n  return previous;\n}\n\nfunction toArray(head) {\n  const values = [];\n  let current = head;\n  while (current) {\n    values.push(current.value);\n    current = current.next;\n  }\n  return values;\n}\n\nconst head = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4))));\nconsole.log("original:", toArray(head));\nconsole.log("reversed:", toArray(reverseList(head)));\n`;
    case "stack":
      return `// ${title} playground template\nfunction isBalanced(expression) {\n  const pairs = new Map([[")", "("], ["]", "["], ["}", "{"]]);\n  const stack = [];\n\n  for (const ch of expression) {\n    if ("([{".includes(ch)) {\n      stack.push(ch);\n    } else if (pairs.has(ch)) {\n      if (stack.pop() !== pairs.get(ch)) {\n        return false;\n      }\n    }\n  }\n\n  return stack.length === 0;\n}\n\nconst expression = "([{}])()";\nconsole.log("expression:", expression);\nconsole.log("balanced:", isBalanced(expression));\n`;
    case "queue":
      return `// ${title} playground template\nfunction bfsLevels(graph, start) {\n  const queue = [start];\n  const seen = new Set([start]);\n  const order = [];\n\n  while (queue.length > 0) {\n    const node = queue.shift();\n    order.push(node);\n\n    for (const neighbor of graph[node] ?? []) {\n      if (!seen.has(neighbor)) {\n        seen.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n\n  return order;\n}\n\nconst graph = { A: ["B", "C"], B: ["D"], C: ["E"], D: [], E: [] };\nconsole.log("level order:", bfsLevels(graph, "A"));\n`;
    case "tree":
      return `// ${title} playground template\nclass TreeNode {\n  constructor(value, left = null, right = null) {\n    this.value = value;\n    this.left = left;\n    this.right = right;\n  }\n}\n\nfunction inorder(node, values = []) {\n  if (!node) {\n    return values;\n  }\n\n  inorder(node.left, values);\n  values.push(node.value);\n  inorder(node.right, values);\n  return values;\n}\n\nconst root = new TreeNode(8, new TreeNode(3, new TreeNode(1), new TreeNode(6)), new TreeNode(10, null, new TreeNode(14)));\nconsole.log("binary tree inorder traversal:", inorder(root));\n`;
    case "hash":
      return `// ${title} playground template\nfunction groupAnagrams(words) {\n  const groups = new Map();\n\n  for (const word of words) {\n    const signature = [...word].sort().join("");\n    if (!groups.has(signature)) {\n      groups.set(signature, []);\n    }\n    groups.get(signature).push(word);\n  }\n\n  return [...groups.values()];\n}\n\nconst words = ["eat", "tea", "tan", "ate", "nat", "bat"];\nconsole.log("groups:", groupAnagrams(words));\n`;
    case "heap":
      return `// ${title} playground template\nfunction kthLargest(values, k) {\n  const sorted = [...values].sort((left, right) => right - left);\n  return sorted[k - 1];\n}\n\nconst values = [7, 2, 9, 4, 1, 12, 8];\nconsole.log("values:", values);\nconsole.log("3rd largest:", kthLargest(values, 3));\n`;
    case "dp":
      return `// ${title} playground template\nfunction climbStairs(steps) {\n  if (steps <= 2) {\n    return steps;\n  }\n\n  let previous = 1;\n  let current = 2;\n\n  for (let step = 3; step <= steps; step += 1) {\n    [previous, current] = [current, previous + current];\n  }\n\n  return current;\n}\n\nconst steps = 7;\nconsole.log("steps:", steps);\nconsole.log("ways to climb:", climbStairs(steps));\n`;
    case "graph":
      return `// ${title} playground template\nfunction shortestPath(graph, start) {\n  const queue = [start];\n  const distance = new Map([[start, 0]]);\n\n  while (queue.length > 0) {\n    const node = queue.shift();\n\n    for (const neighbor of graph[node] ?? []) {\n      if (!distance.has(neighbor)) {\n        distance.set(neighbor, distance.get(node) + 1);\n        queue.push(neighbor);\n      }\n    }\n  }\n\n  return Object.fromEntries(distance);\n}\n\nconst adjacencyList = {\n  A: ["B", "C"],\n  B: ["D", "E"],\n  C: ["F"],\n  D: [],\n  E: ["F"],\n  F: [],\n};\nconsole.log("adjacency list:", adjacencyList);\nconsole.log("distances from A:", shortestPath(adjacencyList, "A"));\n`;
    case "trie":
      return `// ${title} playground template\nclass TrieNode {\n  constructor() {\n    this.children = new Map();\n    this.isWord = false;\n  }\n}\n\nclass Trie {\n  constructor() {\n    this.root = new TrieNode();\n  }\n\n  insert(word) {\n    let node = this.root;\n    for (const ch of word) {\n      if (!node.children.has(ch)) {\n        node.children.set(ch, new TrieNode());\n      }\n      node = node.children.get(ch);\n    }\n    node.isWord = true;\n  }\n\n  startsWith(prefix) {\n    let node = this.root;\n    for (const ch of prefix) {\n      if (!node.children.has(ch)) {\n        return false;\n      }\n      node = node.children.get(ch);\n    }\n    return true;\n  }\n}\n\nconst trie = new Trie();\n["tree", "trie", "algo", "assoc"].forEach((word) => trie.insert(word));\nconsole.log("prefix 'tr':", trie.startsWith("tr"));\nconsole.log("prefix 'ds':", trie.startsWith("ds"));\n`;
    case "bit":
      return `// ${title} playground template\nfunction countBits(value) {\n  let count = 0;\n  let current = value;\n\n  while (current > 0) {\n    current &= current - 1;\n    count += 1;\n  }\n\n  return count;\n}\n\nconst value = 29;\nconsole.log("value:", value);\nconsole.log("binary:", value.toString(2));\nconsole.log("set bits:", countBits(value));\n`;
    case "segment-tree":
      return `// ${title} playground template\nclass SegmentTree {\n  constructor(values) {\n    this.size = 1;\n    while (this.size < values.length) {\n      this.size *= 2;\n    }\n    this.tree = new Array(this.size * 2).fill(0);\n    values.forEach((value, index) => {\n      this.tree[this.size + index] = value;\n    });\n    for (let index = this.size - 1; index > 0; index -= 1) {\n      this.tree[index] = this.tree[index * 2] + this.tree[index * 2 + 1];\n    }\n  }\n\n  rangeSum(left, right) {\n    let l = left + this.size;\n    let r = right + this.size;\n    let total = 0;\n\n    while (l <= r) {\n      if (l % 2 === 1) total += this.tree[l++];\n      if (r % 2 === 0) total += this.tree[r--];\n      l = Math.floor(l / 2);\n      r = Math.floor(r / 2);\n    }\n\n    return total;\n  }\n}\n\nconst values = [2, 1, 5, 3, 4];\nconst segmentTree = new SegmentTree(values);\nconsole.log("range sum [1, 3]:", segmentTree.rangeSum(1, 3));\n`;
    case "geometry":
      return `// ${title} playground template\nfunction cross(origin, a, b) {\n  return (a[0] - origin[0]) * (b[1] - origin[1]) - (a[1] - origin[1]) * (b[0] - origin[0]);\n}\n\nconst points = [[0, 0], [1, 1], [2, 0]];\nconsole.log("points:", points);\nconsole.log("orientation value:", cross(points[0], points[1], points[2]));\n`;
    case "oop":
      return `// ${title} playground template\nclass Stack {\n  #values = [];\n\n  push(value) {\n    this.#values.push(value);\n  }\n\n  pop() {\n    return this.#values.pop() ?? null;\n  }\n}\n\nconst stack = new Stack();\n[3, 5, 8].forEach((value) => stack.push(value));\nconsole.log("top item removed:", stack.pop());\nconsole.log("next item removed:", stack.pop());\n`;
    case "math":
      return `// ${title} playground template\nfunction gcd(a, b) {\n  let x = a;\n  let y = b;\n\n  while (y !== 0) {\n    [x, y] = [y, x % y];\n  }\n\n  return x;\n}\n\nfunction sieve(limit) {\n  const isPrime = new Array(limit + 1).fill(true);\n  isPrime[0] = false;\n  isPrime[1] = false;\n\n  for (let number = 2; number * number <= limit; number += 1) {\n    if (isPrime[number]) {\n      for (let multiple = number * number; multiple <= limit; multiple += number) {\n        isPrime[multiple] = false;\n      }\n    }\n  }\n\n  return isPrime.flatMap((value, index) => (value ? [index] : []));\n}\n\nconsole.log("gcd(48, 18):", gcd(48, 18));\nconsole.log("primes up to 20:", sieve(20));\n`;
    case "array":
    default:
      return `// ${title} playground template\nfunction buildPrefixSum(values) {\n  const prefix = [0];\n  for (const value of values) {\n    prefix.push(prefix[prefix.length - 1] + value);\n  }\n  return prefix;\n}\n\nfunction rangeSum(prefix, left, right) {\n  return prefix[right + 1] - prefix[left];\n}\n\nconst values = [4, 2, 7, 1, 9];\nconst prefix = buildPrefixSum(values);\nconsole.log("values:", values);\nconsole.log("prefix sums:", prefix);\nconsole.log("sum from index 1 to 3:", rangeSum(prefix, 1, 3));\n`;
  }
}

function javaTemplate(family: TemplateFamily, title: string): string {
  void title;
  switch (family) {
    case "string":
      return `import java.util.*;\n\npublic class Main {\n  static int longestUniqueSubstring(String text) {\n    Map<Character, Integer> seen = new HashMap<>();\n    int left = 0;\n    int best = 0;\n\n    for (int right = 0; right < text.length(); right++) {\n      char ch = text.charAt(right);\n      if (seen.containsKey(ch) && seen.get(ch) >= left) {\n        left = seen.get(ch) + 1;\n      }\n      seen.put(ch, right);\n      best = Math.max(best, right - left + 1);\n    }\n\n    return best;\n  }\n\n  public static void main(String[] args) {\n    String text = "datastructures";\n    System.out.println("text: " + text);\n    System.out.println("longest unique substring length: " + longestUniqueSubstring(text));\n  }\n}\n`;
    case "linked-list":
      return `public class Main {\n  static class ListNode {\n    int value;\n    ListNode next;\n\n    ListNode(int value) {\n      this.value = value;\n    }\n  }\n\n  static ListNode reverseList(ListNode head) {\n    ListNode previous = null;\n    ListNode current = head;\n\n    while (current != null) {\n      ListNode nextNode = current.next;\n      current.next = previous;\n      previous = current;\n      current = nextNode;\n    }\n\n    return previous;\n  }\n\n  static String toString(ListNode head) {\n    StringBuilder builder = new StringBuilder();\n    while (head != null) {\n      if (builder.length() > 0) builder.append(" -> ");\n      builder.append(head.value);\n      head = head.next;\n    }\n    return builder.toString();\n  }\n\n  public static void main(String[] args) {\n    ListNode head = new ListNode(1);\n    head.next = new ListNode(2);\n    head.next.next = new ListNode(3);\n    head.next.next.next = new ListNode(4);\n\n    System.out.println("original: " + toString(head));\n    System.out.println("reversed: " + toString(reverseList(head)));\n  }\n}\n`;
    case "stack":
      return `import java.util.*;\n\npublic class Main {\n  static boolean isBalanced(String expression) {\n    Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');\n    Deque<Character> stack = new ArrayDeque<>();\n\n    for (char ch : expression.toCharArray()) {\n      if (ch == '(' || ch == '[' || ch == '{') {\n        stack.push(ch);\n      } else if (pairs.containsKey(ch)) {\n        if (stack.isEmpty() || stack.pop() != pairs.get(ch)) {\n          return false;\n        }\n      }\n    }\n\n    return stack.isEmpty();\n  }\n\n  public static void main(String[] args) {\n    String expression = "([{}])()";\n    System.out.println("expression: " + expression);\n    System.out.println("balanced: " + isBalanced(expression));\n  }\n}\n`;
    case "queue":
      return `import java.util.*;\n\npublic class Main {\n  static List<String> bfsLevels(Map<String, List<String>> graph, String start) {\n    Queue<String> queue = new ArrayDeque<>();\n    Set<String> seen = new HashSet<>();\n    List<String> order = new ArrayList<>();\n\n    queue.offer(start);\n    seen.add(start);\n\n    while (!queue.isEmpty()) {\n      String node = queue.poll();\n      order.add(node);\n\n      for (String neighbor : graph.getOrDefault(node, List.of())) {\n        if (seen.add(neighbor)) {\n          queue.offer(neighbor);\n        }\n      }\n    }\n\n    return order;\n  }\n\n  public static void main(String[] args) {\n    Map<String, List<String>> graph = Map.of(\n      "A", List.of("B", "C"),\n      "B", List.of("D"),\n      "C", List.of("E"),\n      "D", List.of(),\n      "E", List.of()\n    );\n\n    System.out.println("level order: " + bfsLevels(graph, "A"));\n  }\n}\n`;
    case "tree":
      return `import java.util.*;\n\npublic class Main {\n  static class TreeNode {\n    int value;\n    TreeNode left;\n    TreeNode right;\n\n    TreeNode(int value) {\n      this.value = value;\n    }\n  }\n\n  static void inorder(TreeNode node, List<Integer> values) {\n    if (node == null) {\n      return;\n    }\n    inorder(node.left, values);\n    values.add(node.value);\n    inorder(node.right, values);\n  }\n\n  public static void main(String[] args) {\n    TreeNode root = new TreeNode(8);\n    root.left = new TreeNode(3);\n    root.left.left = new TreeNode(1);\n    root.left.right = new TreeNode(6);\n    root.right = new TreeNode(10);\n    root.right.right = new TreeNode(14);\n\n    List<Integer> traversal = new ArrayList<>();\n    inorder(root, traversal);\n    System.out.println("binary tree inorder traversal: " + traversal);\n  }\n}\n`;
    case "hash":
      return `import java.util.*;\n\npublic class Main {\n  static List<List<String>> groupAnagrams(List<String> words) {\n    Map<String, List<String>> groups = new HashMap<>();\n\n    for (String word : words) {\n      char[] chars = word.toCharArray();\n      Arrays.sort(chars);\n      String signature = new String(chars);\n      groups.computeIfAbsent(signature, ignored -> new ArrayList<>()).add(word);\n    }\n\n    return new ArrayList<>(groups.values());\n  }\n\n  public static void main(String[] args) {\n    List<String> words = List.of("eat", "tea", "tan", "ate", "nat", "bat");\n    System.out.println("groups: " + groupAnagrams(words));\n  }\n}\n`;
    case "heap":
      return `import java.util.*;\n\npublic class Main {\n  static int kthLargest(int[] values, int k) {\n    PriorityQueue<Integer> minHeap = new PriorityQueue<>();\n\n    for (int value : values) {\n      minHeap.offer(value);\n      if (minHeap.size() > k) {\n        minHeap.poll();\n      }\n    }\n\n    return minHeap.peek();\n  }\n\n  public static void main(String[] args) {\n    int[] values = {7, 2, 9, 4, 1, 12, 8};\n    System.out.println("3rd largest: " + kthLargest(values, 3));\n  }\n}\n`;
    case "dp":
      return `public class Main {\n  static int climbStairs(int steps) {\n    if (steps <= 2) {\n      return steps;\n    }\n\n    int previous = 1;\n    int current = 2;\n\n    for (int step = 3; step <= steps; step++) {\n      int next = previous + current;\n      previous = current;\n      current = next;\n    }\n\n    return current;\n  }\n\n  public static void main(String[] args) {\n    int steps = 7;\n    System.out.println("steps: " + steps);\n    System.out.println("ways to climb: " + climbStairs(steps));\n  }\n}\n`;
    case "graph":
      return `import java.util.*;\n\npublic class Main {\n  static Map<String, Integer> shortestPath(Map<String, List<String>> graph, String start) {\n    Map<String, Integer> distance = new LinkedHashMap<>();\n    Queue<String> queue = new ArrayDeque<>();\n\n    distance.put(start, 0);\n    queue.offer(start);\n\n    while (!queue.isEmpty()) {\n      String node = queue.poll();\n      for (String neighbor : graph.getOrDefault(node, List.of())) {\n        if (!distance.containsKey(neighbor)) {\n          distance.put(neighbor, distance.get(node) + 1);\n          queue.offer(neighbor);\n        }\n      }\n    }\n\n    return distance;\n  }\n\n  public static void main(String[] args) {\n    Map<String, List<String>> adjacencyList = new LinkedHashMap<>();\n    adjacencyList.put("A", List.of("B", "C"));\n    adjacencyList.put("B", List.of("D", "E"));\n    adjacencyList.put("C", List.of("F"));\n    adjacencyList.put("D", List.of());\n    adjacencyList.put("E", List.of("F"));\n    adjacencyList.put("F", List.of());\n\n    System.out.println("adjacency list: " + adjacencyList);\n    System.out.println("distances from A: " + shortestPath(adjacencyList, "A"));\n  }\n}\n`;
    case "trie":
      return `import java.util.*;\n\npublic class Main {\n  static class TrieNode {\n    Map<Character, TrieNode> children = new HashMap<>();\n    boolean isWord;\n  }\n\n  static class Trie {\n    TrieNode root = new TrieNode();\n\n    void insert(String word) {\n      TrieNode node = root;\n      for (char ch : word.toCharArray()) {\n        node = node.children.computeIfAbsent(ch, ignored -> new TrieNode());\n      }\n      node.isWord = true;\n    }\n\n    boolean startsWith(String prefix) {\n      TrieNode node = root;\n      for (char ch : prefix.toCharArray()) {\n        if (!node.children.containsKey(ch)) {\n          return false;\n        }\n        node = node.children.get(ch);\n      }\n      return true;\n    }\n  }\n\n  public static void main(String[] args) {\n    Trie trie = new Trie();\n    for (String word : List.of("tree", "trie", "algo", "assoc")) {\n      trie.insert(word);\n    }\n\n    System.out.println("prefix 'tr': " + trie.startsWith("tr"));\n    System.out.println("prefix 'ds': " + trie.startsWith("ds"));\n  }\n}\n`;
    case "bit":
      return `public class Main {\n  static int countBits(int value) {\n    int count = 0;\n    int current = value;\n\n    while (current > 0) {\n      current &= current - 1;\n      count++;\n    }\n\n    return count;\n  }\n\n  public static void main(String[] args) {\n    int value = 29;\n    System.out.println("value: " + value);\n    System.out.println("set bits: " + countBits(value));\n  }\n}\n`;
    case "segment-tree":
      return `public class Main {\n  static class SegmentTree {\n    int size = 1;\n    int[] tree;\n\n    SegmentTree(int[] values) {\n      while (size < values.length) {\n        size *= 2;\n      }\n      tree = new int[size * 2];\n      for (int index = 0; index < values.length; index++) {\n        tree[size + index] = values[index];\n      }\n      for (int index = size - 1; index > 0; index--) {\n        tree[index] = tree[index * 2] + tree[index * 2 + 1];\n      }\n    }\n\n    int rangeSum(int left, int right) {\n      int total = 0;\n      int l = left + size;\n      int r = right + size;\n      while (l <= r) {\n        if (l % 2 == 1) total += tree[l++];\n        if (r % 2 == 0) total += tree[r--];\n        l /= 2;\n        r /= 2;\n      }\n      return total;\n    }\n  }\n\n  public static void main(String[] args) {\n    SegmentTree segmentTree = new SegmentTree(new int[] {2, 1, 5, 3, 4});\n    System.out.println("range sum [1, 3]: " + segmentTree.rangeSum(1, 3));\n  }\n}\n`;
    case "geometry":
      return `public class Main {\n  static int cross(int[] origin, int[] a, int[] b) {\n    return (a[0] - origin[0]) * (b[1] - origin[1]) - (a[1] - origin[1]) * (b[0] - origin[0]);\n  }\n\n  public static void main(String[] args) {\n    int[] p1 = {0, 0};\n    int[] p2 = {1, 1};\n    int[] p3 = {2, 0};\n    System.out.println("orientation value: " + cross(p1, p2, p3));\n  }\n}\n`;
    case "oop":
      return `import java.util.*;\n\npublic class Main {\n  static class StackWrapper {\n    private final Deque<Integer> values = new ArrayDeque<>();\n\n    void push(int value) {\n      values.push(value);\n    }\n\n    Integer pop() {\n      return values.isEmpty() ? null : values.pop();\n    }\n  }\n\n  public static void main(String[] args) {\n    StackWrapper stack = new StackWrapper();\n    stack.push(3);\n    stack.push(5);\n    stack.push(8);\n    System.out.println("top item removed: " + stack.pop());\n    System.out.println("next item removed: " + stack.pop());\n  }\n}\n`;
    case "math":
      return `import java.util.*;\n\npublic class Main {\n  static int gcd(int a, int b) {\n    int x = a;\n    int y = b;\n    while (y != 0) {\n      int next = x % y;\n      x = y;\n      y = next;\n    }\n    return x;\n  }\n\n  static List<Integer> sieve(int limit) {\n    boolean[] isPrime = new boolean[limit + 1];\n    Arrays.fill(isPrime, true);\n    isPrime[0] = false;\n    isPrime[1] = false;\n\n    for (int number = 2; number * number <= limit; number++) {\n      if (isPrime[number]) {\n        for (int multiple = number * number; multiple <= limit; multiple += number) {\n          isPrime[multiple] = false;\n        }\n      }\n    }\n\n    List<Integer> primes = new ArrayList<>();\n    for (int number = 2; number <= limit; number++) {\n      if (isPrime[number]) primes.add(number);\n    }\n    return primes;\n  }\n\n  public static void main(String[] args) {\n    System.out.println("gcd(48, 18): " + gcd(48, 18));\n    System.out.println("primes up to 20: " + sieve(20));\n  }\n}\n`;
    case "array":
    default:
      return `import java.util.*;\n\npublic class Main {\n  static int[] buildPrefixSum(int[] values) {\n    int[] prefix = new int[values.length + 1];\n    for (int index = 0; index < values.length; index++) {\n      prefix[index + 1] = prefix[index] + values[index];\n    }\n    return prefix;\n  }\n\n  static int rangeSum(int[] prefix, int left, int right) {\n    return prefix[right + 1] - prefix[left];\n  }\n\n  public static void main(String[] args) {\n    int[] values = {4, 2, 7, 1, 9};\n    int[] prefix = buildPrefixSum(values);\n    System.out.println("values: " + Arrays.toString(values));\n    System.out.println("prefix sums: " + Arrays.toString(prefix));\n    System.out.println("sum from index 1 to 3: " + rangeSum(prefix, 1, 3));\n  }\n}\n`;
  }
}

function cppTemplate(family: TemplateFamily, title: string): string {
  void title;
  switch (family) {
    case "string":
      return `#include <algorithm>\n#include <iostream>\n#include <string>\n#include <unordered_map>\nusing namespace std;\n\nint longestUniqueSubstring(const string& text) {\n    unordered_map<char, int> seen;\n    int left = 0;\n    int best = 0;\n\n    for (int right = 0; right < static_cast<int>(text.size()); ++right) {\n        char ch = text[right];\n        if (seen.count(ch) && seen[ch] >= left) left = seen[ch] + 1;\n        seen[ch] = right;\n        best = max(best, right - left + 1);\n    }\n\n    return best;\n}\n\nint main() {\n    string text = "datastructures";\n    cout << "text: " << text << "\\n";\n    cout << "longest unique substring length: " << longestUniqueSubstring(text) << "\\n";\n}\n`;
    case "linked-list":
      return `#include <iostream>\n#include <vector>\nusing namespace std;\n\nstruct ListNode {\n    int value;\n    ListNode* next;\n    ListNode(int value, ListNode* next = nullptr) : value(value), next(next) {}\n};\n\nListNode* reverseList(ListNode* head) {\n    ListNode* previous = nullptr;\n    ListNode* current = head;\n\n    while (current != nullptr) {\n        ListNode* nextNode = current->next;\n        current->next = previous;\n        previous = current;\n        current = nextNode;\n    }\n\n    return previous;\n}\n\nvector<int> toVector(ListNode* head) {\n    vector<int> values;\n    while (head != nullptr) {\n        values.push_back(head->value);\n        head = head->next;\n    }\n    return values;\n}\n\nint main() {\n    ListNode* head = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4))));\n    for (int value : toVector(head)) cout << value << ' ';\n    cout << "\\n";\n    for (int value : toVector(reverseList(head))) cout << value << ' ';\n    cout << "\\n";\n}\n`;
    case "stack":
      return `#include <iostream>\n#include <stack>\n#include <string>\n#include <unordered_map>\nusing namespace std;\n\nbool isBalanced(const string& expression) {\n    unordered_map<char, char> pairs = {{')', '('}, {']', '['}, {'}', '{'}};\n    stack<char> values;\n\n    for (char ch : expression) {\n        if (ch == '(' || ch == '[' || ch == '{') {\n            values.push(ch);\n        } else if (pairs.count(ch)) {\n            if (values.empty() || values.top() != pairs[ch]) return false;\n            values.pop();\n        }\n    }\n\n    return values.empty();\n}\n\nint main() {\n    string expression = "([{}])()";\n    cout << "balanced: " << boolalpha << isBalanced(expression) << "\\n";\n}\n`;
    case "queue":
      return `#include <iostream>\n#include <queue>\n#include <string>\n#include <unordered_map>\n#include <unordered_set>\n#include <vector>\nusing namespace std;\n\nvector<string> bfsLevels(const unordered_map<string, vector<string>>& graph, const string& start) {\n    queue<string> q;\n    unordered_set<string> seen = {start};\n    vector<string> order;\n    q.push(start);\n\n    while (!q.empty()) {\n        string node = q.front();\n        q.pop();\n        order.push_back(node);\n\n        for (const string& neighbor : graph.at(node)) {\n            if (!seen.count(neighbor)) {\n                seen.insert(neighbor);\n                q.push(neighbor);\n            }\n        }\n    }\n\n    return order;\n}\n\nint main() {\n    unordered_map<string, vector<string>> graph = {{"A", {"B", "C"}}, {"B", {"D"}}, {"C", {"E"}}, {"D", {}}, {"E", {}}};\n    for (const string& node : bfsLevels(graph, "A")) cout << node << ' ';\n    cout << "\\n";\n}\n`;
    case "tree":
      return `#include <iostream>\n#include <vector>\nusing namespace std;\n\nstruct TreeNode {\n    int value;\n    TreeNode* left;\n    TreeNode* right;\n    TreeNode(int value, TreeNode* left = nullptr, TreeNode* right = nullptr) : value(value), left(left), right(right) {}\n};\n\nvoid inorder(TreeNode* node, vector<int>& values) {\n    if (node == nullptr) return;\n    inorder(node->left, values);\n    values.push_back(node->value);\n    inorder(node->right, values);\n}\n\nint main() {\n    TreeNode* root = new TreeNode(8, new TreeNode(3, new TreeNode(1), new TreeNode(6)), new TreeNode(10, nullptr, new TreeNode(14)));\n    vector<int> traversal;\n    inorder(root, traversal);\n    for (int value : traversal) cout << value << ' ';\n    cout << "\\n";\n}\n`;
    case "hash":
      return `#include <algorithm>\n#include <iostream>\n#include <string>\n#include <unordered_map>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<string> words = {"eat", "tea", "tan", "ate", "nat", "bat"};\n    unordered_map<string, vector<string>> groups;\n\n    for (string word : words) {\n        string signature = word;\n        sort(signature.begin(), signature.end());\n        groups[signature].push_back(word);\n    }\n\n    for (const auto& [signature, group] : groups) {\n        for (const string& word : group) cout << word << ' ';\n        cout << "\\n";\n    }\n}\n`;
    case "heap":
      return `#include <functional>\n#include <iostream>\n#include <queue>\n#include <vector>\nusing namespace std;\n\nint kthLargest(const vector<int>& values, int k) {\n    priority_queue<int, vector<int>, greater<int>> minHeap;\n\n    for (int value : values) {\n        minHeap.push(value);\n        if (static_cast<int>(minHeap.size()) > k) minHeap.pop();\n    }\n\n    return minHeap.top();\n}\n\nint main() {\n    vector<int> values = {7, 2, 9, 4, 1, 12, 8};\n    cout << "3rd largest: " << kthLargest(values, 3) << "\\n";\n}\n`;
    case "dp":
      return `#include <iostream>\nusing namespace std;\n\nint climbStairs(int steps) {\n    if (steps <= 2) return steps;\n    int previous = 1;\n    int current = 2;\n    for (int step = 3; step <= steps; ++step) {\n        int next = previous + current;\n        previous = current;\n        current = next;\n    }\n    return current;\n}\n\nint main() {\n    cout << "ways to climb 7 steps: " << climbStairs(7) << "\\n";\n}\n`;
    case "graph":
      return `#include <iostream>\n#include <queue>\n#include <string>\n#include <unordered_map>\n#include <vector>\nusing namespace std;\n\nint main() {\n    unordered_map<string, vector<string>> adjacencyList = {{"A", {"B", "C"}}, {"B", {"D", "E"}}, {"C", {"F"}}, {"D", {}}, {"E", {"F"}}, {"F", {}}};\n    unordered_map<string, int> distance = {{"A", 0}};\n    queue<string> q;\n    q.push("A");\n\n    while (!q.empty()) {\n        string node = q.front();\n        q.pop();\n        for (const string& neighbor : adjacencyList[node]) {\n            if (!distance.count(neighbor)) {\n                distance[neighbor] = distance[node] + 1;\n                q.push(neighbor);\n            }\n        }\n    }\n\n    for (const auto& [node, dist] : distance) cout << node << ": " << dist << "\\n";\n}\n`;
    case "trie":
      return `#include <iostream>\n#include <string>\n#include <unordered_map>\nusing namespace std;\n\nstruct TrieNode {\n    unordered_map<char, TrieNode*> children;\n    bool isWord = false;\n};\n\nvoid insert(TrieNode* root, const string& word) {\n    TrieNode* node = root;\n    for (char ch : word) {\n        if (!node->children.count(ch)) node->children[ch] = new TrieNode();\n        node = node->children[ch];\n    }\n    node->isWord = true;\n}\n\nbool startsWith(TrieNode* root, const string& prefix) {\n    TrieNode* node = root;\n    for (char ch : prefix) {\n        if (!node->children.count(ch)) return false;\n        node = node->children[ch];\n    }\n    return true;\n}\n\nint main() {\n    TrieNode* root = new TrieNode();\n    insert(root, "tree");\n    insert(root, "trie");\n    insert(root, "algo");\n    cout << boolalpha << startsWith(root, "tr") << "\\n";\n}\n`;
    case "bit":
      return `#include <iostream>\nusing namespace std;\n\nint countBits(int value) {\n    int count = 0;\n    while (value > 0) {\n        value &= value - 1;\n        ++count;\n    }\n    return count;\n}\n\nint main() {\n    cout << "set bits in 29: " << countBits(29) << "\\n";\n}\n`;
    case "segment-tree":
      return `#include <iostream>\n#include <vector>\nusing namespace std;\n\nstruct SegmentTree {\n    int size = 1;\n    vector<int> tree;\n\n    explicit SegmentTree(const vector<int>& values) {\n        while (size < static_cast<int>(values.size())) size *= 2;\n        tree.assign(size * 2, 0);\n        for (int index = 0; index < static_cast<int>(values.size()); ++index) tree[size + index] = values[index];\n        for (int index = size - 1; index > 0; --index) tree[index] = tree[index * 2] + tree[index * 2 + 1];\n    }\n\n    int rangeSum(int left, int right) {\n        int total = 0;\n        int l = left + size;\n        int r = right + size;\n        while (l <= r) {\n            if (l % 2 == 1) total += tree[l++];\n            if (r % 2 == 0) total += tree[r--];\n            l /= 2;\n            r /= 2;\n        }\n        return total;\n    }\n};\n\nint main() {\n    SegmentTree segmentTree({2, 1, 5, 3, 4});\n    cout << "range sum [1, 3]: " << segmentTree.rangeSum(1, 3) << "\\n";\n}\n`;
    case "geometry":
      return `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint cross(const vector<int>& origin, const vector<int>& a, const vector<int>& b) {\n    return (a[0] - origin[0]) * (b[1] - origin[1]) - (a[1] - origin[1]) * (b[0] - origin[0]);\n}\n\nint main() {\n    vector<int> p1 = {0, 0};\n    vector<int> p2 = {1, 1};\n    vector<int> p3 = {2, 0};\n    cout << "orientation value: " << cross(p1, p2, p3) << "\\n";\n}\n`;
    case "oop":
      return `#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass StackWrapper {\n  public:\n    void push(int value) { values.push_back(value); }\n    int pop() {\n        int value = values.back();\n        values.pop_back();\n        return value;\n    }\n\n  private:\n    vector<int> values;\n};\n\nint main() {\n    StackWrapper stack;\n    stack.push(3);\n    stack.push(5);\n    stack.push(8);\n    cout << stack.pop() << "\\n";\n    cout << stack.pop() << "\\n";\n}\n`;
    case "math":
      return `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint gcd(int a, int b) {\n    while (b != 0) {\n        int next = a % b;\n        a = b;\n        b = next;\n    }\n    return a;\n}\n\nvector<int> sieve(int limit) {\n    vector<bool> isPrime(limit + 1, true);\n    isPrime[0] = false;\n    isPrime[1] = false;\n    for (int number = 2; number * number <= limit; ++number) {\n        if (isPrime[number]) {\n            for (int multiple = number * number; multiple <= limit; multiple += number) {\n                isPrime[multiple] = false;\n            }\n        }\n    }\n\n    vector<int> primes;\n    for (int number = 2; number <= limit; ++number) if (isPrime[number]) primes.push_back(number);\n    return primes;\n}\n\nint main() {\n    cout << "gcd(48, 18): " << gcd(48, 18) << "\\n";\n    for (int value : sieve(20)) cout << value << ' ';\n    cout << "\\n";\n}\n`;
    case "array":
    default:
      return `#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> buildPrefixSum(const vector<int>& values) {\n    vector<int> prefix(values.size() + 1, 0);\n    for (int index = 0; index < static_cast<int>(values.size()); ++index) {\n        prefix[index + 1] = prefix[index] + values[index];\n    }\n    return prefix;\n}\n\nint rangeSum(const vector<int>& prefix, int left, int right) {\n    return prefix[right + 1] - prefix[left];\n}\n\nint main() {\n    vector<int> values = {4, 2, 7, 1, 9};\n    vector<int> prefix = buildPrefixSum(values);\n    cout << "sum from index 1 to 3: " << rangeSum(prefix, 1, 3) << "\\n";\n}\n`;
  }
}

function goTemplate(family: TemplateFamily, title: string): string {
  void title;
  switch (family) {
    case "string":
      return `package main\n\nimport "fmt"\n\nfunc longestUniqueSubstring(text string) int {\n\tseen := map[rune]int{}\n\tleft, best := 0, 0\n\tfor right, ch := range text {\n\t\tif index, ok := seen[ch]; ok && index >= left {\n\t\t\tleft = index + 1\n\t\t}\n\t\tseen[ch] = right\n\t\tif right-left+1 > best {\n\t\t\tbest = right - left + 1\n\t\t}\n\t}\n\treturn best\n}\n\nfunc main() {\n\ttext := "datastructures"\n\tfmt.Println("text:", text)\n\tfmt.Println("longest unique substring length:", longestUniqueSubstring(text))\n}\n`;
    case "linked-list":
      return `package main\n\nimport "fmt"\n\ntype ListNode struct {\n\tValue int\n\tNext  *ListNode\n}\n\nfunc reverseList(head *ListNode) *ListNode {\n\tvar previous *ListNode\n\tcurrent := head\n\tfor current != nil {\n\t\tnextNode := current.Next\n\t\tcurrent.Next = previous\n\t\tprevious = current\n\t\tcurrent = nextNode\n\t}\n\treturn previous\n}\n\nfunc toSlice(head *ListNode) []int {\n\tvalues := []int{}\n\tfor head != nil {\n\t\tvalues = append(values, head.Value)\n\t\thead = head.Next\n\t}\n\treturn values\n}\n\nfunc main() {\n\thead := &ListNode{1, &ListNode{2, &ListNode{3, &ListNode{4, nil}}}}\n\tfmt.Println("original:", toSlice(head))\n\tfmt.Println("reversed:", toSlice(reverseList(head)))\n}\n`;
    case "stack":
      return `package main\n\nimport "fmt"\n\nfunc isBalanced(expression string) bool {\n\tpairs := map[rune]rune{')': '(', ']': '[', '}': '{'}\n\tstack := []rune{}\n\n\tfor _, ch := range expression {\n\t\tswitch ch {\n\t\tcase '(', '[', '{':\n\t\t\tstack = append(stack, ch)\n\t\tcase ')', ']', '}':\n\t\t\tif len(stack) == 0 || stack[len(stack)-1] != pairs[ch] {\n\t\t\t\treturn false\n\t\t\t}\n\t\t\tstack = stack[:len(stack)-1]\n\t\t}\n\t}\n\n\treturn len(stack) == 0\n}\n\nfunc main() {\n\tfmt.Println("balanced:", isBalanced("([{}])()"))\n}\n`;
    case "queue":
      return `package main\n\nimport "fmt"\n\nfunc bfsLevels(graph map[string][]string, start string) []string {\n\tqueue := []string{start}\n\tseen := map[string]bool{start: true}\n\torder := []string{}\n\n\tfor len(queue) > 0 {\n\t\tnode := queue[0]\n\t\tqueue = queue[1:]\n\t\torder = append(order, node)\n\n\t\tfor _, neighbor := range graph[node] {\n\t\t\tif !seen[neighbor] {\n\t\t\t\tseen[neighbor] = true\n\t\t\t\tqueue = append(queue, neighbor)\n\t\t\t}\n\t\t}\n\t}\n\n\treturn order\n}\n\nfunc main() {\n\tgraph := map[string][]string{"A": {"B", "C"}, "B": {"D"}, "C": {"E"}, "D": {}, "E": {}}\n\tfmt.Println("level order:", bfsLevels(graph, "A"))\n}\n`;
    case "tree":
      return `package main\n\nimport "fmt"\n\ntype TreeNode struct {\n\tValue int\n\tLeft  *TreeNode\n\tRight *TreeNode\n}\n\nfunc inorder(node *TreeNode, values *[]int) {\n\tif node == nil {\n\t\treturn\n\t}\n\tinorder(node.Left, values)\n\t*values = append(*values, node.Value)\n\tinorder(node.Right, values)\n}\n\nfunc main() {\n\troot := &TreeNode{8, &TreeNode{3, &TreeNode{1, nil, nil}, &TreeNode{6, nil, nil}}, &TreeNode{10, nil, &TreeNode{14, nil, nil}}}\n\tvalues := []int{}\n\tinorder(root, &values)\n\tfmt.Println("binary tree inorder traversal:", values)\n}\n`;
    case "hash":
      return `package main\n\nimport (\n\t"fmt"\n\t"sort"\n)\n\nfunc groupAnagrams(words []string) map[string][]string {\n\tgroups := map[string][]string{}\n\tfor _, word := range words {\n\t\tchars := []rune(word)\n\t\tsort.Slice(chars, func(i, j int) bool { return chars[i] < chars[j] })\n\t\tsignature := string(chars)\n\t\tgroups[signature] = append(groups[signature], word)\n\t}\n\treturn groups\n}\n\nfunc main() {\n\twords := []string{"eat", "tea", "tan", "ate", "nat", "bat"}\n\tfmt.Println("groups:", groupAnagrams(words))\n}\n`;
    case "heap":
      return `package main\n\nimport (\n\t"fmt"\n\t"sort"\n)\n\nfunc kthLargest(values []int, k int) int {\n\tsorted := append([]int(nil), values...)\n\tsort.Sort(sort.Reverse(sort.IntSlice(sorted)))\n\treturn sorted[k-1]\n}\n\nfunc main() {\n\tvalues := []int{7, 2, 9, 4, 1, 12, 8}\n\tfmt.Println("3rd largest:", kthLargest(values, 3))\n}\n`;
    case "dp":
      return `package main\n\nimport "fmt"\n\nfunc climbStairs(steps int) int {\n\tif steps <= 2 {\n\t\treturn steps\n\t}\n\tprevious, current := 1, 2\n\tfor step := 3; step <= steps; step++ {\n\t\tprevious, current = current, previous+current\n\t}\n\treturn current\n}\n\nfunc main() {\n\tfmt.Println("ways to climb 7 steps:", climbStairs(7))\n}\n`;
    case "graph":
      return `package main\n\nimport "fmt"\n\nfunc shortestPath(graph map[string][]string, start string) map[string]int {\n\tqueue := []string{start}\n\tdistance := map[string]int{start: 0}\n\n\tfor len(queue) > 0 {\n\t\tnode := queue[0]\n\t\tqueue = queue[1:]\n\t\tfor _, neighbor := range graph[node] {\n\t\t\tif _, ok := distance[neighbor]; !ok {\n\t\t\t\tdistance[neighbor] = distance[node] + 1\n\t\t\t\tqueue = append(queue, neighbor)\n\t\t\t}\n\t\t}\n\t}\n\n\treturn distance\n}\n\nfunc main() {\n\tadjacencyList := map[string][]string{"A": {"B", "C"}, "B": {"D", "E"}, "C": {"F"}, "D": {}, "E": {"F"}, "F": {}}\n\tfmt.Println("adjacency list:", adjacencyList)\n\tfmt.Println("distances from A:", shortestPath(adjacencyList, "A"))\n}\n`;
    case "trie":
      return `package main\n\nimport "fmt"\n\ntype TrieNode struct {\n\tChildren map[rune]*TrieNode\n\tIsWord   bool\n}\n\ntype Trie struct {\n\tRoot *TrieNode\n}\n\nfunc NewTrie() *Trie {\n\treturn &Trie{Root: &TrieNode{Children: map[rune]*TrieNode{}}}\n}\n\nfunc (trie *Trie) Insert(word string) {\n\tnode := trie.Root\n\tfor _, ch := range word {\n\t\tif node.Children[ch] == nil {\n\t\t\tnode.Children[ch] = &TrieNode{Children: map[rune]*TrieNode{}}\n\t\t}\n\t\tnode = node.Children[ch]\n\t}\n\tnode.IsWord = true\n}\n\nfunc (trie *Trie) StartsWith(prefix string) bool {\n\tnode := trie.Root\n\tfor _, ch := range prefix {\n\t\tif node.Children[ch] == nil {\n\t\t\treturn false\n\t\t}\n\t\tnode = node.Children[ch]\n\t}\n\treturn true\n}\n\nfunc main() {\n\ttrie := NewTrie()\n\tfor _, word := range []string{"tree", "trie", "algo", "assoc"} {\n\t\ttrie.Insert(word)\n\t}\n\tfmt.Println("prefix 'tr':", trie.StartsWith("tr"))\n\tfmt.Println("prefix 'ds':", trie.StartsWith("ds"))\n}\n`;
    case "bit":
      return `package main\n\nimport "fmt"\n\nfunc countBits(value int) int {\n\tcount := 0\n\tfor value > 0 {\n\t\tvalue &= value - 1\n\t\tcount++\n\t}\n\treturn count\n}\n\nfunc main() {\n\tfmt.Println("set bits in 29:", countBits(29))\n}\n`;
    case "segment-tree":
      return `package main\n\nimport "fmt"\n\ntype SegmentTree struct {\n\tSize int\n\tTree []int\n}\n\nfunc NewSegmentTree(values []int) *SegmentTree {\n\tsize := 1\n\tfor size < len(values) {\n\t\tsize *= 2\n\t}\n\ttree := make([]int, size*2)\n\tfor index, value := range values {\n\t\ttree[size+index] = value\n\t}\n\tfor index := size - 1; index > 0; index-- {\n\t\ttree[index] = tree[index*2] + tree[index*2+1]\n\t}\n\treturn &SegmentTree{Size: size, Tree: tree}\n}\n\nfunc (segmentTree *SegmentTree) RangeSum(left, right int) int {\n\ttotal := 0\n\tleft += segmentTree.Size\n\tright += segmentTree.Size\n\tfor left <= right {\n\t\tif left%2 == 1 {\n\t\t\ttotal += segmentTree.Tree[left]\n\t\t\tleft++\n\t\t}\n\t\tif right%2 == 0 {\n\t\t\ttotal += segmentTree.Tree[right]\n\t\t\tright--\n\t\t}\n\t\tleft /= 2\n\t\tright /= 2\n\t}\n\treturn total\n}\n\nfunc main() {\n\tsegmentTree := NewSegmentTree([]int{2, 1, 5, 3, 4})\n\tfmt.Println("range sum [1, 3]:", segmentTree.RangeSum(1, 3))\n}\n`;
    case "geometry":
      return `package main\n\nimport "fmt"\n\nfunc cross(origin, a, b [2]int) int {\n\treturn (a[0]-origin[0])*(b[1]-origin[1]) - (a[1]-origin[1])*(b[0]-origin[0])\n}\n\nfunc main() {\n\tfmt.Println("orientation value:", cross([2]int{0, 0}, [2]int{1, 1}, [2]int{2, 0}))\n}\n`;
    case "oop":
      return `package main\n\nimport "fmt"\n\ntype Stack struct {\n\tvalues []int\n}\n\nfunc (stack *Stack) Push(value int) {\n\tstack.values = append(stack.values, value)\n}\n\nfunc (stack *Stack) Pop() int {\n\tlast := stack.values[len(stack.values)-1]\n\tstack.values = stack.values[:len(stack.values)-1]\n\treturn last\n}\n\nfunc main() {\n\tstack := &Stack{}\n\tstack.Push(3)\n\tstack.Push(5)\n\tstack.Push(8)\n\tfmt.Println(stack.Pop())\n\tfmt.Println(stack.Pop())\n}\n`;
    case "math":
      return `package main\n\nimport "fmt"\n\nfunc gcd(a, b int) int {\n\tfor b != 0 {\n\t\ta, b = b, a%b\n\t}\n\treturn a\n}\n\nfunc sieve(limit int) []int {\n\tisPrime := make([]bool, limit+1)\n\tfor i := range isPrime {\n\t\tisPrime[i] = true\n\t}\n\tisPrime[0], isPrime[1] = false, false\n\tfor number := 2; number*number <= limit; number++ {\n\t\tif isPrime[number] {\n\t\t\tfor multiple := number * number; multiple <= limit; multiple += number {\n\t\t\t\tisPrime[multiple] = false\n\t\t\t}\n\t\t}\n\t}\n\tprimes := []int{}\n\tfor number := 2; number <= limit; number++ {\n\t\tif isPrime[number] {\n\t\t\tprimes = append(primes, number)\n\t\t}\n\t}\n\treturn primes\n}\n\nfunc main() {\n\tfmt.Println("gcd(48, 18):", gcd(48, 18))\n\tfmt.Println("primes up to 20:", sieve(20))\n}\n`;
    case "array":
    default:
      return `package main\n\nimport "fmt"\n\nfunc buildPrefixSum(values []int) []int {\n\tprefix := []int{0}\n\tfor _, value := range values {\n\t\tprefix = append(prefix, prefix[len(prefix)-1]+value)\n\t}\n\treturn prefix\n}\n\nfunc rangeSum(prefix []int, left, right int) int {\n\treturn prefix[right+1] - prefix[left]\n}\n\nfunc main() {\n\tvalues := []int{4, 2, 7, 1, 9}\n\tprefix := buildPrefixSum(values)\n\tfmt.Println("values:", values)\n\tfmt.Println("prefix sums:", prefix)\n\tfmt.Println("sum from index 1 to 3:", rangeSum(prefix, 1, 3))\n}\n`;
  }
}

export function getPlaygroundTemplate(topicSlug: string, language: ProgrammingLanguage): string {
  const family = getTemplateFamily(topicSlug);
  const title = getTopicTitle(topicSlug);

  switch (language) {
    case "python":
      return pythonTemplate(family, title);
    case "java":
      return javaTemplate(family, title);
    case "cpp":
      return cppTemplate(family, title);
    case "go":
      return goTemplate(family, title);
    case "javascript":
    default:
      return javascriptTemplate(family, title);
  }
}
