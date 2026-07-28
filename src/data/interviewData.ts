import { 
  CompanyInterviewProfile, 
  CodingProblemItem, 
  SystemDesignTopic, 
  BehavioralQuestionItem, 
  StudyPlanConfig, 
  AchievementItem,
  InterviewDomain,
  InterviewLevel,
  InterviewMode
} from '../types';

// ==========================================
// 1. COMPANY INTERVIEW PROFILES (21+ Top Tier)
// ==========================================
export const companyInterviewProfiles: CompanyInterviewProfile[] = [
  {
    id: 'google',
    name: 'Google',
    logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&q=80&w=120',
    category: 'FAANG / Big Tech',
    estimatedDifficulty: 'Hard',
    salaryRange: '$165,000 - $340,000 / yr',
    hiringTimeline: '4 - 6 Weeks',
    techStack: ['C++', 'Python', 'Go', 'Java', 'Borg', 'Bigtable', 'Angular', 'Kubernetes'],
    overview: 'Google interview process emphasizes strong algorithmic fundamentals, clean code, large-scale system design, and Googleyness leadership principles.',
    interviewStages: [
      'Recruiter Screen (30 mins)',
      'Technical Phone Screen / Coding (45 mins)',
      'Onsite Round 1: Coding & Data Structures (45 mins)',
      'Onsite Round 2: Advanced Coding / Algorithms (45 mins)',
      'Onsite Round 3: System Design & Architecture (45 mins)',
      'Onsite Round 4: Leadership & Googleyness (45 mins)'
    ],
    questionTypes: ['Algorithms', 'System Design', 'Behavioral (Googleyness)', 'Concurrency'],
    codingFocus: ['Dynamic Programming', 'Graphs (BFS/DFS)', 'Trees & Tries', 'Sliding Window', 'Two Pointers'],
    behaviouralFocus: ['Handling Ambiguity', 'Bias for Action', 'Collaboration Across Teams', 'Navigating Failure'],
    faqs: [
      { question: 'Does Google allow any coding language?', answer: 'Yes, Python, C++, Java, and Go are preferred. JavaScript/TypeScript is accepted for Frontend roles.' },
      { question: 'What is Googleyness?', answer: 'It is a combination of intellectual humility, doing the right thing, striving for excellence, and collaborative team focus.' }
    ],
    prepTips: [
      'Focus heavily on time & space complexity analysis (Big-O).',
      'Talk out loud continuously during coding problems.',
      'Practice whiteboard/blank doc coding without syntax auto-complete.'
    ],
    prepChecklist: [
      { id: 'c1', task: 'Solve top 25 Google tagged LeetCode Medium/Hard problems', completed: true },
      { id: 'c2', task: 'Review System Design principles (MapReduce, GFS, Bigtable paper basics)', completed: false },
      { id: 'c3', task: 'Prepare 5 STAR stories demonstrating Googleyness', completed: false },
      { id: 'c4', task: 'Complete 2 full mock interviews under timed constraints', completed: false }
    ]
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: 'https://images.unsplash.com/photo-1642132652859-3ef5a1048fd1?auto=format&fit=crop&q=80&w=120',
    category: 'Big Tech',
    estimatedDifficulty: 'Medium-Hard',
    salaryRange: '$145,000 - $290,000 / yr',
    hiringTimeline: '3 - 5 Weeks',
    techStack: ['C#', '.NET', 'TypeScript', 'React', 'Azure', 'C++', 'SQL Server'],
    overview: 'Microsoft focuses on practical problem solving, object-oriented design, customer obsession, and collaboration across multi-disciplinary engineering groups.',
    interviewStages: [
      'Recruiter Screening (30 mins)',
      'Online Assessment / Technical Screen (60 mins)',
      'Onsite Final Loop: 4 Rounds (Coding, OOD, System Design, Behavioral/As-If)'
    ],
    questionTypes: ['Data Structures', 'Object-Oriented Design', 'System Architecture', 'Behavioral'],
    codingFocus: ['Arrays & Strings', 'Linked Lists', 'Binary Trees', 'Hash Tables', 'Recursion'],
    behaviouralFocus: ['Growth Mindset', 'Customer Obsession', 'One Microsoft Collaboration'],
    faqs: [
      { question: 'Is C# mandatory for Microsoft interviews?', answer: 'No, candidates can code in C++, Java, Python, or TypeScript.' }
    ],
    prepTips: [
      'Emphasize edge cases and code readability.',
      'Highlight growth mindset and learning from past engineering mistakes.'
    ],
    prepChecklist: [
      { id: 'm1', task: 'Practice Object-Oriented Design patterns (Factory, Strategy, Observer)', completed: true },
      { id: 'm2', task: 'Solve Microsoft tagged tree & graph problems', completed: false }
    ]
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&q=80&w=120',
    category: 'FAANG / E-Commerce & Cloud',
    estimatedDifficulty: 'Hard',
    salaryRange: '$150,000 - $310,000 / yr',
    hiringTimeline: '3 - 4 Weeks',
    techStack: ['Java', 'AWS', 'Python', 'React', 'DynamoDB', 'Distributed Systems'],
    overview: 'Amazon heavily tests the 16 Leadership Principles (LPs) in every single round alongside algorithmic coding and distributed system scale.',
    interviewStages: [
      'Online Assessment (2 Coding Questions + Work Style Survey)',
      'Phone Technical Screen (45 mins)',
      'The Bar Raiser Onsite Loop (4-5 rounds, each with 20m LP questions + 30m Tech)'
    ],
    questionTypes: ['Leadership Principles (LPs)', 'Data Structures', 'System Design (AWS)', 'OOD'],
    codingFocus: ['Trees & Graphs', 'Heaps / Priority Queues', 'BFS/DFS', 'Dynamic Programming'],
    behaviouralFocus: ['Customer Obsession', 'Ownership', 'Dive Deep', 'Deliver Results', 'Bias for Action'],
    faqs: [
      { question: 'How important are the Leadership Principles?', answer: 'They account for 50% of your evaluation score across all rounds!' }
    ],
    prepTips: [
      'Prepare 2 distinct STAR stories for EACH of the 16 Leadership Principles.',
      'Use quantitative metrics (%, $, latency, throughput) in every result statement.'
    ],
    prepChecklist: [
      { id: 'a1', task: 'Map out 10 detailed STAR stories with metrics', completed: true },
      { id: 'a2', task: 'Practice Amazon LP behavioural questions with AI Coach', completed: false }
    ]
  },
  {
    id: 'meta',
    name: 'Meta',
    logo: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=120',
    category: 'FAANG / Social & AI',
    estimatedDifficulty: 'Hard',
    salaryRange: '$170,000 - $360,000 / yr',
    hiringTimeline: '3 - 5 Weeks',
    techStack: ['Python', 'C++', 'Hack/PHP', 'React', 'PyTorch', 'GraphQL', 'Presto'],
    overview: 'Meta technical rounds require fast, clean execution (solving 2 coding questions in 45 mins) and scalable architectural design.',
    interviewStages: [
      'Technical Screening (45 mins: 2 Coding problems)',
      'Onsite Round 1: Coding Speed & Accuracy (45 mins)',
      'Onsite Round 2: Coding Speed & Edge cases (45 mins)',
      'Onsite Round 3: Product Architecture / System Design (45 mins)',
      'Onsite Round 4: Behavioral & Culture (45 mins)'
    ],
    questionTypes: ['Fast Algorithmic Coding', 'Product Architecture', 'Behavioral'],
    codingFocus: ['Binary Search', 'Sliding Window', 'Topological Sort', 'Arrays & Hash Maps'],
    behaviouralFocus: ['Move Fast', 'Be Bold', 'Build Awesome Things', 'Focus on Impact'],
    faqs: [
      { question: 'How fast do I need to code for Meta?', answer: 'You should aim to solve 2 Medium/Hard coding questions in under 40 minutes total.' }
    ],
    prepTips: [
      'Speed and bug-free code on the first attempt are paramount.',
      'Memorize standard template setups for BFS, DFS, and Binary Search.'
    ],
    prepChecklist: [
      { id: 'meta1', task: 'Complete Meta top 50 tagged problems under 15m time limit each', completed: false }
    ]
  },
  {
    id: 'apple',
    name: 'Apple',
    logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=120',
    category: 'FAANG / Hardware & Software',
    estimatedDifficulty: 'Hard',
    salaryRange: '$160,000 - $330,000 / yr',
    hiringTimeline: '4 - 6 Weeks',
    techStack: ['Swift', 'Objective-C', 'C++', 'Python', 'Java', 'Metal', 'iOS/macOS'],
    overview: 'Apple team-based hiring focuses deeply on domain excellence, craftsmanship, performance optimization, and secrecy.',
    interviewStages: [
      'Recruiter Call',
      'Technical Screen (1-2 rounds)',
      'Onsite Loop (5-6 1-on-1 rounds with individual team members)'
    ],
    questionTypes: ['Domain Deep Dives', 'Data Structures', 'Low Level Design', 'Behavioral'],
    codingFocus: ['Pointers & Memory', 'Trees & Graphs', 'Bit Manipulation', 'Concurrency'],
    behaviouralFocus: ['Attention to Detail', 'Obsession with Quality', 'Cross-functional Execution'],
    faqs: [{ question: 'Are Apple interviews standardized?', answer: 'No, every Apple team designs its own specific interview loop.' }],
    prepTips: ['Research the specific Apple team and product domain thoroughly.'],
    prepChecklist: [{ id: 'app1', task: 'Review low-level C++/Swift memory management and OS concepts', completed: false }]
  },
  {
    id: 'netflix',
    name: 'Netflix',
    logo: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=120',
    category: 'FAANG / Streaming',
    estimatedDifficulty: 'Hard',
    salaryRange: '$220,000 - $450,000 / yr (All Cash)',
    hiringTimeline: '3 - 5 Weeks',
    techStack: ['Java', 'Node.js', 'React', 'AWS', 'Cassandra', 'Kafka', 'Microservices'],
    overview: 'Netflix looks for senior talent aligned with their famous Culture Memo: Freedom & Responsibility, Context Not Control, and High Density of Talent.',
    interviewStages: ['Recruiter Screen', 'Technical Screen', 'Onsite Round 1 (Technical & System Design)', 'Onsite Round 2 (Culture & Leadership with VPs)'],
    questionTypes: ['System Design', 'Architecture & Reliability', 'Culture Alignment'],
    codingFocus: ['Distributed Caching', 'Concurrency', 'Resilience Patterns', 'API Gateway Design'],
    behaviouralFocus: ['Freedom & Responsibility', 'Stunning Colleagues', 'Highly Aligned, Loosely Coupled'],
    faqs: [{ question: 'Is Netflix salary really all cash?', answer: 'Yes! Netflix offers top-of-market compensation in 100% liquid cash.' }],
    prepTips: ['Read the Netflix Culture Deck / Memo 3 times over.'],
    prepChecklist: [{ id: 'n1', task: 'Read and take notes on the Netflix Culture Memo', completed: true }]
  },
  {
    id: 'uber',
    name: 'Uber',
    logo: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&q=80&w=120',
    category: 'Ride Sharing / Logistics',
    estimatedDifficulty: 'Hard',
    salaryRange: '$155,000 - $310,000 / yr',
    hiringTimeline: '3 - 4 Weeks',
    techStack: ['Go', 'Java', 'Python', 'React', 'Kafka', 'Geospatial / H3', 'MySQL'],
    overview: 'Uber focuses on high-concurrency real-time systems, geospatial indexing (H3), state machine routing, and algorithmic efficiency.',
    interviewStages: ['Recruiter Call', 'Technical Phone Screen', 'Onsite Loop: 2 Coding, 1 Architecture, 1 Managerial'],
    questionTypes: ['Algorithms', 'Geospatial System Design', 'Concurrency & Locks'],
    codingFocus: ['Graphs (Dijkstra, A*)', 'Heaps', 'Interval Overlaps', 'Segment Trees'],
    behaviouralFocus: ['Go the Extra Mile', 'Great Minds Don’t Think Alike', 'Customer First'],
    faqs: [{ question: 'Are geospatial algorithms tested?', answer: 'Yes, spatial hashing and map routing are common design topics.' }],
    prepTips: ['Practice designing real-time matching and dispatch systems.'],
    prepChecklist: [{ id: 'ub1', task: 'Study Uber H3 spatial index & QuadTree structures', completed: false }]
  },
  {
    id: 'adobe',
    name: 'Adobe',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
    category: 'Enterprise & Creative Cloud',
    estimatedDifficulty: 'Medium-Hard',
    salaryRange: '$140,000 - $275,000 / yr',
    hiringTimeline: '3 - 4 Weeks',
    techStack: ['C++', 'Java', 'JavaScript', 'React', 'Node.js', 'AWS', 'C++ WebAssembly'],
    overview: 'Adobe interviews test data structures, graphics algorithms, web performance, and cloud microservices.',
    interviewStages: ['Online Test (Codility/Hackerrank)', 'Technical Phone Screen', 'Onsite 3-4 Rounds'],
    questionTypes: ['Coding', 'OO Design', 'Web Architecture', 'HR'],
    codingFocus: ['Arrays', 'Matrix / 2D Grids', 'Trees', 'String Parsing'],
    behaviouralFocus: ['Creativity & Innovation', 'Genuine Collaboration', 'Exceptional Experiences'],
    faqs: [{ question: 'Does Adobe ask graphics math?', answer: 'For Document/Creative Cloud teams, basic matrix transforms & rendering concepts are pluses.' }],
    prepTips: ['Practice matrix traversal and string manipulation problems.'],
    prepChecklist: [{ id: 'ad1', task: 'Solve Adobe top array & tree questions on LeetCode', completed: false }]
  },
  {
    id: 'atlassian',
    name: 'Atlassian',
    logo: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=120',
    category: 'Enterprise SaaS',
    estimatedDifficulty: 'Medium-Hard',
    salaryRange: '$140,000 - $280,000 / yr',
    hiringTimeline: '3 - 4 Weeks',
    techStack: ['Java', 'Kotlin', 'TypeScript', 'React', 'AWS', 'GraphQL'],
    overview: 'Atlassian emphasizes clean code, real-world rate limiting / data processing problems, and values alignment.',
    interviewStages: ['Recruiter Screen', 'Code Design / Pair Programming (1 hr)', 'Onsite Loop: System Design, Management, Values Round'],
    questionTypes: ['Code Design (Rate Limiter, Snake Game)', 'System Design', 'Values Round'],
    codingFocus: ['Design Data Structure (LRU Cache, File System)', 'Rate Limiters', 'Concurrency'],
    behaviouralFocus: ['Open Company, No BS', 'Build with Heart & Balance', 'Play as a Team'],
    faqs: [{ question: 'What is the Code Design round?', answer: 'It is a 60m hands-on exercise building a maintainable class with tests.' }],
    prepTips: ['Practice writing clean, testable object-oriented code live.'],
    prepChecklist: [{ id: 'atl1', task: 'Implement an in-memory Rate Limiter and LRU Cache in IDE', completed: true }]
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    logo: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&q=80&w=120',
    category: 'AI Infrastructure & Semiconductors',
    estimatedDifficulty: 'Hard',
    salaryRange: '$165,000 - $350,000 / yr',
    hiringTimeline: '4 - 6 Weeks',
    techStack: ['C++', 'CUDA', 'Python', 'PyTorch', 'TensorRT', 'Linux Kernel', 'C#'],
    overview: 'NVIDIA technical interviews focus heavily on parallel computing, GPU memory models, C++ efficiency, and AI workload acceleration.',
    interviewStages: ['Technical HR Screen', 'Coding & Systems Phone Screen', 'Onsite Loop 4-5 technical rounds'],
    questionTypes: ['C++ Deep Dive', 'Parallel Algorithms / CUDA', 'Systems Programming', 'AI Model Optimization'],
    codingFocus: ['Memory Management', 'Bitwise Tricks', 'Concurrency & Threads', 'Vectorization'],
    behaviouralFocus: ['Speed of Execution', 'Intellectual Rigor', 'Agile Teamwork'],
    faqs: [{ question: 'Do I need CUDA experience?', answer: 'For systems/AI infrastructure roles, C++ pointers and multithreading are essential.' }],
    prepTips: ['Brush up on C++ smart pointers, cash coherency, and thread locks.'],
    prepChecklist: [{ id: 'nv1', task: 'Review C++17/20 memory model and multi-threading primitives', completed: false }]
  },
  {
    id: 'oracle',
    name: 'Oracle',
    logo: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=120',
    category: 'Cloud Infrastructure & Enterprise Database',
    estimatedDifficulty: 'Medium-Hard',
    salaryRange: '$135,000 - $260,000 / yr',
    hiringTimeline: '3 - 4 Weeks',
    techStack: ['Java', 'C++', 'OCI (Oracle Cloud)', 'SQL', 'Python', 'Kubernetes'],
    overview: 'Oracle Cloud Infrastructure (OCI) tests core distributed storage, networking, database engine internals, and Java performance.',
    interviewStages: ['Recruiter Screen', 'Online Test / Tech Screen', 'Onsite 4 Rounds (Coding, Design, Managerial)'],
    questionTypes: ['Coding', 'Distributed Storage Design', 'Database Queries'],
    codingFocus: ['Trees & Graphs', 'System Threads', 'Stack/Queue implementations'],
    behaviouralFocus: ['Customer First', 'Integrity', 'Drive for Execution'],
    faqs: [{ question: 'Is OCI hiring aggressively?', answer: 'Yes, Oracle Cloud Infrastructure is expanding fast.' }],
    prepTips: ['Study OS primitives, virtual memory, and distributed file systems.'],
    prepChecklist: [{ id: 'orc1', task: 'Practice OS thread synchronization and database B-Trees', completed: false }]
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=120',
    category: 'Fintech & Payments',
    estimatedDifficulty: 'Medium-Hard',
    salaryRange: '₹22 - ₹48 LPA',
    hiringTimeline: '2 - 3 Weeks',
    techStack: ['PHP', 'Go', 'Node.js', 'React', 'AWS', 'MySQL', 'Redis', 'Kafka'],
    overview: 'Razorpay evaluates payment gateway transactional resilience, rate limiters, distributed ledger consistency, and high-availability design.',
    interviewStages: ['Machine Coding Round (2 hrs)', 'Technical Architecture Round (1 hr)', 'Engineering Manager / Culture Round (1 hr)'],
    questionTypes: ['Machine Coding (Clean Architecture)', 'System Design (Payments/Ledgers)', 'Behavioral'],
    codingFocus: ['Machine Coding / Clean Code', 'Concurrency Locks', 'Idempotency Keys'],
    behaviouralFocus: ['Bias for Action', 'Transparency', 'Customer Obsession'],
    faqs: [{ question: 'What is the Machine Coding round?', answer: 'You build a working functional module with clean OOP, error handling, and test cases in 120 mins.' }],
    prepTips: ['Practice building a fully working CLI or Express server with OOP structure in 2 hours.'],
    prepChecklist: [{ id: 'rz1', task: 'Practice machine coding problem: Design a Payment Gateway Ledger', completed: true }]
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=120',
    category: 'Fintech & UPI Payments',
    estimatedDifficulty: 'Hard',
    salaryRange: '₹25 - ₹55 LPA',
    hiringTimeline: '2 - 3 Weeks',
    techStack: ['Java', 'Spring Boot', 'HBase', 'Kafka', 'Aerospike', 'React Native'],
    overview: 'PhonePe tests ultra-high throughput payment settlement pipelines, Machine Coding, Low Level Design (LLD), and High Level Design (HLD).',
    interviewStages: ['Machine Coding (2.5 hrs)', 'LLD / Code Walkthrough', 'HLD / Distributed Systems', 'HM / HR Round'],
    questionTypes: ['Machine Coding', 'Low Level Design', 'High Level Design'],
    codingFocus: ['Design Patterns', 'Concurrency & Deadlocks', 'Cache Invalidation'],
    behaviouralFocus: ['Ownership', 'Bold Thinking', 'Speed & Detail'],
    faqs: [{ question: 'Is PhonePe machine coding strict on design patterns?', answer: 'Yes! SOLID principles and clean extensibility are mandatory.' }],
    prepTips: ['Master Factory, Strategy, Singleton, and Command design patterns.'],
    prepChecklist: [{ id: 'pp1', task: 'Implement SOLID design patterns in Java/TypeScript', completed: true }]
  },
  {
    id: 'tcs',
    name: 'TCS (Digital / Prime)',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=120',
    category: 'IT Services & Consulting',
    estimatedDifficulty: 'Medium',
    salaryRange: '₹7 - ₹12 LPA (Digital / Prime)',
    hiringTimeline: '2 - 3 Weeks',
    techStack: ['Java', 'Python', 'C++', 'SQL', 'Web Technologies', 'Cloud Basics'],
    overview: 'TCS NQT and Digital rounds assess quantitative aptitude, core DSA coding, relational SQL queries, and basic software engineering principles.',
    interviewStages: ['TCS NQT / Digital Online Assessment', 'Technical Interview', 'MR & HR Interview'],
    questionTypes: ['Aptitude & Reasoning', 'Coding (2 problems)', 'SQL & OOP Fundamentals'],
    codingFocus: ['Strings & Arrays', 'Sorting & Searching', 'Recursion', 'Basic Math / Prime Series'],
    behaviouralFocus: ['Adaptability', 'Communication', 'Teamwork'],
    faqs: [{ question: 'What is the difference between Ninja and Digital?', answer: 'Digital and Prime candidates solve harder coding problems and receive significantly higher packages.' }],
    prepTips: ['Master speed aptitude shortcuts and clean array/string logic.'],
    prepChecklist: [{ id: 'tcs1', task: 'Solve top 30 TCS NQT previous year coding questions', completed: false }]
  },
  {
    id: 'infosys',
    name: 'Infosys (Power Programmer)',
    logo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=120',
    category: 'IT Services & Consulting',
    estimatedDifficulty: 'Medium-Hard',
    salaryRange: '₹9 - ₹18 LPA (Specialist Programmer)',
    hiringTimeline: '2 - 3 Weeks',
    techStack: ['Java', 'Python', 'Spring', 'React', 'Database Design'],
    overview: 'Infosys HackWithInfy / Specialist Programmer rounds require strong algorithmic problem solving in Dynamic Programming, Graphs, and Greedy heuristics.',
    interviewStages: ['HackWithInfy Online Coding', 'Technical Interview (Coding & DBMS)', 'HR Round'],
    questionTypes: ['Algorithmic Coding', 'Database DBMS', 'OOPs & OS'],
    codingFocus: ['Dynamic Programming', 'Graph Shortest Paths', 'Trees'],
    behaviouralFocus: ['Flexibility', 'Client Focus', 'Continuous Learning'],
    faqs: [{ question: 'How many coding questions in HackWithInfy?', answer: '3 competitive programming problems of increasing difficulty.' }],
    prepTips: ['Practice DP on grids and graph traversal problems.'],
    prepChecklist: [{ id: 'inf1', task: 'Solve DP and Graph problems on LeetCode Medium', completed: false }]
  }
];

