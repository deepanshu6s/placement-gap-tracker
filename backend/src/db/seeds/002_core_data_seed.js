const { pool } = require('../../config/db');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // =========================================================================
    // 1. CAREER ROLES (10 Industry Pathways)
    // =========================================================================
    const rolesData = [
      {
        name: 'Software Engineer',
        description: 'Designs, develops, and maintains scalable software systems, algorithms, and core application logic.',
      },
      {
        name: 'Backend Developer',
        description: 'Builds secure server-side architectures, RESTful APIs, business logic, and database integrations.',
      },
      {
        name: 'Frontend Developer',
        description: 'Creates responsive, dynamic, and intuitive user interfaces with modern web standards and client frameworks.',
      },
      {
        name: 'Full-Stack Developer',
        description: 'Delivers complete end-to-end software solutions across user experience, server APIs, and data layers.',
      },
      {
        name: 'Data Analyst',
        description: 'Extracts, transforms, and analyzes complex data to produce actionable statistical business intelligence.',
      },
      {
        name: 'Cloud Engineer',
        description: 'Architects, provisions, and administers secure cloud infrastructure, virtual compute, and networking.',
      },
      {
        name: 'DevOps Engineer',
        description: 'Automates deployment pipelines, containerized environments, and continuous delivery infrastructure.',
      },
      {
        name: 'Cybersecurity Analyst',
        description: 'Protects computer networks, systems, and web applications from unauthorized access, vulnerabilities, and threats.',
      },
      {
        name: 'QA / Software Test Engineer',
        description: 'Ensures software reliability through systematic test cases, automated testing, and regression analysis.',
      },
      {
        name: 'Database Developer',
        description: 'Designs relational schemas, complex queries, indexing structures, and high-performance transactional databases.',
      },
    ];

    const roleIds = {};
    for (const r of rolesData) {
      const res = await client.query(
        `INSERT INTO career_roles (name, description, is_active)
         VALUES ($1, $2, true)
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, is_active = true
         RETURNING id, name`,
        [r.name, r.description]
      );
      roleIds[r.name] = res.rows[0].id;
    }

    // =========================================================================
    // 2. SKILL CATALOGUE
    // =========================================================================
    const skillsData = [
      { name: 'Data Structures and Algorithms', category: 'technical' },
      { name: 'Programming Fundamentals', category: 'technical' },
      { name: 'Object-Oriented Programming', category: 'technical' },
      { name: 'DBMS and SQL', category: 'technical' },
      { name: 'Operating Systems', category: 'technical' },
      { name: 'Computer Networks', category: 'technical' },
      { name: 'Software Engineering', category: 'technical' },
      { name: 'Node.js and Express', category: 'technical' },
      { name: 'REST APIs', category: 'technical' },
      { name: 'Authentication and Authorization', category: 'technical' },
      { name: 'Error Handling and Debugging', category: 'technical' },
      { name: 'Git and Version Control', category: 'technical' },
      { name: 'HTML and CSS', category: 'technical' },
      { name: 'JavaScript', category: 'technical' },
      { name: 'React', category: 'technical' },
      { name: 'API Integration', category: 'technical' },
      { name: 'Responsive Web Design', category: 'technical' },
      { name: 'PostgreSQL', category: 'technical' },
      { name: 'Spreadsheet and Excel Fundamentals', category: 'domain' },
      { name: 'Statistics Fundamentals', category: 'aptitude' },
      { name: 'Data Interpretation', category: 'aptitude' },
      { name: 'Python Fundamentals', category: 'technical' },
      { name: 'Cloud Computing Fundamentals', category: 'technical' },
      { name: 'Linux Fundamentals', category: 'technical' },
      { name: 'Cloud Compute and Virtual Machines', category: 'technical' },
      { name: 'Cloud Storage Solutions', category: 'technical' },
      { name: 'Identity and Access Management', category: 'technical' },
      { name: 'Information Security Fundamentals', category: 'technical' },
      { name: 'Docker and Containerization', category: 'technical' },
      { name: 'CI/CD Pipelines', category: 'technical' },
      { name: 'System Monitoring and Logging', category: 'technical' },
      { name: 'Web Application Security', category: 'technical' },
      { name: 'Security Incident Response', category: 'domain' },
      { name: 'Software Testing Fundamentals', category: 'technical' },
      { name: 'Test Case Design', category: 'technical' },
      { name: 'Bug Reporting and Lifecycle', category: 'domain' },
      { name: 'API Testing and Automation', category: 'technical' },
      { name: 'Test Automation Fundamentals', category: 'technical' },
      { name: 'Relational Database Concepts', category: 'technical' },
      { name: 'Relational Database Design', category: 'technical' },
      { name: 'Indexing and Query Optimization', category: 'technical' },
      { name: 'Database Transactions and ACID', category: 'technical' },
    ];

    const skillIds = {};
    for (const s of skillsData) {
      const res = await client.query(
        `INSERT INTO skills (name, category, is_active)
         VALUES ($1, $2, true)
         ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category, is_active = true
         RETURNING id, name`,
        [s.name, s.category]
      );
      skillIds[s.name] = res.rows[0].id;
    }

    // =========================================================================
    // 3. ROLE SKILL REQUIREMENTS (Configurable Benchmarks & Weights)
    // =========================================================================
    const roleRequirements = [
      // 1. Software Engineer
      { role: 'Software Engineer', skill: 'Data Structures and Algorithms', level: 75, weight: 5 },
      { role: 'Software Engineer', skill: 'Programming Fundamentals', level: 80, weight: 4 },
      { role: 'Software Engineer', skill: 'Object-Oriented Programming', level: 75, weight: 4 },
      { role: 'Software Engineer', skill: 'DBMS and SQL', level: 70, weight: 4 },
      { role: 'Software Engineer', skill: 'Operating Systems', level: 70, weight: 3 },
      { role: 'Software Engineer', skill: 'Computer Networks', level: 70, weight: 3 },
      { role: 'Software Engineer', skill: 'Software Engineering', level: 75, weight: 3 },

      // 2. Backend Developer
      { role: 'Backend Developer', skill: 'Programming Fundamentals', level: 80, weight: 4 },
      { role: 'Backend Developer', skill: 'Node.js and Express', level: 75, weight: 5 },
      { role: 'Backend Developer', skill: 'REST APIs', level: 80, weight: 5 },
      { role: 'Backend Developer', skill: 'DBMS and SQL', level: 75, weight: 4 },
      { role: 'Backend Developer', skill: 'Authentication and Authorization', level: 75, weight: 4 },
      { role: 'Backend Developer', skill: 'Error Handling and Debugging', level: 70, weight: 3 },
      { role: 'Backend Developer', skill: 'Git and Version Control', level: 70, weight: 3 },

      // 3. Frontend Developer
      { role: 'Frontend Developer', skill: 'HTML and CSS', level: 80, weight: 4 },
      { role: 'Frontend Developer', skill: 'JavaScript', level: 80, weight: 5 },
      { role: 'Frontend Developer', skill: 'React', level: 75, weight: 5 },
      { role: 'Frontend Developer', skill: 'API Integration', level: 75, weight: 4 },
      { role: 'Frontend Developer', skill: 'Responsive Web Design', level: 75, weight: 3 },
      { role: 'Frontend Developer', skill: 'Git and Version Control', level: 70, weight: 3 },

      // 4. Full-Stack Developer
      { role: 'Full-Stack Developer', skill: 'HTML and CSS', level: 75, weight: 3 },
      { role: 'Full-Stack Developer', skill: 'JavaScript', level: 80, weight: 5 },
      { role: 'Full-Stack Developer', skill: 'React', level: 75, weight: 4 },
      { role: 'Full-Stack Developer', skill: 'Node.js and Express', level: 75, weight: 4 },
      { role: 'Full-Stack Developer', skill: 'REST APIs', level: 80, weight: 4 },
      { role: 'Full-Stack Developer', skill: 'PostgreSQL', level: 75, weight: 4 },
      { role: 'Full-Stack Developer', skill: 'Authentication and Authorization', level: 75, weight: 4 },
      { role: 'Full-Stack Developer', skill: 'Git and Version Control', level: 70, weight: 3 },

      // 5. Data Analyst
      { role: 'Data Analyst', skill: 'DBMS and SQL', level: 80, weight: 5 },
      { role: 'Data Analyst', skill: 'Spreadsheet and Excel Fundamentals', level: 75, weight: 4 },
      { role: 'Data Analyst', skill: 'Statistics Fundamentals', level: 75, weight: 4 },
      { role: 'Data Analyst', skill: 'Data Interpretation', level: 75, weight: 4 },
      { role: 'Data Analyst', skill: 'Python Fundamentals', level: 70, weight: 3 },

      // 6. Cloud Engineer
      { role: 'Cloud Engineer', skill: 'Cloud Computing Fundamentals', level: 80, weight: 5 },
      { role: 'Cloud Engineer', skill: 'Linux Fundamentals', level: 75, weight: 4 },
      { role: 'Cloud Engineer', skill: 'Computer Networks', level: 75, weight: 4 },
      { role: 'Cloud Engineer', skill: 'Cloud Compute and Virtual Machines', level: 75, weight: 4 },
      { role: 'Cloud Engineer', skill: 'Cloud Storage Solutions', level: 70, weight: 3 },
      { role: 'Cloud Engineer', skill: 'Identity and Access Management', level: 75, weight: 4 },
      { role: 'Cloud Engineer', skill: 'Information Security Fundamentals', level: 70, weight: 3 },

      // 7. DevOps Engineer
      { role: 'DevOps Engineer', skill: 'Linux Fundamentals', level: 80, weight: 4 },
      { role: 'DevOps Engineer', skill: 'Git and Version Control', level: 75, weight: 3 },
      { role: 'DevOps Engineer', skill: 'Computer Networks', level: 70, weight: 3 },
      { role: 'DevOps Engineer', skill: 'Docker and Containerization', level: 80, weight: 5 },
      { role: 'DevOps Engineer', skill: 'CI/CD Pipelines', level: 75, weight: 4 },
      { role: 'DevOps Engineer', skill: 'Cloud Computing Fundamentals', level: 75, weight: 4 },
      { role: 'DevOps Engineer', skill: 'System Monitoring and Logging', level: 70, weight: 3 },

      // 8. Cybersecurity Analyst
      { role: 'Cybersecurity Analyst', skill: 'Computer Networks', level: 80, weight: 5 },
      { role: 'Cybersecurity Analyst', skill: 'Linux Fundamentals', level: 75, weight: 4 },
      { role: 'Cybersecurity Analyst', skill: 'Information Security Fundamentals', level: 80, weight: 5 },
      { role: 'Cybersecurity Analyst', skill: 'Web Application Security', level: 80, weight: 5 },
      { role: 'Cybersecurity Analyst', skill: 'Authentication and Authorization', level: 75, weight: 4 },
      { role: 'Cybersecurity Analyst', skill: 'Security Incident Response', level: 70, weight: 3 },

      // 9. QA / Software Test Engineer
      { role: 'QA / Software Test Engineer', skill: 'Software Testing Fundamentals', level: 80, weight: 5 },
      { role: 'QA / Software Test Engineer', skill: 'Test Case Design', level: 80, weight: 5 },
      { role: 'QA / Software Test Engineer', skill: 'Bug Reporting and Lifecycle', level: 75, weight: 4 },
      { role: 'QA / Software Test Engineer', skill: 'API Testing and Automation', level: 75, weight: 4 },
      { role: 'QA / Software Test Engineer', skill: 'DBMS and SQL', level: 70, weight: 3 },
      { role: 'QA / Software Test Engineer', skill: 'Test Automation Fundamentals', level: 70, weight: 3 },

      // 10. Database Developer
      { role: 'Database Developer', skill: 'DBMS and SQL', level: 85, weight: 5 },
      { role: 'Database Developer', skill: 'Relational Database Concepts', level: 80, weight: 5 },
      { role: 'Database Developer', skill: 'Relational Database Design', level: 80, weight: 4 },
      { role: 'Database Developer', skill: 'Indexing and Query Optimization', level: 75, weight: 4 },
      { role: 'Database Developer', skill: 'Database Transactions and ACID', level: 75, weight: 4 },
      { role: 'Database Developer', skill: 'PostgreSQL', level: 75, weight: 4 },
    ];

    for (const req of roleRequirements) {
      const rId = roleIds[req.role];
      const sId = skillIds[req.skill];
      if (rId && sId) {
        await client.query(
          `INSERT INTO role_skill_requirements (role_id, skill_id, required_level, weight)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (role_id, skill_id) DO UPDATE SET
             required_level = EXCLUDED.required_level,
             weight = EXCLUDED.weight`,
          [rId, sId, req.level, req.weight]
        );
      }
    }

    // =========================================================================
    // 4. ASSESSMENT CONFIGS (5 questions: 2 easy, 2 medium, 1 hard, cooldown: 0h)
    // =========================================================================
    for (const skillName of Object.keys(skillIds)) {
      await client.query(
        `INSERT INTO assessment_configs
           (skill_id, total_questions, time_limit_minutes, easy_count, medium_count, hard_count, cooldown_hours)
         VALUES ($1, 5, 10, 2, 2, 1, 0)
         ON CONFLICT (skill_id) DO UPDATE SET
           total_questions = 5,
           easy_count = 2,
           medium_count = 2,
           hard_count = 1,
           time_limit_minutes = 10,
           cooldown_hours = 0`,
        [skillIds[skillName]]
      );
    }

    // =========================================================================
    // 5. QUESTION BANK (70+ Interview-Ready MCQs with Accurate Answer Keys)
    // =========================================================================
    const questionsData = [
      // -----------------------------------------------------------------------
      // DATA STRUCTURES AND ALGORITHMS
      // -----------------------------------------------------------------------
      {
        skill: 'Data Structures and Algorithms',
        difficulty: 'easy',
        text: 'What is the worst-case time complexity of searching an element in an unsorted array of size N?',
        options: [
          { text: 'O(N)', correct: true },
          { text: 'O(log N)', correct: false },
          { text: 'O(1)', correct: false },
          { text: 'O(N log N)', correct: false },
        ],
      },
      {
        skill: 'Data Structures and Algorithms',
        difficulty: 'easy',
        text: 'Which data structure follows the LIFO (Last In First Out) principle?',
        options: [
          { text: 'Stack', correct: true },
          { text: 'Queue', correct: false },
          { text: 'Linked List', correct: false },
          { text: 'Binary Tree', correct: false },
        ],
      },
      {
        skill: 'Data Structures and Algorithms',
        difficulty: 'medium',
        text: 'What is the average time complexity of QuickSort?',
        options: [
          { text: 'O(N log N)', correct: true },
          { text: 'O(N^2)', correct: false },
          { text: 'O(N)', correct: false },
          { text: 'O(log N)', correct: false },
        ],
      },
      {
        skill: 'Data Structures and Algorithms',
        difficulty: 'medium',
        text: 'Which data structure is primarily used to implement Breadth-First Search (BFS) in a graph?',
        options: [
          { text: 'Queue', correct: true },
          { text: 'Stack', correct: false },
          { text: 'Min-Heap', correct: false },
          { text: 'Hash Table', correct: false },
        ],
      },
      {
        skill: 'Data Structures and Algorithms',
        difficulty: 'hard',
        text: 'What is the time complexity to find the shortest path between all pairs of vertices using the Floyd-Warshall algorithm?',
        options: [
          { text: 'O(V^3)', correct: true },
          { text: 'O(V^2 log V)', correct: false },
          { text: 'O(E log V)', correct: false },
          { text: 'O(V * E)', correct: false },
        ],
      },

      // -----------------------------------------------------------------------
      // PROGRAMMING FUNDAMENTALS
      // -----------------------------------------------------------------------
      {
        skill: 'Programming Fundamentals',
        difficulty: 'easy',
        text: 'Which operator is used to allocate dynamic memory in C++?',
        options: [
          { text: 'new', correct: true },
          { text: 'malloc', correct: false },
          { text: 'alloc', correct: false },
          { text: 'create', correct: false },
        ],
      },
      {
        skill: 'Programming Fundamentals',
        difficulty: 'easy',
        text: 'What does a compiler do?',
        options: [
          { text: 'Translates high-level source code into machine code or bytecode', correct: true },
          { text: 'Executes source code line by line without translation', correct: false },
          { text: 'Manages computer hardware memory allocations directly', correct: false },
          { text: 'Tests code for runtime exceptions automatically', correct: false },
        ],
      },
      {
        skill: 'Programming Fundamentals',
        difficulty: 'medium',
        text: 'What happens when a recursive function lacks a valid base case?',
        options: [
          { text: 'Stack Overflow Error', correct: true },
          { text: 'Out of Memory in Heap', correct: false },
          { text: 'Syntax Compilation Error', correct: false },
          { text: 'Immediate program termination with exit code 0', correct: false },
        ],
      },
      {
        skill: 'Programming Fundamentals',
        difficulty: 'medium',
        text: 'In pass-by-reference, what is passed into the function parameter?',
        options: [
          { text: 'The memory address or alias of the original variable', correct: true },
          { text: 'A deep duplicate copy of the original value', correct: false },
          { text: 'A read-only snapshot of the variable', correct: false },
          { text: 'A pointer stored in read-only ROM', correct: false },
        ],
      },
      {
        skill: 'Programming Fundamentals',
        difficulty: 'hard',
        text: 'What is memory leak in programming?',
        options: [
          { text: 'Dynamically allocated memory that is no longer referenced but never deallocated', correct: true },
          { text: 'Accessing memory outside the allocated boundary of an array', correct: false },
          { text: 'Corrupted hardware RAM causing unpredictable CPU halts', correct: false },
          { text: 'A pointer pointing to an already freed block of memory', correct: false },
        ],
      },

      // -----------------------------------------------------------------------
      // OBJECT-ORIENTED PROGRAMMING
      // -----------------------------------------------------------------------
      {
        skill: 'Object-Oriented Programming',
        difficulty: 'easy',
        text: 'Which OOP principle hides internal implementation details and exposes only essential interfaces?',
        options: [
          { text: 'Encapsulation', correct: true },
          { text: 'Inheritance', correct: false },
          { text: 'Polymorphism', correct: false },
          { text: 'Overloading', correct: false },
        ],
      },
      {
        skill: 'Object-Oriented Programming',
        difficulty: 'easy',
        text: 'What is a constructor in OOP?',
        options: [
          { text: 'A special member method invoked automatically during object instantiation', correct: true },
          { text: 'A function that frees memory when an object is destroyed', correct: false },
          { text: 'A class that contains only pure virtual functions', correct: false },
          { text: 'A static method that clones existing objects', correct: false },
        ],
      },
      {
        skill: 'Object-Oriented Programming',
        difficulty: 'medium',
        text: 'What is runtime polymorphism commonly achieved through in C++ and Java?',
        options: [
          { text: 'Method overriding with virtual functions / dynamic dispatch', correct: true },
          { text: 'Method overloading during compilation', correct: false },
          { text: 'Multiple constructor definitions', correct: false },
          { text: 'Access specifiers (private, protected)', correct: false },
        ],
      },
      {
        skill: 'Object-Oriented Programming',
        difficulty: 'medium',
        text: 'What does the "L" in SOLID design principles stand for?',
        options: [
          { text: 'Liskov Substitution Principle', correct: true },
          { text: 'Linear Inheritance Principle', correct: false },
          { text: 'Lazy Evaluation Principle', correct: false },
          { text: 'Loose Coupling Principle', correct: false },
        ],
      },
      {
        skill: 'Object-Oriented Programming',
        difficulty: 'hard',
        text: 'What is the diamond problem in object-oriented inheritance?',
        options: [
          { text: 'Ambiguity that arises when a class inherits from two classes that share a common ancestor', correct: true },
          { text: 'Circular dependency between two abstract interface definitions', correct: false },
          { text: 'Failure to deallocate base class destructor in single inheritance', correct: false },
          { text: 'Excessive memory overhead created by virtual method tables', correct: false },
        ],
      },

      // -----------------------------------------------------------------------
      // DBMS AND SQL
      // -----------------------------------------------------------------------
      {
        skill: 'DBMS and SQL',
        difficulty: 'easy',
        text: 'Which SQL clause is used to filter rows returned by a SELECT query?',
        options: [
          { text: 'WHERE', correct: true },
          { text: 'ORDER BY', correct: false },
          { text: 'GROUP BY', correct: false },
          { text: 'LIMIT', correct: false },
        ],
      },
      {
        skill: 'DBMS and SQL',
        difficulty: 'easy',
        text: 'What does the SQL command DELETE FROM users; do?',
        options: [
          { text: 'Removes all rows from the users table while preserving the table schema', correct: true },
          { text: 'Drops the table schema and all associated indexes permanently', correct: false },
          { text: 'Deletes only the primary key column from the table', correct: false },
          { text: 'Truncates table storage without logging', correct: false },
        ],
      },
      {
        skill: 'DBMS and SQL',
        difficulty: 'medium',
        text: 'What is the primary difference between WHERE and HAVING in SQL?',
        options: [
          { text: 'WHERE filters individual rows before aggregation; HAVING filters aggregated groups', correct: true },
          { text: 'HAVING can only be used with subqueries, WHERE cannot', correct: false },
          { text: 'WHERE is only supported in MySQL, HAVING is standard ANSI SQL', correct: false },
          { text: 'There is no difference; they are interchangeable aliases', correct: false },
        ],
      },
      {
        skill: 'DBMS and SQL',
        difficulty: 'medium',
        text: 'What does the ACID "I" property represent in transactional databases?',
        options: [
          { text: 'Isolation — concurrent transactions execute without interfering with each other', correct: true },
          { text: 'Integrity — ensuring data types cannot be violated', correct: false },
          { text: 'Indexing — enabling fast B-Tree lookups', correct: false },
          { text: 'Immutability — preventing updates to committed data', correct: false },
        ],
      },
      {
        skill: 'DBMS and SQL',
        difficulty: 'hard',
        text: 'Which database isolation level prevents dirty reads, non-repeatable reads, and phantom reads?',
        options: [
          { text: 'Serializable', correct: true },
          { text: 'Repeatable Read', correct: false },
          { text: 'Read Committed', correct: false },
          { text: 'Read Uncommitted', correct: false },
        ],
      },

      // -----------------------------------------------------------------------
      // OPERATING SYSTEMS
      // -----------------------------------------------------------------------
      {
        skill: 'Operating Systems',
        difficulty: 'easy',
        text: 'What is the primary function of an Operating System kernel?',
        options: [
          { text: 'Managing hardware resources like CPU, memory, and devices', correct: true },
          { text: 'Rendering visual user interfaces and browser tabs', correct: false },
          { text: 'Compiling high level source code into assembly language', correct: false },
          { text: 'Providing internet search query indexing', correct: false },
        ],
      },
      {
        skill: 'Operating Systems',
        difficulty: 'easy',
        text: 'What state is a process in when it is waiting for an I/O operation to complete?',
        options: [
          { text: 'Blocked / Waiting', correct: true },
          { text: 'Running', correct: false },
          { text: 'Ready', correct: false },
          { text: 'Terminated', correct: false },
        ],
      },
      {
        skill: 'Operating Systems',
        difficulty: 'medium',
        text: 'Which of the following is NOT one of Coffman\'s four conditions for deadlock?',
        options: [
          { text: 'Preemptive resource allocation', correct: true },
          { text: 'Mutual exclusion', correct: false },
          { text: 'Hold and wait', correct: false },
          { text: 'Circular wait', correct: false },
        ],
      },
      {
        skill: 'Operating Systems',
        difficulty: 'medium',
        text: 'What is thrashing in virtual memory management?',
        options: [
          { text: 'A state where excessive page swapping occurs, causing CPU utilization to plummet', correct: true },
          { text: 'Hard drive head collision causing permanent data corruption', correct: false },
          { text: 'A malicious cyber attack overloading CPU threads with infinite loops', correct: false },
          { text: 'A cache coherence protocol invalidating L1 cache lines', correct: false },
        ],
      },
      {
        skill: 'Operating Systems',
        difficulty: 'hard',
        text: 'What problem does the Banker\'s Algorithm solve in operating systems?',
        options: [
          { text: 'Deadlock avoidance by verifying safe state before resource allocation', correct: true },
          { text: 'Optimal page replacement in demand paging', correct: false },
          { text: 'CPU burst time prediction in shortest job first scheduling', correct: false },
          { text: 'Buffer cache replacement in distributed file systems', correct: false },
        ],
      },

      // -----------------------------------------------------------------------
      // COMPUTER NETWORKS
      // -----------------------------------------------------------------------
      {
        skill: 'Computer Networks',
        difficulty: 'easy',
        text: 'At which layer of the OSI model does the Internet Protocol (IP) operate?',
        options: [
          { text: 'Network Layer (Layer 3)', correct: true },
          { text: 'Transport Layer (Layer 4)', correct: false },
          { text: 'Data Link Layer (Layer 2)', correct: false },
          { text: 'Application Layer (Layer 7)', correct: false },
        ],
      },
      {
        skill: 'Computer Networks',
        difficulty: 'easy',
        text: 'What is the default port number for HTTPS traffic?',
        options: [
          { text: '443', correct: true },
          { text: '80', correct: false },
          { text: '22', correct: false },
          { text: '8080', correct: false },
        ],
      },
      {
        skill: 'Computer Networks',
        difficulty: 'medium',
        text: 'What is the sequence of packets exchanged in the standard TCP 3-way handshake?',
        options: [
          { text: 'SYN -> SYN-ACK -> ACK', correct: true },
          { text: 'ACK -> SYN -> SYN-ACK', correct: false },
          { text: 'FIN -> ACK -> FIN-ACK', correct: false },
          { text: 'SYN -> ACK -> DATA', correct: false },
        ],
      },
      {
        skill: 'Computer Networks',
        difficulty: 'medium',
        text: 'What is the purpose of the Domain Name System (DNS)?',
        options: [
          { text: 'Translates human-readable domain names into numerical IP addresses', correct: true },
          { text: 'Encrypts HTTP payload data using asymmetric cryptography', correct: false },
          { text: 'Routes network packets dynamically across Autonomous Systems', correct: false },
          { text: 'Assigns local MAC addresses to network interfaces', correct: false },
        ],
      },
      {
        skill: 'Computer Networks',
        difficulty: 'hard',
        text: 'In TCP congestion control, what happens during the Fast Retransmit phase?',
        options: [
          { text: 'The sender retransmits a lost segment upon receiving 3 duplicate ACKs without waiting for timeout', correct: true },
          { text: 'The sender resets the congestion window (CWND) to 1 MSS immediately', correct: false },
          { text: 'The connection drops and renegotiates a new TCP socket', correct: false },
          { text: 'Packets are rerouted over UDP for higher throughput', correct: false },
        ],
      },

      // -----------------------------------------------------------------------
      // JAVASCRIPT
      // -----------------------------------------------------------------------
      {
        skill: 'JavaScript',
        difficulty: 'easy',
        text: 'What is the result of typeof null in JavaScript?',
        options: [
          { text: 'object', correct: true },
          { text: 'null', correct: false },
          { text: 'undefined', correct: false },
          { text: 'number', correct: false },
        ],
      },
      {
        skill: 'JavaScript',
        difficulty: 'easy',
        text: 'Which keyword defines a block-scoped variable that cannot be reassigned?',
        options: [
          { text: 'const', correct: true },
          { text: 'var', correct: false },
          { text: 'let', correct: false },
          { text: 'static', correct: false },
        ],
      },
      {
        skill: 'JavaScript',
        difficulty: 'medium',
        text: 'What is an event loop in Node.js and browser JavaScript?',
        options: [
          { text: 'A mechanism that coordinates non-blocking asynchronous callback execution on the call stack', correct: true },
          { text: 'A while loop running in a dedicated worker thread to poll DOM clicks', correct: false },
          { text: 'A garbage collector loop that reclaims heap allocations', correct: false },
          { text: 'A syntax construct replacing for and while iterations', correct: false },
        ],
      },
      {
        skill: 'JavaScript',
        difficulty: 'medium',
        text: 'What will Promise.all() do if one of the promises rejects?',
        options: [
          { text: 'Immediately rejects with the reason of the first rejected promise', correct: true },
          { text: 'Waits for all other promises to resolve and ignores the rejected one', correct: false },
          { text: 'Returns an array where the rejected promise is replaced with null', correct: false },
          { text: 'Retries the rejected promise automatically 3 times', correct: false },
        ],
      },
      {
        skill: 'JavaScript',
        difficulty: 'hard',
        text: 'What is a closure in JavaScript?',
        options: [
          { text: 'A function that retains access to variables from its outer lexical scope even after that scope has closed', correct: true },
          { text: 'A private method that terminates program execution cleanly', correct: false },
          { text: 'An immediately invoked function expression that deletes global variables', correct: false },
          { text: 'A compiler phase that closes all open WebSocket connections', correct: false },
        ],
      },

      // -----------------------------------------------------------------------
      // REACT
      // -----------------------------------------------------------------------
      {
        skill: 'React',
        difficulty: 'easy',
        text: 'What is the primary function of the useState hook in React?',
        options: [
          { text: 'Declares state variables that persist across component re-renders', correct: true },
          { text: 'Triggers HTTP network requests to backend REST APIs', correct: false },
          { text: 'Subscribes directly to browser localStorage events', correct: false },
          { text: 'Defines route parameters for React Router navigation', correct: false },
        ],
      },
      {
        skill: 'React',
        difficulty: 'easy',
        text: 'Why do items rendered in a list in React require a unique "key" prop?',
        options: [
          { text: 'To help React identify which items have changed, added, or removed for efficient reconciliation', correct: true },
          { text: 'To encrypt list data before mounting it onto the DOM', correct: false },
          { text: 'To sort list items in alphabetical order automatically', correct: false },
          { text: 'To bind onClick event listeners to list items', correct: false },
        ],
      },
      {
        skill: 'React',
        difficulty: 'medium',
        text: 'When does the cleanup function inside a useEffect hook execute?',
        options: [
          { text: 'Before the effect re-runs and when the component unmounts', correct: true },
          { text: 'Only when the entire React application is closed in the browser', correct: false },
          { text: 'Immediately after every DOM paint before state update', correct: false },
          { text: 'Only when a JavaScript syntax error occurs', correct: false },
        ],
      },
      {
        skill: 'React',
        difficulty: 'medium',
        text: 'What is the primary benefit of the useMemo hook in React?',
        options: [
          { text: 'Memoizes the result of an expensive calculation between renders unless dependencies change', correct: true },
          { text: 'Caches API HTTP responses into browser session storage', correct: false },
          { text: 'Prevents children components from mounting until parent state is ready', correct: false },
          { text: 'Replaces Redux and Zustand store providers completely', correct: false },
        ],
      },
      {
        skill: 'React',
        difficulty: 'hard',
        text: 'How does React\'s Virtual DOM diffing algorithm optimize DOM updates?',
        options: [
          { text: 'Compares lightweight virtual tree snapshots and batches minimal real DOM mutations via reconciliation', correct: true },
          { text: 'Replaces the entire browser DOM tree on every state change directly', correct: false },
          { text: 'Compiles JSX templates directly into WebAssembly binary modules', correct: false },
          { text: 'Bypasses browser rendering engine using GPU canvas drawings', correct: false },
        ],
      },

      // -----------------------------------------------------------------------
      // NODE.JS AND EXPRESS
      // -----------------------------------------------------------------------
      {
        skill: 'Node.js and Express',
        difficulty: 'easy',
        text: 'Which parameter signature is required for an Express error-handling middleware?',
        options: [
          { text: '(err, req, res, next)', correct: true },
          { text: '(req, res, err)', correct: false },
          { text: '(error, response)', correct: false },
          { text: '(req, res, next)', correct: false },
        ],
      },
      {
        skill: 'Node.js and Express',
        difficulty: 'easy',
        text: 'Which built-in Node.js module is used to interact with the file system?',
        options: [
          { text: 'fs', correct: true },
          { text: 'path', correct: false },
          { text: 'os', correct: false },
          { text: 'http', correct: false },
        ],
      },
      {
        skill: 'Node.js and Express',
        difficulty: 'medium',
        text: 'What does the next() function do inside an Express middleware?',
        options: [
          { text: 'Passes control to the next middleware function in the request pipeline', correct: true },
          { text: 'Terminates the current HTTP request with a 200 OK status', correct: false },
          { text: 'Restarts the Node.js event loop for the current process', correct: false },
          { text: 'Skips the rest of the file and jumps to the next router', correct: false },
        ],
      },
      {
        skill: 'Node.js and Express',
        difficulty: 'medium',
        text: 'Why is it dangerous to perform CPU-intensive tasks on the Node.js main thread?',
        options: [
          { text: 'It blocks the single-threaded event loop, freezing handling of all concurrent client requests', correct: true },
          { text: 'It causes immediate kernel panic on Linux servers', correct: false },
          { text: 'It invalidates active database connection pools permanently', correct: false },
          { text: 'It automatically revokes JWT authentication secrets', correct: false },
        ],
      },
      {
        skill: 'Node.js and Express',
        difficulty: 'hard',
        text: 'What is the purpose of Node.js streams over standard buffer reading?',
        options: [
          { text: 'Allows processing data chunk by chunk without loading the entire content into memory', correct: true },
          { text: 'Encrypts binary data during transfer over TCP sockets', correct: false },
          { text: 'Executes callbacks synchronously across multiple CPU cores', correct: false },
          { text: 'Enforces strict JSON schema validation on network payloads', correct: false },
        ],
      },

      // -----------------------------------------------------------------------
      // REST APIS
      // -----------------------------------------------------------------------
      {
        skill: 'REST APIs',
        difficulty: 'easy',
        text: 'Which HTTP method should be used to retrieve an existing resource without side effects?',
        options: [
          { text: 'GET', correct: true },
          { text: 'POST', correct: false },
          { text: 'DELETE', correct: false },
          { text: 'PATCH', correct: false },
        ],
      },
      {
        skill: 'REST APIs',
        difficulty: 'easy',
        text: 'What does the HTTP 404 status code indicate?',
        options: [
          { text: 'Not Found — the requested resource does not exist on the server', correct: true },
          { text: 'Unauthorized — valid credentials are required', correct: false },
          { text: 'Internal Server Error — unhandled server exception', correct: false },
          { text: 'Bad Request — malformed request payload syntax', correct: false },
        ],
      },
      {
        skill: 'REST APIs',
        difficulty: 'medium',
        text: 'What does idempotency mean in the context of RESTful HTTP methods?',
        options: [
          { text: 'Making multiple identical requests produces the exact same server state as a single request', correct: true },
          { text: 'Requests can only be executed by authenticated administrators', correct: false },
          { text: 'The API response must always return a JSON object', correct: false },
          { text: 'The endpoint automatically caches responses in Redis', correct: false },
        ],
      },
      {
        skill: 'REST APIs',
        difficulty: 'medium',
        text: 'What is the primary semantic difference between PUT and PATCH in REST APIs?',
        options: [
          { text: 'PUT replaces the entire resource representation; PATCH applies partial modifications', correct: true },
          { text: 'PUT is read-only; PATCH creates new resources', correct: false },
          { text: 'PUT does not accept a request body; PATCH requires JSON', correct: false },
          { text: 'There is no difference; they are exact synonyms in RFC 7231', correct: false },
        ],
      },
      {
        skill: 'REST APIs',
        difficulty: 'hard',
        text: 'Which HTTP status code should be returned after successfully creating a new resource via POST?',
        options: [
          { text: '201 Created', correct: true },
          { text: '200 OK', correct: false },
          { text: '204 No Content', correct: false },
          { text: '202 Accepted', correct: false },
        ],
      },

      // -----------------------------------------------------------------------
      // LINUX FUNDAMENTALS
      // -----------------------------------------------------------------------
      {
        skill: 'Linux Fundamentals',
        difficulty: 'easy',
        text: 'Which Linux command is used to list directory contents including hidden files?',
        options: [
          { text: 'ls -a', correct: true },
          { text: 'list --all', correct: false },
          { text: 'dir -h', correct: false },
          { text: 'show *', correct: false },
        ],
      },
      {
        skill: 'Linux Fundamentals',
        difficulty: 'easy',
        text: 'Which command modifies file access permissions in Linux?',
        options: [
          { text: 'chmod', correct: true },
          { text: 'chown', correct: false },
          { text: 'passwd', correct: false },
          { text: 'perm', correct: false },
        ],
      },
      {
        skill: 'Linux Fundamentals',
        difficulty: 'medium',
        text: 'What does the standard stream file descriptor 2 represent in Linux/Unix?',
        options: [
          { text: 'Standard Error (stderr)', correct: true },
          { text: 'Standard Output (stdout)', correct: false },
          { text: 'Standard Input (stdin)', correct: false },
          { text: 'System Log (syslog)', correct: false },
        ],
      },
      {
        skill: 'Linux Fundamentals',
        difficulty: 'medium',
        text: 'Which command displays real-time running processes and CPU/memory utilization?',
        options: [
          { text: 'top (or htop)', correct: true },
          { text: 'ps -e', correct: false },
          { text: 'df -h', correct: false },
          { text: 'netstat', correct: false },
        ],
      },
      {
        skill: 'Linux Fundamentals',
        difficulty: 'hard',
        text: 'What does a sticky bit on a Linux directory (e.g. /tmp with permissions 1777) enforce?',
        options: [
          { text: 'Only the file owner or root can delete or rename files within the directory', correct: true },
          { text: 'Files inside execute automatically with root privileges', correct: false },
          { text: 'Subdirectories inherit group ownership automatically upon creation', correct: false },
          { text: 'Files cannot be edited once saved', correct: false },
        ],
      },

      // -----------------------------------------------------------------------
      // CLOUD COMPUTING FUNDAMENTALS
      // -----------------------------------------------------------------------
      {
        skill: 'Cloud Computing Fundamentals',
        difficulty: 'easy',
        text: 'Which cloud service model provides virtual machines, networking, and raw storage?',
        options: [
          { text: 'IaaS (Infrastructure as a Service)', correct: true },
          { text: 'PaaS (Platform as a Service)', correct: false },
          { text: 'SaaS (Software as a Service)', correct: false },
          { text: 'FaaS (Function as a Service)', correct: false },
        ],
      },
      {
        skill: 'Cloud Computing Fundamentals',
        difficulty: 'easy',
        text: 'What does "Elasticity" mean in cloud computing?',
        options: [
          { text: 'The ability to dynamically provision and de-provision computing resources according to workload demand', correct: true },
          { text: 'Guaranteed 100% network uptime without maintenance outages', correct: false },
          { text: 'Migrating data between cloud providers without protocol conversion', correct: false },
          { text: 'Storing backups in physical tape drives offsite', correct: false },
        ],
      },
      {
        skill: 'Cloud Computing Fundamentals',
        difficulty: 'medium',
        text: 'What is a Cloud Availability Zone (AZ)?',
        options: [
          { text: 'One or more discrete physical data centers with redundant power, networking, and cooling in a region', correct: true },
          { text: 'A software container running Kubernetes pods across countries', correct: false },
          { text: 'A virtual private network connecting an on-premises office to the cloud', correct: false },
          { text: 'A legal jurisdiction for compliance data storage', correct: false },
        ],
      },
      {
        skill: 'Cloud Computing Fundamentals',
        difficulty: 'medium',
        text: 'What does the "Shared Responsibility Model" dictate regarding customer data security in public clouds?',
        options: [
          { text: 'The cloud provider secures the cloud infrastructure; the customer secures data and access configurations in the cloud', correct: true },
          { text: 'The cloud provider takes 100% legal and operational responsibility for customer data leaks', correct: false },
          { text: 'Customers are responsible for replacing failed physical hard drives in cloud data centers', correct: false },
          { text: 'Security is handled entirely by third party cyber insurance companies', correct: false },
        ],
      },
      {
        skill: 'Cloud Computing Fundamentals',
        difficulty: 'hard',
        text: 'What is the main characteristic of Serverless architecture (e.g. AWS Lambda, Google Cloud Functions)?',
        options: [
          { text: 'Event-driven compute where code runs on demand with automated scaling and zero cost while idle', correct: true },
          { text: 'Web applications running on dedicated physical hardware without an operating system', correct: false },
          { text: 'Databases that do not store state on permanent storage', correct: false },
          { text: 'APIs that do not require DNS routing or SSL certificates', correct: false },
        ],
      },

      // -----------------------------------------------------------------------
      // DOCKER AND CONTAINERIZATION
      // -----------------------------------------------------------------------
      {
        skill: 'Docker and Containerization',
        difficulty: 'easy',
        text: 'What is the fundamental difference between a Docker container and a Virtual Machine?',
        options: [
          { text: 'Containers share the host OS kernel and are lightweight; VMs run a full guest OS on a hypervisor', correct: true },
          { text: 'Containers require dedicated hardware chips while VMs run in software', correct: false },
          { text: 'VMs start in milliseconds whereas containers take several minutes', correct: false },
          { text: 'Containers cannot communicate over network sockets', correct: false },
        ],
      },
      {
        skill: 'Docker and Containerization',
        difficulty: 'easy',
        text: 'Which Docker command lists all currently running containers?',
        options: [
          { text: 'docker ps', correct: true },
          { text: 'docker images', correct: false },
          { text: 'docker run', correct: false },
          { text: 'docker status', correct: false },
        ],
      },
      {
        skill: 'Docker and Containerization',
        difficulty: 'medium',
        text: 'In a Dockerfile, what is the difference between RUN and CMD instructions?',
        options: [
          { text: 'RUN executes during image build to create layers; CMD defines default execution when the container starts', correct: true },
          { text: 'RUN is only for Windows containers; CMD is for Linux', correct: false },
          { text: 'CMD installs packages; RUN exposes network ports', correct: false },
          { text: 'There is no difference; they are interchangeable', correct: false },
        ],
      },
      {
        skill: 'Docker and Containerization',
        difficulty: 'medium',
        text: 'What is a Docker Volume used for?',
        options: [
          { text: 'Persisting data generated by containers independently of container lifecycle', correct: true },
          { text: 'Increasing audio volume inside GUI Linux containers', correct: false },
          { text: 'Compressing Docker images for faster Docker Hub uploads', correct: false },
          { text: 'Allocating additional CPU cores to the Docker daemon', correct: false },
        ],
      },
      {
        skill: 'Docker and Containerization',
        difficulty: 'hard',
        text: 'What is Docker Multi-stage building primarily used for?',
        options: [
          { text: 'Minimizing final production image size by separating build tools from runtime artifacts', correct: true },
          { text: 'Running tests across multiple cloud platforms simultaneously', correct: false },
          { text: 'Deploying containers to multi-region Kubernetes clusters automatically', correct: false },
          { text: 'Running Docker containers inside other Docker containers', correct: false },
        ],
      },

      // -----------------------------------------------------------------------
      // SOFTWARE TESTING FUNDAMENTALS
      // -----------------------------------------------------------------------
      {
        skill: 'Software Testing Fundamentals',
        difficulty: 'easy',
        text: 'What is Regression Testing?',
        options: [
          { text: 'Re-running existing test suites to ensure recent code changes have not broken existing functionality', correct: true },
          { text: 'Testing code performance under extreme load conditions', correct: false },
          { text: 'Testing software without looking at the internal source code', correct: false },
          { text: 'Simulating security penetration attacks on endpoints', correct: false },
        ],
      },
      {
        skill: 'Software Testing Fundamentals',
        difficulty: 'easy',
        text: 'What is the focus of Unit Testing?',
        options: [
          { text: 'Testing individual functions, methods, or isolated modules in isolation', correct: true },
          { text: 'Testing user login flows across multiple microservices and databases', correct: false },
          { text: 'Validating browser UI responsiveness across mobile devices', correct: false },
          { text: 'Measuring server network latency during peak hours', correct: false },
        ],
      },
      {
        skill: 'Software Testing Fundamentals',
        difficulty: 'medium',
        text: 'What is Boundary Value Analysis (BVA) in test case design?',
        options: [
          { text: 'Testing input values at the extreme limits (edges) of valid and invalid partitions', correct: true },
          { text: 'Measuring memory consumption when allocating huge buffers', correct: false },
          { text: 'Ensuring database foreign keys reference existing primary keys', correct: false },
          { text: 'Testing application firewall perimeter configurations', correct: false },
        ],
      },
      {
        skill: 'Software Testing Fundamentals',
        difficulty: 'medium',
        text: 'What is the difference between Black-Box and White-Box testing?',
        options: [
          { text: 'Black-box tests specifications without internal code visibility; white-box tests internal structure and logic paths', correct: true },
          { text: 'Black-box is manual; white-box is fully automated', correct: false },
          { text: 'Black-box is done by developers; white-box is done by end users', correct: false },
          { text: 'Black-box is for frontend only; white-box is for backend only', correct: false },
        ],
      },
      {
        skill: 'Software Testing Fundamentals',
        difficulty: 'hard',
        text: 'In automated testing, what is the role of a Mock object?',
        options: [
          { text: 'A simulated dependency with programmed expectations and verified interactions for isolated unit testing', correct: true },
          { text: 'A fake user account used for testing on staging servers', correct: false },
          { text: 'A production database replica used for stress testing', correct: false },
          { text: 'A browser plugin that intercepts HTTP requests', correct: false },
        ],
      },

      // -----------------------------------------------------------------------
      // WEB APPLICATION SECURITY
      // -----------------------------------------------------------------------
      {
        skill: 'Web Application Security',
        difficulty: 'easy',
        text: 'What type of vulnerability occurs when untrusted user input is directly concatenated into an SQL query?',
        options: [
          { text: 'SQL Injection (SQLi)', correct: true },
          { text: 'Cross-Site Scripting (XSS)', correct: false },
          { text: 'Cross-Site Request Forgery (CSRF)', correct: false },
          { text: 'Denial of Service (DoS)', correct: false },
        ],
      },
      {
        skill: 'Web Application Security',
        difficulty: 'easy',
        text: 'What is Cross-Site Scripting (XSS)?',
        options: [
          { text: 'An attack where malicious JavaScript is injected and executed in the victim\'s browser', correct: true },
          { text: 'An attack that steals server SSL private certificates', correct: false },
          { text: 'Overloading backend servers with synchronous HTTP requests', correct: false },
          { text: 'Modifying database foreign keys without permission', correct: false },
        ],
      },
      {
        skill: 'Web Application Security',
        difficulty: 'medium',
        text: 'Why should passwords NEVER be stored in plain text or simple MD5/SHA256 hashes in a database?',
        options: [
          { text: 'Plain text is vulnerable to leaks; fast hashes are easily broken using precomputed rainbow tables; salted bcrypt/argon2 slows brute force', correct: true },
          { text: 'Relational databases do not support text columns longer than 32 characters', correct: false },
          { text: 'SQL syntax errors occur when querying strings with special characters', correct: false },
          { text: 'HTTP protocols reject unhashed header values automatically', correct: false },
        ],
      },
      {
        skill: 'Web Application Security',
        difficulty: 'medium',
        text: 'What is the purpose of the Same-Origin Policy (SOP) in modern web browsers?',
        options: [
          { text: 'Restricts scripts on one origin from accessing sensitive DOM or cookie resources on a different origin', correct: true },
          { text: 'Enforces that all web pages must be hosted on Apache servers', correct: false },
          { text: 'Requires backend APIs to use HTTPS instead of HTTP', correct: false },
          { text: 'Prevents developers from opening browser developer tools', correct: false },
        ],
      },
      {
        skill: 'Web Application Security',
        difficulty: 'hard',
        text: 'What security flag on an HTTP cookie prevents client-side JavaScript from accessing it via document.cookie?',
        options: [
          { text: 'HttpOnly', correct: true },
          { text: 'Secure', correct: false },
          { text: 'SameSite=Strict', correct: false },
          { text: 'Domain', correct: false },
        ],
      },

      // -----------------------------------------------------------------------
      // PYTHON FUNDAMENTALS
      // -----------------------------------------------------------------------
      {
        skill: 'Python Fundamentals',
        difficulty: 'easy',
        text: 'Which data type in Python is ordered, mutable, and allows duplicate elements?',
        options: [
          { text: 'List', correct: true },
          { text: 'Tuple', correct: false },
          { text: 'Set', correct: false },
          { text: 'Dictionary keys', correct: false },
        ],
      },
      {
        skill: 'Python Fundamentals',
        difficulty: 'easy',
        text: 'How do you define a function in Python?',
        options: [
          { text: 'def function_name():', correct: true },
          { text: 'function function_name() {}', correct: false },
          { text: 'fun function_name() -> void', correct: false },
          { text: 'create function_name():', correct: false },
        ],
      },
      {
        skill: 'Python Fundamentals',
        difficulty: 'medium',
        text: 'What is the Global Interpreter Lock (GIL) in CPython?',
        options: [
          { text: 'A mutex that prevents multiple native threads from executing Python bytecodes simultaneously', correct: true },
          { text: 'A file lock that protects SQLite databases from corruption', correct: false },
          { text: 'A security mechanism that stops unauthorized script downloads', correct: false },
          { text: 'A compiler optimization that speeds up mathematical loops', correct: false },
        ],
      },
      {
        skill: 'Python Fundamentals',
        difficulty: 'medium',
        text: 'What is the difference between a list and a tuple in Python?',
        options: [
          { text: 'Lists are mutable; tuples are immutable', correct: true },
          { text: 'Lists can only store numbers; tuples store strings', correct: false },
          { text: 'Tuples support append() while lists do not', correct: false },
          { text: 'There is no difference in syntax or behavior', correct: false },
        ],
      },
      {
        skill: 'Python Fundamentals',
        difficulty: 'hard',
        text: 'What is a generator in Python and which keyword is used to yield values lazily?',
        options: [
          { text: 'A function that produces an iterator producing values on demand using the "yield" keyword', correct: true },
          { text: 'A class constructor that preallocates fixed memory using "alloc"', correct: false },
          { text: 'A built-in decorator that transforms synchronous methods to async using "await"', correct: false },
          { text: 'A subprocess manager executing tasks using "fork"', correct: false },
        ],
      },
    ];

    let insertedQCount = 0;
    for (const q of questionsData) {
      const sId = skillIds[q.skill];
      if (!sId) continue;

      // Check if question already exists for this skill
      const existingQ = await client.query(
        `SELECT id FROM questions WHERE skill_id = $1 AND question_text = $2`,
        [sId, q.text]
      );

      let questionId;
      if (existingQ.rows.length > 0) {
        questionId = existingQ.rows[0].id;
        // Ensure options exist
        const opts = await client.query('SELECT COUNT(*) FROM question_options WHERE question_id = $1', [questionId]);
        if (parseInt(opts.rows[0].count) === 0) {
          for (let i = 0; i < q.options.length; i++) {
            const opt = q.options[i];
            await client.query(
              `INSERT INTO question_options (question_id, option_text, is_correct, display_order)
               VALUES ($1, $2, $3, $4)`,
              [questionId, opt.text, opt.correct, i + 1]
            );
          }
        }
      } else {
        const qRes = await client.query(
          `INSERT INTO questions (skill_id, question_text, difficulty, is_active)
           VALUES ($1, $2, $3, true) RETURNING id`,
          [sId, q.text, q.difficulty]
        );
        questionId = qRes.rows[0].id;

        for (let i = 0; i < q.options.length; i++) {
          const opt = q.options[i];
          await client.query(
            `INSERT INTO question_options (question_id, option_text, is_correct, display_order)
             VALUES ($1, $2, $3, $4)`,
            [questionId, opt.text, opt.correct, i + 1]
          );
        }
        insertedQCount++;
      }
    }

    // =========================================================================
    // 6. DEFAULT DEMONSTRATION STUDENT ACCOUNT (Fictional Review Account)
    // =========================================================================
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('Student123!', salt);
    const demoUserRes = await client.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ('student@college.edu', $1, 'student')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id`,
      [demoPasswordHash]
    );

    const demoUserId = demoUserRes.rows[0].id;
    const seRoleId = roleIds['Software Engineer'];

    await client.query(
      `INSERT INTO student_profiles (user_id, full_name, roll_number, branch, batch_year, target_role_id, cgpa, profile_completed)
       VALUES ($1, 'Aarav Sharma', '21CS101', 'Computer Science', 2025, $2, 8.6, true)
       ON CONFLICT (user_id) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         target_role_id = EXCLUDED.target_role_id,
         profile_completed = true`,
      [demoUserId, seRoleId]
    );

    await client.query('COMMIT');
    console.log(`Core demonstration data seeded successfully.`);
    console.log(`- Roles: 10 active industry pathways`);
    console.log(`- Skills: ${Object.keys(skillIds).length} catalogued skills`);
    console.log(`- Questions: ${questionsData.length} interview MCQs verified`);
    console.log(`- Demo Account: student@college.edu / Student123! (Target: Software Engineer)`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Core data seed failed:', err);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

seed();
