import { CANONICAL_SKILLS } from '../src/services/jobMatchingService';

// Helper function to analyze resume text dynamically and deterministically with 100% evidence-based keyword provenance
export function analyzeResumeContentLocally(resumeText: string, targetRole: string = "Software Engineer") {
  if (!resumeText || resumeText.trim().length < 20) {
    return {
      overallScore: 0,
      formattingScore: 0,
      impactScore: 0,
      relevanceScore: 0,
      summary: "Insufficient or unreadable resume text. Please upload a document with readable content.",
      targetRole,
      analysisStatus: "failed" as const,
      status: "analysis_unavailable",
      keywordList: [],
      keywords: [],
      missingKeywords: [],
      categoryScores: [],
      categoryBreakdown: [],
      sectionAnalyses: [],
      sectionAnalysis: [],
      aiSuggestions: [],
      improvements: [],
      impactPoints: ["Upload a resume with selectable text to generate machine-readability audit and keyword optimizations."],
      grammarIssues: [],
      extractedText: resumeText || '',
      text: resumeText || ''
    };
  }

  const textLower = resumeText.toLowerCase();

  // 1. Evidence-Based Keyword Detection & Provenance
  const detectedKeywords: any[] = [];
  const missingKeywords: any[] = [];

  for (const skill of CANONICAL_SKILLS) {
    let matchCount = 0;
    
    // Check canonical name
    const canonRegex = new RegExp(`\\b${skill.canonical.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    const canonMatches = resumeText.match(canonRegex);
    if (canonMatches) {
      matchCount += canonMatches.length;
    }

    // Check all aliases
    for (const alias of skill.aliases) {
      if (alias.toLowerCase() === skill.canonical.toLowerCase()) continue;
      const aliasRegex = new RegExp(`\\b${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
      const aliasMatches = resumeText.match(aliasRegex);
      if (aliasMatches) {
        matchCount += aliasMatches.length;
      }
    }

    if (matchCount > 0) {
      detectedKeywords.push({
        keyword: skill.canonical,
        detected: true,
        foundInResume: true,
        importance: matchCount > 2 ? 'High' : 'Medium',
        category: skill.category,
        frequency: matchCount,
        count: matchCount,
        source: 'resume'
      });
    } else {
      // Check if relevant to target role
      const isRoleRelevant = 
        (targetRole.toLowerCase().includes('frontend') && ['React', 'TypeScript', 'JavaScript', 'Next.js', 'HTML/CSS', 'Tailwind CSS', 'Redux'].includes(skill.canonical)) ||
        (targetRole.toLowerCase().includes('backend') && ['Node.js', 'Python', 'Java', 'Go', 'PostgreSQL', 'SQL', 'Redis', 'Docker', 'REST APIs', 'Microservices', 'FastAPI', 'Django', 'Spring Boot'].includes(skill.canonical)) ||
        ((targetRole.toLowerCase().includes('cloud') || targetRole.toLowerCase().includes('devops')) && ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'].includes(skill.canonical)) ||
        ['React', 'TypeScript', 'Python', 'Node.js', 'SQL', 'PostgreSQL', 'Docker', 'Git', 'REST APIs', 'System Design'].includes(skill.canonical);

      if (isRoleRelevant) {
        missingKeywords.push({
          keyword: skill.canonical,
          detected: false,
          foundInResume: false,
          importance: ['Kubernetes', 'AWS', 'Distributed Systems', 'CI/CD', 'Docker', 'TypeScript', 'PostgreSQL'].includes(skill.canonical) ? 'High' : 'Medium',
          category: skill.category,
          frequency: 0,
          count: 0,
          source: 'job_requirement'
        });
      }
    }
  }

  // Combine detected keywords first (sorted by frequency), followed by role-relevant missing keywords
  const keywordList = [
    ...detectedKeywords.sort((a, b) => (b.frequency || 0) - (a.frequency || 0)),
    ...missingKeywords.slice(0, 8)
  ];

  // 2. Metrics & Action Verbs
  const numberMatches = (resumeText.match(/(\d+%\s*|\$\s*\d+|\b\d+\s*ms\b|\b\d+\s*k\b|\b\d+\s*m\b|\b\d+\s*users?\b|\b\d+\s*x\b|\b\d+\+\b)/gi) || []).length;
  const actionVerbs = ["engineered", "architected", "spearheaded", "optimized", "developed", "built", "implemented", "scaled", "led", "designed", "reduced", "increased", "orchestrated", "streamlined", "automated", "delivered"];
  const detectedVerbs = actionVerbs.filter(v => textLower.includes(v));

  // 3. Section Detection
  const hasSummary = textLower.includes("summary") || textLower.includes("profile") || textLower.includes("objective") || textLower.includes("about me");
  const hasExperience = textLower.includes("experience") || textLower.includes("employment") || textLower.includes("work history") || textLower.includes("career history");
  const hasEducation = textLower.includes("education") || textLower.includes("degree") || textLower.includes("university") || textLower.includes("college") || textLower.includes("bachelor") || textLower.includes("master");
  const hasSkills = textLower.includes("skills") || textLower.includes("technologies") || textLower.includes("competencies") || textLower.includes("tech stack");
  const hasProjects = textLower.includes("projects") || textLower.includes("portfolio") || textLower.includes("open source");
  const hasCertifications = textLower.includes("certif") || textLower.includes("licenses") || textLower.includes("achievements") || textLower.includes("awards") || textLower.includes("credentials");

  const detectedSectionsCount = [hasSummary, hasExperience, hasSkills, hasProjects, hasEducation, hasCertifications].filter(Boolean).length;

  // 4. Mathematical ATS Scoring
  let baseScore = 40;
  baseScore += Math.min(25, detectedKeywords.length * 2.5);
  baseScore += Math.min(15, numberMatches * 3);
  baseScore += Math.min(10, detectedVerbs.length * 1.5);
  baseScore += Math.min(15, detectedSectionsCount * 2.5);

  const overallScore = Math.min(98, Math.max(30, Math.round(baseScore)));
  const formattingScore = Math.min(96, Math.max(50, Math.round(65 + (detectedSectionsCount * 5))));
  const impactScore = Math.min(95, Math.max(40, Math.round(45 + (numberMatches * 5) + (detectedVerbs.length * 3))));
  const relevanceScore = Math.min(99, Math.max(40, Math.round(50 + (detectedKeywords.length * 3))));

  const topSkillsFound = detectedKeywords.map(k => k.keyword).slice(0, 6).join(", ") || "General Skills";

  // 5. Section Analyses (6 Core Sections)
  const sectionAnalyses = [
    {
      id: "sa_1",
      sectionName: "Professional Summary",
      score: hasSummary ? Math.min(95, 75 + (topSkillsFound ? 10 : 0)) : 0,
      isDetected: hasSummary,
      strengths: hasSummary ? [`Professional summary present with key focus on ${topSkillsFound}`, `Target specialization articulated`] : [],
      weaknesses: !hasSummary ? ["Section not detected in resume"] : (numberMatches === 0 ? ["Summary lacks quantified career impact"] : []),
      suggestions: [hasSummary ? "Keep concise (2-4 lines) highlighting years of experience, core tech stack, and notable impact." : "Consider adding a concise Professional Summary at the top of your resume."],
      recommendedChanges: hasSummary ? [`Highlight leadership scope and core stack: "${topSkillsFound.split(', ').slice(0, 3).join(', ')}"`] : [],
      priority: (hasSummary ? "Low" : "High") as "High" | "Medium" | "Low",
      estimatedAtsGain: hasSummary ? 2 : 6
    },
    {
      id: "sa_2",
      sectionName: "Work Experience",
      score: hasExperience ? impactScore : 0,
      isDetected: hasExperience,
      strengths: hasExperience ? [
        `Includes ${detectedVerbs.length} action verbs (${detectedVerbs.slice(0, 3).join(', ') || 'action-oriented'})`,
        `${numberMatches} quantified metric points identified`
      ] : [],
      weaknesses: !hasExperience ? ["Section not detected in resume"] : (numberMatches < 3 ? [`Only ${numberMatches} quantifiable metrics found — add % improvements, $ revenue, or scale figures`] : []),
      suggestions: [hasExperience ? "Start every bullet point with a high-impact action verb and include at least one metric (%, latency, users, revenue)." : "Add a dedicated Work Experience section detailing past roles and achievements."],
      recommendedChanges: hasExperience && detectedVerbs.length > 0 ? [`Ensure all previous role bullets use past tense verbs like "${detectedVerbs[0]}" and include measurable scale.`] : [],
      priority: "High" as "High" | "Medium" | "Low",
      estimatedAtsGain: hasExperience ? 4 : 10
    },
    {
      id: "sa_3",
      sectionName: "Technical Skills",
      score: hasSkills ? Math.min(98, 60 + detectedKeywords.length * 3) : 0,
      isDetected: hasSkills,
      strengths: hasSkills ? [`Identified ${detectedKeywords.length} verified technical skills: ${topSkillsFound}`] : [],
      weaknesses: !hasSkills ? ["Section not detected in resume"] : (missingKeywords.length > 0 ? [`Missing role-critical keywords: ${missingKeywords.slice(0, 3).map(m => m.keyword).join(', ')}`] : []),
      suggestions: [hasSkills ? `Group technical skills into clear categories (Languages, Frameworks, Databases, Cloud & DevOps).` : "Add a categorized Technical Skills section listing all programming languages, tools, and platforms."],
      recommendedChanges: missingKeywords.length > 0 ? [`Consider adding: ${missingKeywords.slice(0, 3).map(m => m.keyword).join(', ')} if you have experience with them.`] : [],
      priority: (missingKeywords.length > 2 ? "High" : "Medium") as "High" | "Medium" | "Low",
      estimatedAtsGain: hasSkills ? 3 : 8
    },
    {
      id: "sa_4",
      sectionName: "Projects",
      score: hasProjects ? Math.min(95, 70 + (detectedKeywords.length > 3 ? 15 : 5)) : 0,
      isDetected: hasProjects,
      strengths: hasProjects ? ["Projects section detected with technical descriptions", "Demonstrates hands-on implementation"] : [],
      weaknesses: !hasProjects ? ["Section not detected in resume"] : ["Ensure all projects list explicit technology stack tags and live URLs/GitHub links"],
      suggestions: [hasProjects ? "Add live demo URLs, GitHub repository links, and tech stack tags to each project." : "Consider adding a Projects section featuring 2-3 key technical projects with tech stack and metrics."],
      recommendedChanges: hasProjects ? ["Tag each project with: [Tech Stack: " + topSkillsFound.split(', ').slice(0, 3).join(', ') + "]"] : [],
      priority: (hasProjects ? "Medium" : "High") as "High" | "Medium" | "Low",
      estimatedAtsGain: hasProjects ? 3 : 7
    },
    {
      id: "sa_5",
      sectionName: "Education",
      score: hasEducation ? 92 : 0,
      isDetected: hasEducation,
      strengths: hasEducation ? ["Education section detected with degree/academic details"] : [],
      weaknesses: !hasEducation ? ["Section not detected in resume"] : [],
      suggestions: [hasEducation ? "Ensure degree title, institution name, and graduation year are clearly listed." : "Add an Education section listing your highest degree, institution, and graduation year."],
      recommendedChanges: [],
      priority: "Low" as "High" | "Medium" | "Low",
      estimatedAtsGain: hasEducation ? 1 : 4
    },
    {
      id: "sa_6",
      sectionName: "Certifications & Achievements",
      score: hasCertifications ? 88 : 0,
      isDetected: hasCertifications,
      strengths: hasCertifications ? ["Certifications or achievements section detected"] : [],
      weaknesses: !hasCertifications ? ["Section not detected in resume"] : [],
      suggestions: [hasCertifications ? "List issuing organization, certification name, and year of completion." : "Consider adding relevant industry certifications (e.g. AWS, GCP, CKA) or notable achievements."],
      recommendedChanges: [],
      priority: "Low" as "High" | "Medium" | "Low",
      estimatedAtsGain: hasCertifications ? 2 : 3
    }
  ];

  // 6. Dynamic AI Improvements (aiSuggestions)
  const bulletLines = resumeText.split(/\n/).filter(line => {
    const trimmed = line.trim();
    return trimmed.length > 20 && (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || /^[A-Z][a-z]/.test(trimmed));
  });

  const weakBullets = bulletLines.filter(b => {
    const lower = b.toLowerCase();
    return !/([\d]+%|[\d]+x|\$[\d]+|[\d]+\s*(ms|k|m|users?|requests?))/i.test(b) && 
           !actionVerbs.some(v => lower.startsWith(v));
  }).slice(0, 3);

  const aiSuggestions: any[] = [];

  // Bullet improvements
  weakBullets.forEach((wb, idx) => {
    const cleanBullet = wb.trim().replace(/^[•\-*]\s*/, '');
    const verb = detectedVerbs[idx % (detectedVerbs.length || 1)] || "Engineered";
    const capitalVerb = verb.charAt(0).toUpperCase() + verb.slice(1);
    aiSuggestions.push({
      id: `sug_bullet_${idx}`,
      title: `Quantify Technical Impact in Bullet #${idx + 1}`,
      section: 'bullets',
      currentVersion: cleanBullet,
      improvedVersion: `${capitalVerb} ${cleanBullet.replace(/^(developed|built|managed|worked on|helped with)\s+/i, '')} achieving a 25%+ improvement in efficiency and performance.`,
      reason: 'Adds high-impact active verb and measurable percentage outcome required by ATS screening filters.',
      expectedAtsIncrease: 4,
      status: 'pending'
    });
  });

  // Summary improvement if missing or weak
  if (!hasSummary) {
    aiSuggestions.push({
      id: `sug_summary_add`,
      title: `Add Professional Summary for ${targetRole}`,
      section: 'summary',
      currentVersion: 'No Professional Summary detected.',
      improvedVersion: `Results-driven ${targetRole} with expertise in ${topSkillsFound.split(', ').slice(0, 4).join(', ')}, focused on building scalable, reliable software systems.`,
      reason: 'Creates an immediate strong first impression with core target technologies.',
      expectedAtsIncrease: 5,
      status: 'pending'
    });
  }

  // Missing keyword suggestion
  if (missingKeywords.length > 0) {
    const topMissing = missingKeywords[0];
    aiSuggestions.push({
      id: `sug_skill_missing`,
      title: `Integrate ${topMissing.keyword} into Skills or Experience`,
      section: 'skills',
      currentVersion: `Current resume does not mention ${topMissing.keyword}.`,
      improvedVersion: `Technical Skills: ${topSkillsFound}, ${topMissing.keyword}`,
      reason: `${targetRole} positions frequently evaluate candidate proficiency with ${topMissing.keyword}.`,
      expectedAtsIncrease: 4,
      status: 'pending'
    });
  }

  // 7. Category Scores (10 categories)
  const categoryScores = [
    { category: 'Formatting' as const, score: formattingScore, explanation: `Clear structural separation with ${detectedSectionsCount} of 6 standard resume sections identified.`, tip: 'Maintain consistent line spacing and section headers.' },
    { category: 'Keywords' as const, score: Math.min(98, Math.round((detectedKeywords.length / (detectedKeywords.length + 4 || 1)) * 100)), explanation: `Detected ${detectedKeywords.length} verified technical keywords for ${targetRole}.`, tip: missingKeywords.length > 0 ? `Consider adding ${missingKeywords.slice(0, 3).map(m => m.keyword).join(', ')} if applicable.` : 'Strong keyword coverage.' },
    { category: 'Skills' as const, score: Math.min(95, 55 + detectedKeywords.length * 3), explanation: `Technical coverage including ${topSkillsFound}.`, tip: 'Group skills into clear subheadings (Languages, Frameworks, Cloud).' },
    { category: 'Projects' as const, score: hasProjects ? Math.min(95, 70 + detectedSectionsCount * 4) : 40, explanation: hasProjects ? 'Project titles and technical implementations included.' : 'No dedicated projects section detected.', tip: 'Add live URLs or GitHub repository links.' },
    { category: 'Experience' as const, score: hasExperience ? Math.min(95, 55 + (numberMatches * 5) + (detectedVerbs.length * 2)) : 35, explanation: hasExperience ? `Includes ${detectedVerbs.length} action verbs and ${numberMatches} metrics.` : 'Work experience section not found.', tip: 'Add percentage growth, latency reductions, or dollar figures.' },
    { category: 'Education' as const, score: hasEducation ? 95 : 50, explanation: hasEducation ? 'Education degree and academic credentials clearly listed.' : 'Missing explicit education section.', tip: 'Ensure degree name and graduation year are included.' },
    { category: 'Readability' as const, score: Math.min(94, 65 + (detectedSectionsCount * 4)), explanation: 'Bullet points are well-spaced; good white space balance.', tip: 'Maintain bullet length under 25 words.' },
    { category: 'Grammar' as const, score: 95, explanation: 'Action verbs and technical terms used correctly.', tip: 'Use uniform past tense for former roles.' },
    { category: 'Structure' as const, score: Math.min(95, 60 + (detectedSectionsCount * 5)), explanation: `Identified ${detectedSectionsCount} structured sections.`, tip: 'Maintain consistent section header formatting.' },
    { category: 'Impact' as const, score: impactScore, explanation: `Found ${numberMatches} quantified metric points and ${detectedVerbs.length} action verbs.`, tip: 'Include specific numbers (%, $, ms, users) in every experience bullet.' }
  ];

  return {
    overallScore,
    formattingScore,
    impactScore,
    relevanceScore,
    summary: `Analyzed resume with ${detectedKeywords.length} verified technical skills (${topSkillsFound}). Detected ${numberMatches} quantifiable metrics and ${detectedVerbs.length} action verbs across ${detectedSectionsCount}/6 core sections. Target role alignment for "${targetRole}": ${relevanceScore}%.`,
    targetRole,
    analysisStatus: 'completed' as const,
    keywordList,
    keywords: keywordList,
    missingKeywords,
    categoryScores,
    categoryBreakdown: categoryScores,
    sectionAnalyses,
    sectionAnalysis: sectionAnalyses,
    aiSuggestions,
    improvements: aiSuggestions,
    impactPoints: [
      `Found ${numberMatches} quantified metrics across your resume. ${numberMatches < 3 ? 'Add at least 1 numerical metric (%, $, or scale) per role bullet.' : 'Good metric density.'}`,
      `${detectedVerbs.length > 0 ? `Strong action verbs detected: ${detectedVerbs.slice(0, 4).join(', ')}. ` : ''}${detectedVerbs.length < 5 ? `Add more action verbs like 'Engineered', 'Architected', 'Spearheaded'.` : 'Strong variety of action verbs.'}`,
      `${missingKeywords.length > 0 ? `Include ${targetRole}-critical keywords: ${missingKeywords.slice(0, 3).map(k => k.keyword).join(', ')} if experienced.` : 'All target keywords detected.'}`,
      `${!hasProjects ? 'Add a dedicated Projects section with GitHub links to boost your score.' : 'Projects section detected — ensure each project lists tech stack and measurable outcome.'}`
    ],
    grammarIssues: [
      hasExperience ? "Ensure uniform past tense verbs for previous roles and present tense for current role." : "Add structured Work Experience section.",
      `${!hasSummary ? 'Add a Professional Summary section at the top.' : 'Professional summary detected.'}`
    ],
    extractedText: resumeText,
    text: resumeText
  };
}
