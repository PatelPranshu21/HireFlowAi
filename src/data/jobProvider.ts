import { CompanyInfo, JobRecommendation, UserProfile, JobPreferences } from '../types';

export const mockCompanies: CompanyInfo[] = [
  {
    id: 'google',
    name: 'Google',
    logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&q=80&w=120',
    description: 'Google organizes the world’s information and makes it universally accessible and useful through search, AI, cloud computing, and hardware.',
    industry: 'Technology & Cloud AI',
    headquarters: 'Mountain View, CA',
    employees: '180,000+',
    website: 'https://careers.google.com',
    openPositionsCount: 142,
    benefits: ['401(k) 50% Match', 'Comprehensive Healthcare & Dental', 'On-site Gourmet Dining', '20% Innovation Time', '$2,000 Learning Budget'],
    interviewDifficulty: 'Hard',
    averageSalary: '$180,000 - $350,000 / yr',
    aiRecommendation: 'High alignment for Distributed Systems, Cloud Architecture, and Machine Learning Infrastructure candidates.'
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: 'https://images.unsplash.com/photo-1642132652075-2b87222c1dd7?auto=format&fit=crop&q=80&w=120',
    description: 'Microsoft empowers every person and every organization on the planet to achieve more through Windows, Azure, Office, and Copilot AI.',
    industry: 'Software & Cloud Computing',
    headquarters: 'Redmond, WA',
    employees: '220,000+',
    website: 'https://careers.microsoft.com',
    openPositionsCount: 198,
    benefits: ['Flexible Hybrid Work', '401(k) Matching', 'Health Spending Account', 'Generous Parental Leave', 'Stock Purchase Plan'],
    interviewDifficulty: 'Medium',
    averageSalary: '$165,000 - $310,000 / yr',
    aiRecommendation: 'Top match for C#, TypeScript, Azure Cloud, and Enterprise SaaS engineers.'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&q=80&w=120',
    description: 'Amazon leads global e-commerce, cloud infrastructure (AWS), digital streaming, and artificial intelligence.',
    industry: 'E-commerce & AWS Cloud',
    headquarters: 'Seattle, WA',
    employees: '1,500,000+',
    website: 'https://amazon.jobs',
    openPositionsCount: 310,
    benefits: ['AWS Technical Certification Sponsorship', 'Restricted Stock Units (RSUs)', 'Healthcare from Day 1', 'Relocation Package'],
    interviewDifficulty: 'Hard',
    averageSalary: '$160,000 - $290,000 / yr',
    aiRecommendation: 'Great match for engineers experienced with high-throughput microservices and AWS infrastructure.'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
    description: 'OpenAI builds safe and beneficial artificial general intelligence through ChatGPT, GPT-4o, and Sora.',
    industry: 'Artificial Intelligence & Research',
    headquarters: 'San Francisco, CA',
    employees: '1,500+',
    website: 'https://openai.com/careers',
    openPositionsCount: 45,
    benefits: ['Top-of-market Equity Grants', 'Unlimited PTO', 'Full Health & Wellness Coverage', 'Home Office & Hardware Stipend'],
    interviewDifficulty: 'Very Hard',
    averageSalary: '$220,000 - $380,000 / yr',
    aiRecommendation: 'Exceptional match for senior candidates in Python, PyTorch, Model Serving, and Vector DBs.'
  },
  {
    id: 'apple',
    name: 'Apple',
    logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=120',
    description: 'Apple designs world-class consumer electronics, software systems, and custom silicon processors.',
    industry: 'Hardware, Software & Consumer Tech',
    headquarters: 'Cupertino, CA',
    employees: '160,000+',
    website: 'https://www.apple.com/careers',
    openPositionsCount: 115,
    benefits: ['Employee Discount on Apple Hardware', 'Stock Purchase Plan', 'Wellness Coaching', 'Education Tuition Reimbursement'],
    interviewDifficulty: 'Hard',
    averageSalary: '$175,000 - $320,000 / yr',
    aiRecommendation: 'Direct match for your past experience with high-performance client applications and Swift/React.'
  },
  {
    id: 'meta',
    name: 'Meta',
    logo: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=120',
    description: 'Meta connects billions of people worldwide across Instagram, WhatsApp, Messenger, and Quest VR.',
    industry: 'Social Networks & AR/VR',
    headquarters: 'Menlo Park, CA',
    employees: '67,000+',
    website: 'https://www.metacareers.com',
    openPositionsCount: 165,
    benefits: ['401(k) Dollar-for-Dollar Match', 'Free Meals & Snacks', 'Fertility & Family Planning', 'Annual Wellness Stipend'],
    interviewDifficulty: 'Hard',
    averageSalary: '$185,000 - $340,000 / yr',
    aiRecommendation: 'Highly recommended for React architecture, GraphQL, and large-scale web performance optimization.'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=120',
    description: 'Stripe builds financial infrastructure for internet commerce, handling billions of dollars in daily payments.',
    industry: 'Fintech & Payment Gateway',
    headquarters: 'San Francisco, CA',
    employees: '8,000+',
    website: 'https://stripe.com/jobs',
    openPositionsCount: 88,
    benefits: ['Competitive Equity', 'Remote-First Culture', 'Mental Health Counseling', 'Continuous Learning Stipend'],
    interviewDifficulty: 'Hard',
    averageSalary: '$190,000 - $300,000 / yr',
    aiRecommendation: 'Ideal for API design, PostgreSQL data consistency, and high-reliability payments backend.'
  },
  {
    id: 'netflix',
    name: 'Netflix',
    logo: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=120',
    description: 'Netflix leads global streaming entertainment with 270+ million paid memberships across 190 countries.',
    industry: 'Digital Streaming & Media Tech',
    headquarters: 'Los Gatos, CA',
    employees: '13,000+',
    website: 'https://jobs.netflix.com',
    openPositionsCount: 60,
    benefits: ['Top-of-market Personal Choice Compensation', 'Flexible Work Options', 'Generous Family Leave', 'Global Travel Allowance'],
    interviewDifficulty: 'Hard',
    averageSalary: '$250,000 - $450,000 / yr',
    aiRecommendation: 'Recommended for microservices, video encoding, and resilient cloud streaming architectures.'
  },
  {
    id: 'uber',
    name: 'Uber',
    logo: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?auto=format&fit=crop&q=80&w=120',
    description: 'Uber connects riders, drivers, consumers, and merchants across global mobility and food delivery.',
    industry: 'Mobility & On-Demand Logistics',
    headquarters: 'San Francisco, CA',
    employees: '30,000+',
    website: 'https://www.uber.com/us/en/careers/',
    openPositionsCount: 95,
    benefits: ['Monthly Uber Credits', 'Equity Grants', '401(k) Match', 'Comprehensive Health Plan'],
    interviewDifficulty: 'Hard',
    averageSalary: '$170,000 - $300,000 / yr',
    aiRecommendation: 'Strong match for Go, real-time dispatch algorithms, and distributed geospatial indexing.'
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=120',
    description: 'NVIDIA pioneers GPU accelerated computing, CUDA platform, and generative AI supercomputing infrastructure.',
    industry: 'AI Hardware & CUDA Supercomputing',
    headquarters: 'Santa Clara, CA',
    employees: '29,000+',
    website: 'https://www.nvidia.com/en-us/about-nvidia/careers/',
    openPositionsCount: 210,
    benefits: ['Employee Stock Purchase Plan', 'On-site Fitness Center', 'Student Loan Assistance', 'Flexible Work Options'],
    interviewDifficulty: 'Hard',
    averageSalary: '$180,000 - $330,000 / yr',
    aiRecommendation: 'Great alignment for C++, GPU kernel optimization, and high-performance compute networking.'
  },
  {
    id: 'adobe',
    name: 'Adobe',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
    description: 'Adobe empowers creativity and document productivity through Photoshop, Illustrator, Creative Cloud, and Adobe Sensei AI.',
    industry: 'Creative Software & Cloud SaaS',
    headquarters: 'San Jose, CA',
    employees: '29,000+',
    website: 'https://www.adobe.com/careers.html',
    openPositionsCount: 82,
    benefits: ['Adobe Global Well-being Days', '401(k) Matching', 'Tuition Assistance', 'Flexible Time Off'],
    interviewDifficulty: 'Medium',
    averageSalary: '$160,000 - $280,000 / yr',
    aiRecommendation: 'Matches web canvas rendering, WebAssembly, and cloud asset management engineering roles.'
  },
  {
    id: 'atlassian',
    name: 'Atlassian',
    logo: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=120',
    description: 'Atlassian builds team collaboration software including Jira, Confluence, Trello, and Bitbucket.',
    industry: 'Developer Tools & SaaS Collaboration',
    headquarters: 'Sydney, Australia & San Francisco',
    employees: '11,000+',
    website: 'https://www.atlassian.com/company/careers',
    openPositionsCount: 74,
    benefits: ['ANYWHERE Work Policy (Work from anywhere)', 'Paid Volunteer Days', 'Parental Support Stipend', 'Health Insurance'],
    interviewDifficulty: 'Medium',
    averageSalary: '$165,000 - $270,000 / yr',
    aiRecommendation: 'Ideal for candidates seeking fully remote team productivity tooling and React UI design systems.'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=120',
    description: 'Salesforce provides the world’s #1 CRM platform, Einstein AI, and enterprise workflow solutions.',
    industry: 'Enterprise CRM & Cloud Computing',
    headquarters: 'San Francisco, CA',
    employees: '72,000+',
    website: 'https://careers.salesforce.com',
    openPositionsCount: 130,
    benefits: ['7 Days Paid Volunteer Time Off', '401(k) Matching', 'Wellness Reimbursement', 'Flexible Work Styles'],
    interviewDifficulty: 'Medium',
    averageSalary: '$155,000 - $275,000 / yr',
    aiRecommendation: 'Fits full-stack web developers and cloud database integration specialists.'
  },
  {
    id: 'oracle',
    name: 'Oracle',
    logo: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=120',
    description: 'Oracle offers cloud infrastructure (OCI), autonomous databases, and enterprise application suites.',
    industry: 'Cloud Infrastructure & Enterprise DB',
    headquarters: 'Austin, TX',
    employees: '164,000+',
    website: 'https://www.oracle.com/careers/',
    openPositionsCount: 220,
    benefits: ['Oracle Cloud Training', 'Health Insurance', 'Retirement Plan', 'Flexible Hybrid Schedule'],
    interviewDifficulty: 'Medium',
    averageSalary: '$150,000 - $260,000 / yr',
    aiRecommendation: 'Good match for Java backend developers and database cloud infrastructure engineers.'
  },
  {
    id: 'goldman_sachs',
    name: 'Goldman Sachs',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=120',
    description: 'Goldman Sachs is a leading global investment banking, securities, and investment management firm.',
    industry: 'Fintech & Investment Banking',
    headquarters: 'New York, NY',
    employees: '45,000+',
    website: 'https://www.goldmansachs.com/careers/',
    openPositionsCount: 110,
    benefits: ['Annual Performance Bonus', 'Comprehensive Healthcare', 'On-site Fitness Centers', '401(k) Plan'],
    interviewDifficulty: 'Hard',
    averageSalary: '$165,000 - $310,000 / yr',
    aiRecommendation: 'Great for low-latency quantitative trading systems and Java/C++ financial engineering.'
  },
  {
    id: 'jp_morgan',
    name: 'JPMorgan Chase',
    logo: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=120',
    description: 'JPMorgan Chase is one of the oldest financial institutions in the US with $3.7T in assets.',
    industry: 'Financial Services & Banking Tech',
    headquarters: 'New York, NY',
    employees: '290,000+',
    website: 'https://careers.jpmorganchase.com',
    openPositionsCount: 340,
    benefits: ['Generous 401(k) Match', 'Tuition Assistance', 'Comprehensive Healthcare', 'Parental Leave'],
    interviewDifficulty: 'Medium',
    averageSalary: '$150,000 - $270,000 / yr',
    aiRecommendation: 'Strong match for enterprise Java, React, and banking cybersecurity engineers.'
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=120',
    description: 'Razorpay powers digital payments, banking services, and credit operations for businesses in India.',
    industry: 'Fintech & Digital Payments',
    headquarters: 'Bengaluru, India',
    employees: '3,000+',
    website: 'https://razorpay.com/jobs',
    openPositionsCount: 48,
    benefits: ['ESOP Options', 'Unlimited Wellness Leaves', 'Home Office Allowance', 'Health Insurance for Family'],
    interviewDifficulty: 'Hard',
    averageSalary: '₹25,00,000 - ₹55,00,000 / yr',
    aiRecommendation: 'High match for Node.js, PHP/Go microservices, and payment gateway infrastructure.'
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    logo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=120',
    description: 'Flipkart is India’s leading e-commerce marketplace owned by Walmart, powering retail supply chains.',
    industry: 'E-commerce & Supply Chain Tech',
    headquarters: 'Bengaluru, India',
    employees: '35,000+',
    website: 'https://www.flipkartcareers.com',
    openPositionsCount: 92,
    benefits: ['Performance Incentive', 'Family Health Cover', 'Higher Education Sponsorship', 'Cab Facilities'],
    interviewDifficulty: 'Hard',
    averageSalary: '₹28,00,000 - ₹60,00,000 / yr',
    aiRecommendation: 'Top match for high-throughput Java backend microservices and distributed database scaling.'
  },
  {
    id: 'zomato',
    name: 'Zomato',
    logo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=120',
    description: 'Zomato is a technology platform connecting customers, restaurant partners, and delivery partners.',
    industry: 'Food Delivery & Hyperlocal Logistics',
    headquarters: 'Gurugram, India',
    employees: '5,000+',
    website: 'https://www.zomato.com/careers',
    openPositionsCount: 35,
    benefits: ['Employee Stock Ownership', 'Food Allowance', 'Generous Sick Leave', 'Flexible Hours'],
    interviewDifficulty: 'Medium',
    averageSalary: '₹22,00,000 - ₹48,00,000 / yr',
    aiRecommendation: 'Matches mobile app developers (React Native/iOS/Android) and real-time routing engineers.'
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=120',
    description: 'Swiggy delivers food, groceries (Instamart), and quick-commerce items across 500+ Indian cities.',
    industry: 'Quick Commerce & On-Demand Delivery',
    headquarters: 'Bengaluru, India',
    employees: '6,000+',
    website: 'https://careers.swiggy.com',
    openPositionsCount: 42,
    benefits: ['Remote First Policy', 'Quarterly Bonuses', 'Health Insurance', 'Wellness Days'],
    interviewDifficulty: 'Hard',
    averageSalary: '₹24,00,000 - ₹52,00,000 / yr',
    aiRecommendation: 'Great alignment for real-time order matching algorithms and Golang microservices.'
  }
];

