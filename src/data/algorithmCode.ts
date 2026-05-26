import { CodeImplementation } from "./types";

// ===== ARRAYS =====
export const linearSearchCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

# Example
arr = [10, 23, 45, 70, 11, 15]
print(linear_search(arr, 70))  # Output: 3`,
  },
  {
    language: "java",
    code: `public class LinearSearch {
    public static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) return i;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {10, 23, 45, 70, 11, 15};
        System.out.println(linearSearch(arr, 70)); // Output: 3
    }
}`,
  },
  {
    language: "cpp",
    code: `#include <iostream>
#include <vector>
using namespace std;

int linearSearch(vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}

int main() {
    vector<int> arr = {10, 23, 45, 70, 11, 15};
    cout << linearSearch(arr, 70) << endl; // Output: 3
}`,
  },
  {
    language: "javascript",
    code: `function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return i;
    }
    return -1;
}

// Example
const arr = [10, 23, 45, 70, 11, 15];
console.log(linearSearch(arr, 70)); // Output: 3`,
  },
  {
    language: "go",
    code: `package main

import "fmt"

func linearSearch(arr []int, target int) int {
    for i, v := range arr {
        if v == target {
            return i
        }
    }
    return -1
}

func main() {
    arr := []int{10, 23, 45, 70, 11, 15}
    fmt.Println(linearSearch(arr, 70)) // Output: 3
}`,
  },
];

export const binarySearchCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Example
arr = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72]
print(binary_search(arr, 23))  # Output: 5`,
  },
  {
    language: "java",
    code: `public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {2, 5, 8, 12, 16, 23, 38, 45, 56, 72};
        System.out.println(binarySearch(arr, 23)); // Output: 5
    }
}`,
  },
  {
    language: "cpp",
    code: `#include <iostream>
#include <vector>
using namespace std;

int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    vector<int> arr = {2, 5, 8, 12, 16, 23, 38, 45, 56, 72};
    cout << binarySearch(arr, 23) << endl; // Output: 5
}`,
  },
  {
    language: "javascript",
    code: `function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

// Example
const arr = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72];
console.log(binarySearch(arr, 23)); // Output: 5`,
  },
  {
    language: "go",
    code: `package main

import "fmt"

func binarySearch(arr []int, target int) int {
    left, right := 0, len(arr)-1
    for left <= right {
        mid := left + (right-left)/2
        if arr[mid] == target {
            return mid
        } else if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return -1
}

func main() {
    arr := []int{2, 5, 8, 12, 16, 23, 38, 45, 56, 72}
    fmt.Println(binarySearch(arr, 23)) // Output: 5
}`,
  },
];

export const twoPointerCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    return [-1, -1]

# Example
arr = [2, 7, 11, 15, 20]
print(two_sum_sorted(arr, 22))  # Output: [1, 3]`,
  },
  {
    language: "java",
    code: `public class TwoPointer {
    public static int[] twoSum(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left < right) {
            int sum = arr[left] + arr[right];
            if (sum == target) return new int[]{left, right};
            else if (sum < target) left++;
            else right--;
        }
        return new int[]{-1, -1};
    }
}`,
  },
  {
    language: "cpp",
    code: `#include <vector>
using namespace std;

pair<int,int> twoSum(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return {left, right};
        else if (sum < target) left++;
        else right--;
    }
    return {-1, -1};
}`,
  },
  {
    language: "javascript",
    code: `function twoSum(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left < right) {
        const sum = arr[left] + arr[right];
        if (sum === target) return [left, right];
        else if (sum < target) left++;
        else right--;
    }
    return [-1, -1];
}`,
  },
  {
    language: "go",
    code: `func twoSum(arr []int, target int) [2]int {
    left, right := 0, len(arr)-1
    for left < right {
        sum := arr[left] + arr[right]
        if sum == target {
            return [2]int{left, right}
        } else if sum < target {
            left++
        } else {
            right--
        }
    }
    return [2]int{-1, -1}
}`,
  },
];

// ===== STRINGS =====
export const stringReversalCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def reverse_string(s):
    chars = list(s)
    left, right = 0, len(chars) - 1
    while left < right:
        chars[left], chars[right] = chars[right], chars[left]
        left += 1
        right -= 1
    return ''.join(chars)

# Example
print(reverse_string("hello"))  # Output: "olleh"`,
  },
  {
    language: "java",
    code: `public class StringReversal {
    public static String reverse(String s) {
        char[] chars = s.toCharArray();
        int left = 0, right = chars.length - 1;
        while (left < right) {
            char temp = chars[left];
            chars[left] = chars[right];
            chars[right] = temp;
            left++;
            right--;
        }
        return new String(chars);
    }

    public static void main(String[] args) {
        System.out.println(reverse("hello")); // Output: "olleh"
    }
}`,
  },
  {
    language: "cpp",
    code: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

string reverseString(string s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        swap(s[left], s[right]);
        left++;
        right--;
    }
    return s;
}

int main() {
    cout << reverseString("hello") << endl; // Output: "olleh"
}`,
  },
  {
    language: "javascript",
    code: `function reverseString(s) {
    const chars = s.split('');
    let left = 0, right = chars.length - 1;
    while (left < right) {
        [chars[left], chars[right]] = [chars[right], chars[left]];
        left++;
        right--;
    }
    return chars.join('');
}

console.log(reverseString("hello")); // Output: "olleh"`,
  },
  {
    language: "go",
    code: `package main

import "fmt"

func reverseString(s string) string {
    runes := []rune(s)
    left, right := 0, len(runes)-1
    for left < right {
        runes[left], runes[right] = runes[right], runes[left]
        left++
        right--
    }
    return string(runes)
}

func main() {
    fmt.Println(reverseString("hello")) // Output: "olleh"
}`,
  },
];

export const palindromeCheckCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True

# Example
print(is_palindrome("racecar"))  # Output: True
print(is_palindrome("hello"))    # Output: False`,
  },
  {
    language: "java",
    code: `public class PalindromeCheck {
    public static boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            if (s.charAt(left) != s.charAt(right)) return false;
            left++;
            right--;
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("racecar")); // true
        System.out.println(isPalindrome("hello"));   // false
    }
}`,
  },
  {
    language: "cpp",
    code: `#include <iostream>
#include <string>
using namespace std;

bool isPalindrome(const string& s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        if (s[left] != s[right]) return false;
        left++;
        right--;
    }
    return true;
}

int main() {
    cout << boolalpha;
    cout << isPalindrome("racecar") << endl; // true
    cout << isPalindrome("hello") << endl;   // false
}`,
  },
  {
    language: "javascript",
    code: `function isPalindrome(s) {
    let left = 0, right = s.length - 1;
    while (left < right) {
        if (s[left] !== s[right]) return false;
        left++;
        right--;
    }
    return true;
}

console.log(isPalindrome("racecar")); // true
console.log(isPalindrome("hello"));   // false`,
  },
  {
    language: "go",
    code: `package main

import "fmt"

func isPalindrome(s string) bool {
    left, right := 0, len(s)-1
    for left < right {
        if s[left] != s[right] {
            return false
        }
        left++
        right--
    }
    return true
}

func main() {
    fmt.Println(isPalindrome("racecar")) // true
    fmt.Println(isPalindrome("hello"))   // false
}`,
  },
];

// ===== LINKED LISTS =====
export const reverseLinkedListCode: CodeImplementation[] = [
  {
    language: "python",
    code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    prev = None
    current = head
    while current:
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node
    return prev`,
  },
  {
    language: "java",
    code: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

public class ReverseLinkedList {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null, current = head;
        while (current != null) {
            ListNode next = current.next;
            current.next = prev;
            prev = current;
            current = next;
        }
        return prev;
    }
}`,
  },
  {
    language: "cpp",
    code: `struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* current = head;
    while (current) {
        ListNode* next = current->next;
        current->next = prev;
        prev = current;
        current = next;
    }
    return prev;
}`,
  },
  {
    language: "javascript",
    code: `function reverseList(head) {
    let prev = null;
    let current = head;
    while (current) {
        const next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    return prev;
}`,
  },
  {
    language: "go",
    code: `type ListNode struct {
    Val  int
    Next *ListNode
}

func reverseList(head *ListNode) *ListNode {
    var prev *ListNode
    current := head
    for current != nil {
        next := current.Next
        current.Next = prev
        prev = current
        current = next
    }
    return prev
}`,
  },
];

export const detectCycleCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`,
  },
  {
    language: "java",
    code: `public boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}`,
  },
  {
    language: "cpp",
    code: `bool hasCycle(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
  },
  {
    language: "javascript",
    code: `function hasCycle(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) return true;
    }
    return false;
}`,
  },
  {
    language: "go",
    code: `func hasCycle(head *ListNode) bool {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
        if slow == fast {
            return true
        }
    }
    return false
}`,
  },
];

// ===== STACKS =====
export const stackOperationsCode: CodeImplementation[] = [
  {
    language: "python",
    code: `class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        if not self.is_empty():
            return self.items.pop()
        raise IndexError("Stack is empty")

    def peek(self):
        if not self.is_empty():
            return self.items[-1]
        raise IndexError("Stack is empty")

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)`,
  },
  {
    language: "java",
    code: `import java.util.ArrayList;

public class Stack<T> {
    private ArrayList<T> items = new ArrayList<>();

    public void push(T item) {
        items.add(item);
    }

    public T pop() {
        if (isEmpty()) throw new RuntimeException("Stack empty");
        return items.remove(items.size() - 1);
    }

    public T peek() {
        if (isEmpty()) throw new RuntimeException("Stack empty");
        return items.get(items.size() - 1);
    }

    public boolean isEmpty() { return items.isEmpty(); }
    public int size() { return items.size(); }
}`,
  },
  {
    language: "cpp",
    code: `#include <vector>
#include <stdexcept>
using namespace std;

template<typename T>
class Stack {
    vector<T> items;
public:
    void push(T item) { items.push_back(item); }
    
    T pop() {
        if (isEmpty()) throw runtime_error("Stack empty");
        T top = items.back();
        items.pop_back();
        return top;
    }
    
    T peek() {
        if (isEmpty()) throw runtime_error("Stack empty");
        return items.back();
    }
    
    bool isEmpty() { return items.empty(); }
    int size() { return items.size(); }
};`,
  },
  {
    language: "javascript",
    code: `class Stack {
    constructor() {
        this.items = [];
    }

    push(item) { this.items.push(item); }
    
    pop() {
        if (this.isEmpty()) throw new Error("Stack empty");
        return this.items.pop();
    }
    
    peek() {
        if (this.isEmpty()) throw new Error("Stack empty");
        return this.items[this.items.length - 1];
    }
    
    isEmpty() { return this.items.length === 0; }
    size() { return this.items.length; }
}`,
  },
  {
    language: "go",
    code: `package main

import "errors"

type Stack struct {
    items []interface{}
}

func (s *Stack) Push(item interface{}) {
    s.items = append(s.items, item)
}

func (s *Stack) Pop() (interface{}, error) {
    if s.IsEmpty() {
        return nil, errors.New("stack empty")
    }
    top := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return top, nil
}

func (s *Stack) Peek() (interface{}, error) {
    if s.IsEmpty() {
        return nil, errors.New("stack empty")
    }
    return s.items[len(s.items)-1], nil
}

func (s *Stack) IsEmpty() bool { return len(s.items) == 0 }`,
  },
];

