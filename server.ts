import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Gemini client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is missing. AI features will fallback to smart mock responses if missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key-for-fallback",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ------------------- API ENDPOINTS -------------------

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1. Analyze Resume / ATS Scoring
app.post("/api/ai/analyze-resume", async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: "resumeText is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return realistic AI structure as fallback
      return res.json({
        overallScore: 82,
        summary: `Strong resume for ${targetRole || 'Software Engineering'} roles. Highlights good frontend and cloud experience. Missing explicit metrics for scaling operations.`,
        targetRole: targetRole || "Senior Software Engineer",
        formattingScore: 90,
        keywords: [
          {
            id: "kw_fb_1",
            type: "high",
            title: "Missing Core Skill: 'Distributed Systems Architecture'",
            impactTag: "High Impact",
            description: "Target engineering roles heavily weigh distributed architecture experience.",
            suggestionTitle: "AI Suggestion",
            suggestionText: "Incorporate Kafka, Redis, or microservices orchestration explicitly into experience bullets.",
            originalBullet: "Worked on cloud software services.",
            suggestedBullet: "Architected distributed cloud services handling high-throughput event streaming with Kafka & Redis."
          },
          {
            id: "kw_fb_2",
            type: "medium",
            title: "Quantify Impact in Metrics",
            description: "Bullets lack percentage improvements or user scale numbers.",
            suggestionTitle: "AI Suggestion",
            suggestionText: "Add % latency improvement or dollar cost savings.",
            originalBullet: "Optimized frontend web app performance.",
            suggestedBullet: "Optimized core web vitals and React bundle size, improving page load speed by 42% for 200k daily active users."
          }
        ],
        impactPoints: [
          "Include revenue or cost impact figures in top 2 positions.",
          "Use strong action verbs like 'Engineered', 'Pioneered', 'Architected'."
        ],
        grammarIssues: ["Ensure uniform past tense verbs for previous employment roles."]
      });
    }

    const ai = getGenAI();
    const prompt = `Analyze the following resume for a target role of "${targetRole || 'Software Engineer'}".
    Provide an ATS scoring analysis in JSON format with:
    - overallScore (0-100 number)
    - summary (concise paragraph summary)
    - formattingScore (0-100 number)
    - keywords: array of objects with { id, type ("high" | "medium" | "success"), title, impactTag, description, suggestionTitle, suggestionText, originalBullet, suggestedBullet }
    - impactPoints: array of actionable bullet improvement tips
    - grammarIssues: array of grammar or style fixes
    
    Resume content:
    """
    ${resumeText}
    """`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            formattingScore: { type: Type.INTEGER },
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  impactTag: { type: Type.STRING },
                  description: { type: Type.STRING },
                  suggestionTitle: { type: Type.STRING },
                  suggestionText: { type: Type.STRING },
                  originalBullet: { type: Type.STRING },
                  suggestedBullet: { type: Type.STRING },
                },
              },
            },
            impactPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            grammarIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/ai/analyze-resume:", err);
    res.status(500).json({ error: "Failed to analyze resume", details: err.message });
  }
});

// 2. Job Match Scoring & Missing Skills Analysis
app.post("/api/ai/match-job", async (req, res) => {
  try {
    const { resumeText, jobDescription, jobTitle, company } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: "jobDescription is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        matchScore: 86,
        matchingSkills: ["React", "TypeScript", "Node.js", "Git", "REST APIs"],
        missingSkills: ["GraphQL", "Kubernetes", "System Architecture Documentation"],
        keywordDensityScore: 84,
        suggestions: [
          "Add GraphQL query building experience to your recent project section.",
          "Emphasize Kubernetes container deployments in your DevOps skill highlights."
        ]
      });
    }

    const ai = getGenAI();
    const prompt = `Compare this resume against the target job description for position "${jobTitle || 'Role'}" at "${company || 'Company'}".
    Provide an analysis JSON containing:
    - matchScore (0-100 number)
    - matchingSkills (array of strings)
    - missingSkills (array of strings)
    - keywordDensityScore (0-100 number)
    - suggestions (array of string improvement recommendations)

    Resume:
    """
    ${resumeText || 'Experienced Senior Software Engineer with React, TypeScript, Node.js, Python, AWS, and Docker.'}
    """

    Job Description:
    """
    ${jobDescription}
    """`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywordDensityScore: { type: Type.INTEGER },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Error in /api/ai/match-job:", err);
    res.status(500).json({ error: "Failed to perform job match analysis", details: err.message });
  }
});

