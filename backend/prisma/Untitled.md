# C++ STL — Complete Notes

STL has 4 pillars: **Containers** (store data), **Algorithms** (operate on data), **Iterators** (glue between containers & algorithms), **Functors/Comparators** (customize behavior).

***

## 1. `vector`

**Header:** `<vector>` | Dynamic array, contiguous memory.

```cpp
vector<int> v;                     // empty
vector<int> v(5);                  // 5 elements, value 0
vector<int> v(5, 10);              // 5 elements, all 10
vector<int> v2(v.begin(), v.end());// copy from range
vector<vector<int>> grid(n, vector<int>(m, 0)); // 2D
```

**Key ops:**

* `push_back/pop_back` — O(1) amortized
* `insert/erase` at arbitrary position — O(n) (shifting)
* `[]` / `at()` — O(1) random access; `at()` bound-checks (throws `out_of_range`), `[]` doesn't
* `size(), empty(), clear()` — O(1)
* `capacity(), reserve(n), shrink_to_fit()` — control reallocation
* `emplace_back(args...)` — constructs object in place, avoids a copy vs `push_back`

**Gotchas:**

* Capacity grows by a factor (~1.5x/2x, implementation-defined) — `reserve()` upfront if size is known, avoids repeated reallocation.
* Reallocation invalidates **all** iterators/pointers/references.
* `erase`/`insert` invalidate iterators from that point onward.

**When to use:** default choice for a list of items — need random access, mostly insert/remove at the end.\
**Avoid when:** frequent insert/delete in the middle → use `list`/`deque`.

**🧠 Test Yourself:**

1. Q: Why is `push_back` "amortized" O(1) and not strictly O(1)?

A: Occasionally it triggers reallocation (O(n)) to grow capacity, but this happens rarely enough that the average over many calls is O(1).

2. Q: What's the difference between `size()` and `capacity()`?

A: `size()` = number of elements currently stored; `capacity()` = allocated storage before the next reallocation is needed.

3. Q: Why does `reserve(n)` help performance when you know the final size?

A: It pre-allocates memory once, avoiding multiple O(n) reallocations/copies as the vector grows.

4. Q: Why do pointers into a vector become dangerous after a `push_back`?

A: If capacity is exceeded, the vector reallocates a new buffer and copies/moves elements — old pointers/iterators point to freed memory.

5. Q: When would you prefer `deque` over `vector`?

A: When you need frequent fast insertion/deletion at the **front** — vector's front insert is O(n), deque's is O(1).

***

## 2. `array` (std::array)

**Header:** `<array>` | Fixed-size array, size known at compile time, stack-allocated (no heap overhead).

```cpp
array<int, 5> a = {1,2,3,4,5};
a.size(); a.fill(0); a.at(2);
```

**When to use:** fixed-size collection where you want STL-style methods (`.size()`, iterators) but no dynamic resizing / heap allocation overhead.\
**Avoid when:** size isn't known at compile time.

**🧠 Test Yourself:**

1. Q: Why is `std::array` generally faster than `vector` for small fixed collections?

A: No heap allocation — it lives on the stack, avoiding allocation overhead and pointer indirection.

2. Q: Can you resize a `std::array` at runtime?

A: No — its size is a compile-time template parameter, fixed forever.

3. Q: Does `std::array` support iterators like `vector`?

A: Yes — `begin()/end()`, works with all STL algorithms.

4. Q: Why prefer `array<int,5>` over a raw C array `int arr[5]`?

A: It knows its own size (`.size()`), supports iterators/algorithms, and has bounds-checked `.at()`.

5. Q: What happens if you access `.at(10)` on an `array<int,5>`?

A: Throws `std::out_of_range`, unlike `[]` which is undefined behavior.

***

## 3. `deque`

**Header:** `<deque>` | Double-ended queue, stored as blocks of memory (not fully contiguous).

```cpp
deque<int> dq;
dq.push_front(1); dq.push_back(2);
dq.pop_front(); dq.pop_back();
dq[0]; // O(1) random access
```

**Key ops:** push/pop front & back — O(1); random access `[]` — O(1) (slightly slower constant than vector); insert/erase middle — O(n).

**When to use:** need fast insertion/deletion at **both** ends (e.g., sliding window problems, BFS-like structures).\
**Avoid when:** you need guaranteed contiguous memory (e.g., passing to a C API expecting a raw array).

**🧠 Test Yourself:**

1. Q: Why isn't `deque` fully contiguous in memory like `vector`?

A: It's implemented as a sequence of fixed-size blocks/chunks with an index map, enabling O(1) growth at both ends.

2. Q: Give a classic use case where `deque` beats `vector`.

A: Sliding window maximum — you need O(1) push/pop from both front and back.

3. Q: Is `deque::insert()` in the middle efficient?

A: No, still O(n) — same shifting problem as vector, just not at the ends.

4. Q: Can you use `deque` as the underlying container for `stack` or `queue`?

A: Yes — it's actually the **default** underlying container for both.

5. Q: Why can't you safely pass `&dq[0]` to a function expecting a contiguous C array (like you might with vector)?

A: Deque's memory isn't guaranteed contiguous across its full range — only vector guarantees that.