// ===== QUEUES =====
export const queueOperationsCode: CodeImplementation[] = [
  {
    language: "python",
    code: `from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()

    def enqueue(self, item):
        self.items.append(item)

    def dequeue(self):
        if not self.is_empty():
            return self.items.popleft()
        raise IndexError("Queue is empty")

    def front(self):
        if not self.is_empty():
            return self.items[0]
        raise IndexError("Queue is empty")

    def is_empty(self):
        return len(self.items) == 0`,
  },
  {
    language: "java",
    code: `import java.util.LinkedList;

public class Queue<T> {
    private LinkedList<T> items = new LinkedList<>();

    public void enqueue(T item) { items.addLast(item); }
    
    public T dequeue() {
        if (isEmpty()) throw new RuntimeException("Queue empty");
        return items.removeFirst();
    }
    
    public T front() {
        if (isEmpty()) throw new RuntimeException("Queue empty");
        return items.getFirst();
    }
    
    public boolean isEmpty() { return items.isEmpty(); }
}`,
  },
  {
    language: "cpp",
    code: `#include <queue>
using namespace std;

// Using STL queue
queue<int> q;
q.push(10);    // enqueue
q.push(20);
int front = q.front(); // peek front: 10
q.pop();               // dequeue
// Custom implementation with linked list:
template<typename T>
class Queue {
    struct Node { T data; Node* next; };
    Node *head = nullptr, *tail = nullptr;
public:
    void enqueue(T val) {
        Node* n = new Node{val, nullptr};
        if (tail) tail->next = n;
        else head = n;
        tail = n;
    }
    T dequeue() {
        T val = head->data;
        Node* temp = head;
        head = head->next;
        if (!head) tail = nullptr;
        delete temp;
        return val;
    }
};`,
  },
  {
    language: "javascript",
    code: `class Queue {
    constructor() {
        this.items = [];
        this.head = 0;
    }

    enqueue(item) { this.items.push(item); }
    
    dequeue() {
        if (this.isEmpty()) throw new Error("Queue empty");
        return this.items[this.head++];
    }
    
    front() {
        if (this.isEmpty()) throw new Error("Queue empty");
        return this.items[this.head];
    }
    
    isEmpty() { return this.head >= this.items.length; }
    size() { return this.items.length - this.head; }
}`,
  },
  {
    language: "go",
    code: `package main

type Queue struct {
    items []interface{}
}

func (q *Queue) Enqueue(item interface{}) {
    q.items = append(q.items, item)
}

func (q *Queue) Dequeue() interface{} {
    if q.IsEmpty() { return nil }
    item := q.items[0]
    q.items = q.items[1:]
    return item
}

func (q *Queue) Front() interface{} {
    if q.IsEmpty() { return nil }
    return q.items[0]
}

func (q *Queue) IsEmpty() bool { return len(q.items) == 0 }`,
  },
];

// ===== BINARY TREES =====
export const inorderTraversalCode: CodeImplementation[] = [
  {
    language: "python",
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def inorder(root):
    result = []
    def traverse(node):
        if not node:
            return
        traverse(node.left)
        result.append(node.val)
        traverse(node.right)
    traverse(root)
    return result`,
  },
  {
    language: "java",
    code: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

public List<Integer> inorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    inorder(root, result);
    return result;
}

private void inorder(TreeNode node, List<Integer> result) {
    if (node == null) return;
    inorder(node.left, result);
    result.add(node.val);
    inorder(node.right, result);
}`,
  },
  {
    language: "cpp",
    code: `struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

void inorder(TreeNode* root, vector<int>& result) {
    if (!root) return;
    inorder(root->left, result);
    result.push_back(root->val);
    inorder(root->right, result);
}

vector<int> inorderTraversal(TreeNode* root) {
    vector<int> result;
    inorder(root, result);
    return result;
}`,
  },
  {
    language: "javascript",
    code: `function inorderTraversal(root) {
    const result = [];
    function inorder(node) {
        if (!node) return;
        inorder(node.left);
        result.push(node.val);
        inorder(node.right);
    }
    inorder(root);
    return result;
}`,
  },
  {
    language: "go",
    code: `type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

func inorderTraversal(root *TreeNode) []int {
    result := []int{}
    var inorder func(*TreeNode)
    inorder = func(node *TreeNode) {
        if node == nil { return }
        inorder(node.Left)
        result = append(result, node.Val)
        inorder(node.Right)
    }
    inorder(root)
    return result
}`,
  },
];

// ===== HASH TABLES =====
export const hashTableInsertCode: CodeImplementation[] = [
  {
    language: "python",
    code: `class HashTable:
    def __init__(self, size=7):
        self.size = size
        self.table = [[] for _ in range(size)]

    def _hash(self, key):
        return hash(key) % self.size

    def insert(self, key, value):
        index = self._hash(key)
        for pair in self.table[index]:
            if pair[0] == key:
                pair[1] = value
                return
        self.table[index].append([key, value])

    def search(self, key):
        index = self._hash(key)
        for pair in self.table[index]:
            if pair[0] == key:
                return pair[1]
        return None`,
  },
  {
    language: "java",
    code: `import java.util.*;

public class HashTable<K, V> {
    private LinkedList<Entry<K,V>>[] table;
    private int size;

    class Entry<K,V> { K key; V value; }

    public HashTable(int size) {
        this.size = size;
        table = new LinkedList[size];
        for (int i = 0; i < size; i++)
            table[i] = new LinkedList<>();
    }

    private int hash(K key) {
        return Math.abs(key.hashCode()) % size;
    }

    public void insert(K key, V value) {
        int index = hash(key);
        for (Entry<K,V> e : table[index]) {
            if (e.key.equals(key)) { e.value = value; return; }
        }
        Entry<K,V> entry = new Entry<>();
        entry.key = key; entry.value = value;
        table[index].add(entry);
    }
}`,
  },
  {
    language: "cpp",
    code: `#include <vector>
#include <list>
using namespace std;

class HashTable {
    vector<list<pair<string, int>>> table;
    int size;

    int hash(const string& key) {
        int h = 0;
        for (char c : key) h = (h * 31 + c) % size;
        return h;
    }

public:
    HashTable(int sz = 7) : size(sz), table(sz) {}

    void insert(const string& key, int value) {
        int idx = hash(key);
        for (auto& p : table[idx]) {
            if (p.first == key) { p.second = value; return; }
        }
        table[idx].push_back({key, value});
    }

    int search(const string& key) {
        int idx = hash(key);
        for (auto& p : table[idx])
            if (p.first == key) return p.second;
        return -1;
    }
};`,
  },
  {
    language: "javascript",
    code: `class HashTable {
    constructor(size = 7) {
        this.table = Array.from({ length: size }, () => []);
        this.size = size;
    }

    _hash(key) {
        let hash = 0;
        for (const char of String(key)) {
            hash = (hash * 31 + char.charCodeAt(0)) % this.size;
        }
        return hash;
    }

    insert(key, value) {
        const index = this._hash(key);
        const existing = this.table[index].find(p => p[0] === key);
        if (existing) existing[1] = value;
        else this.table[index].push([key, value]);
    }

    search(key) {
        const index = this._hash(key);
        const pair = this.table[index].find(p => p[0] === key);
        return pair ? pair[1] : undefined;
    }
}`,
  },
  {
    language: "go",
    code: `package main

type Entry struct {
    Key   string
    Value int
}

type HashTable struct {
    table [][]Entry
    size  int
}

func NewHashTable(size int) *HashTable {
    return &HashTable{
        table: make([][]Entry, size),
        size:  size,
    }
}

func (ht *HashTable) hash(key string) int {
    h := 0
    for _, c := range key {
        h = (h*31 + int(c)) % ht.size
    }
    return h
}

func (ht *HashTable) Insert(key string, value int) {
    idx := ht.hash(key)
    for i, e := range ht.table[idx] {
        if e.Key == key {
            ht.table[idx][i].Value = value
            return
        }
    }
    ht.table[idx] = append(ht.table[idx], Entry{key, value})
}`,
  },
];

// ===== HEAPS =====
export const heapifyCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def heapify_down(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2

    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right

    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify_down(arr, n, largest)

def build_max_heap(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify_down(arr, n, i)`,
  },
  {
    language: "java",
    code: `public class MaxHeap {
    private int[] heap;
    private int size;

    void heapifyDown(int i) {
        int largest = i;
        int left = 2 * i + 1, right = 2 * i + 2;
        if (left < size && heap[left] > heap[largest])
            largest = left;
        if (right < size && heap[right] > heap[largest])
            largest = right;
        if (largest != i) {
            int temp = heap[i];
            heap[i] = heap[largest];
            heap[largest] = temp;
            heapifyDown(largest);
        }
    }

    void buildHeap(int[] arr) {
        heap = arr; size = arr.length;
        for (int i = size / 2 - 1; i >= 0; i--)
            heapifyDown(i);
    }
}`,
  },
  {
    language: "cpp",
    code: `#include <vector>
#include <algorithm>
using namespace std;

void heapifyDown(vector<int>& arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1, right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapifyDown(arr, n, largest);
    }
}

void buildMaxHeap(vector<int>& arr) {
    int n = arr.size();
    for (int i = n / 2 - 1; i >= 0; i--)
        heapifyDown(arr, n, i);
}`,
  },
  {
    language: "javascript",
    code: `function heapifyDown(arr, n, i) {
    let largest = i;
    const left = 2 * i + 1, right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapifyDown(arr, n, largest);
    }
}

function buildMaxHeap(arr) {
    const n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapifyDown(arr, n, i);
    }
}`,
  },
  {
    language: "go",
    code: `func heapifyDown(arr []int, n, i int) {
    largest := i
    left, right := 2*i+1, 2*i+2
    if left < n && arr[left] > arr[largest] { largest = left }
    if right < n && arr[right] > arr[largest] { largest = right }
    if largest != i {
        arr[i], arr[largest] = arr[largest], arr[i]
        heapifyDown(arr, n, largest)
    }
}

func buildMaxHeap(arr []int) {
    n := len(arr)
    for i := n/2 - 1; i >= 0; i-- {
        heapifyDown(arr, n, i)
    }
}`,
  },
];

export const heapSortCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def heap_sort(arr):
    n = len(arr)
    # Build max heap
    for i in range(n // 2 - 1, -1, -1):
        heapify_down(arr, n, i)
    # Extract elements one by one
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify_down(arr, i, 0)
    return arr`,
  },
  {
    language: "java",
    code: `public static void heapSort(int[] arr) {
    int n = arr.length;
    for (int i = n / 2 - 1; i >= 0; i--)
        heapifyDown(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;
        heapifyDown(arr, i, 0);
    }
}`,
  },
  {
    language: "cpp",
    code: `void heapSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = n / 2 - 1; i >= 0; i--)
        heapifyDown(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapifyDown(arr, i, 0);
    }
}`,
  },
  {
    language: "javascript",
    code: `function heapSort(arr) {
    const n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--)
        heapifyDown(arr, n, i);
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapifyDown(arr, i, 0);
    }
    return arr;
}`,
  },
  {
    language: "go",
    code: `func heapSort(arr []int) {
    n := len(arr)
    for i := n/2 - 1; i >= 0; i-- {
        heapifyDown(arr, n, i)
    }
    for i := n - 1; i > 0; i-- {
        arr[0], arr[i] = arr[i], arr[0]
        heapifyDown(arr, i, 0)
    }
}`,
  },
];

