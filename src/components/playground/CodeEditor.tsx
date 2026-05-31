"use client";

import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { useMemo } from "react";

const registeredLanguages = new Set<string>();
const themeName = "dsa-visualizer-dark";

const completionSnippets: Record<string, Array<{ label: string; insertText: string; documentation: string }>> = {
  javascript: [
    {
      label: "binary-search",
      documentation: "Binary search helper",
      insertText: [
        "function binarySearch(values, target) {",
        "  let left = 0;",
        "  let right = values.length - 1;",
        "",
        "  while (left <= right) {",
        "    const mid = Math.floor((left + right) / 2);",
        "    if (values[mid] === target) return mid;",
        "    if (values[mid] < target) left = mid + 1;",
        "    else right = mid - 1;",
        "  }",
        "",
        "  return -1;",
        "}",
      ].join("\n"),
    },
    {
      label: "bfs-template",
      documentation: "Queue based BFS traversal",
      insertText: [
        "function bfs(graph, start) {",
        "  const queue = [start];",
        "  const seen = new Set([start]);",
        "  const order = [];",
        "",
        "  while (queue.length > 0) {",
        "    const node = queue.shift();",
        "    order.push(node);",
        "",
        "    for (const neighbor of graph[node] ?? []) {",
        "      if (!seen.has(neighbor)) {",
        "        seen.add(neighbor);",
        "        queue.push(neighbor);",
        "      }",
        "    }",
        "  }",
        "",
        "  return order;",
        "}",
      ].join("\n"),
    },
  ],
  python: [
    {
      label: "binary-search",
      documentation: "Binary search helper",
      insertText: [
        "def binary_search(values: list[int], target: int) -> int:",
        "    left, right = 0, len(values) - 1",
        "",
        "    while left <= right:",
        "        mid = (left + right) // 2",
        "        if values[mid] == target:",
        "            return mid",
        "        if values[mid] < target:",
        "            left = mid + 1",
        "        else:",
        "            right = mid - 1",
        "",
        "    return -1",
      ].join("\n"),
    },
    {
      label: "bfs-template",
      documentation: "Queue based BFS traversal",
      insertText: [
        "from collections import deque",
        "",
        "def bfs(graph: dict[str, list[str]], start: str) -> list[str]:",
        "    queue = deque([start])",
        "    seen = {start}",
        "    order: list[str] = []",
        "",
        "    while queue:",
        "        node = queue.popleft()",
        "        order.append(node)",
        "",
        "        for neighbor in graph.get(node, []):",
        "            if neighbor not in seen:",
        "                seen.add(neighbor)",
        "                queue.append(neighbor)",
        "",
        "    return order",
      ].join("\n"),
    },
  ],
  java: [
    {
      label: "binary-search",
      documentation: "Binary search helper",
      insertText: [
        "static int binarySearch(int[] values, int target) {",
        "  int left = 0;",
        "  int right = values.length - 1;",
        "",
        "  while (left <= right) {",
        "    int mid = left + (right - left) / 2;",
        "    if (values[mid] == target) return mid;",
        "    if (values[mid] < target) left = mid + 1;",
        "    else right = mid - 1;",
        "  }",
        "",
        "  return -1;",
        "}",
      ].join("\n"),
    },
    {
      label: "bfs-template",
      documentation: "Queue based BFS traversal",
      insertText: [
        "static java.util.List<String> bfs(java.util.Map<String, java.util.List<String>> graph, String start) {",
        "  java.util.Queue<String> queue = new java.util.ArrayDeque<>();",
        "  java.util.Set<String> seen = new java.util.HashSet<>();",
        "  java.util.List<String> order = new java.util.ArrayList<>();",
        "  queue.offer(start);",
        "  seen.add(start);",
        "",
        "  while (!queue.isEmpty()) {",
        "    String node = queue.poll();",
        "    order.add(node);",
        "    for (String neighbor : graph.getOrDefault(node, java.util.List.of())) {",
        "      if (seen.add(neighbor)) queue.offer(neighbor);",
        "    }",
        "  }",
        "",
        "  return order;",
        "}",
      ].join("\n"),
    },
  ],
  cpp: [
    {
      label: "binary-search",
      documentation: "Binary search helper",
      insertText: [
        "int binarySearch(const vector<int>& values, int target) {",
        "    int left = 0;",
        "    int right = static_cast<int>(values.size()) - 1;",
        "",
        "    while (left <= right) {",
        "        int mid = left + (right - left) / 2;",
        "        if (values[mid] == target) return mid;",
        "        if (values[mid] < target) left = mid + 1;",
        "        else right = mid - 1;",
        "    }",
        "",
        "    return -1;",
        "}",
      ].join("\n"),
    },
    {
      label: "bfs-template",
      documentation: "Queue based BFS traversal",
      insertText: [
        "vector<string> bfs(const unordered_map<string, vector<string>>& graph, const string& start) {",
        "    queue<string> q;",
        "    unordered_set<string> seen = {start};",
        "    vector<string> order;",
        "    q.push(start);",
        "",
        "    while (!q.empty()) {",
        "        string node = q.front();",
        "        q.pop();",
        "        order.push_back(node);",
        "        for (const string& neighbor : graph.at(node)) {",
        "            if (!seen.count(neighbor)) {",
        "                seen.insert(neighbor);",
        "                q.push(neighbor);",
        "            }",
        "        }",
        "    }",
        "",
        "    return order;",
        "}",
      ].join("\n"),
    },
  ],
  go: [
    {
      label: "binary-search",
      documentation: "Binary search helper",
      insertText: [
        "func binarySearch(values []int, target int) int {",
        "\tleft, right := 0, len(values)-1",
        "\tfor left <= right {",
        "\t\tmid := left + (right-left)/2",
        "\t\tif values[mid] == target {",
        "\t\t\treturn mid",
        "\t\t}",
        "\t\tif values[mid] < target {",
        "\t\t\tleft = mid + 1",
        "\t\t} else {",
        "\t\t\tright = mid - 1",
        "\t\t}",
        "\t}",
        "\treturn -1",
        "}",
      ].join("\n"),
    },
    {
      label: "bfs-template",
      documentation: "Queue based BFS traversal",
      insertText: [
        "func bfs(graph map[string][]string, start string) []string {",
        "\tqueue := []string{start}",
        "\tseen := map[string]bool{start: true}",
        "\torder := []string{}",
        "",
        "\tfor len(queue) > 0 {",
        "\t\tnode := queue[0]",
        "\t\tqueue = queue[1:]",
        "\t\torder = append(order, node)",
        "",
        "\t\tfor _, neighbor := range graph[node] {",
        "\t\t\tif !seen[neighbor] {",
        "\t\t\t\tseen[neighbor] = true",
        "\t\t\t\tqueue = append(queue, neighbor)",
        "\t\t\t}",
        "\t\t}",
        "\t}",
        "",
        "\treturn order",
        "}",
      ].join("\n"),
    },
  ],
};

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
}