***

## 4. `list`

**Header:** `<list>` | Doubly linked list.

```cpp
list<int> l = {1,2,3};
l.push_front(0); l.push_back(4);
l.insert(it, 99); l.erase(it);   // O(1) given iterator
l.splice(pos, otherList);         // O(1) transfer of nodes
l.sort(); l.merge(otherList); l.unique(); l.remove(5);
```

**Key ops:** insert/erase — O(1) given an iterator (no shifting); random access — O(n) (must walk the list); own `sort()` member (O(n log n)) since it lacks random-access iterators for `std::sort`.

**When to use:** heavy insert/delete in the middle, iterators must stay valid across insert/erase elsewhere (list guarantees this).\
**Avoid when:** you need indexed/random access — that's O(n) here.

**🧠 Test Yourself:**

1. Q: Why can't you use `std::sort()` directly on a `list`?

A: `std::sort` requires random-access iterators; `list` only provides bidirectional iterators. Use `list::sort()` instead.

2. Q: Why is `list::erase(it)` O(1) while `vector::erase(it)` is O(n)?

A: List just relinks neighboring pointers; vector must shift all subsequent elements to fill the gap.

3. Q: What is `splice()` and why is it powerful?

A: It moves nodes from one list to another in O(1) by re-pointing links — no copying of elements.

4. Q: Do insertions into a `list` invalidate existing iterators to other elements?

A: No — this is a key advantage; only iterators to erased elements are invalidated.

5. Q: When would `list` be a poor choice despite fast middle insertion?

A: When you also need frequent random access (`l[i]`) — that's O(n) per access, and cache locality is poor vs vector.

***

## 5. `forward_list`

**Header:** `<forward_list>` | Singly linked list — more memory-lean than `list`.

```cpp
forward_list<int> fl = {1,2,3};
fl.push_front(0);
fl.insert_after(it, 5);
fl.erase_after(it);
```

**Gotcha:** No `push_back`, no `size()` member (by design, to keep it minimal), only forward iteration.

**When to use:** memory is extremely tight and you only need forward traversal + front insertion.

**🧠 Test Yourself:**

1. Q: Why does `forward_list` not have a `size()` method?

A: Tracking size would require extra bookkeeping on every insert/delete, which the standard avoided to keep it minimal and match a plain singly linked list's footprint.

2. Q: Why is there no `push_back()`?

A: With only a forward pointer, reaching the tail would be O(n); the container intentionally avoids offering an operation that "looks" cheap but isn't.

3. Q: How do you insert an element after a given position?

A: `insert_after(iterator, value)`.

4. Q: What's the main advantage over `list`?

A: Lower memory overhead — each node stores only one pointer instead of two.

5. Q: Can you iterate `forward_list` backwards?

A: No — only forward iterators are supported.

***

## 6. `string` (quick STL notes)

**Header:** `<string>`

```cpp
string s = "hello";
s.substr(1,3); s.find("ll"); s.append("world");
s.erase(0,1); s.replace(0,2,"HE");
stoi(s); to_string(42);
```

**Key ops:** `find` — O(n); `substr` — O(k); concatenation with `+` — O(n).

**🧠 Test Yourself:**

1. Q: What does `s.find("ll")` return if not found?

A: `string::npos` (a special large constant), not -1.

2. Q: Is `std::string` guaranteed contiguous memory (like vector)?

A: Yes, since C++11, so `&s[0]` can be passed to C-style APIs.

3. Q: What's the complexity of `substr()`?

A: O(k) where k is the length of the substring (it creates a new string).

4. Q: How do you efficiently build a large string from many small pieces?

A: Use `+=` / `append()` in a loop (amortized O(1) per append) rather than repeated `+` which creates temporaries; or use a `stringstream`.

5. Q: What's the difference between `stoi` and `to_string`?

A: `stoi` parses a string into an int; `to_string` converts a number into its string representation.

***

## 7. `stack`

**Header:** `<stack>` | Adapter (default underlying container: `deque`). LIFO.

```cpp
stack<int> st;
st.push(1); st.pop(); st.top(); st.empty(); st.size();
```

**No iteration, no random access** — only top is visible.

**When to use:** LIFO tasks — expression evaluation, backtracking, DFS, undo functionality.

**🧠 Test Yourself:**

1. Q: Can you iterate over a `stack` to print all elements?

A: No — it deliberately exposes no iterators; you'd need to pop elements (destructively) or use the underlying container directly.

2. Q: What is the default underlying container for `stack`?

A: `deque`.

3. Q: What's the time complexity of `push`, `pop`, and `top`?

A: All O(1).

4. Q: Give a classic algorithm that relies on a stack.

A: Balanced parentheses checking, or iterative DFS.

5. Q: Can you build a `stack` on top of a `vector` instead of `deque`?

A: Yes: `stack<int, vector<int>> st;`.

***

## 8. `queue`

**Header:** `<queue>` | Adapter (default underlying container: `deque`). FIFO.

```cpp
queue<int> q;
q.push(1); q.pop(); q.front(); q.back(); q.empty();
```

**When to use:** FIFO tasks — BFS, task scheduling, buffering.