// ===== RECURSION =====
export const nQueensCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def solve_n_queens(n):
    solutions = []
    board = [['.'] * n for _ in range(n)]

    def is_safe(row, col):
        for i in range(row):
            if board[i][col] == 'Q': return False
            if col-(row-i) >= 0 and board[i][col-(row-i)] == 'Q': return False
            if col+(row-i) < n and board[i][col+(row-i)] == 'Q': return False
        return True

    def backtrack(row):
        if row == n:
            solutions.append([''.join(r) for r in board])
            return
        for col in range(n):
            if is_safe(row, col):
                board[row][col] = 'Q'
                backtrack(row + 1)
                board[row][col] = '.'

    backtrack(0)
    return solutions`,
  },
  {
    language: "java",
    code: `public class NQueens {
    List<List<String>> solutions = new ArrayList<>();

    public List<List<String>> solveNQueens(int n) {
        char[][] board = new char[n][n];
        for (char[] row : board) Arrays.fill(row, '.');
        backtrack(board, 0, n);
        return solutions;
    }

    void backtrack(char[][] board, int row, int n) {
        if (row == n) {
            List<String> sol = new ArrayList<>();
            for (char[] r : board) sol.add(new String(r));
            solutions.add(sol);
            return;
        }
        for (int col = 0; col < n; col++) {
            if (isSafe(board, row, col, n)) {
                board[row][col] = 'Q';
                backtrack(board, row + 1, n);
                board[row][col] = '.';
            }
        }
    }
}`,
  },
  {
    language: "cpp",
    code: `class Solution {
public:
    vector<vector<string>> solveNQueens(int n) {
        vector<vector<string>> results;
        vector<string> board(n, string(n, '.'));
        backtrack(results, board, 0, n);
        return results;
    }

    void backtrack(vector<vector<string>>& res, vector<string>& board, int row, int n) {
        if (row == n) { res.push_back(board); return; }
        for (int col = 0; col < n; col++) {
            if (isSafe(board, row, col, n)) {
                board[row][col] = 'Q';
                backtrack(res, board, row + 1, n);
                board[row][col] = '.';
            }
        }
    }
};`,
  },
  {
    language: "javascript",
    code: `function solveNQueens(n) {
    const solutions = [];
    const board = Array.from({length: n}, () => Array(n).fill('.'));

    function isSafe(row, col) {
        for (let i = 0; i < row; i++) {
            if (board[i][col] === 'Q') return false;
            if (col-(row-i) >= 0 && board[i][col-(row-i)] === 'Q') return false;
            if (col+(row-i) < n && board[i][col+(row-i)] === 'Q') return false;
        }
        return true;
    }

    function backtrack(row) {
        if (row === n) {
            solutions.push(board.map(r => r.join('')));
            return;
        }
        for (let col = 0; col < n; col++) {
            if (isSafe(row, col)) {
                board[row][col] = 'Q';
                backtrack(row + 1);
                board[row][col] = '.';
            }
        }
    }

    backtrack(0);
    return solutions;
}`,
  },
  {
    language: "go",
    code: `func solveNQueens(n int) [][]string {
    var results [][]string
    board := make([][]byte, n)
    for i := range board {
        board[i] = make([]byte, n)
        for j := range board[i] { board[i][j] = '.' }
    }

    var backtrack func(int)
    backtrack = func(row int) {
        if row == n {
            sol := make([]string, n)
            for i, r := range board { sol[i] = string(r) }
            results = append(results, sol)
            return
        }
        for col := 0; col < n; col++ {
            if isSafe(board, row, col, n) {
                board[row][col] = 'Q'
                backtrack(row + 1)
                board[row][col] = '.'
            }
        }
    }
    backtrack(0)
    return results
}`,
  },
];

// ===== GRAPHS =====
export const dfsCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def dfs(graph, start):
    visited = set()
    stack = [start]
    result = []

    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            result.append(node)
            for neighbor in reversed(graph[node]):
                if neighbor not in visited:
                    stack.append(neighbor)
    return result

# Example
graph = {0: [1, 2], 1: [3], 2: [4], 3: [], 4: []}
print(dfs(graph, 0))  # [0, 1, 3, 2, 4]`,
  },
  {
    language: "java",
    code: `public List<Integer> dfs(Map<Integer, List<Integer>> graph, int start) {
    List<Integer> result = new ArrayList<>();
    Set<Integer> visited = new HashSet<>();
    Stack<Integer> stack = new Stack<>();
    stack.push(start);

    while (!stack.isEmpty()) {
        int node = stack.pop();
        if (!visited.contains(node)) {
            visited.add(node);
            result.add(node);
            List<Integer> neighbors = graph.get(node);
            for (int i = neighbors.size()-1; i >= 0; i--)
                if (!visited.contains(neighbors.get(i)))
                    stack.push(neighbors.get(i));
        }
    }
    return result;
}`,
  },
  {
    language: "cpp",
    code: `#include <vector>
#include <stack>
#include <unordered_set>
using namespace std;

vector<int> dfs(vector<vector<int>>& graph, int start) {
    vector<int> result;
    unordered_set<int> visited;
    stack<int> st;
    st.push(start);

    while (!st.empty()) {
        int node = st.top(); st.pop();
        if (visited.count(node)) continue;
        visited.insert(node);
        result.push_back(node);
        for (int i = graph[node].size()-1; i >= 0; i--)
            if (!visited.count(graph[node][i]))
                st.push(graph[node][i]);
    }
    return result;
}`,
  },
  {
    language: "javascript",
    code: `function dfs(graph, start) {
    const visited = new Set();
    const stack = [start];
    const result = [];

    while (stack.length > 0) {
        const node = stack.pop();
        if (!visited.has(node)) {
            visited.add(node);
            result.push(node);
            for (const neighbor of [...graph[node]].reverse()) {
                if (!visited.has(neighbor)) stack.push(neighbor);
            }
        }
    }
    return result;
}`,
  },
  {
    language: "go",
    code: `func dfs(graph map[int][]int, start int) []int {
    visited := map[int]bool{}
    stack := []int{start}
    result := []int{}

    for len(stack) > 0 {
        node := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        if visited[node] { continue }
        visited[node] = true
        result = append(result, node)
        neighbors := graph[node]
        for i := len(neighbors) - 1; i >= 0; i-- {
            if !visited[neighbors[i]] {
                stack = append(stack, neighbors[i])
            }
        }
    }
    return result
}`,
  },
];

export const dijkstraCode: CodeImplementation[] = [
  {
    language: "python",
    code: `import heapq

def dijkstra(graph, source):
    dist = {v: float('inf') for v in graph}
    dist[source] = 0
    pq = [(0, source)]

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, weight in graph[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(pq, (dist[v], v))
    return dist`,
  },
  {
    language: "java",
    code: `public int[] dijkstra(List<int[]>[] graph, int source) {
    int n = graph.length;
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[source] = 0;
    PriorityQueue<int[]> pq = new PriorityQueue<>((a,b) -> a[0]-b[0]);
    pq.offer(new int[]{0, source});

    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        int d = curr[0], u = curr[1];
        if (d > dist[u]) continue;
        for (int[] edge : graph[u]) {
            int v = edge[0], w = edge[1];
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.offer(new int[]{dist[v], v});
            }
        }
    }
    return dist;
}`,
  },
  {
    language: "cpp",
    code: `#include <vector>
#include <queue>
using namespace std;

vector<int> dijkstra(vector<vector<pair<int,int>>>& graph, int source) {
    int n = graph.size();
    vector<int> dist(n, INT_MAX);
    dist[source] = 0;
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({0, source});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : graph[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
  },
  {
    language: "javascript",
    code: `function dijkstra(graph, source) {
    const dist = {};
    for (const v in graph) dist[v] = Infinity;
    dist[source] = 0;
    const pq = [[0, source]]; // [distance, node]

    while (pq.length > 0) {
        pq.sort((a, b) => a[0] - b[0]);
        const [d, u] = pq.shift();
        if (d > dist[u]) continue;
        for (const [v, weight] of graph[u]) {
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push([dist[v], v]);
            }
        }
    }
    return dist;
}`,
  },
  {
    language: "go",
    code: `import "container/heap"

type Edge struct { To, Weight int }
type Item struct { Node, Dist int }
type PQ []Item
func (pq PQ) Len() int            { return len(pq) }
func (pq PQ) Less(i, j int) bool  { return pq[i].Dist < pq[j].Dist }
func (pq PQ) Swap(i, j int)       { pq[i], pq[j] = pq[j], pq[i] }
func (pq *PQ) Push(x interface{}) { *pq = append(*pq, x.(Item)) }
func (pq *PQ) Pop() interface{} {
    old := *pq; n := len(old); item := old[n-1]
    *pq = old[:n-1]; return item
}

func dijkstra(graph [][]Edge, source int) []int {
    n := len(graph)
    dist := make([]int, n)
    for i := range dist { dist[i] = 1<<31 - 1 }
    dist[source] = 0
    pq := &PQ{{source, 0}}
    heap.Init(pq)
    for pq.Len() > 0 {
        curr := heap.Pop(pq).(Item)
        if curr.Dist > dist[curr.Node] { continue }
        for _, e := range graph[curr.Node] {
            if dist[curr.Node]+e.Weight < dist[e.To] {
                dist[e.To] = dist[curr.Node] + e.Weight
                heap.Push(pq, Item{e.To, dist[e.To]})
            }
        }
    }
    return dist
}`,
  },
];

// ===== DYNAMIC PROGRAMMING =====
export const fibonacciDPCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def fibonacci(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]

# Space-optimized
def fibonacci_optimized(n):
    if n <= 1: return n
    prev2, prev1 = 0, 1
    for _ in range(2, n + 1):
        curr = prev1 + prev2
        prev2, prev1 = prev1, curr
    return prev1`,
  },
  {
    language: "java",
    code: `public int fibonacci(int n) {
    if (n <= 1) return n;
    int[] dp = new int[n + 1];
    dp[1] = 1;
    for (int i = 2; i <= n; i++)
        dp[i] = dp[i-1] + dp[i-2];
    return dp[n];
}

// Space-optimized
public int fibOptimized(int n) {
    if (n <= 1) return n;
    int prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
  },
  {
    language: "cpp",
    code: `int fibonacci(int n) {
    if (n <= 1) return n;
    vector<int> dp(n + 1);
    dp[1] = 1;
    for (int i = 2; i <= n; i++)
        dp[i] = dp[i-1] + dp[i-2];
    return dp[n];
}

// Space-optimized
int fibOptimized(int n) {
    if (n <= 1) return n;
    int prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
  },
  {
    language: "javascript",
    code: `function fibonacci(n) {
    if (n <= 1) return n;
    const dp = new Array(n + 1).fill(0);
    dp[1] = 1;
    for (let i = 2; i <= n; i++)
        dp[i] = dp[i-1] + dp[i-2];
    return dp[n];
}

// Space-optimized
function fibOptimized(n) {
    if (n <= 1) return n;
    let prev2 = 0, prev1 = 1;
    for (let i = 2; i <= n; i++) {
        const curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
  },
  {
    language: "go",
    code: `func fibonacci(n int) int {
    if n <= 1 { return n }
    dp := make([]int, n+1)
    dp[1] = 1
    for i := 2; i <= n; i++ {
        dp[i] = dp[i-1] + dp[i-2]
    }
    return dp[n]
}

func fibOptimized(n int) int {
    if n <= 1 { return n }
    prev2, prev1 := 0, 1
    for i := 2; i <= n; i++ {
        curr := prev1 + prev2
        prev2, prev1 = prev1, curr
    }
    return prev1
}`,
  },
];

// ===== SORTING =====
export const bubbleSortCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
  },
  {
    language: "java",
    code: `public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n; i++) {
        boolean swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`,
  },
  {
    language: "cpp",
    code: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`,
  },
  {
    language: "javascript",
    code: `function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        if (!swapped) break;
    }
    return arr;
}`,
  },
  {
    language: "go",
    code: `func bubbleSort(arr []int) {
    n := len(arr)
    for i := 0; i < n; i++ {
        swapped := false
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = true
            }
        }
        if !swapped { break }
    }
}`,
  },
];