// 2b. AI Structured Resume Parsing
app.post("/api/ai/parse-resume", async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: "resumeText is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        fullName: "Alex Morgan",
        email: "alex.dev@hireflow.ai",
        phone: "+1 (555) 234-5678",
        linkedIn: "https://linkedin.com/in/alex-dev",
        gitHub: "https://github.com/alex-dev-lead",
        portfolio: "https://alexmorgan.dev",
        summary: "Seasoned Senior Software Engineer with 7+ years of experience in distributed cloud systems, modern web architecture (React, TypeScript, Node.js), and high-throughput microservices.",
        education: [
          { degree: "B.S. in Computer Science", institution: "Stanford University", year: "2018", gpa: "3.9/4.0" }
        ],
        experience: [
          {
            company: "Apple",
            role: "Senior Software Engineer",
            period: "2021 - Present",
            location: "Cupertino, CA",
            bullets: [
              "Architected and deployed highly available distributed streaming services handling 10k+ req/sec using Kafka & Redis.",
              "Led frontend performance migration to Next.js and TypeScript, reducing p99 latency by 35%.",
              "Automated AWS multi-region infrastructure (EC2, EKS, S3) with Terraform CI/CD pipelines."
            ]
          },
          {
            company: "TechCorp Inc.",
            role: "Full Stack Developer",
            period: "2018 - 2021",
            location: "San Francisco, CA",
            bullets: [
              "Engineered real-time telemetry dashboards serving 250k daily active users.",
              "Designed resilient PostgreSQL schemas and GraphQL API microservices."
            ]
          }
        ],
        projects: [
          {
            name: "CloudScale Engine",
            description: "High-performance distributed event broker built with Go and WebSockets.",
            technologies: ["Go", "Kafka", "Docker", "Kubernetes"]
          }
        ],
        skills: ["TypeScript", "React", "Next.js", "Node.js", "Go", "Python", "AWS", "Docker", "Kubernetes", "PostgreSQL", "Kafka", "Redis"],
        certifications: ["AWS Certified Solutions Architect", "CKA (Certified Kubernetes Administrator)"],
        languages: ["English (Native)", "Spanish (Professional)"],
        achievements: ["Patent co-inventor for distributed data caching", "Top 1% Contributor on GitHub"]
      });
    }

    const ai = getGenAI();
    const prompt = `Parse the following raw resume text into a structured JSON object containing:
    - fullName, email, phone, linkedIn, gitHub, portfolio, summary
    - education (array of { degree, institution, year, gpa })
    - experience (array of { company, role, period, location, bullets: string[] })
    - projects (array of { name, description, technologies: string[] })
    - skills (array of string skill names)
    - certifications (array of strings)
    - languages (array of strings)
    - achievements (array of strings)

    Resume Text:
    """
    ${resumeText}
    """`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Error in /api/ai/parse-resume:", err);
    res.status(500).json({ error: "Failed to parse resume", details: err.message });
  }
});

// 2c. AI Resume Tailoring against JD
app.post("/api/ai/tailor-resume", async (req, res) => {
  try {
    const { resumeContent, jobDescription, targetRole, company } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        matchPercentage: 92,
        missingSkills: ["GraphQL Subscriptions", "Kubernetes Mesh"],
        missingKeywords: ["Event-Driven Microservices", "CI/CD Gateways"],
        suggestedChanges: [
          "Reframe Apple experience bullet 1 to highlight Event-Driven architecture.",
          "Insert Kubernetes cluster deployment explicitly into skills section."
        ],
        tailoredResumeContent: `${resumeContent || ''}\n\n[TAILORED FOR ${company || 'TARGET ROLE'}]:\n• Spearheaded event-driven microservice orchestration using Kubernetes & Docker.\n• Integrated GraphQL subscriptions and distributed caching for low-latency state synchronization.`,
        tailoredVersionName: `Tailored: ${targetRole || 'Role'} at ${company || 'Target Co'}`
      });
    }

    const ai = getGenAI();
    const prompt = `Tailor this candidate's resume for the specific job description at "${company || 'Target Company'}" for role "${targetRole || 'Target Role'}".
    Provide JSON with:
    - matchPercentage (0-100 number)
    - missingSkills (array of strings)
    - missingKeywords (array of strings)
    - suggestedChanges (array of string bullet point changes)
    - tailoredResumeContent (the full improved resume text incorporating target keywords)
    - tailoredVersionName (short version string)

    Original Resume:
    """
    ${resumeContent}
    """

    Job Description:
    """
    ${jobDescription}
    """`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Error in /api/ai/tailor-resume:", err);
    res.status(500).json({ error: "Failed to tailor resume", details: err.message });
  }
});

// 2d. Section / Bullet Point AI Optimizer
app.post("/api/ai/improve-section", async (req, res) => {
  try {
    const { sectionName, currentText, improvementType, targetRole } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        originalText: currentText || "Built backend web services.",
        improvedText: sectionName === 'summary' 
          ? "High-impact Senior Software Engineer with 7+ years of expertise in architecting resilient distributed microservices, optimizing web application performance by 35%+, and leading cloud infrastructure deployments across AWS and Kubernetes."
          : "Architected distributed REST/gRPC backend microservices in Node.js and Go, reducing API p99 response times by 42% for 250,000 active daily users.",
        reason: `Enhanced with active leadership verbs, quantified metrics, and target ATS keywords for ${targetRole || 'Senior Software Engineer'}.`,
        expectedAtsIncrease: 7
      });
    }

    const ai = getGenAI();
    const prompt = `Improve the following resume section ("${sectionName}") for a target role of "${targetRole || 'Senior Software Engineer'}".
    Improvement goal: ${improvementType || 'Quantify impact, add strong action verbs, fix passive voice, and optimize for ATS keywords'}.
    
    Current Content:
    """
    ${currentText}
    """
    
    Provide JSON with:
    - originalText
    - improvedText
    - reason (explanation of why this version is stronger)
    - expectedAtsIncrease (integer number between 3 and 12)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Error in /api/ai/improve-section:", err);
    res.status(500).json({ error: "Failed to improve resume section", details: err.message });
  }
});

// 3. Cover Letter Generator
app.post("/api/ai/generate-cover-letter", async (req, res) => {
  try {
    const { resumeText, jobDescription, jobTitle, company, tone } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const selectedTone = tone || "professional & confident";
      return res.json({
        coverLetter: `Dear Hiring Manager at ${company || 'the Hiring Team'},