**🧠 Test Yourself:**

1. Q: What's the difference between `front()` and `back()` in a queue?

A: `front()` is the next element to be removed (oldest); `back()` is the most recently added.

2. Q: What algorithm most commonly uses `queue`?

A: BFS (breadth-first search).

3. Q: Is `queue` iterable?

A: No, same as `stack` — no iterators exposed.

4. Q: What's the complexity of push/pop?

A: O(1) each.

5. Q: Why would `list` be an acceptable underlying container for `queue` but `vector` would not?

A: Queue needs O(1) pop from the front; `vector`'s front removal is O(n), while `list`'s is O(1).

***

## 9. `priority_queue`

**Header:** `<queue>` | Binary heap. Max-heap by default.

```cpp
priority_queue<int> pq;                              // max-heap
priority_queue<int, vector<int>, greater<int>> minH; // min-heap

pq.push(x); pq.pop(); pq.top();

// custom comparator for pairs (min-heap by second value)
struct cmp {
    bool operator()(pair<int,int>&a, pair<int,int>&b) {
        return a.second > b.second;
    }
};
priority_queue<pair<int,int>, vector<pair<int,int>>, cmp> pq2;
```

**Key ops:** `push`/`pop` — O(log n); `top` — O(1).\
**Gotcha:** No iteration, no arbitrary erase, no "decrease-key" — for Dijkstra-style decrease-key, push a new (better) entry and lazily skip stale ones when popped.

**When to use:** need repeated access to min/max while inserting — Dijkstra's algorithm, "k largest elements", scheduling by priority.

**🧠 Test Yourself:**

1. Q: How do you make a min-heap instead of the default max-heap?

A: `priority_queue<int, vector<int>, greater<int>> minHeap;`

2. Q: Why is `top()` O(1) but `push`/`pop` are O(log n)?

A: The max/min is always at the root (O(1) to read), but restoring heap order after insert/remove requires sift-up/sift-down, which is O(log n).

3. Q: How do you implement Dijkstra's algorithm without a "decrease-key" operation?

A: Push a new, better distance for a node whenever found; when popping, skip/ignore any entry whose distance is stale (larger than the currently recorded best).

4. Q: Can you iterate through all elements of a `priority_queue` without destroying it?

A: Not directly — you'd have to pop everything (destructive) or maintain your own copy.

5. Q: What's the default underlying container for `priority_queue`, and why?

A: `vector` — because a binary heap is most naturally stored as an array with implicit parent/child index relationships, and vector gives O(1) random access needed for that.

***

## 10. `set`

**Header:** `<set>` | Sorted, **unique** elements. Balanced BST (Red-Black Tree) internally.

```cpp
set<int> s;
s.insert(10); s.erase(10);
s.find(10);          // iterator or s.end()
s.count(10);         // 0 or 1
auto it = s.lower_bound(10); // first element >= 10
auto it2 = s.upper_bound(10);// first element > 10
*s.begin();  // minimum
*s.rbegin(); // maximum
s.contains(10); // C++20
```

**Key ops:** insert/erase/find/lower_bound/upper_bound — all O(log n).\
**Gotcha:** Elements are effectively `const` (modifying in place would break sort order) — to "change" a value, erase + insert, or use `extract()` (C++17 node handle) to modify the key cheaply and reinsert.

**When to use:** need a sorted collection of unique values with fast search/insert/delete, or need running min/max/rank queries.\
**Avoid when:** you don't care about order → `unordered_set` is faster on average.

**🧠 Test Yourself:**

1. Q: How do you get the maximum element of a `set` in O(1)?

A: `s.rbegin()` (since the set is always sorted ascending) — or `prev(s.end())`.

2. Q: What's the difference between `set::lower_bound` (member function) and the `<algorithm>` `lower_bound()`?

A: The member function uses the tree structure directly — O(log n) always. The generic algorithm needs random-access iterators for O(log n) binary search; on a `set`'s bidirectional iterators it would degrade to O(n), so always use the member function on sets.

3. Q: Why can't you modify an element of a `set` in place through an iterator?

A: Changing the value could break the sorted invariant the tree relies on, so the standard makes set iterators return const references.

4. Q: What does `s.count(x)` return for a `set`, and how is that different from a `multiset`?

A: For `set`, it's always 0 or 1 (unique elements); for `multiset` it can be any non-negative integer (number of occurrences).

5. Q: What's the time complexity of `set::insert`, and why?

A: O(log n) — it's a balanced BST (Red-Black tree), so insertion involves a tree-height traversal plus possible rebalancing.

***

## 11. `multiset`

**Header:** `<set>` | Like `set` but allows duplicates.

```cpp
multiset<int> ms = {1,1,2,3};
ms.erase(1);            // removes ALL occurrences of 1!
auto it = ms.find(1);
ms.erase(it);            // removes only ONE occurrence
auto range = ms.equal_range(2); // pair of iterators [lower_bound, upper_bound)
```

**When to use:** need sorted data with duplicates and fast search (e.g., maintaining a sorted multiset of scores where ties are allowed).

**🧠 Test Yourself:**