export const mergeSortCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
  },
  {
    language: "java",
    code: `public static void mergeSort(int[] arr, int l, int r) {
    if (l < r) {
        int mid = (l + r) / 2;
        mergeSort(arr, l, mid);
        mergeSort(arr, mid + 1, r);
        merge(arr, l, mid, r);
    }
}

static void merge(int[] arr, int l, int mid, int r) {
    int[] temp = new int[r - l + 1];
    int i = l, j = mid + 1, k = 0;
    while (i <= mid && j <= r) {
        if (arr[i] <= arr[j]) temp[k++] = arr[i++];
        else temp[k++] = arr[j++];
    }
    while (i <= mid) temp[k++] = arr[i++];
    while (j <= r) temp[k++] = arr[j++];
    System.arraycopy(temp, 0, arr, l, temp.length);
}`,
  },
  {
    language: "cpp",
    code: `void merge(vector<int>& arr, int l, int mid, int r) {
    vector<int> temp;
    int i = l, j = mid + 1;
    while (i <= mid && j <= r) {
        if (arr[i] <= arr[j]) temp.push_back(arr[i++]);
        else temp.push_back(arr[j++]);
    }
    while (i <= mid) temp.push_back(arr[i++]);
    while (j <= r) temp.push_back(arr[j++]);
    for (int k = 0; k < temp.size(); k++) arr[l+k] = temp[k];
}

void mergeSort(vector<int>& arr, int l, int r) {
    if (l >= r) return;
    int mid = (l + r) / 2;
    mergeSort(arr, l, mid);
    mergeSort(arr, mid + 1, r);
    merge(arr, l, mid, r);
}`,
  },
  {
    language: "javascript",
    code: `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) result.push(left[i++]);
        else result.push(right[j++]);
    }
    return [...result, ...left.slice(i), ...right.slice(j)];
}`,
  },
  {
    language: "go",
    code: `func mergeSort(arr []int) []int {
    if len(arr) <= 1 { return arr }
    mid := len(arr) / 2
    left := mergeSort(arr[:mid])
    right := mergeSort(arr[mid:])
    return merge(left, right)
}

func merge(left, right []int) []int {
    result := make([]int, 0, len(left)+len(right))
    i, j := 0, 0
    for i < len(left) && j < len(right) {
        if left[i] <= right[j] {
            result = append(result, left[i]); i++
        } else {
            result = append(result, right[j]); j++
        }
    }
    result = append(result, left[i:]...)
    result = append(result, right[j:]...)
    return result
}`,
  },
];

// ===== TRIES =====
export const trieInsertSearchCode: CodeImplementation[] = [
  {
    language: "python",
    code: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True

    def search(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end

    def starts_with(self, prefix):
        node = self.root
        for char in prefix:
            if char not in node.children:
                return False
            node = node.children[char]
        return True`,
  },
  {
    language: "java",
    code: `class Trie {
    private TrieNode root = new TrieNode();

    class TrieNode {
        TrieNode[] children = new TrieNode[26];
        boolean isEnd = false;
    }

    public void insert(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (node.children[idx] == null)
                node.children[idx] = new TrieNode();
            node = node.children[idx];
        }
        node.isEnd = true;
    }

    public boolean search(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (node.children[idx] == null) return false;
            node = node.children[idx];
        }
        return node.isEnd;
    }

    public boolean startsWith(String prefix) {
        TrieNode node = root;
        for (char c : prefix.toCharArray()) {
            int idx = c - 'a';
            if (node.children[idx] == null) return false;
            node = node.children[idx];
        }
        return true;
    }
}`,
  },
  {
    language: "cpp",
    code: `class Trie {
    struct TrieNode {
        TrieNode* children[26] = {};
        bool isEnd = false;
    };
    TrieNode* root;

public:
    Trie() { root = new TrieNode(); }

    void insert(string word) {
        TrieNode* node = root;
        for (char c : word) {
            int idx = c - 'a';
            if (!node->children[idx])
                node->children[idx] = new TrieNode();
            node = node->children[idx];
        }
        node->isEnd = true;
    }

    bool search(string word) {
        TrieNode* node = root;
        for (char c : word) {
            int idx = c - 'a';
            if (!node->children[idx]) return false;
            node = node->children[idx];
        }
        return node->isEnd;
    }

    bool startsWith(string prefix) {
        TrieNode* node = root;
        for (char c : prefix) {
            int idx = c - 'a';
            if (!node->children[idx]) return false;
            node = node->children[idx];
        }
        return true;
    }
};`,
  },
  {
    language: "javascript",
    code: `class TrieNode {
    constructor() {
        this.children = {};
        this.isEnd = false;
    }
}

class Trie {
    constructor() { this.root = new TrieNode(); }

    insert(word) {
        let node = this.root;
        for (const char of word) {
            if (!node.children[char])
                node.children[char] = new TrieNode();
            node = node.children[char];
        }
        node.isEnd = true;
    }

    search(word) {
        let node = this.root;
        for (const char of word) {
            if (!node.children[char]) return false;
            node = node.children[char];
        }
        return node.isEnd;
    }

    startsWith(prefix) {
        let node = this.root;
        for (const char of prefix) {
            if (!node.children[char]) return false;
            node = node.children[char];
        }
        return true;
    }
}`,
  },
  {
    language: "go",
    code: `type TrieNode struct {
    Children [26]*TrieNode
    IsEnd    bool
}

type Trie struct {
    Root *TrieNode
}

func NewTrie() *Trie {
    return &Trie{Root: &TrieNode{}}
}

func (t *Trie) Insert(word string) {
    node := t.Root
    for _, c := range word {
        idx := c - 'a'
        if node.Children[idx] == nil {
            node.Children[idx] = &TrieNode{}
        }
        node = node.Children[idx]
    }
    node.IsEnd = true
}

func (t *Trie) Search(word string) bool {
    node := t.Root
    for _, c := range word {
        idx := c - 'a'
        if node.Children[idx] == nil { return false }
        node = node.Children[idx]
    }
    return node.IsEnd
}`,
  },
];

// ===== ADVANCED GRAPHS =====
export const kruskalCode: CodeImplementation[] = [
  {
    language: "python",
    code: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py: return False
        if self.rank[px] < self.rank[py]: px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]: self.rank[px] += 1
        return True

def kruskal(n, edges):
    edges.sort(key=lambda x: x[2])
    uf = UnionFind(n)
    mst = []
    for u, v, w in edges:
        if uf.union(u, v):
            mst.append((u, v, w))
        if len(mst) == n - 1:
            break
    return mst`,
  },
  {
    language: "java",
    code: `class UnionFind {
    int[] parent, rank;
    UnionFind(int n) {
        parent = new int[n]; rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }
    boolean union(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;
        if (rank[px] < rank[py]) { int t=px; px=py; py=t; }
        parent[py] = px;
        if (rank[px] == rank[py]) rank[px]++;
        return true;
    }
}

public int[][] kruskal(int n, int[][] edges) {
    Arrays.sort(edges, (a,b) -> a[2] - b[2]);
    UnionFind uf = new UnionFind(n);
    List<int[]> mst = new ArrayList<>();
    for (int[] e : edges) {
        if (uf.union(e[0], e[1])) mst.add(e);
        if (mst.size() == n - 1) break;
    }
    return mst.toArray(new int[0][]);
}`,
  },
  {
    language: "cpp",
    code: `struct UnionFind {
    vector<int> parent, rank_;
    UnionFind(int n) : parent(n), rank_(n, 0) {
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int x) {
        return parent[x] == x ? x : parent[x] = find(parent[x]);
    }
    bool unite(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;
        if (rank_[px] < rank_[py]) swap(px, py);
        parent[py] = px;
        if (rank_[px] == rank_[py]) rank_[px]++;
        return true;
    }
};

vector<tuple<int,int,int>> kruskal(int n, vector<tuple<int,int,int>>& edges) {
    sort(edges.begin(), edges.end(), [](auto& a, auto& b) {
        return get<2>(a) < get<2>(b);
    });
    UnionFind uf(n);
    vector<tuple<int,int,int>> mst;
    for (auto& [u, v, w] : edges) {
        if (uf.unite(u, v)) mst.push_back({u, v, w});
        if (mst.size() == n - 1) break;
    }
    return mst;
}`,
  },
  {
    language: "javascript",
    code: `class UnionFind {
    constructor(n) {
        this.parent = Array.from({length: n}, (_, i) => i);
        this.rank = new Array(n).fill(0);
    }
    find(x) {
        if (this.parent[x] !== x)
            this.parent[x] = this.find(this.parent[x]);
        return this.parent[x];
    }
    union(x, y) {
        let px = this.find(x), py = this.find(y);
        if (px === py) return false;
        if (this.rank[px] < this.rank[py]) [px, py] = [py, px];
        this.parent[py] = px;
        if (this.rank[px] === this.rank[py]) this.rank[px]++;
        return true;
    }
}

function kruskal(n, edges) {
    edges.sort((a, b) => a[2] - b[2]);
    const uf = new UnionFind(n);
    const mst = [];
    for (const [u, v, w] of edges) {
        if (uf.union(u, v)) mst.push([u, v, w]);
        if (mst.length === n - 1) break;
    }
    return mst;
}`,
  },
  {
    language: "go",
    code: `type UnionFind struct {
    parent, rank []int
}

func NewUF(n int) *UnionFind {
    p := make([]int, n)
    for i := range p { p[i] = i }
    return &UnionFind{p, make([]int, n)}
}

func (uf *UnionFind) Find(x int) int {
    if uf.parent[x] != x { uf.parent[x] = uf.Find(uf.parent[x]) }
    return uf.parent[x]
}

func (uf *UnionFind) Union(x, y int) bool {
    px, py := uf.Find(x), uf.Find(y)
    if px == py { return false }
    if uf.rank[px] < uf.rank[py] { px, py = py, px }
    uf.parent[py] = px
    if uf.rank[px] == uf.rank[py] { uf.rank[px]++ }
    return true
}`,
  },
];