// ==========================================
// 2. CODING PRACTICE PROBLEMS (14 Categories)
// ==========================================
export const sampleCodingProblems: CodingProblemItem[] = [
  {
    id: 'p1',
    title: 'Two Sum',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    problemDescription: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
    initialCode: `function twoSum(nums, target) {\n  // Write your code here\n};`,
    solutionCode: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n};`,
    hints: ['Can you use a Hash Map to check for complement values in O(1) time?'],
    aiExplanation: 'By iterating through the array once and storing each element along with its index in a hash map, we can check if the complement (target - current) exists in O(1) constant time.',
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]' }
    ],
    status: 'unsolved'
  },
  {
    id: 'p2',
    title: 'Longest Substring Without Repeating Characters',
    category: 'Sliding Window',
    difficulty: 'Medium',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(min(N, M))',
    problemDescription: 'Given a string s, find the length of the longest substring without repeating characters.',
    initialCode: `function lengthOfLongestSubstring(s) {\n  // Write your code here\n};`,
    solutionCode: `function lengthOfLongestSubstring(s) {\n  let set = new Set();\n  let left = 0, maxLen = 0;\n  for (let right = 0; right < s.length; right++) {\n    while (set.has(s[right])) {\n      set.delete(s[left]);\n      left++;\n    }\n    set.add(s[right]);\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n};`,
    hints: ['Use the Sliding Window technique with two pointers (left and right) and a Set.'],
    aiExplanation: 'Maintain a window [left...right]. If duplicate character is encountered at right, shrink left until duplicate is restored.',
    testCases: [
      { input: 's = "abcabcbb"', expectedOutput: '3' },
      { input: 's = "bbbbb"', expectedOutput: '1' }
    ],
    status: 'unsolved'
  },
  {
    id: 'p3',
    title: 'Trapping Rain Water',
    category: 'Two Pointers',
    difficulty: 'Hard',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    problemDescription: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    initialCode: `function trap(height) {\n  // Write your code here\n};`,
    solutionCode: `function trap(height) {\n  let left = 0, right = height.length - 1;\n  let leftMax = 0, rightMax = 0, water = 0;\n  while (left < right) {\n    if (height[left] < height[right]) {\n      if (height[left] >= leftMax) leftMax = height[left];\n      else water += leftMax - height[left];\n      left++;\n    } else {\n      if (height[right] >= rightMax) rightMax = height[right];\n      else water += rightMax - height[right];\n      right--;\n    }\n  }\n  return water;\n};`,
    hints: ['Use two pointers moving inwards. Track leftMax and rightMax elevation bounds.'],
    aiExplanation: 'Water level above any bar is determined by min(leftMax, rightMax) - height[i]. Two pointers eliminate O(N) space auxiliary arrays.',
    testCases: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' }
    ],
    status: 'unsolved'
  },
  {
    id: 'p4',
    title: 'Coin Change',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    timeComplexity: 'O(amount * N)',
    spaceComplexity: 'O(amount)',
    problemDescription: 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount.',
    initialCode: `function coinChange(coins, amount) {\n  // Write your code here\n};`,
    solutionCode: `function coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let i = 1; i <= amount; i++) {\n    for (const coin of coins) {\n      if (i - coin >= 0) {\n        dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n      }\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n};`,
    hints: ['Use bottom-up dynamic programming. dp[i] represents minimum coins needed for sum i.'],
    aiExplanation: 'We build an array dp where dp[i] stores the minimum coins to make amount i. For each coin, dp[i] = min(dp[i], dp[i - coin] + 1).',
    testCases: [
      { input: 'coins = [1,2,5], amount = 11', expectedOutput: '3' },
      { input: 'coins = [2], amount = 3', expectedOutput: '-1' }
    ],
    status: 'unsolved'
  },
  {
    id: 'p5',
    title: 'Serialize and Deserialize Binary Tree',
    category: 'Trees',
    difficulty: 'Hard',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    problemDescription: 'Design an algorithm to serialize and deserialize a binary tree into a string format and back to the original tree structure.',
    initialCode: `function serialize(root) {\n  // Serialize tree to string\n}\nfunction deserialize(data) {\n  // Reconstruct tree from string\n}`,
    solutionCode: `function serialize(root) {\n  if (!root) return 'null';\n  return root.val + ',' + serialize(root.left) + ',' + serialize(root.right);\n}\nfunction deserialize(data) {\n  const nodes = data.split(',');\n  function build() {\n    const val = nodes.shift();\n    if (val === 'null') return null;\n    const node = { val: Number(val), left: null, right: null };\n    node.left = build();\n    node.right = build();\n    return node;\n  }\n  return build();\n}`,
    hints: ['Use pre-order traversal with delimiter "," and "null" markers for empty children.'],
    aiExplanation: 'Pre-order traversal preserves root-first ordering. When rebuilding, recursive calls consume array nodes sequentially.',
    testCases: [
      { input: 'root = [1,2,3,null,null,4,5]', expectedOutput: '[1,2,3,null,null,4,5]' }
    ],
    status: 'unsolved'
  }
];