1. Q: What's the danger of calling `ms.erase(value)` when you only want to remove one occurrence?

A: `erase(value)` removes **all** matching elements; to remove just one, find its iterator first and call `erase(iterator)`.

2. Q: What does `equal_range(x)` return and when is it useful?

A: A pair of iterators `{lower_bound(x), upper_bound(x)}` — useful to iterate over all occurrences of `x` in one call instead of two separate lookups.

3. Q: How many times does `x` appear if `ms.count(x)` returns 3?

A: Exactly 3 occurrences of `x` exist in the multiset.

4. Q: Is `multiset` sorted?

A: Yes, always, same as `set` — ascending by default.

5. Q: When would you choose `multiset` over `vector` + `sort`?

A: When you need to insert/erase elements dynamically while keeping the collection always sorted, since re-sorting a vector after every insert would be O(n log n) each time vs O(log n) for multiset.

***

## 12. `map`

**Header:** `<map>` | Sorted key-value pairs, unique keys. Red-Black tree.

```cpp
map<string,int> m;
m["apple"] = 5;              // inserts w/ default value if key absent, or updates
m.insert({"banana", 3});
m.at("apple");                // throws if key absent (unlike [])
if (m.find("cherry") == m.end()) { /* not found */ }
for (auto& [k, v] : m) { /* structured bindings, C++17 */ }
m.erase("apple");
auto it = m.lower_bound("b");
```

**Gotcha (classic interview trap):** `m[key]` **inserts** a default-constructed value if the key doesn't exist — even a simple read like `if (m["x"] > 0)` silently adds `"x"` to the map. Use `m.find(key)` or `m.count(key)` for a pure lookup, `m.at(key)` for a read that should throw instead of insert.

**When to use:** need key-value storage sorted by key, or need ordered iteration / range queries (`lower_bound`/`upper_bound` on keys).\
**Avoid when:** you don't need sorted order → `unordered_map` is faster.

**🧠 Test Yourself:**

1. Q: What happens when you do `int x = m["missingKey"];` on a `map<string,int>`?

A: It silently **inserts** `"missingKey"` with default value `0` into the map, then returns 0 — a common source of subtle bugs.

2. Q: How do you check if a key exists **without** accidentally inserting it?

A: Use `m.find(key) != m.end()` or `m.count(key) > 0` or `m.contains(key)` (C++20) — never bare `m[key]` for a pure existence check.

3. Q: What's the difference between `m.at(key)` and `m[key]` when the key is missing?

A: `at()` throws `std::out_of_range`; `[]` inserts a default-constructed value.

4. Q: Why is a `map`'s key always `const`?

A: Because keys determine tree ordering — mutating a key in place would corrupt the tree structure, so `pair<const Key, Value>` enforces immutability of the key.

5. Q: How do you iterate a `map` in sorted key order?

A: Just use a normal range-based for loop — `map` is always kept sorted by key internally, so iteration is automatically in ascending key order.

***

## 13. `multimap`

**Header:** `<map>` | Like `map`, but allows multiple values per key. **No** `operator[]`**.**

```cpp
multimap<string,int> mm;
mm.insert({"a", 1});
mm.insert({"a", 2});
auto range = mm.equal_range("a"); // iterate all values for "a"
for (auto it = range.first; it != range.second; ++it) cout << it->second;
```

**When to use:** need to associate multiple values with the same key while keeping keys sorted (e.g., adjacency list for a graph, sorted by node id).

**🧠 Test Yourself:**

1. Q: Why does `multimap` not provide `operator[]`?

A: `[]` implies a single value per key; since multimap allows duplicate keys, there's no unambiguous single value to return.

2. Q: How do you get all values associated with a key in a `multimap`?

A: `equal_range(key)`, which returns the range `[lower_bound, upper_bound)` of matching entries.

3. Q: Is a `multimap` sorted by key, by value, or both?

A: By key only; values for the same key appear in insertion order (implementation detail, not guaranteed order between equal keys prior to C++11, but stable since).

4. Q: What's a real-world use case for `multimap`?

A: Representing a graph's adjacency list where each node (key) can map to multiple neighbors (values), kept sorted by node id.

5. Q: How do you count how many values a key has?

A: `mm.count(key)`.

***

## 14. `unordered_set`

**Header:** `<unordered_set>` | Hash table, unique elements, **no order guarantee**.

```cpp
unordered_set<int> us;
us.insert(5); us.erase(5); us.find(5); us.count(5); us.contains(5); // C++20
```

**Complexity:** average O(1) for insert/erase/find; **worst case O(n)** (hash collisions / adversarial input).

**When to use:** pure existence/membership checks, deduplication, no need for sorted order — fastest average lookup of any container.\
**Avoid when:** you need sorted iteration, or need `lower_bound`/`upper_bound`-style range queries (not supported meaningfully on unordered containers).

**🧠 Test Yourself:**

1. Q: Why is `unordered_set` usually faster than `set` for simple lookups?

A: Hashing gives average O(1) access vs the O(log n) tree traversal of `set`.

2. Q: When could `unordered_set` actually be **slower** than `set`?