export const topologicalSortCode: CodeImplementation[] = [
  {
    language: "python",
    code: `from collections import deque

def topological_sort(graph, n):
    in_degree = [0] * n
    for u in range(n):
        for v in graph[u]:
            in_degree[v] += 1

    queue = deque([v for v in range(n) if in_degree[v] == 0])
    result = []

    while queue:
        node = queue.popleft()
        result.append(node)
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return result if len(result) == n else []  # empty = cycle`,
  },
  {
    language: "java",
    code: `public int[] topologicalSort(List<List<Integer>> graph, int n) {
    int[] inDegree = new int[n];
    for (List<Integer> neighbors : graph)
        for (int v : neighbors) inDegree[v]++;

    Queue<Integer> queue = new LinkedList<>();
    for (int i = 0; i < n; i++)
        if (inDegree[i] == 0) queue.offer(i);

    int[] result = new int[n];
    int idx = 0;
    while (!queue.isEmpty()) {
        int node = queue.poll();
        result[idx++] = node;
        for (int neighbor : graph.get(node)) {
            if (--inDegree[neighbor] == 0)
                queue.offer(neighbor);
        }
    }
    return idx == n ? result : new int[0];
}`,
  },
  {
    language: "cpp",
    code: `vector<int> topologicalSort(vector<vector<int>>& graph, int n) {
    vector<int> inDegree(n, 0);
    for (auto& neighbors : graph)
        for (int v : neighbors) inDegree[v]++;

    queue<int> q;
    for (int i = 0; i < n; i++)
        if (inDegree[i] == 0) q.push(i);

    vector<int> result;
    while (!q.empty()) {
        int node = q.front(); q.pop();
        result.push_back(node);
        for (int neighbor : graph[node]) {
            if (--inDegree[neighbor] == 0)
                q.push(neighbor);
        }
    }
    return result.size() == n ? result : vector<int>();
}`,
  },
  {
    language: "javascript",
    code: `function topologicalSort(graph, n) {
    const inDegree = new Array(n).fill(0);
    for (const neighbors of graph)
        for (const v of neighbors) inDegree[v]++;

    const queue = [];
    for (let i = 0; i < n; i++)
        if (inDegree[i] === 0) queue.push(i);

    const result = [];
    while (queue.length > 0) {
        const node = queue.shift();
        result.push(node);
        for (const neighbor of graph[node]) {
            if (--inDegree[neighbor] === 0)
                queue.push(neighbor);
        }
    }
    return result.length === n ? result : [];
}`,
  },
  {
    language: "go",
    code: `func topologicalSort(graph [][]int, n int) []int {
    inDegree := make([]int, n)
    for _, neighbors := range graph {
        for _, v := range neighbors { inDegree[v]++ }
    }

    queue := []int{}
    for i := 0; i < n; i++ {
        if inDegree[i] == 0 { queue = append(queue, i) }
    }

    result := []int{}
    for len(queue) > 0 {
        node := queue[0]; queue = queue[1:]
        result = append(result, node)
        for _, neighbor := range graph[node] {
            inDegree[neighbor]--
            if inDegree[neighbor] == 0 {
                queue = append(queue, neighbor)
            }
        }
    }
    if len(result) == n { return result }
    return nil
}`,
  },
];

// ===== KMP =====
export const kmpCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def compute_lps(pattern):
    lps = [0] * len(pattern)
    length, i = 0, 1
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length != 0:
            length = lps[length - 1]
        else:
            lps[i] = 0
            i += 1
    return lps

def kmp_search(text, pattern):
    lps = compute_lps(pattern)
    i = j = 0
    matches = []
    while i < len(text):
        if text[i] == pattern[j]:
            i += 1; j += 1
        if j == len(pattern):
            matches.append(i - j)
            j = lps[j - 1]
        elif i < len(text) and text[i] != pattern[j]:
            if j != 0: j = lps[j - 1]
            else: i += 1
    return matches`,
  },
  {
    language: "java",
    code: `public List<Integer> kmpSearch(String text, String pattern) {
    int[] lps = computeLPS(pattern);
    List<Integer> matches = new ArrayList<>();
    int i = 0, j = 0;
    while (i < text.length()) {
        if (text.charAt(i) == pattern.charAt(j)) { i++; j++; }
        if (j == pattern.length()) {
            matches.add(i - j);
            j = lps[j - 1];
        } else if (i < text.length() && text.charAt(i) != pattern.charAt(j)) {
            if (j != 0) j = lps[j - 1];
            else i++;
        }
    }
    return matches;
}

int[] computeLPS(String pattern) {
    int[] lps = new int[pattern.length()];
    int len = 0, i = 1;
    while (i < pattern.length()) {
        if (pattern.charAt(i) == pattern.charAt(len)) {
            lps[i++] = ++len;
        } else if (len != 0) { len = lps[len-1]; }
        else { lps[i++] = 0; }
    }
    return lps;
}`,
  },
  {
    language: "cpp",
    code: `vector<int> computeLPS(const string& pattern) {
    int n = pattern.size();
    vector<int> lps(n, 0);
    int len = 0, i = 1;
    while (i < n) {
        if (pattern[i] == pattern[len]) { lps[i++] = ++len; }
        else if (len) { len = lps[len-1]; }
        else { lps[i++] = 0; }
    }
    return lps;
}

vector<int> kmpSearch(const string& text, const string& pattern) {
    vector<int> lps = computeLPS(pattern);
    vector<int> matches;
    int i = 0, j = 0;
    while (i < text.size()) {
        if (text[i] == pattern[j]) { i++; j++; }
        if (j == pattern.size()) {
            matches.push_back(i - j);
            j = lps[j - 1];
        } else if (i < text.size() && text[i] != pattern[j]) {
            if (j) j = lps[j-1]; else i++;
        }
    }
    return matches;
}`,
  },
  {
    language: "javascript",
    code: `function computeLPS(pattern) {
    const lps = new Array(pattern.length).fill(0);
    let len = 0, i = 1;
    while (i < pattern.length) {
        if (pattern[i] === pattern[len]) { lps[i++] = ++len; }
        else if (len) { len = lps[len - 1]; }
        else { lps[i++] = 0; }
    }
    return lps;
}

function kmpSearch(text, pattern) {
    const lps = computeLPS(pattern);
    const matches = [];
    let i = 0, j = 0;
    while (i < text.length) {
        if (text[i] === pattern[j]) { i++; j++; }
        if (j === pattern.length) {
            matches.push(i - j);
            j = lps[j - 1];
        } else if (i < text.length && text[i] !== pattern[j]) {
            if (j) j = lps[j - 1]; else i++;
        }
    }
    return matches;
}`,
  },
  {
    language: "go",
    code: `func computeLPS(pattern string) []int {
    n := len(pattern)
    lps := make([]int, n)
    length, i := 0, 1
    for i < n {
        if pattern[i] == pattern[length] {
            length++; lps[i] = length; i++
        } else if length != 0 {
            length = lps[length-1]
        } else {
            lps[i] = 0; i++
        }
    }
    return lps
}

func kmpSearch(text, pattern string) []int {
    lps := computeLPS(pattern)
    matches := []int{}
    i, j := 0, 0
    for i < len(text) {
        if text[i] == pattern[j] { i++; j++ }
        if j == len(pattern) {
            matches = append(matches, i-j)
            j = lps[j-1]
        } else if i < len(text) && text[i] != pattern[j] {
            if j != 0 { j = lps[j-1] } else { i++ }
        }
    }
    return matches
}`,
  },
];

// ===== BITMASK DP =====
export const bitmaskDPCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def tsp(dist):
    n = len(dist)
    INF = float('inf')
    # dp[mask][i] = min cost to visit cities in mask, ending at i
    dp = [[INF] * n for _ in range(1 << n)]
    dp[1][0] = 0  # Start at city 0

    for mask in range(1, 1 << n):
        for last in range(n):
            if not (mask & (1 << last)): continue
            if dp[mask][last] == INF: continue
            for next_city in range(n):
                if mask & (1 << next_city): continue
                new_mask = mask | (1 << next_city)
                dp[new_mask][next_city] = min(
                    dp[new_mask][next_city],
                    dp[mask][last] + dist[last][next_city]
                )

    full_mask = (1 << n) - 1
    return min(dp[full_mask][i] + dist[i][0] for i in range(1, n))`,
  },
  {
    language: "java",
    code: `public int tsp(int[][] dist) {
    int n = dist.length;
    int[][] dp = new int[1 << n][n];
    for (int[] row : dp) Arrays.fill(row, Integer.MAX_VALUE);
    dp[1][0] = 0;

    for (int mask = 1; mask < (1 << n); mask++) {
        for (int last = 0; last < n; last++) {
            if ((mask & (1 << last)) == 0) continue;
            if (dp[mask][last] == Integer.MAX_VALUE) continue;
            for (int next = 0; next < n; next++) {
                if ((mask & (1 << next)) != 0) continue;
                int newMask = mask | (1 << next);
                dp[newMask][next] = Math.min(
                    dp[newMask][next],
                    dp[mask][last] + dist[last][next]
                );
            }
        }
    }

    int fullMask = (1 << n) - 1;
    int ans = Integer.MAX_VALUE;
    for (int i = 1; i < n; i++)
        ans = Math.min(ans, dp[fullMask][i] + dist[i][0]);
    return ans;
}`,
  },
  {
    language: "cpp",
    code: `int tsp(vector<vector<int>>& dist) {
    int n = dist.size();
    vector<vector<int>> dp(1 << n, vector<int>(n, INT_MAX));
    dp[1][0] = 0;

    for (int mask = 1; mask < (1 << n); mask++) {
        for (int last = 0; last < n; last++) {
            if (!(mask & (1 << last))) continue;
            if (dp[mask][last] == INT_MAX) continue;
            for (int next = 0; next < n; next++) {
                if (mask & (1 << next)) continue;
                int newMask = mask | (1 << next);
                dp[newMask][next] = min(dp[newMask][next],
                    dp[mask][last] + dist[last][next]);
            }
        }
    }

    int fullMask = (1 << n) - 1, ans = INT_MAX;
    for (int i = 1; i < n; i++)
        ans = min(ans, dp[fullMask][i] + dist[i][0]);
    return ans;
}`,
  },
  {
    language: "javascript",
    code: `function tsp(dist) {
    const n = dist.length;
    const dp = Array.from({length: 1 << n}, () => 
        new Array(n).fill(Infinity));
    dp[1][0] = 0;

    for (let mask = 1; mask < (1 << n); mask++) {
        for (let last = 0; last < n; last++) {
            if (!(mask & (1 << last))) continue;
            if (dp[mask][last] === Infinity) continue;
            for (let next = 0; next < n; next++) {
                if (mask & (1 << next)) continue;
                const newMask = mask | (1 << next);
                dp[newMask][next] = Math.min(
                    dp[newMask][next],
                    dp[mask][last] + dist[last][next]
                );
            }
        }
    }

    const fullMask = (1 << n) - 1;
    let ans = Infinity;
    for (let i = 1; i < n; i++)
        ans = Math.min(ans, dp[fullMask][i] + dist[i][0]);
    return ans;
}`,
  },
  {
    language: "go",
    code: `func tsp(dist [][]int) int {
    n := len(dist)
    dp := make([][]int, 1<<n)
    for i := range dp {
        dp[i] = make([]int, n)
        for j := range dp[i] { dp[i][j] = 1<<31 - 1 }
    }
    dp[1][0] = 0

    for mask := 1; mask < (1 << n); mask++ {
        for last := 0; last < n; last++ {
            if mask&(1<<last) == 0 || dp[mask][last] == 1<<31-1 { continue }
            for next := 0; next < n; next++ {
                if mask&(1<<next) != 0 { continue }
                newMask := mask | (1 << next)
                if dp[mask][last]+dist[last][next] < dp[newMask][next] {
                    dp[newMask][next] = dp[mask][last] + dist[last][next]
                }
            }
        }
    }

    fullMask := (1 << n) - 1
    ans := 1<<31 - 1
    for i := 1; i < n; i++ {
        if dp[fullMask][i]+dist[i][0] < ans {
            ans = dp[fullMask][i] + dist[i][0]
        }
    }
    return ans
}`,
  },
];

