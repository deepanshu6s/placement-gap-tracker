const { pool } = require('../../config/db');

/**
 * Seed explanation and concept_tested metadata for interview MCQs.
 * Ensures that whenever a student completes or reviews an assessment,
 * they receive a comprehensive, educational explanation and actionable remediation.
 */
async function seedExplanations() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Generic educational explanation generator based on question text, skill, and correct option
    const res = await client.query(`
      SELECT q.id, q.question_text, qo.option_text as correct_answer, s.name as skill_name
      FROM questions q
      JOIN skills s ON q.skill_id = s.id
      JOIN question_options qo ON qo.question_id = q.id AND qo.is_correct = true
    `);

    console.log(`Enriching ${res.rows.length} questions with educational explanations...`);

    const explanationsMap = {
      // JavaScript
      'What is the output of typeof null?': {
        concept: 'JavaScript Type System & Historical Quirks',
        explanation: 'In JavaScript, typeof null returning "object" is an acknowledged legacy bug from the initial 1995 JS specification. In the original implementation, values were represented with a type tag and a value pointer; object type tags were 000, and null was represented as the NULL pointer (0x00), causing typeof to mistakenly classify null as an object.',
      },
      'Which method is used to serialize an object into a JSON string?': {
        concept: 'Data Serialization & JSON Format',
        explanation: 'JSON.stringify() converts a JavaScript object or primitive value into a valid JSON-formatted string representation. Conversely, JSON.parse() deserializes a JSON string back into a JavaScript object structure.',
      },
      'What is a closure in JavaScript?': {
        concept: 'Lexical Scoping & Memory Closures',
        explanation: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment. In JavaScript, closures allow an inner function to retain access to variables from an outer function scope even after the outer function has finished executing.',
      },

      // DSA
      'What is the worst-case time complexity of searching an element in an unsorted array of size N?': {
        concept: 'Linear Search & Asymptotic Analysis',
        explanation: 'In an unsorted array, elements have no predefined order. Therefore, in the worst case (the element is at the very end or absent), every single one of the N elements must be inspected sequentially, yielding O(N) linear time complexity.',
      },
      'Which data structure follows the LIFO (Last In First Out) principle?': {
        concept: 'Stack Data Structure',
        explanation: 'A Stack follows the LIFO (Last In, First Out) principle, where the last element inserted (pushed) is the first element retrieved (popped). Queues, in contrast, adhere to FIFO (First In, First Out).',
      },
      'What is the average time complexity of QuickSort?': {
        concept: 'Divide-and-Conquer Sorting Algorithms',
        explanation: 'QuickSort has an average and best-case time complexity of O(N log N) when the pivot divides the array reasonably evenly. Its worst case is O(N^2), which occurs with poor pivot choices (such as always picking the smallest or largest element in an already sorted array).',
      },
      'Which data structure is primarily used to implement Breadth-First Search (BFS) in a graph?': {
        concept: 'Graph Traversal & Queue Application',
        explanation: 'BFS explores graph vertices level by level. A Queue (FIFO) is used to track visited vertices and their adjacent neighbors so that all nodes at distance k are visited before nodes at distance k+1.',
      },
      'What is the time complexity to find the shortest path between all pairs of vertices using the Floyd-Warshall algorithm?': {
        concept: 'All-Pairs Shortest Path Dynamic Programming',
        explanation: 'The Floyd-Warshall algorithm utilizes three nested loops over the number of vertices V to compute all-pairs shortest paths via dynamic programming, resulting in a time complexity of O(V^3).',
      },

      // Python
      'What is the difference between a list and a tuple in Python?': {
        concept: 'Python Mutability & Sequence Types',
        explanation: 'In Python, lists are mutable (elements can be added, removed, or modified in place using methods like append or slice assignment), whereas tuples are immutable (their contents cannot be modified after instantiation).',
      },
      'Which data type in Python is ordered, mutable, and allows duplicate elements?': {
        concept: 'Core Python Built-in Collections',
        explanation: 'A Python List is an ordered sequence that is mutable and permits duplicate items. Sets are unordered with unique elements; dictionaries store key-value mappings; tuples are immutable.',
      },
      'What is a generator in Python and which keyword is used to yield values lazily?': {
        concept: 'Iterators & Memory-Efficient Generators',
        explanation: 'A generator function yields values one at a time using the "yield" keyword rather than computing and storing an entire collection in RAM. This lazy evaluation enables handling infinite sequences and massive datasets with O(1) memory.',
      },
      'How do you define a function in Python?': {
        concept: 'Function Declaration Syntax',
        explanation: 'Python uses the "def" keyword followed by the function name, parameter list in parentheses, and a colon to declare a new function block.',
      },
      'What is the Global Interpreter Lock (GIL) in CPython?': {
        concept: 'CPython Concurrency & Memory Management',
        explanation: 'The GIL is a mutual exclusion lock in CPython that ensures only one native thread executes Python bytecode at a time, simplifying CPython memory management and reference counting at the cost of multi-core CPU parallelism for pure Python threads.',
      },

      // React
      "How does React's Virtual DOM diffing algorithm optimize DOM updates?": {
        concept: 'Virtual DOM & Reconciliation Engine',
        explanation: 'React maintains an in-memory Virtual DOM tree representation. When state changes, a new tree is created and compared against the previous snapshot (reconciliation). React calculates the minimum necessary real DOM mutations and applies them in efficient batches.',
      },
      'What is the primary function of the useState hook in React?': {
        concept: 'React Component State Management',
        explanation: 'The useState hook lets functional components declare persistent local state variables. Calling the updater function triggers a re-render of the component with the new state value.',
      },
      'Why do items rendered in a list in React require a unique "key" prop?': {
        concept: 'List Reconciliation & Identity Matching',
        explanation: 'React uses the "key" prop to uniquely identify items between renders. This enables React to determine whether an element was inserted, moved, or deleted, avoiding wasteful DOM re-creations and preserving input state.',
      },
      'What is the primary benefit of the useMemo hook in React?': {
        concept: 'Performance Optimization & Memoization',
        explanation: 'useMemo caches the returned value of an expensive calculation across re-renders and only recalculates it when one of its specified dependencies has changed, preventing redundant computations.',
      },
      'When does the cleanup function inside a useEffect hook execute?': {
        concept: 'Effect Lifecycle & Resource Cleanup',
        explanation: 'The cleanup function returned by useEffect runs right before the effect re-runs (if dependencies change) and immediately before the component unmounts from the DOM, ensuring subscriptions, timers, or event listeners are safely cleaned up.',
      },

      // REST APIs
      'What does idempotency mean in the context of RESTful HTTP methods?': {
        concept: 'HTTP Protocol Semantics & Idempotency',
        explanation: 'An HTTP method is idempotent if performing the same request N times yields the identical resulting server resource state as performing it once. GET, PUT, and DELETE are idempotent; POST is generally non-idempotent because repeated calls create multiple resources.',
      },
      'Which HTTP status code should be returned after successfully creating a new resource via POST?': {
        concept: 'RESTful HTTP Status Codes',
        explanation: 'HTTP 201 Created signifies that the request succeeded and led to the creation of one or more new resources, typically accompanied by a Location header referencing the new resource URI.',
      },
      'What is the primary semantic difference between PUT and PATCH in REST APIs?': {
        concept: 'HTTP Method Semantics (PUT vs PATCH)',
        explanation: 'PUT performs a full resource replacement where missing fields are typically reset to defaults or null. PATCH applies a partial delta modification, updating only the specific fields provided in the request payload.',
      },
      'Which HTTP method should be used to retrieve an existing resource without side effects?': {
        concept: 'Safe HTTP Methods',
        explanation: 'GET is a safe, idempotent method intended solely to retrieve resource representations without altering server-side state or creating side effects.',
      },
      'What does the HTTP 404 status code indicate?': {
        concept: 'Client Error Status Codes',
        explanation: '404 Not Found indicates that the origin server did not find a current representation for the target resource or is unwilling to disclose that one exists.',
      },

      // Web Security
      'What security flag on an HTTP cookie prevents client-side JavaScript from accessing it via document.cookie?': {
        concept: 'Cookie Security & XSS Mitigation',
        explanation: 'Setting the HttpOnly flag on an HTTP cookie tells the browser that the cookie should not be accessible via client-side scripts such as document.cookie, mitigating session hijacking via Cross-Site Scripting (XSS).',
      },
      'What is Cross-Site Scripting (XSS)?': {
        concept: 'Web Application Vulnerabilities (XSS)',
        explanation: 'Cross-Site Scripting (XSS) occurs when an application includes untrusted data in a web page without proper validation or escaping, allowing an attacker to execute arbitrary JavaScript in the victim’s browser context.',
      },
      'What is the purpose of the Same-Origin Policy (SOP) in modern web browsers?': {
        concept: 'Browser Security Model (Same-Origin Policy)',
        explanation: 'The Same-Origin Policy is a fundamental browser security mechanism that isolates documents or scripts loaded from one origin from accessing resources (cookies, DOM, localStorage) from a different origin unless explicitly permitted via CORS.',
      },
      'Why should passwords NEVER be stored in plain text or simple MD5/SHA256 hashes in a database?': {
        concept: 'Cryptographic Hashing & Password Storage',
        explanation: 'Plain text passwords are exposed upon database breach. Fast algorithms like MD5/SHA256 can be cracked at billions of guesses per second with GPUs and rainbow tables. Adaptive salted algorithms like bcrypt or Argon2 incorporate work factors to deliberately slow down brute-force attacks.',
      },
      'What type of vulnerability occurs when untrusted user input is directly concatenated into an SQL query?': {
        concept: 'Injection Vulnerabilities (SQL Injection)',
        explanation: 'SQL Injection (SQLi) allows malicious actors to manipulate application queries by injecting raw SQL syntax through unsanitized user inputs. Parameterized queries / prepared statements treat input strictly as literal values, completely neutralizing SQLi.',
      },

      // Testing
      'In automated testing, what is the role of a Mock object?': {
        concept: 'Test Doubles & Mocking',
        explanation: 'A Mock object is a simulated dependency that mimics the behavior of a real component (such as an external API or database), allowing tests to set up programmed expectations and verify that specific methods were invoked.',
      },
      'What is Regression Testing?': {
        concept: 'Software Quality Assurance & Regression Suites',
        explanation: 'Regression testing involves executing previously passed test suites after code changes or bug fixes to guarantee that existing functionality and system integrations remain unbroken.',
      },
      'What is the focus of Unit Testing?': {
        concept: 'Test Levels & Unit Test Scope',
        explanation: 'Unit testing tests the smallest testable units of software (individual functions, methods, or isolated classes) in isolation from external dependencies like databases or networks.',
      },
      'What is the difference between Black-Box and White-Box testing?': {
        concept: 'Testing Methodologies & Code Visibility',
        explanation: 'Black-box testing evaluates software functionality based purely on specifications and input/output requirements without visibility into internal code. White-box testing examines the internal structure, code branches, and execution paths.',
      },
      'What is Boundary Value Analysis (BVA) in test case design?': {
        concept: 'Black-Box Test Case Design Techniques',
        explanation: 'Boundary Value Analysis focuses on testing values at the boundaries of equivalence partitions (e.g. min, min+1, nominal, max-1, max), because software defects cluster disproportionately near boundary conditions.',
      },

      // Operating Systems
      'What is the primary function of an Operating System kernel?': {
        concept: 'Operating System Architecture & Kernel Role',
        explanation: 'The kernel is the core program of an OS that executes in privileged supervisor mode. It manages hardware resources including CPU scheduling, physical and virtual memory allocation, interrupt handling, and device I/O.',
      },
      'What is thrashing in virtual memory management?': {
        concept: 'Virtual Memory & Paging Algorithms',
        explanation: 'Thrashing occurs when the system spends more time moving pages back and forth between RAM and swap storage than executing application instructions, causing CPU utilization to collapse.',
      },
      "Which of the following is NOT one of Coffman's four conditions for deadlock?": {
        concept: 'Concurrency & Deadlock Prevention',
        explanation: 'Coffman’s four necessary conditions for deadlock are: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption (resources cannot be forcibly confiscated), and 4) Circular Wait. "Preemptive allocation" prevents deadlocks rather than causing them.',
      },

      // Programming Fundamentals
      'What does a compiler do?': {
        concept: 'Compilation & Language Processing',
        explanation: 'A compiler translates source code written in a high-level programming language into machine code or intermediate bytecode in a single batch process prior to execution.',
      },
      'What is memory leak in programming?': {
        concept: 'Memory Allocation & Garbage Collection',
        explanation: 'A memory leak happens when memory allocated dynamically on the heap is no longer accessible or needed by the application, but is never freed or deallocated, gradually consuming system RAM.',
      },
      'What happens when a recursive function lacks a valid base case?': {
        concept: 'Recursion & Call Stack Limits',
        explanation: 'Without a base case, recursive function invocations continue indefinitely until the allocated call stack space is exhausted, triggering a Stack Overflow exception.',
      },
      'Which operator is used to allocate dynamic memory in C++?': {
        concept: 'Dynamic Memory Allocation (C++)',
        explanation: 'In C++, the "new" operator dynamically allocates memory on the heap and calls the appropriate constructor. The corresponding "delete" operator frees the allocated heap memory.',
      },
      'In pass-by-reference, what is passed into the function parameter?': {
        concept: 'Parameter Passing Semantics',
        explanation: 'In pass-by-reference, the function receives an alias or direct reference to the original variable’s memory location. Modifications made to the parameter inside the function directly affect the caller’s original variable.',
      },
    };

    for (const row of res.rows) {
      let concept = 'Core Technical Concepts';
      let explanation = `The correct answer is "${row.correct_answer}". Understanding this principle is essential for technical placement interviews in ${row.skill_name}.`;

      if (explanationsMap[row.question_text]) {
        concept = explanationsMap[row.question_text].concept;
        explanation = explanationsMap[row.question_text].explanation;
      } else {
        // Generate helpful context
        concept = `${row.skill_name} Competency`;
        explanation = `The correct answer is "${row.correct_answer}". In ${row.skill_name}, this concept verifies fundamental understanding required for production systems and technical screenings.`;
      }

      await client.query(
        'UPDATE questions SET concept_tested = $1, explanation = $2 WHERE id = $3',
        [concept, explanation, row.id]
      );
    }

    await client.query('COMMIT');
    console.log('Successfully enriched questions with explanations and concepts tested.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to seed explanations:', err);
    throw err;
  } finally {
    client.release();
  }
}

seedExplanations().then(() => pool.end()).catch(() => process.exit(1));