// ==========================================
// 3. SYSTEM DESIGN MODULES
// ==========================================
export const systemDesignTopics: SystemDesignTopic[] = [
  {
    id: 'sd_load_balancing',
    title: 'Load Balancing & Traffic Distribution',
    category: 'Scalability',
    difficulty: 'Intermediate',
    description: 'Master L4 (Transport Layer) and L7 (Application Layer) load balancers, health checks, Round Robin, Least Connections, Consistent Hashing algorithms.',
    keyTradeoffs: [
      'L4 vs L7 Load Balancing: Speed vs Inspection depth',
      'Consistent Hashing vs Simple Ring Hashing for caching servers',
      'Hardware Load Balancer cost vs Software Load Balancers (HAProxy, NGINX, Envoy)'
    ],
    sampleQuestions: [
      'How would you distribute 1 million concurrent incoming HTTP/2 connections?',
      'Explain how Consistent Hashing minimizes cache misses when nodes join or fail.'
    ],
    aiExplanation: 'Load balancers act as the traffic gateway in modern microservices. Consistent Hashing limits key re-mapping to k/n keys when adding or removing cache nodes.'
  },
  {
    id: 'sd_caching',
    title: 'Caching Strategies & Redis Architecture',
    category: 'Caching',
    difficulty: 'Intermediate',
    description: 'In-depth exploration of Cache-Aside, Write-Through, Write-Behind (Write-Back), Cache Eviction policies (LRU, LFU, ARC), and Redis Sentinel/Cluster topologies.',
    keyTradeoffs: [
      'Cache-Aside vs Write-Through: Consistency vs Write latency',
      'Single-threaded Redis event loop vs Multi-threaded Memcached',
      'TTL expiration vs Memory Eviction limits'
    ],
    sampleQuestions: [
      'How do you prevent Cache Stampede (Thundering Herd) during key expiration under high traffic?',
      'Describe Redis Cluster slot hash partitioning across 10 master nodes.'
    ],
    aiExplanation: 'Caching reduces database read pressure by storing hot data in RAM. Using Mutex locks or Probabilistic Early Expiration avoids Cache Stampedes.'
  },
  {
    id: 'sd_databases',
    title: 'SQL vs NoSQL & Database Sharding',
    category: 'Databases',
    difficulty: 'Advanced',
    description: 'CAP Theorem, ACID vs BASE guarantees, Horizontal Sharding, Replication Lag, Multi-Master setups, and Cassandra vs PostgreSQL vs MongoDB benchmarking.',
    keyTradeoffs: [
      'RDBMS ACID consistency vs NoSQL High Availability & Partition Tolerance',
      'Range-based Sharding vs Hash-based Sharding hotspots',
      'Synchronous vs Asynchronous database replication latency'
    ],
    sampleQuestions: [
      'Design a sharding scheme for a global chat application with billions of messages.',
      'How does PostgreSQL handle MVCC (Multi-Version Concurrency Control)?'
    ],
    aiExplanation: 'When single-node database write bandwidth maxes out, horizontal sharding distributes partitions across nodes based on a Shard Key.'
  },
  {
    id: 'sd_queues',
    title: 'Message Queues & Event-Driven Architecture',
    category: 'Queues',
    difficulty: 'Intermediate',
    description: 'Decoupling services using Apache Kafka, RabbitMQ, and AWS SQS. At-least-once, At-most-once, and Exactly-once delivery semantics.',
    keyTradeoffs: [
      'Kafka Log Partitioning vs RabbitMQ AMQP exchange queues',
      'Exactly-once delivery performance overhead vs At-least-once with Idempotency',
      'Push vs Pull messaging model'
    ],
    sampleQuestions: [
      'Design an order processing pipeline that handles black Friday spikes reliably without dropping messages.',
      'How does Kafka guarantee message ordering within a single partition?'
    ],
    aiExplanation: 'Event streaming queues buffer asynchronous background tasks, preventing spikes in traffic from crashing downstream processing microservices.'
  }
];