// ===== ADDITIONAL TOPIC IMPLEMENTATIONS =====
export const twoSumSortedArrayCode = twoPointerCode;
export const divideAndConquerMergeSortCode = mergeSortCode;

export const euclideanGcdCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def gcd(a, b):
    a, b = abs(a), abs(b)
    while b:
        a, b = b, a % b
    return a`,
  },
  {
    language: "java",
    code: `public class EuclideanGCD {
    static int gcd(int a, int b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b != 0) {
            int temp = a % b;
            a = b;
            b = temp;
        }
        return a;
    }
}`,
  },
  {
    language: "cpp",
    code: `int gcd(int a, int b) {
    a = abs(a);
    b = abs(b);
    while (b != 0) {
        int temp = a % b;
        a = b;
        b = temp;
    }
    return a;
}`,
  },
  {
    language: "javascript",
    code: `function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}`,
  },
  {
    language: "go",
    code: `func gcd(a, b int) int {
    if a < 0 { a = -a }
    if b < 0 { b = -b }
    for b != 0 {
        a, b = b, a%b
    }
    return a
}`,
  },
];

export const sieveOfEratosthenesCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def sieve(n):
    if n < 2:
        return []
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    p = 2
    while p * p <= n:
        if is_prime[p]:
            for multiple in range(p * p, n + 1, p):
                is_prime[multiple] = False
        p += 1
    return [i for i, prime in enumerate(is_prime) if prime]`,
  },
  {
    language: "java",
    code: `import java.util.*;

public class SieveOfEratosthenes {
    static List<Integer> sieve(int n) {
        if (n < 2) return new ArrayList<>();
        boolean[] isPrime = new boolean[n + 1];
        Arrays.fill(isPrime, true);
        isPrime[0] = isPrime[1] = false;
        for (int p = 2; p * p <= n; p++) {
            if (isPrime[p]) {
                for (int m = p * p; m <= n; m += p) isPrime[m] = false;
            }
        }
        List<Integer> primes = new ArrayList<>();
        for (int i = 2; i <= n; i++) if (isPrime[i]) primes.add(i);
        return primes;
    }
}`,
  },
  {
    language: "cpp",
    code: `vector<int> sieve(int n) {
    if (n < 2) return {};
    vector<bool> isPrime(n + 1, true);
    isPrime[0] = isPrime[1] = false;
    for (int p = 2; p * p <= n; ++p) {
        if (isPrime[p]) {
            for (int m = p * p; m <= n; m += p) isPrime[m] = false;
        }
    }
    vector<int> primes;
    for (int i = 2; i <= n; ++i) if (isPrime[i]) primes.push_back(i);
    return primes;
}`,
  },
  {
    language: "javascript",
    code: `function sieve(n) {
    if (n < 2) return [];
    const isPrime = new Array(n + 1).fill(true);
    isPrime[0] = isPrime[1] = false;
    for (let p = 2; p * p <= n; p++) {
        if (isPrime[p]) {
            for (let m = p * p; m <= n; m += p) isPrime[m] = false;
        }
    }
    const primes = [];
    for (let i = 2; i <= n; i++) if (isPrime[i]) primes.push(i);
    return primes;
}`,
  },
  {
    language: "go",
    code: `func sieve(n int) []int {
    if n < 2 { return []int{} }
    isPrime := make([]bool, n+1)
    for i := 2; i <= n; i++ { isPrime[i] = true }
    for p := 2; p*p <= n; p++ {
        if isPrime[p] {
            for m := p * p; m <= n; m += p { isPrime[m] = false }
        }
    }
    primes := []int{}
    for i := 2; i <= n; i++ {
        if isPrime[i] { primes = append(primes, i) }
    }
    return primes
}`,
  },
];

export const spiralMatrixTraversalCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def spiral_order(matrix):
    if not matrix or not matrix[0]:
        return []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    order = []
    while top <= bottom and left <= right:
        for col in range(left, right + 1): order.append(matrix[top][col])
        top += 1
        for row in range(top, bottom + 1): order.append(matrix[row][right])
        right -= 1
        if top <= bottom:
            for col in range(right, left - 1, -1): order.append(matrix[bottom][col])
            bottom -= 1
        if left <= right:
            for row in range(bottom, top - 1, -1): order.append(matrix[row][left])
            left += 1
    return order`,
  },
  {
    language: "java",
    code: `import java.util.*;

public class SpiralMatrixTraversal {
    static List<Integer> spiralOrder(int[][] matrix) {
        List<Integer> order = new ArrayList<>();
        if (matrix.length == 0 || matrix[0].length == 0) return order;
        int top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
        while (top <= bottom && left <= right) {
            for (int c = left; c <= right; c++) order.add(matrix[top][c]);
            top++;
            for (int r = top; r <= bottom; r++) order.add(matrix[r][right]);
            right--;
            if (top <= bottom) for (int c = right; c >= left; c--) order.add(matrix[bottom][c]);
            bottom--;
            if (left <= right) for (int r = bottom; r >= top; r--) order.add(matrix[r][left]);
            left++;
        }
        return order;
    }
}`,
  },
  {
    language: "cpp",
    code: `vector<int> spiralOrder(vector<vector<int>>& matrix) {
    vector<int> order;
    if (matrix.empty() || matrix[0].empty()) return order;
    int top = 0, bottom = matrix.size() - 1, left = 0, right = matrix[0].size() - 1;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; ++c) order.push_back(matrix[top][c]);
        ++top;
        for (int r = top; r <= bottom; ++r) order.push_back(matrix[r][right]);
        --right;
        if (top <= bottom) for (int c = right; c >= left; --c) order.push_back(matrix[bottom][c]);
        --bottom;
        if (left <= right) for (int r = bottom; r >= top; --r) order.push_back(matrix[r][left]);
        ++left;
    }
    return order;
}`,
  },
  {
    language: "javascript",
    code: `function spiralOrder(matrix) {
    if (!matrix.length || !matrix[0].length) return [];
    let top = 0, bottom = matrix.length - 1;
    let left = 0, right = matrix[0].length - 1;
    const order = [];
    while (top <= bottom && left <= right) {
        for (let c = left; c <= right; c++) order.push(matrix[top][c]);
        top++;
        for (let r = top; r <= bottom; r++) order.push(matrix[r][right]);
        right--;
        if (top <= bottom) for (let c = right; c >= left; c--) order.push(matrix[bottom][c]);
        bottom--;
        if (left <= right) for (let r = bottom; r >= top; r--) order.push(matrix[r][left]);
        left++;
    }
    return order;
}`,
  },
  {
    language: "go",
    code: `func spiralOrder(matrix [][]int) []int {
    if len(matrix) == 0 || len(matrix[0]) == 0 { return []int{} }
    top, bottom := 0, len(matrix)-1
    left, right := 0, len(matrix[0])-1
    order := []int{}
    for top <= bottom && left <= right {
        for c := left; c <= right; c++ { order = append(order, matrix[top][c]) }
        top++
        for r := top; r <= bottom; r++ { order = append(order, matrix[r][right]) }
        right--
        if top <= bottom { for c := right; c >= left; c-- { order = append(order, matrix[bottom][c]) } ; bottom-- }
        if left <= right { for r := bottom; r >= top; r-- { order = append(order, matrix[r][left]) } ; left++ }
    }
    return order
}`,
  },
];

export const matrixRotationCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def rotate(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()`,
  },
  {
    language: "java",
    code: `public class MatrixRotation {
    static void rotate(int[][] matrix) {
        int n = matrix.length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                int temp = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = temp;
            }
            for (int l = 0, r = n - 1; l < r; l++, r--) {
                int temp = matrix[i][l];
                matrix[i][l] = matrix[i][r];
                matrix[i][r] = temp;
            }
        }
    }
}`,
  },
  {
    language: "cpp",
    code: `void rotate(vector<vector<int>>& matrix) {
    int n = matrix.size();
    for (int i = 0; i < n; ++i) {
        for (int j = i + 1; j < n; ++j) {
            swap(matrix[i][j], matrix[j][i]);
        }
        reverse(matrix[i].begin(), matrix[i].end());
    }
}`,
  },
  {
    language: "javascript",
    code: `function rotate(matrix) {
    const n = matrix.length;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
        }
        matrix[i].reverse();
    }
}`,
  },
  {
    language: "go",
    code: `func rotate(matrix [][]int) {
    n := len(matrix)
    for i := 0; i < n; i++ {
        for j := i + 1; j < n; j++ {
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
        }
        for l, r := 0, n-1; l < r; l, r = l+1, r-1 {
            matrix[i][l], matrix[i][r] = matrix[i][r], matrix[i][l]
        }
    }
}`,
  },
];

