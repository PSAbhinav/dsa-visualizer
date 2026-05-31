import { getTopicBySlug, topics, type Problem, type ProgrammingLanguage, type Topic } from "@/data/topics";

export type ProblemTemplateKind = "array" | "string" | "linked-list" | "tree" | "graph";

export interface ProblemTemplateContext {
  problem: Problem;
  topic: Topic;
  kind: ProblemTemplateKind;
}

const treeKeywords = ["tree", "bst", "heap", "trie", "segment"];
const graphKeywords = ["graph", "network", "disjoint", "province", "course-schedule", "island"];
const stringKeywords = ["string", "palindrome", "anagram", "substring"];
const linkedListKeywords = ["linked", "listnode", "browser-history"];

function getTemplateKind(topic: Topic): ProblemTemplateKind {
  const value = `${topic.slug} ${topic.title} ${topic.visualizerType}`.toLowerCase();

  if (linkedListKeywords.some((keyword) => value.includes(keyword))) {
    return "linked-list";
  }

  if (graphKeywords.some((keyword) => value.includes(keyword))) {
    return "graph";
  }

  if (treeKeywords.some((keyword) => value.includes(keyword))) {
    return "tree";
  }

  if (stringKeywords.some((keyword) => value.includes(keyword))) {
    return "string";
  }

  return "array";
}

function toFunctionName(problemId: string): string {
  const segments = problemId
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((segment) => segment.toLowerCase());

  if (segments.length === 0) {
    return "solveProblem";
  }

  const [first, ...rest] = segments;
  const camelCase = `${first}${rest.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join("")}`;
  return /^[a-zA-Z_$]/.test(camelCase) ? camelCase : `solve${camelCase.charAt(0).toUpperCase()}${camelCase.slice(1)}`;
}

function buildHeader(problem: Problem): string[] {
  return [
    `Problem: ${problem.title}`,
    problem.description,
    `Expected: Time ${problem.expectedTimeComplexity}, Space ${problem.expectedSpaceComplexity}`,
  ];
}

function buildComment(lines: string[], prefix: string) {
  return lines.map((line) => `${prefix} ${line}`).join("\n");
}

function buildPythonTemplate(context: ProblemTemplateContext): string {
  const { problem, kind } = context;
  const functionName = toFunctionName(problem.id);
  const header = buildComment(buildHeader(problem), "#");

  switch (kind) {
    case "string":
      return `${header}\n\ndef ${functionName}(s: str) -> bool:\n    # Your solution here\n    return False\n\n\ns = "A man, a plan, a canal: Panama"\nprint(${functionName}(s))\n`;
    case "linked-list":
      return `${header}\n\nclass ListNode:\n    def __init__(self, val: int = 0, next_node: "ListNode | None" = None):\n        self.val = val\n        self.next = next_node\n\n\ndef ${functionName}(head: ListNode | None) -> ListNode | None:\n    # Your solution here\n    return head\n\n\ndef to_list(head: ListNode | None) -> list[int]:\n    values: list[int] = []\n    while head is not None:\n        values.append(head.val)\n        head = head.next\n    return values\n\n\nhead = ListNode(1, ListNode(2, ListNode(3, ListNode(4))))\nprint(to_list(${functionName}(head)))\n`;
    case "tree":
      return `${header}\n\nclass TreeNode:\n    def __init__(self, val: int = 0, left: "TreeNode | None" = None, right: "TreeNode | None" = None):\n        self.val = val\n        self.left = left\n        self.right = right\n\n\ndef ${functionName}(root: TreeNode | None) -> list[int]:\n    # Your solution here\n    return []\n\n\nroot = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3))\nprint(${functionName}(root))\n`;
    case "graph":
      return `${header}\n\ndef ${functionName}(graph: dict[str, list[str]], start: str) -> dict[str, int]:\n    # Your solution here\n    return {start: 0}\n\n\nadjacency_list = {\n    "A": ["B", "C"],\n    "B": ["D"],\n    "C": ["D", "E"],\n    "D": [],\n    "E": [],\n}\nprint(${functionName}(adjacency_list, "A"))\n`;
    case "array":
    default:
      return `${header}\n\ndef ${functionName}(nums: list[int], target: int) -> list[int]:\n    # Your solution here\n    return []\n\n\nnums = [2, 7, 11, 15]\ntarget = 9\nprint(${functionName}(nums, target))\n`;
  }
}