// ==========================================
// 4. HR & BEHAVIORAL QUESTIONS
// ==========================================
export const sampleBehavioralQuestions: BehavioralQuestionItem[] = [
  {
    id: 'bh_1',
    category: 'Introductory',
    question: 'Tell me about yourself and your engineering background.',
    framework: 'Present -> Past -> Future + Unique Value Proposition',
    idealStructure: '1. Current Role & Core Highlights (60s)\n2. Past Key Experience & Big Achievements (60s)\n3. Why this company & immediate future goals (30s)'
  },
  {
    id: 'bh_2',
    category: 'Conflict & Leadership',
    question: 'Describe a time you had a technical disagreement with a teammate or lead. How did you resolve it?',
    framework: 'STAR (Situation, Task, Action, Result)',
    idealStructure: 'Focus on objective data, benchmarks, trade-off comparisons, professional empathy, and successful consensus.'
  },
  {
    id: 'bh_3',
    category: 'Failure & Resilience',
    question: 'Tell me about a project that failed or missed a critical production deadline. What did you learn?',
    framework: 'STAR + Root Cause Analysis + Retrospective Takeaways',
    idealStructure: 'Acknowledge accountability immediately, explain systemic fixes deployed post-incident, and show long-term process growth.'
  },
  {
    id: 'bh_4',
    category: 'Motivation & Vision',
    question: 'Why do you want to join our engineering team, and where do you see yourself in 5 years?',
    framework: 'Mission Alignment + Technical Mastery Path',
    idealStructure: 'Connect company mission to personal technical passions, demonstrating commitment to engineering craftsmanship and mentorship.'
  }
];

