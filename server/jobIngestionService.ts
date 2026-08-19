import { dbSaveJobs, dbGetAllJobs, DbJobRecord } from '../src/db/postgres';

export const REAL_INDIAN_JOBS: DbJobRecord[] = [
  // -------------------------------------------------------------
  // 1. PYTHON, DJANGO, FASTAPI, DATA & AI (INDIA)
  // -------------------------------------------------------------
  {
    id: 'job_in_py_1',
    external_job_id: 'swiggy-be-py-2026',
    source: 'Swiggy Careers',
    company: 'Swiggy',
    title: 'Senior Backend Engineer - Python & Django',
    location: 'Bengaluru, Karnataka (Hybrid)',
    description: 'Build high-scale order dispatching and pricing microservices using Python, Django, PostgreSQL, and Redis. Handle 50,000+ requests per second during peak hours with sub-50ms latency.',
    url: 'https://careers.swiggy.com',
    posted_at: '2 days ago',
    employment_type: 'Full-time',
    experience_required: '3-6 Years',
    salary: '₹22,00,000 - ₹38,00,000 / yr',
    skills: ['Python', 'Django', 'Django REST Framework', 'PostgreSQL', 'Redis', 'REST APIs', 'Microservices', 'Docker'],
    tags: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Backend'],
    responsibilities: [
      'Architect and scale core order processing pipelines in Python and Django.',
      'Optimize database queries and indexing strategies on high-volume PostgreSQL clusters.',
      'Design RESTful and gRPC APIs for driver allocation and real-time live tracking.'
    ],
    requirements: [
      '3+ years of production backend experience with Python and Django / DRF.',
      'Strong grasp of relational databases (PostgreSQL) and caching (Redis).',
      'Solid foundation in system design, data structures, and concurrency.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://www.swiggy.com',
    industry: 'FoodTech & Logistics',
    is_active: true
  },
  {
    id: 'job_in_py_2',
    external_job_id: 'zerodha-py-go-2026',
    source: 'Zerodha Tech',
    company: 'Zerodha',
    title: 'Python / Django Developer - Kite Platform',
    location: 'Bengaluru, Karnataka (Onsite)',
    description: 'Join the team building India’s largest stock brokerage platform. Work with clean Python, Django, PostgreSQL, and WebSockets to process millions of financial orders daily.',
    url: 'https://zerodha.com/careers',
    posted_at: '1 day ago',
    employment_type: 'Full-time',
    experience_required: '2-5 Years',
    salary: '₹24,00,000 - ₹42,00,000 / yr',
    skills: ['Python', 'Django', 'PostgreSQL', 'WebSockets', 'Linux', 'Git', 'REST APIs'],
    tags: ['Python', 'Django', 'Fintech', 'PostgreSQL', 'WebSockets'],
    responsibilities: [
      'Develop robust, minimalist backend services for trading calculations and ledger operations.',
      'Maintain sub-10ms response times on mission-critical market execution APIs.',
      'Write clean, idiomatic Python code with zero external bloat.'
    ],
    requirements: [
      '2+ years of hands-on experience building web backends in Python and Django.',
      'Deep understanding of Linux systems, networking, and PostgreSQL query tuning.',
      'Appreciation for simple, elegant software design.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://zerodha.com',
    industry: 'Fintech & Capital Markets',
    is_active: true
  },
  {
    id: 'job_in_py_3',
    external_job_id: 'yellowai-fastapi-2026',
    source: 'Yellow.ai Careers',
    company: 'Yellow.ai',
    title: 'FastAPI Backend Engineer - Conversational AI',
    location: 'Bengaluru, Karnataka (Hybrid)',
    description: 'Develop async microservices in Python, FastAPI, MongoDB, and Redis to power enterprise voice and chat AI agents across banking and retail.',
    url: 'https://yellow.ai/careers',
    posted_at: '3 days ago',
    employment_type: 'Full-time',
    experience_required: '2-4 Years',
    salary: '₹18,00,000 - ₹32,00,000 / yr',
    skills: ['Python', 'FastAPI', 'MongoDB', 'Redis', 'Docker', 'REST APIs', 'LLM Integration'],
    tags: ['Python', 'FastAPI', 'AI', 'MongoDB', 'Redis'],
    responsibilities: [
      'Build low-latency asynchronous API gateways in FastAPI.',
      'Integrate LLM streaming endpoints with dialogue management engines.',
      'Deploy containerized services using Docker and Kubernetes.'
    ],
    requirements: [
      '2+ years working with async Python (FastAPI / asyncio / aiohttp).',
      'Experience with NoSQL databases (MongoDB) and message queues.',
      'Familiarity with containerization and cloud environments.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://yellow.ai',
    industry: 'Enterprise AI & SaaS',
    is_active: true
  },
  {
    id: 'job_in_py_4',
    external_job_id: 'postman-py-api-2026',
    source: 'Postman Careers',
    company: 'Postman',
    title: 'Python API Platform Engineer',
    location: 'Hyderabad, Telangana / Remote India',
    description: 'Help build developer tooling and API collaboration platforms used by over 30 million engineers worldwide. Work with Python, Django, REST APIs, and AWS infrastructure.',
    url: 'https://www.postman.com/careers',
    posted_at: 'Just now',
    employment_type: 'Full-time',
    experience_required: '3-7 Years',
    salary: '₹28,00,000 - ₹50,00,000 / yr',
    skills: ['Python', 'Django', 'REST APIs', 'AWS', 'Docker', 'CI/CD', 'PostgreSQL'],
    tags: ['Python', 'Django', 'DevTools', 'AWS', 'Remote India'],
    responsibilities: [
      'Design public API specifications, mock servers, and telemetry collectors.',
      'Improve performance of schema validation pipelines and team workspaces.',
      'Work closely with open-source API standards communities.'
    ],
    requirements: [
      'Strong expertise in Python backend frameworks (Django or Flask).',
      'Deep knowledge of HTTP, REST, WebSockets, and API architecture.',
      'Experience with cloud infrastructure (AWS EC2, S3, RDS).'
    ],
    company_logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://www.postman.com',
    industry: 'Developer Tools & SaaS',
    is_active: true
  },
  {
    id: 'job_in_py_5',
    external_job_id: 'sarvam-ai-ml-2026',
    source: 'Sarvam AI',
    company: 'Sarvam AI',
    title: 'AI / Python Systems Engineer',
    location: 'Chennai, Tamil Nadu (Hybrid)',
    description: 'Work on foundational Indian language AI models and high-throughput inference APIs using Python, PyTorch, FastAPI, and GPU acceleration.',
    url: 'https://www.sarvam.ai',
    posted_at: '4 days ago',
    employment_type: 'Full-time',
    experience_required: '1-4 Years',
    salary: '₹20,00,000 - ₹36,00,000 / yr',
    skills: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'Linux', 'Data Science', 'Machine Learning'],
    tags: ['Python', 'PyTorch', 'FastAPI', 'GenAI', 'Chennai'],
    responsibilities: [
      'Build model serving pipelines for Indian voice and text generation.',
      'Optimize GPU throughput and model inference latency.',
      'Maintain dataset processing and tokenization scripts in Python.'
    ],
    requirements: [
      'Proficiency in Python and deep learning frameworks (PyTorch or TensorFlow).',
      'Experience building REST endpoints with FastAPI for ML workloads.',
      'Strong algorithmic foundation.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://www.sarvam.ai',
    industry: 'Generative AI & DeepTech',
    is_active: true
  },

  // -------------------------------------------------------------
  // 2. JAVA, SPRING BOOT, KAFKA, MICROSERVICES (INDIA)
  // -------------------------------------------------------------
  {
    id: 'job_in_java_1',
    external_job_id: 'phonepe-java-sr-2026',
    source: 'PhonePe Careers',
    company: 'PhonePe',
    title: 'Lead Java Backend Engineer - UPI Payments',
    location: 'Bengaluru, Karnataka (Hybrid)',
    description: 'Architect mission-critical UPI transaction processing engines handling billions of monthly payments. Deep focus on Java 17/21, Spring Boot, Apache Kafka, Distributed Systems, and RocksDB/MySQL.',
    url: 'https://www.phonepe.com/careers',
    posted_at: '1 day ago',
    employment_type: 'Full-time',
    experience_required: '5-9 Years',
    salary: '₹32,00,000 - ₹55,00,000 / yr',
    skills: ['Java', 'Spring Boot', 'Kafka', 'Microservices', 'Distributed Systems', 'MySQL', 'Redis', 'System Design'],
    tags: ['Java', 'Spring Boot', 'Kafka', 'Fintech', 'Bengaluru'],
    responsibilities: [
      'Lead design of fault-tolerant payment routing and settlement microservices.',
      'Handle zero-data-loss event streaming on high-scale Kafka clusters.',
      'Drive low-latency transaction processing with 99.999% availability.'
    ],
    requirements: [
      '5+ years of solid experience in Core Java, JVM internals, and Spring Boot.',
      'Extensive hands-on experience with Kafka pub/sub messaging and event sourcing.',
      'Proven track record in high-throughput distributed systems architecture.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://www.phonepe.com',
    industry: 'Fintech & Digital Payments',
    is_active: true
  },
  {
    id: 'job_in_java_2',
    external_job_id: 'cisco-in-java-2026',
    source: 'Cisco India Careers',
    company: 'Cisco',
    title: 'Senior Software Engineer - Cloud Networking (Java / Spring)',
    location: 'Bengaluru, Karnataka / Pune, Maharashtra',
    description: 'Develop enterprise networking management software in Java, Spring Boot, Microservices, and Kubernetes for global cloud customers.',
    url: 'https://jobs.cisco.com',
    posted_at: '2 days ago',
    employment_type: 'Full-time',
    experience_required: '4-8 Years',
    salary: '₹26,00,000 - ₹45,00,000 / yr',
    skills: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes', 'Docker', 'REST APIs', 'SQL'],
    tags: ['Java', 'Spring Boot', 'Cloud Networking', 'MNC', 'Pune'],
    responsibilities: [
      'Develop scalable control-plane microservices in Java and Spring Boot.',
      'Write clean, modular code with automated unit and integration tests.',
      'Collaborate with international teams on distributed telemetry services.'
    ],
    requirements: [
      '4+ years development in Java and modern Spring ecosystem.',
      'Familiarity with containerized deployments (Docker, Kubernetes).',
      'Strong understanding of object-oriented design and design patterns.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://www.cisco.com',
    industry: 'Networking & Cloud Infrastructure',
    is_active: true
  },
  {
    id: 'job_in_java_3',
    external_job_id: 'sap-labs-java-2026',
    source: 'SAP Labs India',
    company: 'SAP Labs',
    title: 'Java Cloud Application Developer',
    location: 'Bengaluru, Karnataka / Gurgaon, Haryana',
    description: 'Work on SAP Business Technology Platform (BTP). Develop enterprise SaaS solutions using Java, Spring Cloud, PostgreSQL, and Kafka.',
    url: 'https://jobs.sap.com',
    posted_at: '3 days ago',
    employment_type: 'Full-time',
    experience_required: '3-6 Years',
    salary: '₹20,00,000 - ₹36,00,000 / yr',
    skills: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Microservices', 'Cloud Computing', 'CI/CD'],
    tags: ['Java', 'Spring Boot', 'SAP', 'SaaS', 'Gurgaon'],
    responsibilities: [
      'Design and implement cloud-native microservices on SAP BTP.',
      'Implement multi-tenant data isolation and role-based security.',
      'Ensure high code quality and test coverage in Agile sprints.'
    ],
    requirements: [
      '3+ years in enterprise Java development (Spring Boot / Spring Cloud).',
      'Solid understanding of relational database schema design and SQL.',
      'Experience in building and consuming RESTful web services.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://www.sap.com',
    industry: 'Enterprise Software & Cloud',
    is_active: true
  },
  {
    id: 'job_in_java_4',
    external_job_id: 'goldman-in-java-2026',
    source: 'Goldman Sachs Careers',
    company: 'Goldman Sachs',
    title: 'Software Engineer - Java Trading Platforms',
    location: 'Hyderabad, Telangana / Bengaluru, Karnataka',
    description: 'Build ultra-low latency trade processing, risk calculation, and regulatory reporting systems in Core Java, Kafka, and distributed cache engines.',
    url: 'https://www.goldmansachs.com/careers',
    posted_at: '1 day ago',
    employment_type: 'Full-time',
    experience_required: '2-6 Years',
    salary: '₹28,00,000 - ₹52,00,000 / yr',
    skills: ['Java', 'Spring Boot', 'Kafka', 'Distributed Systems', 'SQL', 'Linux', 'Unit Testing'],
    tags: ['Java', 'Kafka', 'Investment Banking', 'Hyderabad', 'Bengaluru'],
    responsibilities: [
      'Develop real-time algorithmic trade confirmation engines.',
      'Optimize Java memory allocation and garbage collection parameters.',
      'Participate in global architecture and code review sessions.'
    ],
    requirements: [
      'Strong core Java proficiency (multithreading, memory model, collections).',
      'Experience with messaging queues (Kafka, RabbitMQ) and relational databases.',
      'B.Tech / M.Tech in Computer Science or related field.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://www.goldmansachs.com',
    industry: 'Investment Banking & Fintech',
    is_active: true
  },
  {
    id: 'job_in_java_5',
    external_job_id: 'persistent-java-pune-2026',
    source: 'Persistent Systems',
    company: 'Persistent Systems',
    title: 'Java Microservices Specialist',
    location: 'Pune, Maharashtra / Hyderabad / Indore',
    description: 'Build modern digital banking and healthcare applications using Java 17, Spring Boot, Docker, Kubernetes, and AWS.',
    url: 'https://www.persistent.com/careers',
    posted_at: '5 days ago',
    employment_type: 'Full-time',
    experience_required: '3-7 Years',
    salary: '₹14,00,000 - ₹26,00,000 / yr',
    skills: ['Java', 'Spring Boot', 'Microservices', 'Docker', 'Kubernetes', 'AWS', 'REST APIs'],
    tags: ['Java', 'Spring Boot', 'Pune', 'Indore', 'Digital Engineering'],
    responsibilities: [
      'Modernize legacy monoliths into cloud-native Spring Boot microservices.',
      'Implement API security with OAuth2 and JWT token validation.',
      'Set up CI/CD automation with Jenkins and GitHub Actions.'
    ],
    requirements: [
      '3+ years hands-on experience in Java and Spring Boot microservices.',
      'Experience with database ORMs (Hibernate / JPA) and REST API design.',
      'Good communication and client interaction skills.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://www.persistent.com',
    industry: 'IT Services & Digital Engineering',
    is_active: true
  },

  // -------------------------------------------------------------
  // 3. REACT, NEXT.JS, TYPESCRIPT, FRONTEND (INDIA)
  // -------------------------------------------------------------
  {
    id: 'job_in_react_1',
    external_job_id: 'cred-react-web-2026',
    source: 'CRED Careers',
    company: 'CRED',
    title: 'Senior Frontend Engineer - React & TypeScript',
    location: 'Bengaluru, Karnataka (Onsite)',
    description: 'Craft world-class interactive web experiences and financial dashboards. High emphasis on pixel perfection, smooth 60fps animations, React 19, TypeScript, and Web Performance.',
    url: 'https://careers.cred.club',
    posted_at: '1 day ago',
    employment_type: 'Full-time',
    experience_required: '3-6 Years',
    salary: '₹26,00,000 - ₹48,00,000 / yr',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Web Performance', 'Redux', 'HTML/CSS'],
    tags: ['React', 'TypeScript', 'Next.js', 'Fintech', 'Bengaluru'],
    responsibilities: [
      'Build fluid, responsive credit and reward interfaces for millions of premium members.',
      'Optimize bundle size, Core Web Vitals, and time-to-interactive metrics.',
      'Collaborate with design teams on design system tokens and micro-interactions.'
    ],
    requirements: [
      '3+ years of professional web engineering with React and TypeScript.',
      'Deep mastery of DOM, CSS architecture, and browser rendering lifecycle.',
      'Obsession with UI aesthetics and micro-animations.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://cred.club',
    industry: 'Fintech & Lifestyle',
    is_active: true
  },
  {
    id: 'job_in_react_2',
    external_job_id: 'groww-frontend-2026',
    source: 'Groww Careers',
    company: 'Groww',
    title: 'Frontend Developer - React & Next.js',
    location: 'Bengaluru, Karnataka / Remote India',
    description: 'Help millions of Indians invest in stocks and mutual funds. Build fast, accessible web trading terminals in Next.js, React, TypeScript, and WebSockets.',
    url: 'https://groww.in/careers',
    posted_at: '2 days ago',
    employment_type: 'Full-time',
    experience_required: '2-5 Years',
    salary: '₹18,00,000 - ₹34,00,000 / yr',
    skills: ['React', 'Next.js', 'TypeScript', 'WebSockets', 'Tailwind CSS', 'REST APIs', 'Redux'],
    tags: ['React', 'Next.js', 'TypeScript', 'Fintech', 'Remote India'],
    responsibilities: [
      'Develop real-time candlestick charts and order placement widgets.',
      'Integrate WebSocket feeds for live market tick data without frame drops.',
      'Implement Server-Side Rendering (SSR) and SEO optimizations.'
    ],
    requirements: [
      '2+ years experience in React and modern state management (Redux / Zustand).',
      'Strong TypeScript skills and familiarity with Next.js App Router.',
      'Experience in real-time data visualization is a plus.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://groww.in',
    industry: 'WealthTech & Investing',
    is_active: true
  },
  {
    id: 'job_in_react_3',
    external_job_id: 'zoho-ui-react-2026',
    source: 'Zoho Careers',
    company: 'Zoho',
    title: 'Frontend Web Engineer (React / TypeScript)',
    location: 'Chennai, Tamil Nadu / Tenkasi / Coimbatore',
    description: 'Work on Zoho’s suite of global SaaS applications. Build accessible, enterprise-grade web components in React, TypeScript, HTML/CSS, and REST APIs.',
    url: 'https://www.zoho.com/careers',
    posted_at: '3 days ago',
    employment_type: 'Full-time',
    experience_required: '1-4 Years',
    salary: '₹10,00,000 - ₹20,00,000 / yr',
    skills: ['React', 'JavaScript', 'TypeScript', 'HTML/CSS', 'Accessibility', 'REST APIs', 'Git'],
    tags: ['React', 'TypeScript', 'SaaS', 'Chennai', 'Coimbatore'],
    responsibilities: [
      'Build reusable UI widget libraries for Zoho CRM and Mail products.',
      'Ensure WCAG accessibility compliance across cross-browser environments.',
      'Write modular, self-documenting frontend code.'
    ],
    requirements: [
      'Solid command over JavaScript (ES6+), React, and semantic HTML/CSS.',
      'Familiarity with TypeScript and modern bundlers (Vite / Webpack).',
      'Strong problem-solving and debugging skills.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://www.zoho.com',
    industry: 'Enterprise SaaS & Cloud',
    is_active: true
  },
  {
    id: 'job_in_react_4',
    external_job_id: 'browserstack-fe-2026',
    source: 'BrowserStack Careers',
    company: 'BrowserStack',
    title: 'Senior React Engineer - Live Testing Cloud',
    location: 'Mumbai, Maharashtra (Hybrid)',
    description: 'Build real-time remote browser streaming and debugging consoles. High challenges in canvas rendering, WebRTC, React, TypeScript, and WebSockets.',
    url: 'https://www.browserstack.com/careers',
    posted_at: '2 days ago',
    employment_type: 'Full-time',
    experience_required: '4-7 Years',
    salary: '₹28,00,000 - ₹48,00,000 / yr',
    skills: ['React', 'TypeScript', 'WebSockets', 'Web Performance', 'REST APIs', 'Node.js'],
    tags: ['React', 'TypeScript', 'Mumbai', 'DevTools', 'WebRTC'],
    responsibilities: [
      'Architect the web dashboard for remote device farm interactions.',
      'Optimize frame latency for interactive browser session mirroring.',
      'Maintain automated end-to-end testing with Playwright and Cypress.'
    ],
    requirements: [
      '4+ years building high-complexity single page applications in React.',
      'Deep understanding of frontend network protocols and rendering pipelines.',
      'Strong focus on performance engineering.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://www.browserstack.com',
    industry: 'Software Testing & DevTools',
    is_active: true
  },

  // -------------------------------------------------------------
  // 4. FULL STACK (NODE.JS, REACT, TYPESCRIPT, POSTGRESQL) (INDIA)
  // -------------------------------------------------------------
  {
    id: 'job_in_fs_1',
    external_job_id: 'razorpay-fs-2026',
    source: 'Razorpay Careers',
    company: 'Razorpay',
    title: 'Full Stack Engineer - Merchant Platform',
    location: 'Bengaluru, Karnataka (Hybrid)',
    description: 'Build unified payment gateway dashboards and onboarding workflows in React, Node.js, TypeScript, and PostgreSQL for over 10 million Indian businesses.',
    url: 'https://razorpay.com/jobs',
    posted_at: '1 day ago',
    employment_type: 'Full-time',
    experience_required: '3-6 Years',
    salary: '₹24,00,000 - ₹44,00,000 / yr',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs', 'Docker', 'Redis'],
    tags: ['Full Stack', 'React', 'Node.js', 'PostgreSQL', 'Fintech'],
    responsibilities: [
      'Develop end-to-end features across merchant frontend and API backends.',
      'Design reliable database schemas and idempotent transaction APIs.',
      'Implement real-time payment status webhooks and notifications.'
    ],
    requirements: [
      '3+ years full stack experience with React on the frontend and Node.js on the backend.',
      'Solid experience with PostgreSQL and relational database transactions.',
      'Strong understanding of API security and authentication standards.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://razorpay.com',
    industry: 'Payment Gateway & Fintech',
    is_active: true
  },
  {
    id: 'job_in_fs_2',
    external_job_id: 'meesho-fs-2026',
    source: 'Meesho Careers',
    company: 'Meesho',
    title: 'Full Stack Developer - Seller Experience',
    location: 'Bengaluru, Karnataka (Hybrid)',
    description: 'Empower 1M+ small Indian sellers. Build inventory management, catalog uploads, and payout dashboards using React, Next.js, Node.js, and MongoDB/PostgreSQL.',
    url: 'https://www.meesho.io/jobs',
    posted_at: '2 days ago',
    employment_type: 'Full-time',
    experience_required: '2-5 Years',
    salary: '₹20,00,000 - ₹36,00,000 / yr',
    skills: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'MongoDB', 'REST APIs', 'TypeScript'],
    tags: ['Full Stack', 'E-Commerce', 'Node.js', 'React', 'Bengaluru'],
    responsibilities: [
      'Deliver intuitive web portals for rural and small-town suppliers.',
      'Build scalable backend services for bulk product catalog processing.',
      'Optimize image compression and CDN delivery for low-bandwidth networks.'
    ],
    requirements: [
      '2+ years in full-stack JavaScript / TypeScript development.',
      'Experience in building consumer-facing or supplier-facing web apps.',
      'Comfortable working in fast-paced product environments.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://www.meesho.com',
    industry: 'Social E-Commerce & Retail',
    is_active: true
  },
  {
    id: 'job_in_fs_3',
    external_job_id: 'freshworks-fs-2026',
    source: 'Freshworks Careers',
    company: 'Freshworks',
    title: 'Full Stack Engineer - Customer Journey',
    location: 'Chennai, Tamil Nadu / Hyderabad / Remote India',
    description: 'Work on Freshdesk and Freshsales suites. Build collaborative ticketing and CRM capabilities using React, TypeScript, Node.js, and AWS.',
    url: 'https://www.freshworks.com/company/careers',
    posted_at: '3 days ago',
    employment_type: 'Full-time',
    experience_required: '3-7 Years',
    salary: '₹18,00,000 - ₹35,00,000 / yr',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'REST APIs', 'MySQL', 'GraphQL'],
    tags: ['Full Stack', 'SaaS', 'React', 'Node.js', 'Chennai'],
    responsibilities: [
      'Design modular frontends in React and micro-backends in Node.js.',
      'Integrate multi-channel communications (Email, WhatsApp, Chat).',
      'Optimize database queries on large-scale multi-tenant databases.'
    ],
    requirements: [
      '3+ years full-stack product development experience.',
      'Strong proficiency in React, Node.js, and modern TypeScript.',
      'Experience with AWS services and relational database optimization.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://www.freshworks.com',
    industry: 'Customer Engagement SaaS',
    is_active: true
  },
  {
    id: 'job_in_fs_4',
    external_job_id: 'signoz-fs-2026',
    source: 'SigNoz Careers',
    company: 'SigNoz',
    title: 'Full Stack Developer - Open Source Observability',
    location: 'Bengaluru / Remote India',
    description: 'Build open-source application performance monitoring (APM) and log analysis platforms. Work with React, TypeScript, Node.js, Go, and ClickHouse.',
    url: 'https://signoz.io/careers',
    posted_at: '1 day ago',
    employment_type: 'Full-time',
    experience_required: '2-5 Years',
    salary: '₹22,00,000 - ₹40,00,000 / yr',
    skills: ['React', 'TypeScript', 'Node.js', 'Go', 'Docker', 'REST APIs', 'SQL'],
    tags: ['Full Stack', 'Open Source', 'Observability', 'Remote India'],
    responsibilities: [
      'Build responsive trace visualization and metrics query builder UIs.',
      'Develop aggregation backend APIs in TypeScript and Go.',
      'Engage with open-source developer community on GitHub and Slack.'
    ],
    requirements: [
      'Strong full stack foundation with React and Node.js or Go.',
      'Interest in distributed systems, observability, and dev tools.',
      'Passion for open-source software.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://signoz.io',
    industry: 'Developer Tools & Observability',
    is_active: true
  },

  // -------------------------------------------------------------
  // 5. GO, KUBERNETES, DEVOPS & CLOUD INFRASTRUCTURE (INDIA)
  // -------------------------------------------------------------
  {
    id: 'job_in_devops_1',
    external_job_id: 'hasura-go-cloud-2026',
    source: 'Hasura Careers',
    company: 'Hasura',
    title: 'Cloud Systems Engineer (Go & Kubernetes)',
    location: 'Bengaluru, Karnataka / Remote India',
    description: 'Build Hasura Cloud infrastructure across multi-cloud regions. Deep work in Go, Kubernetes, Terraform, Docker, and PostgreSQL.',
    url: 'https://hasura.io/careers',
    posted_at: '2 days ago',
    employment_type: 'Full-time',
    experience_required: '3-6 Years',
    salary: '₹28,00,000 - ₹50,00,000 / yr',
    skills: ['Go', 'Kubernetes', 'Docker', 'Terraform', 'PostgreSQL', 'AWS', 'Linux'],
    tags: ['Go', 'Kubernetes', 'Cloud', 'GraphQL', 'Remote India'],
    responsibilities: [
      'Manage multi-region Kubernetes clusters serving billions of GraphQL operations.',
      'Automate cloud infrastructure provisioning using Terraform and Helm.',
      'Write custom Kubernetes operators and internal control planes in Go.'
    ],
    requirements: [
      '3+ years experience with Go and Kubernetes in production.',
      'Hands-on knowledge of cloud networking, DNS, and TLS certificates.',
      'Strong troubleshooting skills in Linux environments.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://hasura.io',
    industry: 'Data Infrastructure & SaaS',
    is_active: true
  },
  {
    id: 'job_in_devops_2',
    external_job_id: 'zomato-devops-2026',
    source: 'Zomato Careers',
    company: 'Zomato',
    title: 'DevOps & Site Reliability Engineer',
    location: 'Gurgaon, Haryana / Noida (Hybrid)',
    description: 'Ensure 99.99% reliability during IPL and festival peak seasons. Automate CI/CD, Kubernetes autoscaling, AWS infrastructure, and monitoring in Prometheus/Grafana.',
    url: 'https://www.zomato.com/careers',
    posted_at: '1 day ago',
    employment_type: 'Full-time',
    experience_required: '3-7 Years',
    salary: '₹24,00,000 - ₹45,00,000 / yr',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux', 'Python'],
    tags: ['DevOps', 'SRE', 'AWS', 'Kubernetes', 'Gurgaon'],
    responsibilities: [
      'Scale infrastructure to handle 10x traffic surges during major events.',
      'Implement zero-downtime Canary and Blue-Green deployment pipelines.',
      'Conduct chaos engineering experiments and automate incident response.'
    ],
    requirements: [
      '3+ years SRE or DevOps experience on high-traffic AWS infrastructure.',
      'Proficiency in Kubernetes, Helm, Terraform, and Linux shell scripting.',
      'Experience with observability stacks (Prometheus, Grafana, OpenTelemetry).'
    ],
    company_logo: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://www.zomato.com',
    industry: 'FoodTech & Hyperlocal Delivery',
    is_active: true
  },
  {
    id: 'job_in_devops_3',
    external_job_id: 'tcs-cloud-mumbai-2026',
    source: 'TCS Careers',
    company: 'Tata Consultancy Services',
    title: 'Cloud DevOps Architect (AWS / Azure)',
    location: 'Mumbai, Maharashtra / Ahmedabad / Kolkata / Chennai',
    description: 'Lead enterprise cloud transformations for global banking and automotive clients. Architect CI/CD, Terraform infrastructure, and Docker container ecosystems.',
    url: 'https://www.tcs.com/careers',
    posted_at: '4 days ago',
    employment_type: 'Full-time',
    experience_required: '5-10 Years',
    salary: '₹18,00,000 - ₹32,00,000 / yr',
    skills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
    tags: ['DevOps', 'AWS', 'Azure', 'Mumbai', 'Ahmedabad'],
    responsibilities: [
      'Design enterprise landing zones on AWS and Microsoft Azure.',
      'Migrate monolithic applications to microservices on managed Kubernetes (EKS / AKS).',
      'Enforce DevSecOps compliance and automated vulnerability scanning.'
    ],
    requirements: [
      '5+ years experience in Cloud & DevOps architecture.',
      'Certifications in AWS Solutions Architect or Azure Administrator preferred.',
      'Deep understanding of CI/CD pipelines (Jenkins, GitLab CI, GitHub Actions).'
    ],
    company_logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://www.tcs.com',
    industry: 'Global IT & Consulting',
    is_active: true
  },

  // -------------------------------------------------------------
  // 6. MOBILE (REACT NATIVE, FLUTTER, ANDROID, IOS) (INDIA)
  // -------------------------------------------------------------
  {
    id: 'job_in_mob_1',
    external_job_id: 'paytm-rn-2026',
    source: 'Paytm Careers',
    company: 'Paytm',
    title: 'Mobile Engineer - React Native & Android',
    location: 'Noida, Uttar Pradesh / Bengaluru (Hybrid)',
    description: 'Build fast, responsive mobile payment and soundbox companion experiences used by 300 million Indians. Work with React Native, TypeScript, Kotlin, and native bridge modules.',
    url: 'https://paytm.com/careers',
    posted_at: '2 days ago',
    employment_type: 'Full-time',
    experience_required: '2-5 Years',
    salary: '₹16,00,000 - ₹30,00,000 / yr',
    skills: ['React', 'TypeScript', 'Kotlin', 'REST APIs', 'Git', 'Mobile Development'],
    tags: ['React Native', 'Mobile', 'Noida', 'Fintech', 'Android'],
    responsibilities: [
      'Develop high-performance React Native screens with smooth 60fps transitions.',
      'Build native Android Kotlin bridge modules for hardware POS and NFC payments.',
      'Optimize app launch time, memory footprint, and offline caching.'
    ],
    requirements: [
      '2+ years in mobile development with React Native or Native Android.',
      'Strong understanding of mobile lifecycle, offline storage, and state management.',
      'Published apps on Google Play Store or Apple App Store.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://paytm.com',
    industry: 'Fintech & Digital Payments',
    is_active: true
  },

  // -------------------------------------------------------------
  // 7. QA / AUTOMATION & TESTING (INDIA)
  // -------------------------------------------------------------
  {
    id: 'job_in_qa_1',
    external_job_id: 'clevertap-qa-2026',
    source: 'CleverTap Careers',
    company: 'CleverTap',
    title: 'Software Development Engineer in Test (SDET)',
    location: 'Mumbai, Maharashtra / Remote India',
    description: 'Build automated testing frameworks for real-time customer analytics and push notification engines. Work with TypeScript, Cypress, Playwright, Python, and CI/CD.',
    url: 'https://clevertap.com/careers',
    posted_at: '3 days ago',
    employment_type: 'Full-time',
    experience_required: '2-5 Years',
    salary: '₹15,00,000 - ₹28,00,000 / yr',
    skills: ['Unit Testing', 'TypeScript', 'Python', 'CI/CD', 'Docker', 'REST APIs', 'Git'],
    tags: ['QA', 'SDET', 'Automation', 'Mumbai', 'Remote India'],
    responsibilities: [
      'Design end-to-end automation test suites for web and API platforms.',
      'Integrate automated testing into continuous integration pipelines.',
      'Perform performance, load, and stress testing on backend services.'
    ],
    requirements: [
      '2+ years experience in automated testing with Playwright, Cypress, or Selenium.',
      'Strong programming skills in JavaScript / TypeScript or Python.',
      'Solid understanding of REST API testing and testing methodologies.'
    ],
    company_logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=120',
    company_website: 'https://clevertap.com',
    industry: 'Customer Engagement SaaS',
    is_active: true
  }
];

export class JobIngestionService {
  private static isInitialized = false;

  /**
   * Ensures the database has the full real Indian jobs catalog ingested.
   */
  public static async ensureJobsIngested(): Promise<number> {
    try {
      const existing = await dbGetAllJobs();
      if (existing.length >= REAL_INDIAN_JOBS.length) {
        this.isInitialized = true;
        return existing.length;
      }

      console.log(`[JobIngestionService] Ingesting ${REAL_INDIAN_JOBS.length} real jobs into PostgreSQL...`);
      const insertedCount = await dbSaveJobs(REAL_INDIAN_JOBS);
      console.log(`[JobIngestionService] Successfully ingested ${insertedCount} jobs.`);
      this.isInitialized = true;
      return insertedCount;
    } catch (err) {
      console.error('[JobIngestionService] Error during job ingestion:', err);
      return 0;
    }
  }

  /**
   * Retrieves all active jobs from PostgreSQL.
   */
  public static async getAvailableJobs(): Promise<DbJobRecord[]> {
    await this.ensureJobsIngested();
    const jobs = await dbGetAllJobs();
    return jobs.length > 0 ? jobs : REAL_INDIAN_JOBS;
  }
}