export const slidingWindowMaximumCode: CodeImplementation[] = [
  {
    language: "python",
    code: `from collections import deque

def max_sliding_window(nums, k):
    dq = deque()
    answer = []
    for i, value in enumerate(nums):
        while dq and dq[0] <= i - k:
            dq.popleft()
        while dq and nums[dq[-1]] <= value:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            answer.append(nums[dq[0]])
    return answer`,
  },
  {
    language: "java",
    code: `import java.util.*;

public class SlidingWindowMaximum {
    static int[] maxSlidingWindow(int[] nums, int k) {
        Deque<Integer> dq = new ArrayDeque<>();
        int[] answer = new int[nums.length - k + 1];
        for (int i = 0; i < nums.length; i++) {
            while (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();
            while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();
            dq.offerLast(i);
            if (i >= k - 1) answer[i - k + 1] = nums[dq.peekFirst()];
        }
        return answer;
    }
}`,
  },
  {
    language: "cpp",
    code: `vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> dq;
    vector<int> answer;
    for (int i = 0; i < nums.size(); ++i) {
        while (!dq.empty() && dq.front() <= i - k) dq.pop_front();
        while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1) answer.push_back(nums[dq.front()]);
    }
    return answer;
}`,
  },
  {
    language: "javascript",
    code: `function maxSlidingWindow(nums, k) {
    const dq = [];
    let head = 0;
    const answer = [];
    for (let i = 0; i < nums.length; i++) {
        while (head < dq.length && dq[head] <= i - k) head++;
        while (head < dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
        dq.push(i);
        if (i >= k - 1) answer.push(nums[dq[head]]);
    }
    return answer;
}`,
  },
  {
    language: "go",
    code: `func maxSlidingWindow(nums []int, k int) []int {
    dq := []int{}
    answer := []int{}
    for i := 0; i < len(nums); i++ {
        if len(dq) > 0 && dq[0] <= i-k { dq = dq[1:] }
        for len(dq) > 0 && nums[dq[len(dq)-1]] <= nums[i] {
            dq = dq[:len(dq)-1]
        }
        dq = append(dq, i)
        if i >= k-1 { answer = append(answer, nums[dq[0]]) }
    }
    return answer
}`,
  },
];

export const activitySelectionCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def activity_selection(intervals):
    intervals.sort(key=lambda interval: interval[1])
    chosen = []
    last_end = float("-inf")
    for start, end in intervals:
        if start >= last_end:
            chosen.append((start, end))
            last_end = end
    return chosen`,
  },
  {
    language: "java",
    code: `import java.util.*;

public class ActivitySelection {
    static List<int[]> select(int[][] intervals) {
        Arrays.sort(intervals, Comparator.comparingInt(a -> a[1]));
        List<int[]> chosen = new ArrayList<>();
        int lastEnd = Integer.MIN_VALUE;
        for (int[] interval : intervals) {
            if (interval[0] >= lastEnd) {
                chosen.add(interval);
                lastEnd = interval[1];
            }
        }
        return chosen;
    }
}`,
  },
  {
    language: "cpp",
    code: `vector<pair<int, int>> activitySelection(vector<pair<int, int>>& intervals) {
    sort(intervals.begin(), intervals.end(), [](auto& a, auto& b) { return a.second < b.second; });
    vector<pair<int, int>> chosen;
    int lastEnd = INT_MIN;
    for (auto& interval : intervals) {
        if (interval.first >= lastEnd) {
            chosen.push_back(interval);
            lastEnd = interval.second;
        }
    }
    return chosen;
}`,
  },
  {
    language: "javascript",
    code: `function activitySelection(intervals) {
    intervals.sort((a, b) => a[1] - b[1]);
    const chosen = [];
    let lastEnd = -Infinity;
    for (const [start, end] of intervals) {
        if (start >= lastEnd) {
            chosen.push([start, end]);
            lastEnd = end;
        }
    }
    return chosen;
}`,
  },
  {
    language: "go",
    code: `import "sort"

type Activity struct { Start, End int }

func activitySelection(intervals []Activity) []Activity {
    sort.Slice(intervals, func(i, j int) bool { return intervals[i].End < intervals[j].End })
    chosen := []Activity{}
    lastEnd := -(1 << 60)
    for _, interval := range intervals {
        if interval.Start >= lastEnd {
            chosen = append(chosen, interval)
            lastEnd = interval.End
        }
    }
    return chosen
}`,
  },
];

export const fractionalKnapsackCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def fractional_knapsack(items, capacity):
    items.sort(key=lambda item: item[0] / item[1], reverse=True)
    total = 0.0
    for value, weight in items:
        if capacity == 0:
            break
        take = min(weight, capacity)
        total += take * value / weight
        capacity -= take
    return total`,
  },
  {
    language: "java",
    code: `import java.util.*;

public class FractionalKnapsack {
    static class Item { int value, weight; Item(int v, int w) { value = v; weight = w; } }
    static double maxValue(Item[] items, int capacity) {
        Arrays.sort(items, (a, b) -> Double.compare((double) b.value / b.weight, (double) a.value / a.weight));
        double total = 0;
        for (Item item : items) {
            if (capacity == 0) break;
            int take = Math.min(item.weight, capacity);
            total += (double) take * item.value / item.weight;
            capacity -= take;
        }
        return total;
    }
}`,
  },
  {
    language: "cpp",
    code: `struct Item { int value, weight; };

double fractionalKnapsack(vector<Item>& items, int capacity) {
    sort(items.begin(), items.end(), [](const Item& a, const Item& b) {
        return (double)a.value / a.weight > (double)b.value / b.weight;
    });
    double total = 0;
    for (const Item& item : items) {
        if (capacity == 0) break;
        int take = min(item.weight, capacity);
        total += (double)take * item.value / item.weight;
        capacity -= take;
    }
    return total;
}`,
  },
  {
    language: "javascript",
    code: `function fractionalKnapsack(items, capacity) {
    items.sort((a, b) => b.value / b.weight - a.value / a.weight);
    let total = 0;
    for (const item of items) {
        if (capacity === 0) break;
        const take = Math.min(item.weight, capacity);
        total += (take * item.value) / item.weight;
        capacity -= take;
    }
    return total;
}`,
  },
  {
    language: "go",
    code: `import "sort"

type Item struct { Value, Weight int }

func fractionalKnapsack(items []Item, capacity int) float64 {
    sort.Slice(items, func(i, j int) bool {
        return float64(items[i].Value)/float64(items[i].Weight) > float64(items[j].Value)/float64(items[j].Weight)
    })
    total := 0.0
    for _, item := range items {
        if capacity == 0 { break }
        take := item.Weight
        if take > capacity { take = capacity }
        total += float64(take) * float64(item.Value) / float64(item.Weight)
        capacity -= take
    }
    return total
}`,
  },
];

export const xorSingleNumberCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def single_number(nums):
    answer = 0
    for num in nums:
        answer ^= num
    return answer`,
  },
  {
    language: "java",
    code: `public class XorSingleNumber {
    static int singleNumber(int[] nums) {
        int answer = 0;
        for (int num : nums) answer ^= num;
        return answer;
    }
}`,
  },
  {
    language: "cpp",
    code: `int singleNumber(vector<int>& nums) {
    int answer = 0;
    for (int num : nums) answer ^= num;
    return answer;
}`,
  },
  {
    language: "javascript",
    code: `function singleNumber(nums) {
    let answer = 0;
    for (const num of nums) answer ^= num;
    return answer;
}`,
  },
  {
    language: "go",
    code: `func singleNumber(nums []int) int {
    answer := 0
    for _, num := range nums { answer ^= num }
    return answer
}`,
  },
];

export const countSetBitsCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def count_set_bits(x):
    count = 0
    while x:
        x &= x - 1
        count += 1
    return count`,
  },
  {
    language: "java",
    code: `public class CountSetBits {
    static int countSetBits(int x) {
        int count = 0;
        while (x != 0) {
            x &= x - 1;
            count++;
        }
        return count;
    }
}`,
  },
  {
    language: "cpp",
    code: `int countSetBits(int x) {
    int count = 0;
    while (x != 0) {
        x &= x - 1;
        ++count;
    }
    return count;
}`,
  },
  {
    language: "javascript",
    code: `function countSetBits(x) {
    x >>>= 0;
    let count = 0;
    while (x !== 0) {
        x &= x - 1;
        count++;
    }
    return count;
}`,
  },
  {
    language: "go",
    code: `func countSetBits(x int) int {
    count := 0
    for x != 0 {
        x &= x - 1
        count++
    }
    return count
}`,
  },
];

export const buildSegmentTreeCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def build_segment_tree(nums):
    tree = [0] * (4 * len(nums))
    def build(node, left, right):
        if left == right:
            tree[node] = nums[left]
            return
        mid = (left + right) // 2
        build(node * 2, left, mid)
        build(node * 2 + 1, mid + 1, right)
        tree[node] = tree[node * 2] + tree[node * 2 + 1]
    if nums:
        build(1, 0, len(nums) - 1)
    return tree`,
  },
  {
    language: "java",
    code: `public class SegmentTreeBuilder {
    int[] nums, tree;
    SegmentTreeBuilder(int[] nums) {
        this.nums = nums;
        this.tree = new int[4 * nums.length];
        if (nums.length > 0) build(1, 0, nums.length - 1);
    }
    void build(int node, int left, int right) {
        if (left == right) { tree[node] = nums[left]; return; }
        int mid = (left + right) / 2;
        build(node * 2, left, mid);
        build(node * 2 + 1, mid + 1, right);
        tree[node] = tree[node * 2] + tree[node * 2 + 1];
    }
}`,
  },
  {
    language: "cpp",
    code: `struct SegmentTreeBuilder {
    vector<int> nums, tree;
    SegmentTreeBuilder(vector<int> values) : nums(move(values)), tree(4 * nums.size()) {
        if (!nums.empty()) build(1, 0, nums.size() - 1);
    }
    void build(int node, int left, int right) {
        if (left == right) { tree[node] = nums[left]; return; }
        int mid = (left + right) / 2;
        build(node * 2, left, mid);
        build(node * 2 + 1, mid + 1, right);
        tree[node] = tree[node * 2] + tree[node * 2 + 1];
    }
};`,
  },
  {
    language: "javascript",
    code: `function buildSegmentTree(nums) {
    const tree = new Array(nums.length * 4).fill(0);
    function build(node, left, right) {
        if (left === right) {
            tree[node] = nums[left];
            return;
        }
        const mid = Math.floor((left + right) / 2);
        build(node * 2, left, mid);
        build(node * 2 + 1, mid + 1, right);
        tree[node] = tree[node * 2] + tree[node * 2 + 1];
    }
    if (nums.length) build(1, 0, nums.length - 1);
    return tree;
}`,
  },
  {
    language: "go",
    code: `type SegmentTree struct {
    nums []int
    tree []int
}

func newSegmentTree(nums []int) *SegmentTree {
    st := &SegmentTree{nums: nums, tree: make([]int, 4*len(nums))}
    if len(nums) > 0 { st.build(1, 0, len(nums)-1) }
    return st
}