// ==========================================
// 5. STUDY PLANS (4 Config Options)
// ==========================================
export const studyPlansList: StudyPlanConfig[] = [
  {
    id: 'sp_7',
    days: 7,
    title: '7-Day High-Velocity Sprint',
    description: 'Rapid refresher for upcoming interviews this week. Focused on core DSA patterns, STAR story polishing, and 2 mock interviews.',
    dailyTasks: [
      { day: 1, topic: 'Resume Review & Top 3 STAR Stories', category: 'Behavioral', completed: false },
      { day: 2, topic: 'Arrays, Two Pointers & Sliding Window', category: 'Coding', completed: false },
      { day: 3, topic: 'Trees & BFS/DFS Graph Traversals', category: 'Coding', completed: false },
      { day: 4, topic: 'System Design Basics & Load Balancers', category: 'System Design', completed: false },
      { day: 5, topic: 'AI Mock Interview #1 (30 mins)', category: 'Mock Interview', completed: false },
      { day: 6, topic: 'Company Specific Prep & FAQs', category: 'Company Prep', completed: false },
      { day: 7, topic: 'AI Mock Interview #2 & Final Revision', category: 'Revision', completed: false }
    ]
  },
  {
    id: 'sp_14',
    days: 14,
    title: '14-Day Targeted Mastery',
    description: 'Ideal preparation window for scheduled onsite loops. Comprehensive DSA coverage, System Design trade-offs, and company-deep dives.',
    dailyTasks: [
      { day: 1, topic: 'Skill Gap Analysis & Target Role Mapping', category: 'Resume', completed: false },
      { day: 2, topic: 'Arrays, Hash Maps & Matrix Problems', category: 'Coding', completed: false },
      { day: 3, topic: 'Linked Lists & Stacks/Queues', category: 'Coding', completed: false },
      { day: 4, topic: 'Binary Search & Two Pointers', category: 'Coding', completed: false },
      { day: 5, topic: 'Recursion & Backtracking', category: 'Coding', completed: false },
      { day: 6, topic: 'Behavioral Prep: 16 Amazon LPs / Googleyness', category: 'Behavioral', completed: false },
      { day: 7, topic: 'Mid-Point Mock Interview & Diagnostic', category: 'Mock Interview', completed: false },
      { day: 8, topic: 'Trees, Binary Search Trees & Tries', category: 'Coding', completed: false },
      { day: 9, topic: 'Graphs (Dijkstra, Topological Sort)', category: 'Coding', completed: false },
      { day: 10, topic: 'Dynamic Programming Patterns 1D/2D', category: 'Coding', completed: false },
      { day: 11, topic: 'System Design: Scalability, Caching & DB Sharding', category: 'System Design', completed: false },
      { day: 12, topic: 'System Design: Queues & Microservices', category: 'System Design', completed: false },
      { day: 13, topic: 'Company Specific Practice & Salary Negotiation Prep', category: 'Company Prep', completed: false },
      { day: 14, topic: 'Final Full 60-Min AI Mock Interview', category: 'Mock Interview', completed: false }
    ]
  },
  {
    id: 'sp_30',
    days: 30,
    title: '30-Day Comprehensive Bootcamp',
    description: 'Full-spectrum preparation for FAANG/Tier-1 engineering roles covering all 14 coding categories and end-to-end distributed system architectures.',
    dailyTasks: [
      { day: 1, topic: 'Kickoff & Baseline Assessment', category: 'Revision', completed: false }
    ]
  },
  {
    id: 'sp_60',
    days: 60,
    title: '60-Day Tech Lead & Staff Engineering Track',
    description: 'Deep architectural mastery, distributed systems theory, advanced DP/Graph algorithms, and executive communication skills.',
    dailyTasks: [
      { day: 1, topic: 'System Design Principles & Architecture Benchmarking', category: 'System Design', completed: false }
    ]
  }
];

// ==========================================
// 6. GAMIFICATION ACHIEVEMENTS & BADGES
// ==========================================
export const initialAchievements: AchievementItem[] = [
  {
    id: 'ach_streak',
    title: 'Streak Flame',
    description: 'Maintained a 5-day continuous interview study streak',
    iconName: 'Flame',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    rewardXp: 150
  },
  {
    id: 'ach_dsa',
    title: 'DSA Warrior',
    description: 'Solved 25 coding interview problems across categories',
    iconName: 'Code',
    unlocked: false,
    progress: 0,
    maxProgress: 25,
    rewardXp: 300
  },
  {
    id: 'ach_sys',
    title: 'System Architect',
    description: 'Completed 4 System Design learning modules',
    iconName: 'Layers',
    unlocked: false,
    progress: 0,
    maxProgress: 4,
    rewardXp: 250
  },
  {
    id: 'ach_star',
    title: 'STAR Storyteller',
    description: 'Scored 90+ on 3 HR Behavioral mock rounds',
    iconName: 'Star',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    rewardXp: 200
  },
  {
    id: 'ach_faang',
    title: 'Company Ready',
    description: 'Completed preparation checklist for a FAANG company',
    iconName: 'Building2',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rewardXp: 500
  }
];