I am writing to express my strong enthusiasm for the ${jobTitle || 'Software Engineer'} role. With over 6 years of hands-end engineering experience across scalable cloud services, modern web frameworks, and high-performance system design, I am confident in my ability to drive immediate value for your team.

Throughout my career, I have consistently focused on delivering robust, high-impact software solutions. For example, at Apple, I architected distributed streaming pipelines handling high-throughput traffic while reducing frontend load times by 35%. My technical toolkit—spanning TypeScript, React, Node.js, Python, and AWS—aligns directly with the priorities outlined in your job requirements.

What excites me most about ${company || 'your company'} is your commitment to technical innovation and engineering excellence. I thrive in collaborative environments that demand technical rigor and product ownership, and I look forward to contributing to your upcoming roadmap.

Thank you for your time and consideration. I would welcome the opportunity to discuss how my background and technical leadership align with your team's goals.

Sincerely,
Alex Dev`
      });
    }

    const ai = getGenAI();
    const prompt = `Generate a compelling, highly tailored cover letter for the role of "${jobTitle || 'Role'}" at "${company || 'Company'}".
    Tone requested: ${tone || 'Professional, confident, and engaging'}.
    
    Resume details:
    """
    ${resumeText || 'Senior Software Engineer with 7+ years in web development, cloud architectures, TypeScript, React, Python, AWS.'}
    """

    Job description details:
    """
    ${jobDescription || 'Seeking an innovative engineer to build high-scale web platforms and APIs.'}
    """`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({ coverLetter: response.text });
  } catch (err: any) {
    console.error("Error in /api/ai/generate-cover-letter:", err);
    res.status(500).json({ error: "Failed to generate cover letter", details: err.message });
  }
});

// 4. Interview Feedback / Coach Evaluation
app.post("/api/ai/interview-feedback", async (req, res) => {
  try {
    const { question, answer, role } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        score: 88,
        starBreakdown: {
          situation: "Clear context provided regarding team scalability challenge.",
          task: "Well-defined objective to reduce API response latency.",
          action: "Strong technical detail on Redis caching and query indexing.",
          result: "Quantified 40% speedup achieved."
        },
        strengths: ["Great technical precision", "Data-driven results"],
        areasToImprove: ["Mention cross-functional stakeholder communication briefly."],
        polishedAnswer: "In my previous role, I faced an API bottleneck during peak traffic. I led the backend refactoring by introducing Redis caching layers and optimizing PostgreSQL query execution plans, ultimately reducing p99 latency by 42% for 150k active sessions."
      });
    }

    const ai = getGenAI();
    const prompt = `Evaluate the candidate's answer for an interview question for role "${role || 'Software Engineer'}".
    Question: "${question}"
    Candidate Answer: "${answer}"

    Provide evaluation JSON with:
    - score (0-100 number)
    - starBreakdown: object with { situation, task, action, result }
    - strengths: array of string bullet points
    - areasToImprove: array of string bullet points
    - polishedAnswer: an exemplar STAR-aligned improved answer string`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            starBreakdown: {
              type: Type.OBJECT,
              properties: {
                situation: { type: Type.STRING },
                task: { type: Type.STRING },
                action: { type: Type.STRING },
                result: { type: Type.STRING },
              },
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasToImprove: { type: Type.ARRAY, items: { type: Type.STRING } },
            polishedAnswer: { type: Type.STRING },
          },
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Error in /api/ai/interview-feedback:", err);
    res.status(500).json({ error: "Failed to evaluate interview response", details: err.message });
  }
});

// 5. AI Career Coach Chat
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { prompt, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        reply: `As your HireFlow AI Career Coach, I recommend focusing on highlighting quantifiable achievements in your resume and preparing STAR-structured answers for technical system design interviews. What specific topic would you like to explore next?`
      });
    }

    const ai = getGenAI();
    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction: "You are HireFlow AI's Lead Career Strategist and Tech Recruitment Coach. Provide concise, strategic, high-value career, resume, and interview guidance for software engineering and tech professionals.",
      },
    });

    const response = await chat.sendMessage({ message: prompt });
    res.json({ reply: response.text });
  } catch (err: any) {
    console.error("Error in /api/ai/chat:", err);
    res.status(500).json({ error: "Failed to process AI chat message", details: err.message });
  }
});

// ------------------- VITE MIDDLEWARE SETUP -------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HireFlow AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