func (st *SegmentTree) build(node, left, right int) {
    if left == right { st.tree[node] = st.nums[left]; return }
    mid := (left + right) / 2
    st.build(node*2, left, mid); st.build(node*2+1, mid+1, right)
    st.tree[node] = st.tree[node*2] + st.tree[node*2+1]
}`,
  },
];

export const rangeQueryCode: CodeImplementation[] = [
  {
    language: "python",
    code: `class SegmentTree:
    def __init__(self, nums):
        self.n = len(nums)
        self.tree = [0] * (4 * self.n)
        self.lazy = [0] * (4 * self.n)
        if self.n:
            self.build(1, 0, self.n - 1, nums)

    def build(self, node, left, right, nums):
        if left == right:
            self.tree[node] = nums[left]
            return
        mid = (left + right) // 2
        self.build(node * 2, left, mid, nums)
        self.build(node * 2 + 1, mid + 1, right, nums)
        self.tree[node] = self.tree[node * 2] + self.tree[node * 2 + 1]

    def push(self, node, left, right):
        if self.lazy[node] and left != right:
            mid = (left + right) // 2
            self.tree[node * 2] += self.lazy[node] * (mid - left + 1)
            self.tree[node * 2 + 1] += self.lazy[node] * (right - mid)
            self.lazy[node * 2] += self.lazy[node]
            self.lazy[node * 2 + 1] += self.lazy[node]
        self.lazy[node] = 0

    def query(self, node, left, right, ql, qr):
        if ql <= left and right <= qr: return self.tree[node]
        self.push(node, left, right)
        mid = (left + right) // 2
        total = 0
        if ql <= mid: total += self.query(node * 2, left, mid, ql, qr)
        if qr > mid: total += self.query(node * 2 + 1, mid + 1, right, ql, qr)
        return total`,
  },
  {
    language: "java",
    code: `class SegmentTreeRangeQuery {
    int[] tree, lazy; int n;
    SegmentTreeRangeQuery(int[] nums) { n = nums.length; tree = new int[4 * n]; lazy = new int[4 * n]; if (n > 0) build(1, 0, n - 1, nums); }
    void build(int node, int l, int r, int[] nums) { if (l == r) { tree[node] = nums[l]; return; } int m = (l + r) / 2; build(node * 2, l, m, nums); build(node * 2 + 1, m + 1, r, nums); tree[node] = tree[node * 2] + tree[node * 2 + 1]; }
    void push(int node, int l, int r) { if (lazy[node] != 0 && l != r) { int m = (l + r) / 2; tree[node * 2] += lazy[node] * (m - l + 1); tree[node * 2 + 1] += lazy[node] * (r - m); lazy[node * 2] += lazy[node]; lazy[node * 2 + 1] += lazy[node]; } lazy[node] = 0; }
    int query(int node, int l, int r, int ql, int qr) { if (ql <= l && r <= qr) return tree[node]; push(node, l, r); int m = (l + r) / 2, total = 0; if (ql <= m) total += query(node * 2, l, m, ql, qr); if (qr > m) total += query(node * 2 + 1, m + 1, r, ql, qr); return total; }
}`,
  },
  {
    language: "cpp",
    code: `struct SegmentTreeRangeQuery {
    vector<int> tree, lazy; int n;
    SegmentTreeRangeQuery(vector<int>& nums) : tree(4 * nums.size()), lazy(4 * nums.size()), n(nums.size()) { if (n) build(1, 0, n - 1, nums); }
    void build(int node, int l, int r, vector<int>& nums) { if (l == r) { tree[node] = nums[l]; return; } int m = (l + r) / 2; build(node * 2, l, m, nums); build(node * 2 + 1, m + 1, r, nums); tree[node] = tree[node * 2] + tree[node * 2 + 1]; }
    void push(int node, int l, int r) { if (lazy[node] && l != r) { int m = (l + r) / 2; tree[node * 2] += lazy[node] * (m - l + 1); tree[node * 2 + 1] += lazy[node] * (r - m); lazy[node * 2] += lazy[node]; lazy[node * 2 + 1] += lazy[node]; } lazy[node] = 0; }
    int query(int node, int l, int r, int ql, int qr) { if (ql <= l && r <= qr) return tree[node]; push(node, l, r); int m = (l + r) / 2, total = 0; if (ql <= m) total += query(node * 2, l, m, ql, qr); if (qr > m) total += query(node * 2 + 1, m + 1, r, ql, qr); return total; }
};`,
  },
  {
    language: "javascript",
    code: `class SegmentTreeRangeQuery {
    constructor(nums) { this.n = nums.length; this.tree = new Array(this.n * 4).fill(0); this.lazy = new Array(this.n * 4).fill(0); if (this.n) this.build(1, 0, this.n - 1, nums); }
    build(node, left, right, nums) { if (left === right) { this.tree[node] = nums[left]; return; } const mid = Math.floor((left + right) / 2); this.build(node * 2, left, mid, nums); this.build(node * 2 + 1, mid + 1, right, nums); this.tree[node] = this.tree[node * 2] + this.tree[node * 2 + 1]; }
    push(node, left, right) { if (this.lazy[node] && left !== right) { const mid = Math.floor((left + right) / 2); this.tree[node * 2] += this.lazy[node] * (mid - left + 1); this.tree[node * 2 + 1] += this.lazy[node] * (right - mid); this.lazy[node * 2] += this.lazy[node]; this.lazy[node * 2 + 1] += this.lazy[node]; } this.lazy[node] = 0; }
    query(node, left, right, ql, qr) { if (ql <= left && right <= qr) return this.tree[node]; this.push(node, left, right); const mid = Math.floor((left + right) / 2); let total = 0; if (ql <= mid) total += this.query(node * 2, left, mid, ql, qr); if (qr > mid) total += this.query(node * 2 + 1, mid + 1, right, ql, qr); return total; }
}`,
  },
  {
    language: "go",
    code: `type SegmentTreeRangeQuery struct { tree, lazy []int; n int }

func newSegmentTreeRangeQuery(nums []int) *SegmentTreeRangeQuery {
    st := &SegmentTreeRangeQuery{tree: make([]int, 4*len(nums)), lazy: make([]int, 4*len(nums)), n: len(nums)}
    if st.n > 0 { st.build(1, 0, st.n-1, nums) }
    return st
}

func (st *SegmentTreeRangeQuery) build(node, left, right int, nums []int) {
    if left == right { st.tree[node] = nums[left]; return }
    mid := (left + right) / 2
    st.build(node*2, left, mid, nums); st.build(node*2+1, mid+1, right, nums)
    st.tree[node] = st.tree[node*2] + st.tree[node*2+1]
}

func (st *SegmentTreeRangeQuery) push(node, left, right int) {
    if st.lazy[node] != 0 && left != right { mid := (left + right) / 2; st.tree[node*2] += st.lazy[node] * (mid - left + 1); st.tree[node*2+1] += st.lazy[node] * (right - mid); st.lazy[node*2] += st.lazy[node]; st.lazy[node*2+1] += st.lazy[node] }
    st.lazy[node] = 0
}

func (st *SegmentTreeRangeQuery) query(node, left, right, ql, qr int) int {
    if ql <= left && right <= qr { return st.tree[node] }
    st.push(node, left, right); mid, total := (left+right)/2, 0
    if ql <= mid { total += st.query(node*2, left, mid, ql, qr) }
    if qr > mid { total += st.query(node*2+1, mid+1, right, ql, qr) }
    return total
}`,
  },
];

export const unionFindWithPathCompressionCode: CodeImplementation[] = [
  {
    language: "python",
    code: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb: return False
        if self.rank[ra] < self.rank[rb]: ra, rb = rb, ra
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]: self.rank[ra] += 1
        return True`,
  },
  {
    language: "java",
    code: `public class UnionFind {
    int[] parent, rank;
    public UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }
    boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;
        if (rank[ra] == rank[rb]) rank[ra]++;
        return true;
    }
}`,
  },
  {
    language: "cpp",
    code: `struct UnionFind {
    vector<int> parent, rank;
    UnionFind(int n) : parent(n), rank(n, 0) { iota(parent.begin(), parent.end(), 0); }
    int find(int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); }
    bool unite(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (rank[ra] < rank[rb]) swap(ra, rb);
        parent[rb] = ra;
        if (rank[ra] == rank[rb]) rank[ra]++;
        return true;
    }
};`,
  },
  {
    language: "javascript",
    code: `class UnionFind {
    constructor(n) {
        this.parent = Array.from({ length: n }, (_, i) => i);
        this.rank = new Array(n).fill(0);
    }
    find(x) {
        if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
        return this.parent[x];
    }
    union(a, b) {
        let ra = this.find(a), rb = this.find(b);
        if (ra === rb) return false;
        if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
        this.parent[rb] = ra;
        if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
        return true;
    }
}`,
  },
  {
    language: "go",
    code: `type UnionFind struct {
    parent []int
    rank   []int
}

func newUnionFind(n int) *UnionFind {
    uf := &UnionFind{parent: make([]int, n), rank: make([]int, n)}
    for i := range uf.parent { uf.parent[i] = i }
    return uf
}

func (uf *UnionFind) find(x int) int {
    if uf.parent[x] != x { uf.parent[x] = uf.find(uf.parent[x]) }
    return uf.parent[x]
}

func (uf *UnionFind) union(a, b int) bool {
    ra, rb := uf.find(a), uf.find(b)
    if ra == rb { return false }
    if uf.rank[ra] < uf.rank[rb] { ra, rb = rb, ra }
    uf.parent[rb] = ra
    if uf.rank[ra] == uf.rank[rb] { uf.rank[ra]++ }
    return true
}`,
  },
];

export const quickSelectCode: CodeImplementation[] = [
  {
    language: "python",
    code: `def quick_select(nums, k):
    left, right = 0, len(nums) - 1
    while True:
        pivot = nums[right]
        store = left
        for i in range(left, right):
            if nums[i] <= pivot:
                nums[store], nums[i] = nums[i], nums[store]
                store += 1
        nums[store], nums[right] = nums[right], nums[store]
        if store == k:
            return nums[store]
        if store < k:
            left = store + 1
        else:
            right = store - 1`,
  },
  {
    language: "java",
    code: `public class QuickSelect {
    static int quickSelect(int[] nums, int k) {
        int left = 0, right = nums.length - 1;
        while (true) {
            int pivot = nums[right], store = left;
            for (int i = left; i < right; i++) if (nums[i] <= pivot) { int t = nums[store]; nums[store++] = nums[i]; nums[i] = t; }
            int t = nums[store]; nums[store] = nums[right]; nums[right] = t;
            if (store == k) return nums[store];
            if (store < k) left = store + 1; else right = store - 1;
        }
    }
}`,
  },
  {
    language: "cpp",
    code: `int quickSelect(vector<int>& nums, int k) {
    int left = 0, right = nums.size() - 1;
    while (true) {
        int pivot = nums[right], store = left;
        for (int i = left; i < right; ++i) if (nums[i] <= pivot) swap(nums[store++], nums[i]);
        swap(nums[store], nums[right]);
        if (store == k) return nums[store];
        if (store < k) left = store + 1; else right = store - 1;
    }
}`,
  },
  {
    language: "javascript",
    code: `function quickSelect(nums, k) {
    let left = 0, right = nums.length - 1;
    while (true) {
        const pivot = nums[right];
        let store = left;
        for (let i = left; i < right; i++) {
            if (nums[i] <= pivot) [nums[store], nums[i]] = [nums[i], nums[store]], store++;
        }
        [nums[store], nums[right]] = [nums[right], nums[store]];
        if (store === k) return nums[store];
        if (store < k) left = store + 1; else right = store - 1;
    }
}`,
  },
  {
    language: "go",
    code: `func quickSelect(nums []int, k int) int {
    left, right := 0, len(nums)-1
    for {
        pivot, store := nums[right], left
        for i := left; i < right; i++ {
            if nums[i] <= pivot { nums[store], nums[i] = nums[i], nums[store]; store++ }
        }
        nums[store], nums[right] = nums[right], nums[store]
        if store == k { return nums[store] }
        if store < k { left = store + 1 } else { right = store - 1 }
    }
}`,
  },
];