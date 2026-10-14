/**
 * Structured content dictionary for core placement skills.
 * Provides accurate, beginner-friendly explanations, learning sequences,
 * practical exercises, common pitfalls, reputable official documentation URLs,
 * and guided practical learning tasks.
 */

const SKILL_CONTENT = {
  'Data Structures and Algorithms': {
    summary: 'The foundation of technical interviews and efficient software engineering. Covers arrays, linked lists, trees, graphs, sorting, and algorithmic complexity.',
    whyItMatters: 'Top product companies and technical screening rounds evaluate algorithmic problem solving to test logic, optimization, and edge-case handling.',
    prerequisites: ['Programming Fundamentals'],
    concepts: [
      'Time and Space Complexity (Big-O Notation)',
      'Linear Structures: Arrays, Strings, Linked Lists, Stacks, Queues',
      'Non-Linear Structures: Binary Trees, Binary Search Trees, Heaps',
      'Graphs: BFS, DFS, Shortest Paths, Topological Sort',
      'Algorithmic Paradigms: Two Pointers, Sliding Window, Divide & Conquer, Dynamic Programming',
    ],
    exercises: [
      'Implement a Linked List with reverse and cycle detection algorithms',
      'Solve the classic Two Sum and Valid Parentheses problems without built-in helpers',
      'Traverse a Binary Tree in Level Order (BFS) using a Queue',
      'Find the longest substring without repeating characters using the Sliding Window technique',
    ],
    learningTasks: [
      {
        key: 'dsa_task_1',
        title: 'Array Manipulation & Two-Pointer Technique',
        description: 'Implement an in-place algorithm to remove duplicates from a sorted array and return the new length.',
        instructions: 'Given a sorted array of numbers, use two pointers (read and write) to overwrite duplicates in place with O(1) extra memory. Analyze time complexity.',
        expectedOutcome: 'A tested function running in O(N) time and O(1) auxiliary space that handles empty arrays and arrays with all duplicate values.',
        suggestedEffortMinutes: 30,
        starterCode: 'function removeDuplicates(nums) {\n  // In-place pointer solution\n  let writeIdx = 1;\n  for (let readIdx = 1; readIdx < nums.length; readIdx++) {\n    if (nums[readIdx] !== nums[readIdx - 1]) {\n      nums[writeIdx++] = nums[readIdx];\n    }\n  }\n  return writeIdx;\n}',
      },
      {
        key: 'dsa_task_2',
        title: 'Stack Application: Valid Parentheses Validator',
        description: 'Verify matching nested brackets (), [], {} using a Stack data structure.',
        instructions: 'Iterate through an expression string. Push opening brackets to a stack, and on encountering closing brackets, verify if the top of the stack matches.',
        expectedOutcome: 'A function that returns true for balanced strings and false for unbalanced cases like "([)]" or "(()".',
        suggestedEffortMinutes: 40,
        starterCode: 'function isValidParentheses(s) {\n  const stack = [];\n  const map = { ")": "(", "}": "{", "]": "[" };\n  for (const char of s) {\n    if (char in map) {\n      if (stack.pop() !== map[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}',
      },
      {
        key: 'dsa_task_3',
        title: 'Binary Search & Edge Cases',
        description: 'Implement iterative binary search to find target values in sorted arrays with bounds checking.',
        instructions: 'Write binary search using low and high pointers. Calculate mid using low + Math.floor((high - low) / 2) to prevent 32-bit integer overflow.',
        expectedOutcome: 'Correctly returns the index of target in O(log N) time or -1 if absent, verified against boundary tests.',
        suggestedEffortMinutes: 45,
        starterCode: 'function binarySearch(arr, target) {\n  let low = 0, high = arr.length - 1;\n  while (low <= high) {\n    const mid = low + Math.floor((high - low) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return -1;\n}',
      },
    ],
    commonMistakes: [
      'Jumping straight into coding before tracing examples and edge cases on paper',
      'Ignoring space complexity when creating nested copies of arrays',
      'Forgetting null checks or off-by-one errors in pointer manipulation',
    ],
    miniChallenge: 'Build a priority task scheduler using a custom Min-Heap implementation and benchmark its enqueue/dequeue performance against an array.',
    resources: [
      { title: 'GeeksforGeeks DSA Guide', url: 'https://www.geeksforgeeks.org/data-structures/', type: 'Documentation' },
      { title: 'LeetCode Problem Archive', url: 'https://leetcode.com/problemset/all/', type: 'Practice' },
      { title: 'Visualgo - Algorithm Visualizations', url: 'https://visualgo.net/', type: 'Visualization' },
    ],
  },

  'DBMS and SQL': {
    summary: 'Relational database management, schema design, normalization, ACID transactions, indexing, and complex querying using SQL.',
    whyItMatters: 'Essential for every backend and full-stack role to design durable data models and query data efficiently under high transaction loads.',
    prerequisites: ['Programming Fundamentals'],
    concepts: [
      'Relational Model & Keys: Primary, Foreign, Candidate, Composite',
      'Normalization: 1NF, 2NF, 3NF, BCNF & Preventing Redundancy',
      'SQL Querying: SELECT, WHERE, GROUP BY, HAVING, Subqueries, CTEs',
      'Joins: INNER, LEFT, RIGHT, FULL OUTER, CROSS, SELF JOIN',
      'ACID Properties & Transaction Isolation Levels',
      'Indexing: B-Tree, Hash Indexes, Query Execution Plans (EXPLAIN ANALYZE)',
    ],
    exercises: [
      'Write a query finding the 2nd highest salary using window functions (DENSE_RANK)',
      'Design a normalized 3NF schema for an e-commerce order management system',
      'Write a query with aggregation and HAVING to find customers with more than 5 orders in a month',
      'Optimize a slow query using EXPLAIN to identify missing indexes',
    ],
    learningTasks: [
      {
        key: 'sql_task_1',
        title: 'Multi-Table Relational Joins & Aggregation',
        description: 'Query student course enrollments, departments, and average grades with grouped calculations.',
        instructions: 'Write an SQL query joining students, enrollments, and courses. Calculate the average grade per department, filtering departments having more than 10 enrolled candidates using HAVING.',
        expectedOutcome: 'A well-formatted SQL query using INNER JOIN, GROUP BY, and HAVING with proper aliasing.',
        suggestedEffortMinutes: 35,
        starterCode: 'SELECT d.department_name, COUNT(s.id) AS total_students, AVG(e.grade_numeric) AS avg_gpa\nFROM students s\nJOIN departments d ON s.department_id = d.id\nJOIN enrollments e ON e.student_id = s.id\nGROUP BY d.department_name\nHAVING COUNT(s.id) > 10\nORDER BY avg_gpa DESC;',
      },
      {
        key: 'sql_task_2',
        title: 'Schema Normalization & Foreign Key Constraints',
        description: 'Design a clean 3NF database schema for a campus placement recruitment drive.',
        instructions: 'Create tables for companies, job_postings, student_applications, and interview_rounds with appropriate primary keys, foreign keys (ON DELETE CASCADE), and check constraints.',
        expectedOutcome: 'A valid DDL script with normalized tables free of transitive dependencies.',
        suggestedEffortMinutes: 45,
        starterCode: 'CREATE TABLE companies (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  name VARCHAR(150) NOT NULL UNIQUE,\n  tier VARCHAR(50) DEFAULT \'Standard\'\n);\n\nCREATE TABLE job_postings (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,\n  title VARCHAR(150) NOT NULL,\n  min_cgpa NUMERIC(4,2) CHECK (min_cgpa BETWEEN 0 AND 10)\n);',
      },
      {
        key: 'sql_task_3',
        title: 'Indexing & Query Performance Optimization',
        description: 'Analyze an unindexed slow query on a high-volume table using EXPLAIN ANALYZE and implement indexes.',
        instructions: 'Identify sequential scans on a large preparation activity log table. Add a compound B-tree index on (student_id, activity_date) and verify execution time reduction.',
        expectedOutcome: 'EXPLAIN output showing index scan transition with reduced cost and execution time.',
        suggestedEffortMinutes: 40,
        starterCode: '-- Before Index:\nEXPLAIN ANALYZE\nSELECT * FROM preparation_activities WHERE student_id = \'...\' AND activity_date >= \'2024-01-01\';\n\n-- Create Compound Index:\nCREATE INDEX idx_prep_student_date ON preparation_activities (student_id, activity_date DESC);',
      },
    ],
    commonMistakes: [
      'Using SELECT * instead of specifying required columns in production queries',
      'Confusing WHERE with HAVING (WHERE filters before aggregation; HAVING filters after)',
      'Over-indexing tables, which slows down write (INSERT/UPDATE) throughput',
    ],
    miniChallenge: 'Create a university course enrollment database with tables for students, courses, and enrollments. Write queries to detect schedule conflicts.',
    resources: [
      { title: 'PostgreSQL Official Documentation', url: 'https://www.postgresql.org/docs/', type: 'Official Documentation' },
      { title: 'SQLZoo Interactive SQL Tutorials', url: 'https://sqlzoo.net/', type: 'Practice' },
      { title: 'Use The Index, Luke (SQL Indexing Guide)', url: 'https://use-the-index-luke.com/', type: 'Guide' },
    ],
  },

  'JavaScript': {
    summary: 'Core language mechanics of modern ECMAScript: prototypes, closures, event loop, asynchronous promises, and ES6+ syntax.',
    whyItMatters: 'The universal language of frontend web development and a dominant backend environment via Node.js.',
    prerequisites: ['Programming Fundamentals', 'HTML and CSS'],
    concepts: [
      'Execution Context, Hoisting, Call Stack, and Lexical Scope',
      'Closures and Practical Use Cases (data privacy, currying)',
      'Event Loop, Microtasks (Promises) vs Macrotasks (setTimeout)',
      'Prototypes and Prototypal Inheritance vs ES6 Classes',
      'Asynchronous JS: Callbacks, Promises, async/await, Promise.all',
      'ES6+ Features: Destructuring, Spread/Rest, Modules, Arrow Functions',
    ],
    exercises: [
      'Implement custom polyfills for Array.prototype.map, filter, and reduce',
      'Build a debounce and throttle utility function from scratch',
      'Create a retry mechanism for fetch calls with exponential backoff using async/await',
    ],
    learningTasks: [
      {
        key: 'js_task_1',
        title: 'Asynchronous Programming: Retrying API Calls with Backoff',
        description: 'Build an asynchronous utility function that retries failing HTTP requests with exponential backoff.',
        instructions: 'Write a function retryFetch(fn, maxRetries, delayMs) using async/await and Promise. If fn rejects, wait for delayMs * 2^attempt before retrying.',
        expectedOutcome: 'Robust error-handling utility that catches transient network blips without crashing the main thread.',
        suggestedEffortMinutes: 35,
        starterCode: 'async function retryFetch(fn, maxRetries = 3, delay = 1000) {\n  for (let i = 0; i < maxRetries; i++) {\n    try {\n      return await fn();\n    } catch (err) {\n      if (i === maxRetries - 1) throw err;\n      await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));\n    }\n  }\n}',
      },
      {
        key: 'js_task_2',
        title: 'Functional Helpers: Custom Array.prototype.reduce Polyfill',
        description: 'Recreate the reduce method from scratch, handling accumulator initialization and sparse arrays.',
        instructions: 'Attach myReduce to Array.prototype without using the built-in reduce. Ensure it handles initialValue properly and throws a TypeError on empty arrays without initialValue.',
        expectedOutcome: 'A polyfill passing edge cases: empty array with initialValue, accumulator aggregation, and object grouping.',
        suggestedEffortMinutes: 30,
        starterCode: 'Array.prototype.myReduce = function(callback, initialValue) {\n  let acc = initialValue !== undefined ? initialValue : this[0];\n  let startIdx = initialValue !== undefined ? 0 : 1;\n  for (let i = startIdx; i < this.length; i++) {\n    if (i in this) acc = callback(acc, this[i], i, this);\n  }\n  return acc;\n};',
      },
    ],
    commonMistakes: [
      'Modifying state directly instead of using immutable patterns',
      'Misunderstanding this binding inside arrow functions vs regular functions',
      'Forgetting error handling (try/catch or .catch) on asynchronous promises',
    ],
    miniChallenge: 'Implement a minimal event emitter pattern with on, off, and emit methods supporting multiple listeners.',
    resources: [
      { title: 'MDN Web Docs - JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', type: 'Official Documentation' },
      { title: 'JavaScript.info (Modern JS Tutorial)', url: 'https://javascript.info/', type: 'Guide' },
    ],
  },

  'React': {
    summary: 'Component-driven user interface engineering with virtual DOM, hooks, state management, and declarative rendering.',
    whyItMatters: 'The industry standard library for building modern web applications. Tested in frontend and full-stack technical rounds.',
    prerequisites: ['JavaScript', 'HTML and CSS'],
    concepts: [
      'JSX, Components, Props vs State, One-Way Data Flow',
      'React Lifecycle & Hooks: useState, useEffect, useRef, useMemo, useCallback',
      'Controlled vs Uncontrolled Form Components',
      'State Lifting and Context API for global theme and authentication state',
      'Component Re-rendering Optimization and React Keys',
    ],
    exercises: [
      'Build a searchable, paginated data table component with sorting columns',
      'Implement an authenticated route wrapper that redirects unauthenticated users',
      'Create a custom useDebounce hook for live search inputs',
    ],
    learningTasks: [
      {
        key: 'react_task_1',
        title: 'Custom Hook: useDebounce for Search Queries',
        description: 'Build and test a reusable custom hook that delays state updates until typing pauses.',
        instructions: 'Create useDebounce(value, delayMs) with useState and useEffect. Clear the previous timer in the useEffect cleanup function on rapid input.',
        expectedOutcome: 'A clean custom hook that reduces redundant API queries during live search typing.',
        suggestedEffortMinutes: 30,
        starterCode: 'import { useState, useEffect } from "react";\n\nexport function useDebounce(value, delay = 300) {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  useEffect(() => {\n    const handler = setTimeout(() => setDebouncedValue(value), delay);\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n  return debouncedValue;\n}',
      },
      {
        key: 'react_task_2',
        title: 'Controlled Form with Validation and Accessible Errors',
        description: 'Build an accessible multi-field student registration form with client-side validation.',
        instructions: 'Implement controlled inputs with error messages displayed in semantic ARIA alerts. Disable submit button while submission is pending.',
        expectedOutcome: 'Form adhering to WCAG standards with instant field-level validation on blur and submit.',
        suggestedEffortMinutes: 40,
        starterCode: 'export function StudentForm({ onSubmit }) {\n  const [values, setValues] = useState({ name: "", email: "" });\n  const [errors, setErrors] = useState({});\n  // Handle validation and submission\n}',
      },
    ],
    commonMistakes: [
      'Mutating state objects directly rather than creating new copies',
      'Omitting dependencies in useEffect dependency arrays leading to stale closures',
      'Using array indexes as unstable keys in dynamic lists',
    ],
    miniChallenge: 'Build a multi-step modal wizard that validates input at each step and retains state across previous and next steps.',
    resources: [
      { title: 'React Official Documentation', url: 'https://react.dev/', type: 'Official Documentation' },
      { title: 'MDN React Tutorials', url: 'https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/React_getting_started', type: 'Tutorial' },
    ],
  },

  'Node.js and Express': {
    summary: 'Server-side JavaScript runtime with event-driven non-blocking I/O, middleware architectures, REST endpoints, and stream processing.',
    whyItMatters: 'Core building block for modern microservices and backend web servers in placement technical rounds.',
    prerequisites: ['JavaScript', 'REST APIs'],
    concepts: [
      'Node.js Architecture: V8 Engine, libuv, Event Loop, Thread Pool',
      'Express Middleware Pipeline: Request, Response, next() function',
      'Routing, Request Parsing, URL Parameters, and Query Strings',
      'Centralized Error Handling Middleware and Async Wrappers',
      'Environment Configurations and Secret Management with dotenv',
    ],
    exercises: [
      'Create an Express server with structured routes, controllers, and services',
      'Implement a rate-limiting middleware using memory stores',
      'Build a structured request logging middleware recording method, path, and duration',
    ],
    learningTasks: [
      {
        key: 'node_task_1',
        title: 'Centralized Async Route Handler & Error Envelope',
        description: 'Implement an asyncHandler wrapper and global error middleware producing standard API envelopes.',
        instructions: 'Create an asyncHandler wrapper to eliminate try/catch boilerplate in Express route controllers. Route unhandled rejections to next(err).',
        expectedOutcome: 'Consistent JSON error response { success: false, error: { code, message } } across all endpoints.',
        suggestedEffortMinutes: 35,
        starterCode: 'const asyncHandler = (fn) => (req, res, next) => {\n  Promise.resolve(fn(req, res, next)).catch(next);\n};\n\nconst errorHandler = (err, req, res, next) => {\n  const status = err.status || 500;\n  res.status(status).json({\n    success: false,\n    error: { code: err.code || "INTERNAL_ERROR", message: err.message }\n  });\n};',
      },
      {
        key: 'node_task_2',
        title: 'Authentication Middleware with JWT Verification',
        description: 'Build a reusable Express middleware to verify Bearer tokens and attach user credentials to req.user.',
        instructions: 'Extract token from Authorization header, verify with jsonwebtoken, handle TokenExpiredError gracefully, and block unauthorized requests with 401 status.',
        expectedOutcome: 'Secure authentication middleware with unit tests covering valid, expired, and missing tokens.',
        suggestedEffortMinutes: 40,
        starterCode: 'const jwt = require("jsonwebtoken");\n\nfunction authenticate(req, res, next) {\n  const auth = req.headers.authorization;\n  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Missing token" });\n  try {\n    req.user = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);\n    next();\n  } catch (err) {\n    return res.status(401).json({ error: "Invalid or expired token" });\n  }\n}',
      },
    ],
    commonMistakes: [
      'Blocking the event loop with synchronous file operations in route handlers',
      'Failing to handle unhandled promise rejections causing server crashes',
      'Hardcoding connection strings and API keys into source control',
    ],
    miniChallenge: 'Build a secure RESTful CRUD API for managing job applications with input validation and centralized error envelopes.',
    resources: [
      { title: 'Node.js Official Documentation', url: 'https://nodejs.org/en/docs/', type: 'Official Documentation' },
      { title: 'Express.js API Reference', url: 'https://expressjs.com/', type: 'Official Documentation' },
    ],
  },
};