export const mockJobsList: JobRecommendation[] = [
  {
    id: 'job_google_1',
    companyId: 'google',
    title: 'Senior Software Engineer - Distributed Infrastructure',
    company: 'Google',
    companyLogo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&q=80&w=120',
    location: 'Mountain View, CA (Hybrid)',
    matchScore: 96,
    matchConfidence: 'Very High',
    tags: ['C++', 'Distributed Systems', 'Go', 'Kubernetes', 'GCP'],
    salary: '$210,000 - $310,000 / yr + RSUs',
    salaryRange: '$210k - $310k',
    description: 'Architect low-latency storage systems, high-throughput RPC frameworks, and planetary-scale cloud infrastructure powering Google Cloud & Gemini AI serving.',
    responsibilities: [
      'Design and maintain zero-downtime distributed storage systems serving billions of queries per second.',
      'Optimize RPC communication efficiency and memory footprints across Linux cluster nodes.',
      'Collaborate with AI model deployment teams to reduce LLM token generation latency.'
    ],
    requirements: [
      '6+ years of experience in distributed systems or backend platform engineering.',
      'Strong proficiency in C++, Go, or Java with deep understanding of concurrency models.',
      'BS or MS in Computer Science or equivalent practical experience.'
    ],
    benefits: [
      'Full healthcare coverage including medical, dental, and vision with $0 employee premium option.',
      'Generous 401(k) matching up to 50% of IRS limits.',
      '3 free gourmet meals daily, gym access, and wellness credits.'
    ],
    hiringProcess: [
      'Initial Technical Recruiter Screen (30 mins)',
      'Coding & Data Structures Phone Screen (45 mins)',
      'Onsite Virtual Loop: 3 Coding, 1 System Design, 1 Googleyness (Behavioral)'
    ],
    requiredSkills: ['Distributed Systems', 'C++', 'Go', 'Kubernetes', 'System Design'],
    missingSkills: ['Terraform'],
    experienceRequired: '6+ Years Experience',
    jobType: 'Full-Time',
    companyDescription: 'Google organizes the world’s information and makes it universally accessible and useful.',
    postedDate: '1 day ago',
    recommendationReason: 'Exceptional match! Your 7+ years of distributed backend engineering and system optimization directly mirror Google’s infrastructure requirements.',
    applyUrl: 'https://careers.google.com',
    companyWebsite: 'https://google.com',
    preparationTips: [
      'Review Distributed Systems concepts: Paxos/Raft consensus, CAP Theorem, and Consistent Hashing.',
      'Practice LeetCode hard graph and dynamic programming questions.',
      'Prepare STAR stories emphasizing cross-functional leadership.'
    ]
  },
  {
    id: 'job_microsoft_1',
    companyId: 'microsoft',
    title: 'Principal Software Architect - Azure Copilot AI',
    company: 'Microsoft',
    companyLogo: 'https://images.unsplash.com/photo-1642132652075-2b87222c1dd7?auto=format&fit=crop&q=80&w=120',
    location: 'Redmond, WA (Hybrid)',
    matchScore: 94,
    matchConfidence: 'Very High',
    tags: ['TypeScript', 'C#', 'Azure Cloud', 'LLM Integration', 'Microservices'],
    salary: '$220,000 - $320,000 / yr + Stock',
    salaryRange: '$220k - $320k',
    description: 'Lead technical design for Azure Copilot AI developer tools, building high-reliability vector indexing and LLM context streaming pipelines.',
    responsibilities: [
      'Drive architectural standards for AI copilot agent execution and prompt caching engines.',
      'Engineer sub-100ms response streaming APIs over WebSockets and Server-Sent Events.',
      'Mentor senior engineers and conduct technical design reviews across 4 component teams.'
    ],
    requirements: [
      '7+ years of full-stack or backend software development experience.',
      'Proven track record of building production TypeScript or C# web applications.',
      'Demonstrated experience integrating Generative AI APIs or vector embeddings.'
    ],
    benefits: [
      'Flexible hybrid work options with 2 days remote work per week.',
      'Annual stock award grants and 15% discount on Microsoft stock purchase.',
      '$1,200 annual wellness credit for gym or home equipment.'
    ],
    hiringProcess: [
      'Technical Recruiter Conversation',
      'System Architecture Phone Interview',
      'Final Loop: 2 Technical Architecture, 1 Live Coding, 1 Managerial Leadership'
    ],
    requiredSkills: ['TypeScript', 'System Architecture', 'Microservices', 'REST APIs', 'Cloud Computing'],
    missingSkills: ['C#'],
    experienceRequired: '7+ Years Experience',
    jobType: 'Full-Time',
    companyDescription: 'Microsoft empowers every person and organization to achieve more through platform AI.',
    postedDate: '2 days ago',
    recommendationReason: 'High match based on your full-stack React/TypeScript leadership and proven background managing cloud microservices.',
    applyUrl: 'https://careers.microsoft.com',
    companyWebsite: 'https://microsoft.com',
    preparationTips: [
      'Focus on system architecture for streaming AI APIs and caching layers.',
      'Review Microsoft core competency principles: Customer Obsession and Growth Mindset.'
    ]
  },
  {
    id: 'job_openai_1',
    companyId: 'openai',
    title: 'Senior Full Stack Engineer - ChatGPT Experience',
    company: 'OpenAI',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
    location: 'San Francisco, CA (Hybrid)',
    matchScore: 97,
    matchConfidence: 'Very High',
    tags: ['Next.js', 'React', 'TypeScript', 'Python', 'Tailwind CSS'],
    salary: '$240,000 - $350,000 / yr + Equity',
    salaryRange: '$240k - $350k',
    description: 'Build fast, responsive web interfaces for ChatGPT, voice interaction canvases, and real-time multimodality rendering engines.',
    responsibilities: [
      'Craft fluid, delightful user experiences for millions of active ChatGPT users.',
      'Optimize web client rendering pipeline for audio streaming and low-latency token rendering.',
      'Implement web canvas interactions using React, Next.js App Router, and WebSockets.'
    ],
    requirements: [
      '5+ years building modern web applications with React, Next.js, and TypeScript.',
      'Deep understanding of browser performance metrics, state synchronization, and CSS/Tailwind.',
      'Passion for advancing AI accessibility and intuitive developer UI design.'
    ],
    benefits: [
      'Substantial OpenAI equity grant with strong liquidity potential.',
      'Unlimited time off policy with mandatory 3 weeks minimum recommendation.',
      'Comprehensive family medical, dental, and vision with 100% covered premiums.'
    ],
    hiringProcess: [
      'Recruiter Screen (20 mins)',
      'Take-Home Practical Coding Project or Practical Screen (3 hours)',
      'Virtual Onsite Loop: 2 Technical UI/Systems, 1 Architecture, 1 Cultural Alignment'
    ],
    requiredSkills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Web Performance'],
    missingSkills: ['WebSockets'],
    experienceRequired: '5+ Years Experience',
    jobType: 'Full-Time',
    companyDescription: 'OpenAI builds safe and beneficial AI models for humanity.',
    postedDate: 'Just now',
    recommendationReason: 'Your portfolio of React & Next.js projects along with 85+ ATS score places you in the top 3% candidate pool.',
    applyUrl: 'https://openai.com/careers',
    companyWebsite: 'https://openai.com',
    preparationTips: [
      'Be prepared to demonstrate complex state management and responsive UI layout design.',
      'Review high-frequency event handling and Web Performance optimization techniques.'
    ]
  },
  {
    id: 'job_apple_1',
    companyId: 'apple',
    title: 'Staff Frontend Engineer - Apple Cloud Services',
    company: 'Apple',
    companyLogo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=120',
    location: 'Cupertino, CA (Hybrid)',
    matchScore: 92,
    matchConfidence: 'Very High',
    tags: ['React', 'TypeScript', 'Web Security', 'Accessibility', 'Performance'],
    salary: '$195,000 - $305,000 / yr + RSUs',
    salaryRange: '$195k - $305k',
    description: 'Engineer high-security web webapps for iCloud, Apple Music web dashboard, and developer portal platforms with strict accessibility standards.',
    responsibilities: [
      'Architect accessible, high-performance web components adhering strictly to Apple UI HIG guidelines.',
      'Conduct code audits for web security standards (CORS, CSP, XSS mitigation).',
      'Drive frontend performance monitoring and accessibility compliance across web products.'
    ],
    requirements: [
      '6+ years of expertise in JavaScript/TypeScript and React ecosystem.',
      'Demonstrated commitment to web accessibility (WCAG 2.1 AA) and responsive web design.',
      'Solid experience with CI/CD deployment pipelines.'
    ],
    benefits: [
      'Apple Product Purchase Discounts (up to 25% off Macs, iPhones, iPads).',
      'Relocation assistance package available.',
      '401(k) plan with company matching.'
    ],
    hiringProcess: [
      'Initial Phone Screen',
      'Technical Deep Dive Screen',
      'Full Onsite Loop (5 rounds covering coding, web architecture, accessibility, and leadership)'
    ],
    requiredSkills: ['React', 'TypeScript', 'Accessibility', 'Web Security', 'CSS'],
    missingSkills: ['Swift'],
    experienceRequired: '6+ Years Experience',
    jobType: 'Full-Time',
    companyDescription: 'Apple designs world-class consumer products and innovative software.',
    postedDate: '3 days ago',
    recommendationReason: 'Your experience leading frontend architecture and accessibility matches Apple Cloud Services requirements.',
    applyUrl: 'https://www.apple.com/careers',
    companyWebsite: 'https://apple.com',
    preparationTips: [
      'Brush up on WCAG accessibility guidelines and keyboard navigation patterns.',
      'Practice DOM manipulation and custom component design from scratch without third-party libs.'
    ]
  },
  {
    id: 'job_stripe_1',
    companyId: 'stripe',
    title: 'Lead Full Stack Engineer - Global Payments',
    company: 'Stripe',
    companyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=120',
    location: 'San Francisco, CA or Remote',
    matchScore: 91,
    matchConfidence: 'High',
    tags: ['TypeScript', 'React', 'Ruby', 'PostgreSQL', 'REST APIs'],
    salary: '$205,000 - $295,000 / yr',
    salaryRange: '$205k - $295k',
    description: 'Build mission-critical payment processing SDKs, dashboard analytics, and international merchant onboarding pipelines.',
    responsibilities: [
      'Develop robust API integrations and React component libraries for Stripe Merchant Dashboard.',
      'Design idempotent transactional workflows for international banking rails.',
      'Ensure 99.999% reliability for core payment gateway APIs.'
    ],
    requirements: [
      '5+ years building production full-stack web applications.',
      'Strong command over PostgreSQL database design, transactions, and index tuning.',
      'Deep appreciation for API developer ergonomics and clean documentation.'
    ],
    benefits: [
      'Remote-first work environment flexibility.',
      'Generous parental leave and family planning assistance.',
      'Home office ergonomic equipment budget.'
    ],
    hiringProcess: [
      'Recruiter Screen',
      'Technical Practical Coding Screen',
      'Virtual Onsite: API Design, Debugging Session, System Architecture, Behavioral'
    ],
    requiredSkills: ['TypeScript', 'React', 'PostgreSQL', 'REST APIs'],
    missingSkills: ['Ruby on Rails'],
    experienceRequired: '5+ Years Experience',
    jobType: 'Remote',
    companyDescription: 'Stripe builds financial infrastructure for internet commerce.',
    postedDate: '2 days ago',
    recommendationReason: 'Strong alignment with your PostgreSQL schema experience and full-stack React API integrations.',
    applyUrl: 'https://stripe.com/jobs',
    companyWebsite: 'https://stripe.com',
    preparationTips: [
      'Practice API design emphasizing backward compatibility and idempotency keys.',
      'Be ready to live-debug a realistic codebase during the practical interview.'
    ]
  },
  {
    id: 'job_amazon_1',
    companyId: 'amazon',
    title: 'Senior Software Development Engineer - AWS Cloud',
    company: 'Amazon',
    companyLogo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&q=80&w=120',
    location: 'Seattle, WA (Hybrid)',
    matchScore: 89,
    matchConfidence: 'High',
    tags: ['Java', 'AWS', 'Distributed Systems', 'DynamoDB', 'Microservices'],
    salary: '$180,000 - $270,000 / yr + RSUs',
    salaryRange: '$180k - $270k',
    description: 'Scale cloud computing infrastructure for AWS EC2 and Lambda, managing distributed routing tables and automated load balancing systems.',
    responsibilities: [
      'Engineer fault-tolerant microservices running on AWS ECS and Lambda.',
      'Optimize database queries on DynamoDB and Aurora PostgreSQL.',
      'Participate in operational on-call rotation and continuous deployment monitoring.'
    ],
    requirements: [
      '5+ years of software engineering experience using Java, C++, or Go.',
      'Demonstrated expertise with cloud services, object storage, and relational/NoSQL databases.',
      'BS in Computer Science or equivalent field.'
    ],
    benefits: [
      'AWS Technical Certification vouchers and fully paid training courses.',
      'Relocation assistance package.',
      'Comprehensive medical and dental coverage.'
    ],
    hiringProcess: [
      'Recruiter Screening',
      'Online Assessment (OA): 2 Coding Questions + Work Style Survey',
      'Onsite Loop: 4 rounds focusing heavily on Amazon Leadership Principles + System Design'
    ],
    requiredSkills: ['Java', 'Distributed Systems', 'AWS', 'Microservices'],
    missingSkills: ['DynamoDB'],
    experienceRequired: '5+ Years Experience',
    jobType: 'Full-Time',
    companyDescription: 'Amazon is a global technology leader in e-commerce and cloud infrastructure.',
    postedDate: '4 days ago',
    recommendationReason: 'Good match for your cloud platform experience and backend microservices skills.',
    applyUrl: 'https://amazon.jobs',
    companyWebsite: 'https://amazon.com',
    preparationTips: [
      'Memorize and prepare 2 detailed stories for each of Amazon’s 16 Leadership Principles.',
      'Focus system design on high availability, scaling, and fault tolerance.'
    ]
  },
  {
    id: 'job_netflix_1',
    companyId: 'netflix',
    title: 'Senior Microservices Engineer - Core Streaming',
    company: 'Netflix',
    companyLogo: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=120',
    location: 'Los Gatos, CA (Hybrid or Remote)',
    matchScore: 88,
    matchConfidence: 'High',
    tags: ['Java', 'Spring Boot', 'gRPC', 'Cassandra', 'AWS'],
    salary: '$280,000 - $420,000 / yr (All-Cash Option)',
    salaryRange: '$280k - $420k',
    description: 'Build planetary-scale video distribution services processing real-time telemetry from over 270 million global active profiles.',
    responsibilities: [
      'Architect fault-tolerant microservices handling high-throughput video metadata requests.',
      'Utilize gRPC and RxJava for asynchronous non-blocking event handling.',
      'Partner with client engineers (iOS, Android, Smart TV) to optimize playback startup latency.'
    ],
    requirements: [
      '6+ years of backend engineering experience at scale.',
      'Deep mastery of JVM internals, garbage collection tuning, and asynchronous IO.',
      'Experience operating distributed data stores like Cassandra or DynamoDB.'
    ],
    benefits: [
      'Industry-leading top-of-market compensation with customizable stock/cash allocation.',
      'Open paid time off policy based on freedom and responsibility culture.',
      'Generous global travel and parental benefits.'
    ],
    hiringProcess: [
      'Initial Recruiter Call',
      'Technical Screener with Senior Engineer',
      'Virtual Onsite Loop: 2 Technical Architecture, 2 Culture & Alignment Rounds with Directors'
    ],
    requiredSkills: ['Microservices', 'Distributed Systems', 'Java', 'gRPC'],
    missingSkills: ['Cassandra'],
    experienceRequired: '6+ Years Experience',
    jobType: 'Full-Time',
    companyDescription: 'Netflix is the world’s leading streaming entertainment service.',
    postedDate: '5 days ago',
    recommendationReason: 'Recommended for your distributed architecture experience and proven track record with high availability systems.',
    applyUrl: 'https://jobs.netflix.com',
    companyWebsite: 'https://netflix.com',
    preparationTips: [
      'Read Netflix Culture Memo thoroughly. They heavily evaluate Culture Fit.',
      'Be ready to discuss trade-offs in distributed consistency (Eventual vs Strong Consistency).'
    ]
  },
  {
    id: 'job_atlassian_1',
    companyId: 'atlassian',
    title: 'Senior Frontend Engineer - Jira Experience',
    company: 'Atlassian',
    companyLogo: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=120',
    location: 'Remote (US or Canada)',
    matchScore: 93,
    matchConfidence: 'Very High',
    tags: ['React', 'TypeScript', 'Redux', 'Design Systems', 'GraphQL'],
    salary: '$175,000 - $250,000 / yr',
    salaryRange: '$175k - $250k',
    description: 'Craft high-performance task management components and interactive drag-and-drop board interfaces for Jira Cloud.',
    responsibilities: [
      'Build responsive, accessible canvas and list components for millions of agile software teams.',
      'Contribute to Atlassian Design System (DS) UI primitives.',
      'Optimize bundle size and initial render speed for complex project dashboards.'
    ],
    requirements: [
      '5+ years building modern React frontends with TypeScript.',
      'Strong expertise in state management, drag-and-drop interactions, and component libraries.',
      'Passion for remote collaboration and team developer tooling.'
    ],
    benefits: [
      'Work from Anywhere policy (100% remote flexibility).',
      'Annual $1,500 learning & development stipend.',
      '5 paid days per year for community volunteering.'
    ],
    hiringProcess: [
      'Recruiter Chat',
      'Technical Code Pair Session (React/JS)',
      'System Architecture & Design Screen',
      'Values & Leadership Interview'
    ],
    requiredSkills: ['React', 'TypeScript', 'State Management', 'CSS'],
    missingSkills: ['GraphQL'],
    experienceRequired: '5+ Years Experience',
    jobType: 'Remote',
    companyDescription: 'Atlassian creates software that helps teams work better together.',
    postedDate: '1 day ago',
    recommendationReason: 'Direct match for your React skills and experience building complex interactive web applications.',
    applyUrl: 'https://www.atlassian.com/company/careers',
    companyWebsite: 'https://atlassian.com',
    preparationTips: [
      'Practice live coding React state managers and component layouts.',
      'Be familiar with Atlassian Core Values (e.g. "Be the change you seek", "Open company, no bullshit").'
    ]
  },
  {
    id: 'job_uber_1',
    companyId: 'uber',
    title: 'Senior Backend Engineer - Real-Time Dispatch',
    company: 'Uber',
    companyLogo: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?auto=format&fit=crop&q=80&w=120',
    location: 'San Francisco, CA (Hybrid)',
    matchScore: 87,
    matchConfidence: 'High',
    tags: ['Go', 'Kafka', 'Geospatial', 'Redis', 'Microservices'],
    salary: '$185,000 - $285,000 / yr + Equity',
    salaryRange: '$185k - $285k',
    description: 'Build real-time driver matching and dynamic pricing engines processing millions of concurrent location updates worldwide.',
    responsibilities: [
      'Develop low-latency Go microservices handling geospatial indexing (H3 grid system).',
      'Maintain streaming data pipelines on Kafka and Apache Flink.',
      'Optimize memory usage and network serialization for sub-50ms dispatch decisions.'
    ],
    requirements: [
      '5+ years of software engineering experience using Go, Java, or C++.',
      'Demonstrated expertise in distributed streaming architectures and caching.',
      'Experience with high concurrency networking.'
    ],
    benefits: [
      'Monthly Uber Credits for Rides and Eats orders.',
      'Full health, dental, and vision coverage.',
      '401(k) plan with employer match.'
    ],
    hiringProcess: [
      'Recruiter Screen',
      'Technical Coding Assessment (Go / Algorithms)',
      'Virtual Onsite: 2 Coding, 1 System Design (Geospatial focus), 1 Managerial'
    ],
    requiredSkills: ['Go', 'Microservices', 'Kafka', 'Distributed Systems'],
    missingSkills: ['Geospatial H3'],
    experienceRequired: '5+ Years Experience',
    jobType: 'Full-Time',
    companyDescription: 'Uber provides mobility and logistics on a global scale.',
    postedDate: '3 days ago',
    recommendationReason: 'High relevance to your distributed systems background and Kafka event pipeline experience.',
    applyUrl: 'https://www.uber.com/us/en/careers/',
    companyWebsite: 'https://uber.com',
    preparationTips: [
      'Review Uber H3 spatial index and quad-tree indexing concepts.',
      'Practice system design for real-time ride matching and ETA calculation.'
    ]
  },
  {
    id: 'job_razorpay_1',
    companyId: 'razorpay',
    title: 'Lead Backend Engineer - Payment Gateway Core',
    company: 'Razorpay',
    companyLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=120',
    location: 'Bengaluru, India (Hybrid)',
    matchScore: 90,
    matchConfidence: 'High',
    tags: ['Go', 'Node.js', 'PostgreSQL', 'Redis', 'Microservices'],
    salary: '₹32,00,000 - ₹55,00,000 / yr + ESOPs',
    salaryRange: '₹32L - ₹55L',
    description: 'Engineer high-concurrency payment routing microservices handling 10,000+ transactions per second across UPI, Cards, and Netbanking.',
    responsibilities: [
      'Architect resilient payment state machines with automated retry mechanics.',
      'Optimize MySQL & PostgreSQL query bottlenecks for high-volume transactions.',
      'Drive zero-downtime database migrations across distributed payment clusters.'
    ],
    requirements: [
      '5+ years of backend development in Go, Node.js, or Java.',
      'Solid experience in transactional relational databases and distributed locks.',
      'Prior experience in fintech, payments, or banking APIs is a major plus.'
    ],
    benefits: [
      'Generous ESOP wealth allocation program.',
      'Comprehensive family medical insurance.',
      'Flexible wellness and learning reimbursement.'
    ],
    hiringProcess: [
      'Recruiter Screen',
      'Machine Coding Round (2 hours live problem solving)',
      'System Design Round',
      'Culture Fit & CTO Discussion'
    ],
    requiredSkills: ['Node.js', 'PostgreSQL', 'Microservices', 'REST APIs'],
    missingSkills: ['Go'],
    experienceRequired: '5+ Years Experience',
    jobType: 'Full-Time',
    companyDescription: 'Razorpay powers digital payments and financial services for businesses in India.',
    postedDate: '1 day ago',
    recommendationReason: 'Your background in full-stack backend development and relational databases makes you an ideal candidate.',
    applyUrl: 'https://razorpay.com/jobs',
    companyWebsite: 'https://razorpay.com',
    preparationTips: [
      'Practice Machine Coding interview rounds (building low level class design & working code).',
      'Focus system design on distributed payment transactions, idempotency, and state locking.'
    ]
  }
];