A: Under heavy hash collisions (worst case O(n) per operation), e.g., adversarially crafted inputs against a weak/default hash — a known competitive-programming "anti-hash test" trick against `unordered_map`/`set` with `int` keys.

3. Q: Does `unordered_set` preserve insertion order?

A: No — iteration order is unspecified and can even change after a rehash.

4. Q: What triggers iterator invalidation in an `unordered_set`?

A: Rehashing (triggered when load factor exceeds a threshold after insertion) invalidates iterators, though references/pointers to existing elements remain valid.

5. Q: How would you defend against anti-hash test cases in competitive programming?

A: Use a custom hash function (e.g., seeded with `chrono`based randomness) instead of the default one.

***

## 15. `unordered_map`

**Header:** `<unordered_map>` | Hash table, key-value, unique keys.

```cpp
unordered_map<string,int> um;
um["x"] = 1; um.find("x"); um.count("x"); um.erase("x");
```

**Same complexity/order caveats as** `unordered_set`**.**

**When to use:** the default choice for key-value lookups when order doesn't matter — frequency counting, caching, memoization.

**🧠 Test Yourself:**

1. Q: For a typical "count frequency of elements" problem, why is `unordered_map` usually preferred over `map`?

A: You don't need sorted order, and unordered_map gives average O(1) per lookup/update vs O(log n) for map.

2. Q: What happens to existing iterators when an `unordered_map` rehashes?

A: They're invalidated, but references and pointers to the actual key-value pairs stay valid.

3. Q: Does `unordered_map` support `lower_bound()`?

A: It technically compiles in some implementations but is meaningless since there's no order — don't rely on it; use `map` if you need range queries.

4. Q: How is memory usage of `unordered_map` compared to `map` typically?

A: Usually higher — hash tables need extra bucket array overhead, whereas trees only store node pointers.

5. Q: What's the load factor and why does it matter?

A: The ratio of elements to buckets; when it exceeds a threshold, the table rehashes (resizes buckets) to keep operations close to O(1).

***

## 16 & 17. `unordered_multiset` / `unordered_multimap`

**Header:** `<unordered_set>` / `<unordered_map>` | Like their ordered counterparts but hash-based and allow duplicates.

**When to use:** need duplicate keys/values with fast average-case access and don't care about order (e.g., grouping items by a hashable key without needing sorted groups).

**🧠 Test Yourself:**

1. Q: What's the core difference between `unordered_multiset` and `unordered_set`?

A: `unordered_multiset` allows duplicate elements; `unordered_set` enforces uniqueness.

2. Q: Does `unordered_multimap` support `operator[]`?

A: No — same reasoning as `multimap`, ambiguous which value to return for a key.

3. Q: How do you retrieve all values for a key in `unordered_multimap`?

A: `equal_range(key)`, same pattern as `multimap`.

4. Q: What's the average time complexity of `insert` for `unordered_multimap`?

A: O(1) average, O(n) worst case (collisions).

5. Q: Give a scenario where `unordered_multimap` is preferable to `multimap`.

A: Grouping large volumes of data by key (e.g., grouping log entries by user ID) where you don't need the groups sorted by key, just fast insertion/lookup.

***

## 18. `pair`

**Header:** `<utility>`

```cpp
pair<int,string> p = {1, "a"};
p.first; p.second;
auto p2 = make_pair(2, "b");
auto [a, b] = p; // structured bindings, C++17
```

Pairs compare lexicographically (`first` compared first, then `second`).

**🧠 Test Yourself:**

1. Q: How are two pairs compared with `<`?

A: Lexicographically — first compare `.first`; if equal, compare `.second`.

2. Q: Why is `pair<int,int>` commonly used in graph algorithms like Dijkstra?

A: To bundle `{distance, node}` together so a `priority_queue` can order by distance automatically via pair comparison.

3. Q: What does `make_pair(1, "a")` do differently from `pair<int,string>{1,"a"}`?

A: `make_pair` infers the template types automatically (type deduction), so you don't have to specify them explicitly.

4. Q: How do you unpack a pair into two named variables in modern C++?

A: Structured bindings: `auto [x, y] = p;`

5. Q: Can you use `pair` as a key in a `map` or `set`?

A: Yes — since it has a well-defined `<` operator, it works directly as a key/element.

***

## 19. `tuple`

**Header:** `<tuple>`

```cpp
tuple<int, string, double> t = {1, "a", 2.5};
get<0>(t); get<1>(t);
auto [a, b, c] = t;              // structured bindings
int x; string y;
tie(x, y, ignore) = t;           // unpack, ignoring 3rd
```

**🧠 Test Yourself:**

1. Q: How is `tuple` different from `pair`?

A: `tuple` can hold any number of heterogeneous elements, not just two.

2. Q: How do you access the 2nd element of a tuple?

A: `get<1>(t)` (0-indexed).

3. Q: What does `std::ignore` do inside a `tie()` call?

A: Acts as a placeholder to skip/discard a value during unpacking.

4. Q: What's the modern (C++17) alternative to `tie()` for unpacking?

A: Structured bindings — `auto [a,b,c] = t;`

5. Q: Can you compare two tuples with `<`?

A: Yes, lexicographically element by element, same principle as `pair`.

***