function buildJavascriptTemplate(context: ProblemTemplateContext): string {
  const { problem, kind } = context;
  const functionName = toFunctionName(problem.id);
  const header = buildComment(buildHeader(problem), "//");

  switch (kind) {
    case "string":
      return `${header}\n\nfunction ${functionName}(s) {\n  // Your solution here\n  return false;\n}\n\nconst s = "A man, a plan, a canal: Panama";\nconsole.log(${functionName}(s));\n`;
    case "linked-list":
      return `${header}\n\nclass ListNode {\n  constructor(val, next = null) {\n    this.val = val;\n    this.next = next;\n  }\n}\n\nfunction ${functionName}(head) {\n  // Your solution here\n  return head;\n}\n\nfunction toArray(head) {\n  const values = [];\n  let current = head;\n  while (current) {\n    values.push(current.val);\n    current = current.next;\n  }\n  return values;\n}\n\nconst head = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4))));\nconsole.log(toArray(${functionName}(head)));\n`;
    case "tree":
      return `${header}\n\nclass TreeNode {\n  constructor(val, left = null, right = null) {\n    this.val = val;\n    this.left = left;\n    this.right = right;\n  }\n}\n\nfunction ${functionName}(root) {\n  // Your solution here\n  return [];\n}\n\nconst root = new TreeNode(1, new TreeNode(2, new TreeNode(4), new TreeNode(5)), new TreeNode(3));\nconsole.log(${functionName}(root));\n`;
    case "graph":
      return `${header}\n\nfunction ${functionName}(graph, start) {\n  // Your solution here\n  return { [start]: 0 };\n}\n\nconst adjacencyList = {\n  A: ["B", "C"],\n  B: ["D"],\n  C: ["D", "E"],\n  D: [],\n  E: [],\n};\nconsole.log(${functionName}(adjacencyList, "A"));\n`;
    case "array":
    default:
      return `${header}\n\nfunction ${functionName}(nums, target) {\n  // Your solution here\n  return [];\n}\n\nconst nums = [2, 7, 11, 15];\nconst target = 9;\nconsole.log(${functionName}(nums, target));\n`;
  }
}

function buildJavaTemplate(context: ProblemTemplateContext): string {
  const { problem, kind } = context;
  const functionName = toFunctionName(problem.id);
  const header = buildComment(buildHeader(problem), "//");

  switch (kind) {
    case "string":
      return `${header}\npublic class Main {\n  static boolean ${functionName}(String s) {\n    // Your solution here\n    return false;\n  }\n\n  public static void main(String[] args) {\n    String s = \"A man, a plan, a canal: Panama\";\n    System.out.println(${functionName}(s));\n  }\n}\n`;
    case "linked-list":
      return `${header}\npublic class Main {\n  static class ListNode {\n    int val;\n    ListNode next;\n\n    ListNode(int val, ListNode next) {\n      this.val = val;\n      this.next = next;\n    }\n  }\n\n  static ListNode ${functionName}(ListNode head) {\n    // Your solution here\n    return head;\n  }\n\n  static String toString(ListNode head) {\n    StringBuilder builder = new StringBuilder();\n    while (head != null) {\n      if (builder.length() > 0) builder.append(\" -> \" );\n      builder.append(head.val);\n      head = head.next;\n    }\n    return builder.toString();\n  }\n\n  public static void main(String[] args) {\n    ListNode head = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4, null))));\n    System.out.println(toString(${functionName}(head)));\n  }\n}\n`;
    case "tree":
      return `${header}\nimport java.util.*;\n\npublic class Main {\n  static class TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n\n    TreeNode(int val) {\n      this.val = val;\n    }\n  }\n\n  static List<Integer> ${functionName}(TreeNode root) {\n    // Your solution here\n    return new ArrayList<>();\n  }\n\n  public static void main(String[] args) {\n    TreeNode root = new TreeNode(1);\n    root.left = new TreeNode(2);\n    root.right = new TreeNode(3);\n    root.left.left = new TreeNode(4);\n    root.left.right = new TreeNode(5);\n    System.out.println(${functionName}(root));\n  }\n}\n`;
    case "graph":
      return `${header}\nimport java.util.*;\n\npublic class Main {\n  static Map<String, Integer> ${functionName}(Map<String, List<String>> graph, String start) {\n    // Your solution here\n    return new LinkedHashMap<>(Map.of(start, 0));\n  }\n\n  public static void main(String[] args) {\n    Map<String, List<String>> graph = new LinkedHashMap<>();\n    graph.put(\"A\", List.of(\"B\", \"C\"));\n    graph.put(\"B\", List.of(\"D\"));\n    graph.put(\"C\", List.of(\"D\", \"E\"));\n    graph.put(\"D\", List.of());\n    graph.put(\"E\", List.of());\n    System.out.println(${functionName}(graph, \"A\"));\n  }\n}\n`;
    case "array":
    default:
      return `${header}\nimport java.util.*;\n\npublic class Main {\n  static int[] ${functionName}(int[] nums, int target) {\n    // Your solution here\n    return new int[0];\n  }\n\n  public static void main(String[] args) {\n    int[] nums = {2, 7, 11, 15};\n    int target = 9;\n    System.out.println(Arrays.toString(${functionName}(nums, target)));\n  }\n}\n`;
  }
}