// Helper: Calculate or update AI match score dynamically based on user profile and preferences
export function calculateDynamicMatchScore(job: JobRecommendation, user: UserProfile): {
  score: number;
  confidence: 'Very High' | 'High' | 'Moderate';
  matchingSkills: string[];
  missingSkills: string[];
  reason: string;
} {
  let score = job.matchScore || 85;
  const reqSkills = job.requiredSkills || [];
  const prefs = user.preferences;

  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  // Match against target role
  if (user.targetRole && job.title.toLowerCase().includes(user.targetRole.toLowerCase().split(' ')[0])) {
    score += 4;
  }

  // Preference boosters
  if (prefs) {
    if (prefs.preferredCompanies && prefs.preferredCompanies.includes(job.company)) {
      score += 5;
    }
    if (prefs.remotePreference && prefs.remotePreference !== 'Any') {
      if (job.location.toLowerCase().includes(prefs.remotePreference.toLowerCase())) {
        score += 3;
      }
    }
    if (prefs.preferredCities && prefs.preferredCities.some(city => job.location.toLowerCase().includes(city.toLowerCase()))) {
      score += 3;
    }
  }

  // Normalize score between 65 and 99
  score = Math.min(99, Math.max(68, score));

  let confidence: 'Very High' | 'High' | 'Moderate' = 'High';
  if (score >= 92) confidence = 'Very High';
  else if (score < 82) confidence = 'Moderate';

  return {
    score,
    confidence,
    matchingSkills: reqSkills.slice(0, 3),
    missingSkills: job.missingSkills || ['Docker', 'AWS'],
    reason: job.recommendationReason || `Strong alignment with your profile as a ${user.title || 'Software Engineer'}.`
  };
}