## 20. `bitset`

**Header:** `<bitset>` | Fixed-size sequence of bits, very memory- and speed-efficient for boolean flags.

```cpp
bitset<8> b(5);       // 00000101
b.set(2); b.reset(0); b.flip(1);
b.count();  // number of set bits
b.any(); b.none(); b.all();
b.to_string(); b.to_ulong();
```

**When to use:** fixed-size boolean arrays/flags, bitmask DP, sieve of Eratosthenes (memory-efficient), subset enumeration.

**🧠 Test Yourself:**

1. Q: Why is `bitset<n>` more memory-efficient than `vector<bool>`... wait, isn't `vector<bool>` also bit-packed?

A: Yes, `vector<bool>` is also bit-packed, but `bitset` has a fixed compile-time size (no dynamic overhead) and richer bitwise operations (`&`, `|`, `^`, `<<`, `>>`) built in.

2. Q: What does `b.count()` return?

A: The number of bits set to 1.

3. Q: How do you convert a `bitset` to a decimal number?

A: `b.to_ulong()` or `b.to_ullong()` for larger sizes.

4. Q: Can `bitset` size change at runtime?

A: No — it's a template parameter, fixed at compile time (like `array`).

5. Q: Name a classic use case for `bitset` in competitive programming.

A: Representing visited states in bitmask DP, or speeding up subset-sum/knapsack-style problems using bitwise shifts.

***

## 21. Iterators

**Types (increasing power):** Input → Output → Forward → Bidirectional → Random Access.

| Container                          | Iterator Type |
| ---------------------------------- | ------------- |
| vector, deque, array               | Random Access |
| list, set, map, multiset, multimap | Bidirectional |
| forward_list, unordered_*          | Forward       |

```cpp
v.begin(), v.end();          // forward iteration
v.rbegin(), v.rend();        // reverse iteration
v.cbegin(), v.cend();        // const iterators
advance(it, 3);              // move iterator by 3
distance(it1, it2);          // number of steps between
next(it); prev(it);          // C++11, returns new iterator without mutating original
```

**🧠 Test Yourself:**

1. Q: Why does `std::sort` fail to compile on a `list`?

A: `sort` requires random-access iterators (needs O(1) jump to any index); `list` only offers bidirectional iterators.

2. Q: What's the difference between `advance(it, n)` and `next(it, n)`?

A: `advance` mutates the iterator in place and returns nothing; `next` returns a new advanced iterator, leaving the original unchanged.

3. Q: Which containers guarantee that inserting elements does NOT invalidate existing iterators (except to erased elements)?

A: Node-based containers: `list`, `forward_list`, `set`, `map`, `multiset`, `multimap`.

4. Q: What does `rbegin()` point to?

A: The last element of the container, iterating in reverse toward `rend()` (which is one-before-the-first, conceptually).

5. Q: Why use `cbegin()`/`cend()` instead of `begin()`/`end()`?

A: They return const_iterators, communicating and enforcing that you won't modify the elements — useful for read-only algorithms and API clarity.

***

## 22. Searching & Bounds — `lower_bound`, `upper_bound`, `binary_search`, `max_element`, `min_element`

*(This is the section most people get confused about — read carefully.)*

```cpp
// <algorithm> versions — work on a SORTED RANGE, need random-access iterators for true O(log n)
auto it  = lower_bound(v.begin(), v.end(), x); // first element >= x
auto it2 = upper_bound(v.begin(), v.end(), x); // first element > x
bool ok  = binary_search(v.begin(), v.end(), x); // true/false, O(log n)

int mx = *max_element(v.begin(), v.end()); // O(n), linear scan, works on ANY range (sorted or not)
int mn = *min_element(v.begin(), v.end()); // O(n)
```

```cpp
// set/map MEMBER FUNCTION versions — always O(log n), tree-based, use these instead of <algorithm>
// versions when working with set/map!
auto it  = s.lower_bound(x);
auto it2 = s.upper_bound(x);
```

**Critical distinction:**

|                            | `<algorithm>` free function                   | `set`/`map` member function              |
| -------------------------- | --------------------------------------------- | ---------------------------------------- |
| Needs sorted input?        | Yes, manually maintained                      | Always sorted automatically              |
| Complexity on `vector`     | O(log n) — true binary search (random access) | N/A                                      |
| Complexity on `list`/`set` | O(n) — degrades since no random access!       | O(log n) — uses tree structure           |
| Rule of thumb              | Use on sorted `vector`/`array`                | Always use member version on `set`/`map` |

* `lower_bound(x)` → first element **≥** x
* `upper_bound(x)` → first element **>** x
* `upper_bound(x) - lower_bound(x)` (or count via `equal_range`) → number of occurrences of x
* `max_element`/`min_element` need **no sorting** — they're a plain O(n) linear scan over any range.

**🧠 Test Yourself:**

1. Q: On a `vector<int>`, what does `lower_bound(v.begin(), v.end(), 5)` return if 5 isn't present but 4 and 6 are?

A: An iterator to 6 — the first element not less than (≥) 5.

2. Q: What's the difference between `lower_bound` and `upper_bound` when the target value **does** exist in the range?