function buildCppTemplate(context: ProblemTemplateContext): string {
  const { problem, kind } = context;
  const functionName = toFunctionName(problem.id);
  const header = buildComment(buildHeader(problem), "//");

  switch (kind) {
    case "string":
      return `${header}\n#include <iostream>\n#include <string>\nusing namespace std;\n\nbool ${functionName}(string s) {\n    // Your solution here\n    return false;\n}\n\nint main() {\n    string s = \"A man, a plan, a canal: Panama\";\n    cout << boolalpha << ${functionName}(s) << "\\n";\n}\n`;
    case "linked-list":
      return `${header}\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nstruct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int val, ListNode* next = nullptr) : val(val), next(next) {}\n};\n\nListNode* ${functionName}(ListNode* head) {\n    // Your solution here\n    return head;\n}\n\nvector<int> toVector(ListNode* head) {\n    vector<int> values;\n    while (head != nullptr) {\n        values.push_back(head->val);\n        head = head->next;\n    }\n    return values;\n}\n\nint main() {\n    ListNode* head = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4))));\n    for (int value : toVector(${functionName}(head))) cout << value << ' ';\n    cout << "\\n";\n}\n`;
    case "tree":
      return `${header}\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nstruct TreeNode {\n    int val;\n    TreeNode* left;\n    TreeNode* right;\n    TreeNode(int val, TreeNode* left = nullptr, TreeNode* right = nullptr) : val(val), left(left), right(right) {}\n};\n\nvector<int> ${functionName}(TreeNode* root) {\n    // Your solution here\n    return {};\n}\n\nint main() {\n    TreeNode* root = new TreeNode(1, new TreeNode(2, new TreeNode(4), new TreeNode(5)), new TreeNode(3));\n    for (int value : ${functionName}(root)) cout << value << ' ';\n    cout << "\\n";\n}\n`;
    case "graph":
      return `${header}\n#include <iostream>\n#include <string>\n#include <unordered_map>\n#include <vector>\nusing namespace std;\n\nunordered_map<string, int> ${functionName}(unordered_map<string, vector<string>> graph, string start) {\n    // Your solution here\n    return {{start, 0}};\n}\n\nint main() {\n    unordered_map<string, vector<string>> graph = {{\"A\", {\"B\", \"C\"}}, {\"B\", {\"D\"}}, {\"C\", {\"D\", \"E\"}}, {\"D\", {}}, {\"E\", {}}};\n    auto distances = ${functionName}(graph, \"A\");\n    for (const auto& [node, distance] : distances) cout << node << ':' << distance << ' ';\n    cout << "\\n";\n}\n`;
    case "array":
    default:
      return `${header}\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> ${functionName}(vector<int>& nums, int target) {\n    // Your solution here\n    return {};\n}\n\nint main() {\n    vector<int> nums = {2, 7, 11, 15};\n    int target = 9;\n    for (int value : ${functionName}(nums, target)) cout << value << ' ';\n    cout << "\\n";\n}\n`;
  }
}

