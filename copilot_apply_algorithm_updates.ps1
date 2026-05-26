$repo = 'C:\Users\P3123\Desktop\dsa-visualizer'
$algoPath = Join-Path $repo 'src\data\algorithmCode.ts'
$topicsPath = Join-Path $repo 'src\data\topics.ts'

$algoText = Get-Content $algoPath -Raw
$nl = if ($algoText.Contains("`r`n")) { "`r`n" } else { "`n" }

$block = @'
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
'@
$block = $block.TrimStart([char[]]"`r`n")
if ($nl -eq "`n") { $block = $block -replace "`r`n", "`n" }

if (-not $algoText.Contains('export const euclideanGcdCode')) {
    if (-not $algoText.EndsWith($nl)) { $algoText += $nl }
    $algoText += $nl + $block
    Set-Content -Path $algoPath -Value $algoText -Encoding utf8 -NoNewline
}

$topicsText = Get-Content $topicsPath -Raw

function Add-CodeRef([string]$text, [string]$needle, [string]$insert) {
    if ($text.Contains($insert)) { return $text }
    if (-not $text.Contains($needle)) { throw "Replacement target not found: $needle" }
    return $text.Replace($needle, $insert)
}

$topicsText = Add-CodeRef $topicsText ('        explanation: "The gcd does not change if the larger number is replaced with its remainder modulo the smaller one.",' + $nl + '      },') ('        explanation: "The gcd does not change if the larger number is replaced with its remainder modulo the smaller one.",' + $nl + '        code: algoCode.euclideanGcdCode,' + $nl + '      },')
$topicsText = Add-CodeRef $topicsText ('        explanation: "Each prime marks its multiples, leaving only prime numbers unmarked.",' + $nl + '      },') ('        explanation: "Each prime marks its multiples, leaving only prime numbers unmarked.",' + $nl + '        code: algoCode.sieveOfEratosthenesCode,' + $nl + '      },')
$topicsText = Add-CodeRef $topicsText ('        explanation: "Boundary pointers shrink inward after each layer of the spiral is processed.",' + $nl + '      },') ('        explanation: "Boundary pointers shrink inward after each layer of the spiral is processed.",' + $nl + '        code: algoCode.spiralMatrixTraversalCode,' + $nl + '      },')
$topicsText = Add-CodeRef $topicsText ('        explanation: "A deque stores only useful candidates for the current window maximum.",' + $nl + '      },') ('        explanation: "A deque stores only useful candidates for the current window maximum.",' + $nl + '        code: algoCode.slidingWindowMaximumCode,' + $nl + '      },')
$topicsText = Add-CodeRef $topicsText ('        explanation: "Choosing the activity that ends earliest leaves the most room for future choices.",' + $nl + '      },') ('        explanation: "Choosing the activity that ends earliest leaves the most room for future choices.",' + $nl + '        code: algoCode.activitySelectionCode,' + $nl + '      },')
$topicsText = Add-CodeRef $topicsText ('        explanation: "The best immediate ratio is always safe when fractions of items are allowed.",' + $nl + '      },') ('        explanation: "The best immediate ratio is always safe when fractions of items are allowed.",' + $nl + '        code: algoCode.fractionalKnapsackCode,' + $nl + '      },')
$topicsText = Add-CodeRef $topicsText ('        explanation: "Equal numbers cancel under XOR, leaving only the unique value behind.",' + $nl + '      },') ('        explanation: "Equal numbers cancel under XOR, leaving only the unique value behind.",' + $nl + '        code: algoCode.xorSingleNumberCode,' + $nl + '      },')
$topicsText = Add-CodeRef $topicsText ('        explanation: "The expression x AND (x - 1) removes the lowest set bit each time.",' + $nl + '      },') ('        explanation: "The expression x AND (x - 1) removes the lowest set bit each time.",' + $nl + '        code: algoCode.countSetBitsCode,' + $nl + '      },')
$topicsText = Add-CodeRef $topicsText ('        explanation: "Each node stores a summary for one interval, built from its two children.",' + $nl + '      },') ('        explanation: "Each node stores a summary for one interval, built from its two children.",' + $nl + '        code: algoCode.buildSegmentTreeCode,' + $nl + '      },')
$topicsText = Add-CodeRef $topicsText ('        explanation: "Lazy tags defer interval updates so each query touches only the relevant logarithmic path.",' + $nl + '      },') ('        explanation: "Lazy tags defer interval updates so each query touches only the relevant logarithmic path.",' + $nl + '        code: algoCode.rangeQueryCode,' + $nl + '      },')
$topicsText = Add-CodeRef $topicsText ('        explanation: "Every find call shortens future paths by pointing nodes directly closer to the representative.",' + $nl + '      },') ('        explanation: "Every find call shortens future paths by pointing nodes directly closer to the representative.",' + $nl + '        code: algoCode.unionFindWithPathCompressionCode,' + $nl + '      },')
$topicsText = Add-CodeRef $topicsText ('        explanation: "Attaching the shallower tree under the deeper tree keeps future operations fast.",' + $nl + '      },') ('        explanation: "Attaching the shallower tree under the deeper tree keeps future operations fast.",' + $nl + '        code: algoCode.unionFindWithPathCompressionCode,' + $nl + '      },')

Set-Content -Path $topicsPath -Value $topicsText -Encoding utf8 -NoNewline