A: `lower_bound` points to the first occurrence of the value; `upper_bound` points to the position right after the **last** occurrence.

3. Q: Why should you call `s.lower_bound(x)` instead of `lower_bound(s.begin(), s.end(), x)` on a `set`?

A: The generic algorithm can't exploit the tree structure (set iterators are only bidirectional), so it degrades to O(n); the member function is a proper O(log n) tree search.

4. Q: Do you need to sort a vector before calling `max_element`?

A: No — `max_element`/`min_element` are plain O(n) linear scans that work on any range regardless of order.

5. Q: How would you count the number of elements equal to `x` in a sorted vector using bounds?

A: `upper_bound(v.begin(), v.end(), x) - lower_bound(v.begin(), v.end(), x)`.

***

## 23. Sorting & Related Algorithms

```cpp
sort(v.begin(), v.end());                                  // ascending, ~O(n log n), NOT stable (introsort)
sort(v.begin(), v.end(), greater<int>());                  // descending
sort(v.begin(), v.end(), [](int a, int b){ return a > b; });// custom lambda comparator

stable_sort(v.begin(), v.end());   // O(n log n), guaranteed stable (merge sort), extra O(n) space
partial_sort(v.begin(), v.begin()+k, v.end()); // only first k elements guaranteed sorted, O(n log k)
nth_element(v.begin(), v.begin()+k, v.end());  // kth element ends in correct sorted position, O(n) avg

reverse(v.begin(), v.end());       // O(n)
```

**When to use which:**

* Full sort needed → `sort` (fastest general-purpose).
* Need stability (equal elements keep relative order) → `stable_sort`.
* Only need the "kth smallest/largest" → `nth_element` (O(n) avg, faster than a full sort).
* Only need top-k sorted, rest doesn't matter → `partial_sort`.

**🧠 Test Yourself:**

1. Q: Why is `std::sort` not stable by default?

A: It's implemented as introsort (quicksort + heapsort + insertion sort hybrid) for speed; these algorithms don't preserve relative order of equal elements.

2. Q: You need the "5 smallest elements" from a huge array but don't care about their internal order — what's the fastest STL tool?

A: `nth_element` (or `partial_sort` if you also need those 5 sorted among themselves) — both beat a full O(n log n) sort.

3. Q: When would you specifically need `stable_sort` over `sort`?

A: When sorting by one key but you want ties to preserve their original relative order (e.g., sorting students by grade while keeping alphabetical order among same-grade students, if the list was already alphabetical).

4. Q: What's the average time complexity of `nth_element`?

A: O(n) average (based on quickselect).

5. Q: How do you sort a vector of pairs by the second element descending?

A: `sort(v.begin(), v.end(), [](auto&a, auto&b){ return a.second > b.second; });`

***

## 24. Numeric & Misc Algorithms

```cpp
int sum = accumulate(v.begin(), v.end(), 0);       // <numeric>, O(n)
int cnt = count(v.begin(), v.end(), x);             // O(n)
int cnt2 = count_if(v.begin(), v.end(), pred);      // O(n)
auto it = find(v.begin(), v.end(), x);              // O(n) linear search, works unsorted
v.erase(unique(v.begin(), v.end()), v.end());       // erase-remove idiom: dedupe CONSECUTIVE duplicates (sort first for full dedup)
next_permutation(v.begin(), v.end());               // rearranges to next lexicographic permutation
int g = gcd(a, b); int l = lcm(a, b);                // <numeric>, C++17
swap(a, b);
```

**🧠 Test Yourself:**

1. Q: What does `unique()` actually do, and why do you almost always sort first?

A: `unique` only removes **consecutive** duplicate elements, returning a new logical end; without sorting, non-adjacent duplicates (like `1,2,1`) won't be removed.

2. Q: Why does `unique()` need to be paired with `.erase()` (the "erase-remove idiom")?

A: `unique` only shuffles duplicates to the end and returns an iterator to the new logical end — it doesn't actually shrink the container; `erase` is needed to physically remove the leftover elements.

3. Q: Difference between `find()` and `binary_search()`?

A: `find` is O(n) linear search and works on any (even unsorted) range; `binary_search` is O(log n) but requires the range to already be sorted.

4. Q: What does `next_permutation` do when the sequence is already in the highest (last) permutation?

A: It wraps around, rearranging it into the lowest (ascending) permutation, and returns `false`.

5. Q: How would you count how many elements are greater than 10 in a vector?

A: `count_if(v.begin(), v.end(), [](int x){ return x > 10; });`

***

## 25. Comparators & Custom Sorting

```cpp
// Lambda (most common, C++11+)
sort(v.begin(), v.end(), [](int a, int b){ return a > b; });

// Function object / struct (reusable, can hold state)
struct Cmp {
    bool operator()(int a, int b) const { return a > b; }
};
sort(v.begin(), v.end(), Cmp());

// Built-in functors
sort(v.begin(), v.end(), greater<int>());

// Custom comparator for set/map/priority_queue (as a type, not a value)
set<int, greater<int>> s;                                  // descending set
priority_queue<int, vector<int>, greater<int>> minHeap;     // min-heap
```

