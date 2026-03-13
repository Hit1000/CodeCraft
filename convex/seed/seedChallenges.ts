import { internalMutation } from "../_generated/server";

export const seedChallenges = internalMutation({
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("challenges").first();
    if (existing) {
      console.log("Challenges already seeded, skipping...");
      return;
    }

    const challenges = [
      // ==================== DSA PROBLEMS ====================
      {
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy" as const,
        category: "DSA",
        subcategory: "Arrays & Hashing",
        tags: ["arrays", "hash-map", "two-pointers"],
        description: `## Two Sum\n\nGiven an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers that add up to the target.\n\nYou may assume that each input has **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.`,
        examples: [
          {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0, 1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
          },
          { input: "nums = [3,2,4], target = 6", output: "[1, 2]" },
        ],
        constraints: [
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "-10^9 <= target <= 10^9",
          "Only one valid answer exists.",
        ],
        starterCode: {
          python: `def solution(nums: list[int], target: int) -> list[int]:\n    """\n    Find two numbers that add up to target.\n    Return their indices.\n    """\n    # Your code here\n    pass`,
          javascript: `function solution(nums, target) {\n    // Find two numbers that add up to target\n    // Return their indices\n}`,
          typescript: `function solution(nums: number[], target: number): number[] {\n    // Find two numbers that add up to target\n    // Return their indices\n}`,
          java: `class Solution {\n    public int[] solution(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}`,
        },
        testCases: [
          { id: "tc1", input: "[2,7,11,15]\\n9", expectedOutput: "[0,1]", isHidden: false },
          { id: "tc2", input: "[3,2,4]\\n6", expectedOutput: "[1,2]", isHidden: false },
          { id: "tc3", input: "[3,3]\\n6", expectedOutput: "[0,1]", isHidden: false },
          { id: "tc4", input: "[1,5,3,7,2,8]\\n10", expectedOutput: "[1,3]", isHidden: true },
          { id: "tc5", input: "[-1,-2,-3,-4,-5]\\n-8", expectedOutput: "[2,4]", isHidden: true },
        ],
        hints: [
          "A brute force approach would be O(n²). Can you do better?",
          "Think about using a hash map to store values you've seen.",
          "For each element, check if (target - element) exists in your hash map.",
        ],
        editorial: `## Solution\n\n### Approach: Hash Map\n\nUse a hash map to store each number's index as we iterate. For each number, check if \`target - num\` is in the map.\n\n\`\`\`python\ndef solution(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n\`\`\`\n\n**Time Complexity:** O(n)  \n**Space Complexity:** O(n)`,
        timeLimit: 5000,
        memoryLimit: 256,
        acceptanceRate: 49.2,
        totalSubmissions: 0,
        totalAccepted: 0,
        likes: 0,
        dislikes: 0,
        order: 1,
        isPremium: false,
      },
      {
        title: "Valid Parentheses",
        slug: "valid-parentheses",
        difficulty: "Easy" as const,
        category: "DSA",
        subcategory: "Stacks",
        tags: ["stack", "string", "fundamentals"],
        description: `## Valid Parentheses\n\nGiven a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.`,
        examples: [
          { input: 's = "()"', output: "true" },
          { input: 's = "()[]{}"', output: "true" },
          { input: 's = "(]"', output: "false" },
        ],
        constraints: [
          "1 <= s.length <= 10^4",
          "s consists of parentheses only '()[]{}'",
        ],
        starterCode: {
          python: `def solution(s: str) -> bool:\n    """\n    Determine if the input string has valid parentheses.\n    """\n    # Your code here\n    pass`,
          javascript: `function solution(s) {\n    // Determine if the input string has valid parentheses\n}`,
        },
        testCases: [
          { id: "tc1", input: '"()"', expectedOutput: "true", isHidden: false },
          { id: "tc2", input: '"()[]{}"', expectedOutput: "true", isHidden: false },
          { id: "tc3", input: '"(]"', expectedOutput: "false", isHidden: false },
          { id: "tc4", input: '"([{}])"', expectedOutput: "true", isHidden: true },
          { id: "tc5", input: '""', expectedOutput: "true", isHidden: true },
        ],
        hints: [
          "Use a stack to keep track of opening brackets.",
          "When you encounter a closing bracket, check if it matches the top of the stack.",
        ],
        timeLimit: 5000,
        memoryLimit: 256,
        acceptanceRate: 40.1,
        totalSubmissions: 0,
        totalAccepted: 0,
        likes: 0,
        dislikes: 0,
        order: 2,
        isPremium: false,
      },
      {
        title: "Merge Two Sorted Lists",
        slug: "merge-two-sorted-lists",
        difficulty: "Easy" as const,
        category: "DSA",
        subcategory: "Linked Lists",
        tags: ["linked-list", "recursion", "two-pointers"],
        description: `## Merge Two Sorted Lists\n\nYou are given two sorted arrays \`list1\` and \`list2\`. Merge them into a single sorted array.\n\nReturn the merged sorted array.`,
        examples: [
          { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
          { input: "list1 = [], list2 = [0]", output: "[0]" },
        ],
        constraints: [
          "0 <= list length <= 50",
          "-100 <= values <= 100",
          "Both lists are sorted in non-decreasing order",
        ],
        starterCode: {
          python: `def solution(list1: list[int], list2: list[int]) -> list[int]:\n    """\n    Merge two sorted lists into one sorted list.\n    """\n    # Your code here\n    pass`,
          javascript: `function solution(list1, list2) {\n    // Merge two sorted lists into one sorted list\n}`,
        },
        testCases: [
          { id: "tc1", input: "[1,2,4]\\n[1,3,4]", expectedOutput: "[1,1,2,3,4,4]", isHidden: false },
          { id: "tc2", input: "[]\\n[0]", expectedOutput: "[0]", isHidden: false },
          { id: "tc3", input: "[]\\n[]", expectedOutput: "[]", isHidden: true },
          { id: "tc4", input: "[1,3,5,7]\\n[2,4,6,8]", expectedOutput: "[1,2,3,4,5,6,7,8]", isHidden: true },
        ],
        hints: [
          "Use two pointers, one for each list.",
          "Compare elements at both pointers and take the smaller one.",
        ],
        timeLimit: 5000,
        memoryLimit: 256,
        acceptanceRate: 62.3,
        totalSubmissions: 0,
        totalAccepted: 0,
        likes: 0,
        dislikes: 0,
        order: 3,
        isPremium: false,
      },
      {
        title: "Binary Search",
        slug: "binary-search",
        difficulty: "Easy" as const,
        category: "DSA",
        subcategory: "Binary Search",
        tags: ["binary-search", "arrays", "fundamentals"],
        description: `## Binary Search\n\nGiven a sorted array of integers \`nums\` and a \`target\`, write a function that returns the index of the target if found, otherwise return \`-1\`.\n\nYou must write an algorithm with **O(log n)** runtime complexity.`,
        examples: [
          {
            input: "nums = [-1,0,3,5,9,12], target = 9",
            output: "4",
            explanation: "9 exists in nums and its index is 4.",
          },
          {
            input: "nums = [-1,0,3,5,9,12], target = 2",
            output: "-1",
            explanation: "2 does not exist in nums so return -1.",
          },
        ],
        constraints: [
          "1 <= nums.length <= 10^4",
          "All integers in nums are unique",
          "nums is sorted in ascending order",
        ],
        starterCode: {
          python: `def solution(nums: list[int], target: int) -> int:\n    """\n    Find target in sorted array using binary search.\n    Return index or -1 if not found.\n    """\n    # Your code here\n    pass`,
          javascript: `function solution(nums, target) {\n    // Find target in sorted array using binary search\n    // Return index or -1 if not found\n}`,
        },
        testCases: [
          { id: "tc1", input: "[-1,0,3,5,9,12]\\n9", expectedOutput: "4", isHidden: false },
          { id: "tc2", input: "[-1,0,3,5,9,12]\\n2", expectedOutput: "-1", isHidden: false },
          { id: "tc3", input: "[5]\\n5", expectedOutput: "0", isHidden: true },
          { id: "tc4", input: "[1,2,3,4,5,6,7,8,9,10]\\n7", expectedOutput: "6", isHidden: true },
        ],
        hints: [
          "Use two pointers for left and right bounds.",
          "Calculate mid and compare with target to decide which half to search.",
        ],
        timeLimit: 5000,
        memoryLimit: 256,
        acceptanceRate: 55.8,
        totalSubmissions: 0,
        totalAccepted: 0,
        likes: 0,
        dislikes: 0,
        order: 4,
        isPremium: false,
      },
      {
        title: "Maximum Subarray (Kadane's Algorithm)",
        slug: "maximum-subarray",
        difficulty: "Medium" as const,
        category: "DSA",
        subcategory: "Dynamic Programming",
        tags: ["dynamic-programming", "arrays", "greedy"],
        description: `## Maximum Subarray\n\nGiven an integer array \`nums\`, find the subarray with the largest sum, and return its sum.\n\nA **subarray** is a contiguous non-empty sequence of elements within an array.`,
        examples: [
          {
            input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
            output: "6",
            explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
          },
          { input: "nums = [1]", output: "1" },
        ],
        constraints: [
          "1 <= nums.length <= 10^5",
          "-10^4 <= nums[i] <= 10^4",
        ],
        starterCode: {
          python: `def solution(nums: list[int]) -> int:\n    """\n    Find the contiguous subarray with the largest sum.\n    """\n    # Your code here\n    pass`,
          javascript: `function solution(nums) {\n    // Find the contiguous subarray with the largest sum\n}`,
        },
        testCases: [
          { id: "tc1", input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6", isHidden: false },
          { id: "tc2", input: "[1]", expectedOutput: "1", isHidden: false },
          { id: "tc3", input: "[5,4,-1,7,8]", expectedOutput: "23", isHidden: false },
          { id: "tc4", input: "[-1]", expectedOutput: "-1", isHidden: true },
          { id: "tc5", input: "[-2,-1]", expectedOutput: "-1", isHidden: true },
        ],
        hints: [
          "Think about Kadane's algorithm.",
          "At each position, decide whether to extend the current subarray or start a new one.",
        ],
        timeLimit: 5000,
        memoryLimit: 256,
        acceptanceRate: 50.1,
        totalSubmissions: 0,
        totalAccepted: 0,
        likes: 0,
        dislikes: 0,
        order: 5,
        isPremium: false,
      },

      // ==================== AI/ML PROBLEMS ====================
      {
        title: "Linear Regression from Scratch",
        slug: "linear-regression-from-scratch",
        difficulty: "Easy" as const,
        category: "AI/ML",
        subcategory: "Linear Regression",
        tags: ["numpy", "regression", "normal-equation", "fundamentals"],
        description: `## Linear Regression from Scratch\n\nImplement simple linear regression using the **Normal Equation**.\n\nGiven training data \`X\` (features) and \`y\` (targets), compute the optimal weights and return predictions.\n\n### The Normal Equation\n**θ = (XᵀX)⁻¹ Xᵀy**\n\n### Steps:\n1. Add a bias column of ones to X\n2. Compute weights θ using the normal equation\n3. Return predictions: **ŷ = X_b · θ**`,
        examples: [
          {
            input: "X = [[1],[2],[3]], y = [2,4,6]",
            output: "[2.0, 4.0, 6.0]",
            explanation: "Perfect linear relationship y = 2x. Model learns exact weights.",
          },
        ],
        constraints: [
          "Use only NumPy (no sklearn)",
          "X: 2D numpy array (n_samples, n_features)",
          "y: 1D numpy array (n_samples,)",
          "Return 1D numpy array of predictions",
          "Tolerance: 1e-5 for floating point comparison",
        ],
        starterCode: {
          python: `import numpy as np\n\ndef solution(X, y):\n    """\n    Implement linear regression using the normal equation.\n    \n    Args:\n        X: numpy array of shape (n_samples, n_features) \n        y: numpy array of shape (n_samples,)\n    \n    Returns:\n        predictions: numpy array of shape (n_samples,)\n    """\n    # Your code here\n    pass`,
          javascript: `// This problem requires NumPy - please use Python\nfunction solution(X, y) {\n    throw new Error("Please solve this problem in Python");\n}`,
        },
        testCases: [
          { id: "tc1", input: "np.array([[1],[2],[3]])\\nnp.array([2,4,6])", expectedOutput: "np.array([2.0, 4.0, 6.0])", isHidden: false },
          { id: "tc2", input: "np.array([[1],[2],[3],[4]])\\nnp.array([1,3,5,7])", expectedOutput: "np.array([1.0, 3.0, 5.0, 7.0])", isHidden: false },
          { id: "tc3", input: "np.array([[0],[1],[2],[3],[4]])\\nnp.array([1,1,1,1,1])", expectedOutput: "np.array([1.0,1.0,1.0,1.0,1.0])", isHidden: true },
        ],
        hints: [
          "Add a bias column: X_b = np.c_[np.ones((X.shape[0], 1)), X]",
          "Normal equation: theta = np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y",
          "Predictions: y_pred = X_b @ theta",
        ],
        editorial: `## Solution\n\n\`\`\`python\nimport numpy as np\n\ndef solution(X, y):\n    X_b = np.c_[np.ones((X.shape[0], 1)), X]\n    theta = np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y\n    return X_b @ theta\n\`\`\`\n\n**Time Complexity:** O(n·d² + d³)  \n**Space Complexity:** O(d²)`,
        timeLimit: 10000,
        memoryLimit: 512,
        acceptanceRate: 72.5,
        totalSubmissions: 0,
        totalAccepted: 0,
        likes: 0,
        dislikes: 0,
        order: 101,
        isPremium: false,
      },
      {
        title: "Sigmoid Activation Function",
        slug: "sigmoid-activation-function",
        difficulty: "Easy" as const,
        category: "AI/ML",
        subcategory: "Neural Networks",
        tags: ["numpy", "activation-functions", "neural-networks", "fundamentals"],
        description: `## Sigmoid Activation Function\n\nImplement the **sigmoid function** and its **derivative**.\n\n### Formulas:\n- Sigmoid: **σ(x) = 1 / (1 + e^(-x))**\n- Derivative: **σ'(x) = σ(x) · (1 - σ(x))**\n\nYour function should return a **tuple**: \`(sigmoid_output, derivative_output)\`.\n\n> ⚠️ Make sure to handle very large/small inputs without numerical overflow.`,
        examples: [
          {
            input: "x = np.array([0.0])",
            output: "(np.array([0.5]), np.array([0.25]))",
            explanation: "σ(0) = 0.5, σ'(0) = 0.5 * (1-0.5) = 0.25",
          },
        ],
        constraints: [
          "Use only NumPy",
          "Input: numpy array of any shape",
          "Return: tuple of two numpy arrays with same shape",
          "Handle inputs in range [-1000, 1000] without overflow",
          "Tolerance: 1e-5",
        ],
        starterCode: {
          python: `import numpy as np\n\ndef solution(x):\n    """\n    Compute sigmoid and its derivative.\n    \n    Args:\n        x: numpy array\n    \n    Returns:\n        tuple: (sigmoid(x), sigmoid_derivative(x))\n    """\n    # Your code here\n    pass`,
          javascript: `function solution(x) {\n    // Please solve this problem in Python\n}`,
        },
        testCases: [
          { id: "tc1", input: "np.array([0.0])", expectedOutput: "(np.array([0.5]), np.array([0.25]))", isHidden: false },
          { id: "tc2", input: "np.array([1.0, -1.0])", expectedOutput: "(np.array([0.7310585, 0.2689414]), np.array([0.1966119, 0.1966119]))", isHidden: false },
          { id: "tc3", input: "np.array([1000])", expectedOutput: "(np.array([1.0]), np.array([0.0]))", isHidden: true },
        ],
        hints: [
          "Use np.clip to handle overflow: clip x to a safe range before computing exp.",
          "The derivative is simply sigmoid * (1 - sigmoid).",
        ],
        timeLimit: 5000,
        memoryLimit: 256,
        acceptanceRate: 85.3,
        totalSubmissions: 0,
        totalAccepted: 0,
        likes: 0,
        dislikes: 0,
        order: 102,
        isPremium: false,
      },
      {
        title: "K-Nearest Neighbors Classifier",
        slug: "knn-classifier",
        difficulty: "Medium" as const,
        category: "AI/ML",
        subcategory: "Classification",
        tags: ["numpy", "knn", "classification", "distance-metrics"],
        description: `## K-Nearest Neighbors Classifier\n\nImplement a **K-Nearest Neighbors (KNN)** classifier from scratch.\n\nGiven training data \`X_train\`, \`y_train\`, test data \`X_test\`, and parameter \`k\`, predict the labels for the test data.\n\n### Algorithm:\n1. For each test point, compute Euclidean distance to all training points\n2. Find the k nearest neighbors\n3. Return the most common label among those neighbors`,
        examples: [
          {
            input: "X_train = [[0,0],[1,1],[2,2]], y_train = [0,0,1], X_test = [[0.5,0.5]], k = 2",
            output: "[0]",
            explanation: "The 2 nearest neighbors to [0.5,0.5] are [0,0] and [1,1], both labeled 0.",
          },
        ],
        constraints: [
          "Use only NumPy",
          "Use Euclidean distance",
          "For ties, choose the smaller label",
          "1 <= k <= len(X_train)",
        ],
        starterCode: {
          python: `import numpy as np\n\ndef solution(X_train, y_train, X_test, k):\n    """\n    Implement KNN classifier.\n    \n    Args:\n        X_train: numpy array (n_train, n_features)\n        y_train: numpy array (n_train,)\n        X_test: numpy array (n_test, n_features)\n        k: int, number of neighbors\n    \n    Returns:\n        predictions: numpy array (n_test,)\n    """\n    # Your code here\n    pass`,
          javascript: `function solution(X_train, y_train, X_test, k) {\n    // Please solve this problem in Python\n}`,
        },
        testCases: [
          { id: "tc1", input: "np.array([[0,0],[1,1],[2,2]])\\nnp.array([0,0,1])\\nnp.array([[0.5,0.5]])\\n2", expectedOutput: "np.array([0])", isHidden: false },
          { id: "tc2", input: "np.array([[0,0],[1,1],[2,2],[3,3]])\\nnp.array([0,0,1,1])\\nnp.array([[1.5,1.5]])\\n3", expectedOutput: "np.array([1])", isHidden: false },
          { id: "tc3", input: "np.array([[0],[1],[2],[3],[4],[5]])\\nnp.array([0,0,0,1,1,1])\\nnp.array([[2.5]])\\n5", expectedOutput: "np.array([0])", isHidden: true },
        ],
        hints: [
          "Compute distances: np.linalg.norm(X_test[:, np.newaxis] - X_train, axis=2)",
          "Use np.argsort to find the k nearest neighbors.",
          "Use np.bincount or Counter to find the most common label.",
        ],
        timeLimit: 10000,
        memoryLimit: 512,
        acceptanceRate: 58.7,
        totalSubmissions: 0,
        totalAccepted: 0,
        likes: 0,
        dislikes: 0,
        order: 103,
        isPremium: false,
      },
    ];

    for (const challenge of challenges) {
      await ctx.db.insert("challenges", challenge);
    }

    console.log(`Seeded ${challenges.length} challenges successfully!`);
  },
});