/**
 * Returns structured details for a skill, falling back to a derived template.
 */
function getSkillContent(skillName, category = 'technical') {
  if (SKILL_CONTENT[skillName]) {
    return SKILL_CONTENT[skillName];
  }

  const slug = skillName.toLowerCase().replace(/[^a-z0-9]+/g, '_');

  // Graceful fallback for any other skill in the catalog
  return {
    summary: `Core competence in ${skillName}, emphasizing practical application, conceptual depth, and industry best practices.`,
    whyItMatters: `This competency is directly evaluated in technical placement assessments for your target career role.`,
    prerequisites: category === 'technical' ? ['Programming Fundamentals'] : [],
    concepts: [
      `Foundational principles of ${skillName}`,
      `Practical syntax and standard conventions`,
      `Performance optimization and common edge cases`,
      `Integration with standard engineering workflows`,
    ],
    exercises: [
      `Review core textbook principles and official documentation for ${skillName}`,
      `Complete standard practice problems or implementation exercises`,
      `Analyze common interview questions and debugging scenarios`,
    ],
    learningTasks: [
      {
        key: `${slug}_task_1`,
        title: `Core Concept Implementation in ${skillName}`,
        description: `Implement and test a fundamental application or problem solution in ${skillName}.`,
        instructions: `Review the official documentation, create a working demonstration snippet, and verify input/output edge cases.`,
        expectedOutcome: `A working, documented code or conceptual deliverable demonstrating mastery of fundamental ${skillName}.`,
        suggestedEffortMinutes: 30,
        starterCode: `// ${skillName} foundational task implementation`,
      },
      {
        key: `${slug}_task_2`,
        title: `Practical Project Exercise: ${skillName}`,
        description: `Apply ${skillName} within a realistic engineering scenario with error handling.`,
        instructions: `Design a structured solution that addresses performance, security, and edge-case handling.`,
        expectedOutcome: `A modular implementation ready to be included in your student evidence portfolio.`,
        suggestedEffortMinutes: 45,
        starterCode: `// Practical ${skillName} project exercise`,
      },
    ],
    commonMistakes: [
      `Focusing only on theory without practical hands-on application`,
      `Overlooking standard edge cases and error scenarios`,
    ],
    miniChallenge: `Build a small demonstration project or solve 3 targeted problems demonstrating proficiency in ${skillName}.`,
    resources: [
      { title: `${skillName} Official Documentation`, url: 'https://developer.mozilla.org/', type: 'Documentation' },
      { title: 'GeeksforGeeks Skill Overview', url: 'https://www.geeksforgeeks.org/', type: 'Tutorial' },
    ],
  };
}

module.exports = {
  SKILL_CONTENT,
  getSkillContent,
};