function registerTheme(monaco: Monaco) {
  monaco.editor.defineTheme(themeName, {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#020617",
      "editor.lineHighlightBackground": "#0f172a",
      "editor.selectionBackground": "#1e293b",
      "editorCursor.foreground": "#38bdf8",
      "editorLineNumber.foreground": "#475569",
      "editorLineNumber.activeForeground": "#e2e8f0",
      "editorWidget.background": "#0f172a",
      "editorSuggestWidget.background": "#0f172a",
    },
  });
}

function registerCompletions(monaco: Monaco, language: string) {
  if (registeredLanguages.has(language)) {
    return;
  }

  const snippets = completionSnippets[language] ?? [];
  if (snippets.length === 0) {
    return;
  }

  monaco.languages.registerCompletionItemProvider(language, {
    provideCompletionItems: () => ({
      suggestions: snippets.map((snippet, index) => ({
        label: snippet.label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: snippet.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: snippet.documentation,
        sortText: `0${index}`,
      })),
    }),
  });

  registeredLanguages.add(language);
}

export default function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  const editorLoading = useMemo(
    () => (
      <div className="flex h-[420px] w-full animate-pulse flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/80 p-6">
        <div className="h-4 w-40 rounded-full bg-slate-800" />
        <div className="h-4 w-full rounded-full bg-slate-900" />
        <div className="h-4 w-5/6 rounded-full bg-slate-900" />
        <div className="h-4 w-3/4 rounded-full bg-slate-900" />
        <div className="h-4 w-2/3 rounded-full bg-slate-900" />
        <div className="h-4 w-4/5 rounded-full bg-slate-900" />
      </div>
    ),
    []
  );

  const handleBeforeMount = (monaco: Monaco) => {
    registerTheme(monaco);
    Object.keys(completionSnippets).forEach((snippetLanguage) => registerCompletions(monaco, snippetLanguage));
  };

  const handleMount: OnMount = (editor, monaco) => {
    monaco.editor.setTheme(themeName);
    editor.focus();
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-950/70 shadow-2xl shadow-cyan-950/20">
      <Editor
        beforeMount={handleBeforeMount}
        defaultLanguage={language}
        height="420px"
        language={language}
        loading={editorLoading}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        onMount={handleMount}
        options={{
          automaticLayout: true,
          bracketPairColorization: { enabled: true },
          cursorBlinking: "smooth",
          fontLigatures: true,
          fontSize: 14,
          lineNumbers: "on",
          minimap: { enabled: true },
          padding: { top: 18, bottom: 18 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          suggestOnTriggerCharacters: true,
          wordWrap: "on",
        }}
        theme={themeName}
        value={value}
      />
    </div>
  );
}