function buildGoTemplate(context: ProblemTemplateContext): string {
  const { problem, kind } = context;
  const functionName = toFunctionName(problem.id);
  const header = buildComment(buildHeader(problem), "//");

  switch (kind) {
    case "string":
      return `${header}\npackage main\n\nimport \"fmt\"\n\nfunc ${functionName}(s string) bool {\n\t// Your solution here\n\treturn false\n}\n\nfunc main() {\n\ts := \"A man, a plan, a canal: Panama\"\n\tfmt.Println(${functionName}(s))\n}\n`;
    case "linked-list":
      return `${header}\npackage main\n\nimport \"fmt\"\n\ntype ListNode struct {\n\tVal  int\n\tNext *ListNode\n}\n\nfunc ${functionName}(head *ListNode) *ListNode {\n\t// Your solution here\n\treturn head\n}\n\nfunc toSlice(head *ListNode) []int {\n\tvalues := []int{}\n\tfor head != nil {\n\t\tvalues = append(values, head.Val)\n\t\thead = head.Next\n\t}\n\treturn values\n}\n\nfunc main() {\n\thead := &ListNode{Val: 1, Next: &ListNode{Val: 2, Next: &ListNode{Val: 3, Next: &ListNode{Val: 4}}}}\n\tfmt.Println(toSlice(${functionName}(head)))\n}\n`;
    case "tree":
      return `${header}\npackage main\n\nimport \"fmt\"\n\ntype TreeNode struct {\n\tVal   int\n\tLeft  *TreeNode\n\tRight *TreeNode\n}\n\nfunc ${functionName}(root *TreeNode) []int {\n\t// Your solution here\n\treturn []int{}\n}\n\nfunc main() {\n\troot := &TreeNode{Val: 1, Left: &TreeNode{Val: 2, Left: &TreeNode{Val: 4}, Right: &TreeNode{Val: 5}}, Right: &TreeNode{Val: 3}}\n\tfmt.Println(${functionName}(root))\n}\n`;
    case "graph":
      return `${header}\npackage main\n\nimport \"fmt\"\n\nfunc ${functionName}(graph map[string][]string, start string) map[string]int {\n\t// Your solution here\n\treturn map[string]int{start: 0}\n}\n\nfunc main() {\n\tgraph := map[string][]string{\n\t\t\"A\": []string{\"B\", \"C\"},\n\t\t\"B\": []string{\"D\"},\n\t\t\"C\": []string{\"D\", \"E\"},\n\t\t\"D\": []string{},\n\t\t\"E\": []string{},\n\t}\n\tfmt.Println(${functionName}(graph, \"A\"))\n}\n`;
    case "array":
    default:
      return `${header}\npackage main\n\nimport \"fmt\"\n\nfunc ${functionName}(nums []int, target int) []int {\n\t// Your solution here\n\treturn []int{}\n}\n\nfunc main() {\n\tnums := []int{2, 7, 11, 15}\n\ttarget := 9\n\tfmt.Println(${functionName}(nums, target))\n}\n`;
  }
}

export function getProblemContext(problemId?: string | null, topicSlug?: string | null): ProblemTemplateContext | null {
  const normalizedProblemId = problemId?.trim();
  if (!normalizedProblemId) {
    return null;
  }

  const topic = topicSlug ? getTopicBySlug(topicSlug) : undefined;
  const topicMatch = topic?.problems.find((problem) => problem.id === normalizedProblemId);

  if (topicMatch && topic) {
    return {
      problem: topicMatch,
      topic,
      kind: getTemplateKind(topic),
    };
  }

  for (const currentTopic of topics) {
    const problem = currentTopic.problems.find((candidate) => candidate.id === normalizedProblemId);
    if (problem) {
      return {
        problem,
        topic: currentTopic,
        kind: getTemplateKind(currentTopic),
      };
    }
  }

  return null;
}

export function getProblemTemplate(context: ProblemTemplateContext, language: ProgrammingLanguage): string {
  switch (language) {
    case "python":
      return buildPythonTemplate(context);
    case "java":
      return buildJavaTemplate(context);
    case "cpp":
      return buildCppTemplate(context);
    case "go":
      return buildGoTemplate(context);
    case "javascript":
    default:
      return buildJavascriptTemplate(context);
  }
}