// Generate job recommendations tailored specifically to the active resume's content, skills, and target role
export function getRecommendationsForResume(
  jobs: JobRecommendation[],
  resumeText: string,
  skills: string[],
  targetRole: string = 'Software Engineer'
): JobRecommendation[] {
  const textLower = (resumeText || '').toLowerCase();
  const userSkillsLower = (skills || []).map(s => s.toLowerCase());

  return jobs.map(job => {
    const jobTitleLower = job.title.toLowerCase();
    const jobCompanyLower = job.company.toLowerCase();
    const jobTagsLower = (job.tags || []).map(t => t.toLowerCase());
    const reqSkillsLower = (job.requiredSkills || []).map(r => r.toLowerCase());

    let matchPoints = 60;

    // 1. Title alignment
    const roleWords = targetRole.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    for (const word of roleWords) {
      if (jobTitleLower.includes(word)) {
        matchPoints += 8;
      }
    }

    // 2. Skills overlap
    const allJobSkills = [...new Set([...jobTagsLower, ...reqSkillsLower])];
    let matchedSkillsCount = 0;

    const matchingSkillsList: string[] = [];
    const missingSkillsList: string[] = [];

    allJobSkills.forEach(js => {
      const isMatched = userSkillsLower.some(us => us.includes(js) || js.includes(us)) || textLower.includes(js);
      if (isMatched) {
        matchedSkillsCount++;
        matchingSkillsList.push(js);
      } else {
        missingSkillsList.push(js);
      }
    });

    if (allJobSkills.length > 0) {
      const ratio = matchedSkillsCount / allJobSkills.length;
      matchPoints += Math.round(ratio * 30);
    }

    if (textLower.includes(jobCompanyLower)) {
      matchPoints += 5;
    }

    const finalScore = Math.min(98, Math.max(62, matchPoints));
    const confidence: 'Very High' | 'High' | 'Moderate' = finalScore >= 90 ? 'Very High' : finalScore >= 80 ? 'High' : 'Moderate';

    return {
      ...job,
      matchScore: finalScore,
      matchConfidence: confidence,
      requiredSkills: matchingSkillsList.length > 0 ? matchingSkillsList : job.requiredSkills,
      missingSkills: missingSkillsList.length > 0 ? missingSkillsList.slice(0, 3) : job.missingSkills,
      recommendationReason: `Matched against active resume skills: ${matchingSkillsList.slice(0, 4).join(', ') || 'core engineering keywords'}.`
    };
  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}