**Rule:** the comparator must define a **strict weak ordering** — `cmp(a,a)` must be false, and it must be consistent/transitive, or you get undefined behavior (crashes, infinite loops in `sort`).

**🧠 Test Yourself:**

1. Q: Why must a custom comparator return `false` when comparing an element to itself (`cmp(a,a)`)?

A: STL requires a strict weak ordering; violating this (e.g., using `>=` instead of `>`) can cause undefined behavior in `sort`/`set`, including crashes.

2. Q: For `set`/`map`, why is the comparator specified as a **template parameter** rather than passed as an argument like in `sort`?

A: Because the comparator is baked into the container's type — it needs to be known at compile time to maintain the internal tree structure consistently across all operations (insert, find, erase all rely on the same ordering).

3. Q: What happens if you use a "bad" comparator like `a <= b` for sorting?

A: It violates strict weak ordering (fails the `cmp(a,a)==false` requirement) and can lead to undefined behavior, potentially crashing `std::sort`.

4. Q: How do you sort strings by length, and alphabetically for ties?

A: `sort(v.begin(), v.end(), [](string&a, string&b){ if(a.size()!=b.size()) return a.size()<b.size(); return a<b; });`

5. Q: Why might you use a `struct` with `operator()` instead of a lambda for a comparator?

A: When the comparator needs to be reused across multiple places, hold internal state, or be named as a type (e.g., as the 3rd template argument to `set`/`priority_queue`), a named functor is clearer/necessary since lambdas' types are anonymous.

***

## 26. Complexity Cheat Sheet

| Container                | Access              | Search                | Insert               | Delete               | Order      | Duplicates | Underlying DS        |
| ------------------------ | ------------------- | --------------------- | -------------------- | -------------------- | ---------- | ---------- | -------------------- |
| `vector`                 | O(1)                | O(n)                  | O(1)* / O(n) mid     | O(1)* / O(n) mid     | insertion  | Yes        | Dynamic array        |
| `deque`                  | O(1)                | O(n)                  | O(1) ends / O(n) mid | O(1) ends / O(n) mid | insertion  | Yes        | Block array          |
| `list`                   | O(n)                | O(n)                  | O(1)**               | O(1)**               | insertion  | Yes        | Doubly linked list   |
| `forward_list`           | O(n)                | O(n)                  | O(1)**               | O(1)**               | insertion  | Yes        | Singly linked list   |
| `set` / `map`            | O(log n)            | O(log n)              | O(log n)             | O(log n)             | sorted     | No         | Red-Black Tree       |
| `multiset`/`multimap`    | O(log n)            | O(log n)              | O(log n)             | O(log n)+dupes       | sorted     | Yes        | Red-Black Tree       |
| `unordered_set/map`      | O(1) avg            | O(1) avg / O(n) worst | O(1) avg             | O(1) avg             | none       | No         | Hash table           |
| `unordered_multiset/map` | O(1) avg            | O(1) avg / O(n) worst | O(1) avg             | O(1) avg             | none       | Yes        | Hash table           |
| `stack`/`queue`          | top/front only O(1) | —                     | O(1)                 | O(1)                 | LIFO/FIFO  | Yes        | deque (default)      |
| `priority_queue`         | top O(1)            | —                     | O(log n)             | O(log n)             | heap order | Yes        | Binary heap (vector) |

* at end. **given a valid iterator to the position (finding that position, if unknown, is O(n)).

***

## 27. Which Container Should I Use?

* Just need a resizable list, mostly append/read → `vector` (default choice, 90% of cases)
* Need fast push/pop at **both** ends → `deque`
* Fixed size known at compile time → `array`
* Frequent insert/delete in the **middle**, no random access needed → `list`
* LIFO behavior → `stack`
* FIFO behavior → `queue`
* Repeatedly need current min/max while inserting → `priority_queue`
* Need sorted **unique** values + fast search → `set`
* Need sorted unique values allowing duplicates → `multiset`
* Need sorted key→value mapping → `map`
* Need key→value mapping, duplicates allowed → `multimap`
* Don't care about order, want the fastest average lookup → `unordered_set`**/**`unordered_map`
* Fixed-size boolean flags / bitmask tricks → `bitset`

***

## 28. Common Gotchas & Interview Traps

* `m[key]` on a `map`/`unordered_map` **inserts** if the key is missing — never use it for a pure existence check.
* `multiset.erase(value)` removes **all** copies — use `erase(iterator)` for just one.
* `vector` iterators can be invalidated by `push_back` (reallocation) — never hold a raw pointer/iterator across a push_back and reuse it.
* `unique()` only removes **consecutive** duplicates — sort first for full deduplication.
* `<algorithm>` `lower_bound`/`upper_bound` degrade to O(n) on non-random-access containers (like `list`/`set`) — always prefer the member function on `set`/`map`.
* `priority_queue` has no way to erase or update an arbitrary element — use the "push again, lazy-skip stale entries" pattern.
* `forward_list` has no `size()` and no `push_back()` — easy to forget when switching from `list`.
* Comparators must satisfy strict weak ordering — `<=`/`>=` in a sort comparator is a classic bug that crashes or infinite-loops.

***
