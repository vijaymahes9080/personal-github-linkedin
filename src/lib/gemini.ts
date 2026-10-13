import { ROLE_TAXONOMY, getRoleRequirement } from "./roles";

export interface AIAnalysisRequest {
  targetRole: string;
  repositories: Array<{
    id: string;
    name: string;
    description: string | null;
    language: string | null;
    technologies: string[];
    skills: string[];
    structureScore: number;
    completionStatus: string;
    missingDocumentation: string[];
  }>;
  verifiedFacts: Array<{
    category: string;
    title: string;
    organization?: string | null;
    skills: string[];
  }>;
  geminiApiKey?: string | null;
}

export interface AIAnalysisResponse {
  matchScore: number;
  summary: string;
  bestShowcaseProjects: Array<{
    repoId: string;
    title: string;
    reason: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    actionPlan: string;
    skillsGained: string[];
    score: number;
  }>;
  projectsNeedingImprovement: Array<{
    repoId: string;
    title: string;
    reason: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    actionPlan: string;
    skillsGained: string[];
    score: number;
  }>;
  missingPortfolioProjects: Array<{
    title: string;
    reason: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    actionPlan: string;
    skillsGained: string[];
  }>;
  skillsToLearn: string[];
  roadmap: Array<{
    phase: string;
    goal: string;
    actions: string[];
  }>;
  providerUsed: "GEMINI_2_FLASH" | "BUILTIN_HEURISTIC";
}

export class IntelligenceEngine {
  /**
   * Evaluates role alignment using either Google Gemini Flash or the built-in heuristic engine.
   */
  static async analyzeRole(req: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const roleReq = getRoleRequirement(req.targetRole);
    const apiKey = req.geminiApiKey || process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 10) {
      try {
        const geminiResult = await this.callGeminiAPI(req, roleReq, apiKey.trim());
        if (geminiResult) {
          return {
            ...geminiResult,
            providerUsed: "GEMINI_2_FLASH",
          };
        }
      } catch (err) {
        console.warn("Gemini API call failed, gracefully falling back to Heuristic Engine:", err);
      }
    }

    // Zero-Cost Local Heuristic Engine
    return this.runHeuristicAnalysis(req, roleReq);
  }

  /**
   * Fast, 100% free, zero-cost, grounded local heuristic engine.
   */
  private static runHeuristicAnalysis(
    req: AIAnalysisRequest,
    roleReq: ReturnType<typeof getRoleRequirement>
  ): AIAnalysisResponse {
    const allRepoSkills = new Set<string>();
    const allRepoTech = new Set<string>();

    req.repositories.forEach((r) => {
      if (r.language) allRepoSkills.add(r.language.toLowerCase());
      r.technologies.forEach((t) => allRepoTech.add(t.toLowerCase()));
      r.skills.forEach((s) => allRepoSkills.add(s.toLowerCase()));
    });

    req.verifiedFacts.forEach((f) => {
      f.skills.forEach((s) => allRepoSkills.add(s.toLowerCase()));
    });

    // Calculate match score
    const targetCoreSkills = roleReq.coreSkills.map((s) => s.toLowerCase());
    const matchedSkills = targetCoreSkills.filter((s) => allRepoSkills.has(s) || allRepoTech.has(s));
    const skillMatchRatio = targetCoreSkills.length > 0 ? matchedSkills.length / targetCoreSkills.length : 0.5;
    const baseMatchScore = Math.round(skillMatchRatio * 75 + Math.min(req.repositories.length * 5, 25));
    const matchScore = Math.min(Math.max(baseMatchScore, 20), 98);

    // Score and categorize repositories
    const scoredRepos = req.repositories.map((repo) => {
      let score = 0;
      const matched: string[] = [];

      targetCoreSkills.forEach((skill) => {
        const inTech = repo.technologies.some((t) => t.toLowerCase().includes(skill));
        const inName = repo.name.toLowerCase().includes(skill);
        const inDesc = repo.description?.toLowerCase().includes(skill);
        const inLang = repo.language?.toLowerCase() === skill;

        if (inTech || inName || inDesc || inLang) {
          score += 25;
          matched.push(skill);
        }
      });

      // Factor in repo health
      score += Math.round(repo.structureScore * 0.3);

      return {
        repo,
        score,
        matchedSkills: matched,
      };
    });

    scoredRepos.sort((a, b) => b.score - a.score);

    const bestShowcaseProjects = scoredRepos
      .filter((item) => item.score >= 40 && item.repo.structureScore >= 50)
      .slice(0, 3)
      .map((item) => ({
        repoId: item.repo.id,
        title: item.repo.name,
        reason: `Demonstrates verified technologies (${item.matchedSkills.length > 0 ? item.matchedSkills.join(", ") : item.repo.language || "codebase"}) with a solid structure health of ${item.repo.structureScore}%.`,
        priority: "HIGH" as const,
        actionPlan: `Highlight in the top section of your resume. Polish the README banner and add a live demo link if available.`,
        skillsGained: item.repo.technologies.slice(0, 5),
        score: item.score,
      }));

    const projectsNeedingImprovement = scoredRepos
      .filter((item) => item.score >= 25 && item.repo.structureScore < 60)
      .slice(0, 3)
      .map((item) => ({
        repoId: item.repo.id,
        title: item.repo.name,
        reason: `Contains relevant tech stack for ${req.targetRole}, but lacks critical repository components (${item.repo.missingDocumentation.slice(0, 2).join(", ") || "needs tests/documentation"}).`,
        priority: "MEDIUM" as const,
        actionPlan: `Add automated tests, include an architecture diagram in README, and add .env.example before showcasing to recruiters.`,
        skillsGained: item.repo.technologies.slice(0, 4),
        score: item.score,
      }));

    // Missing portfolio projects
    const missingPortfolioProjects = roleReq.sampleProjectIdeas.slice(0, 3).map((idea, idx) => ({
      title: idea,
      reason: `Directly targets key ${req.targetRole} competencies (${roleReq.criticalConcepts[idx] || roleReq.coreSkills[idx]}) that are not yet prominently showcased in existing repositories.`,
      priority: idx === 0 ? ("HIGH" as const) : ("MEDIUM" as const),
      actionPlan: `Build a clean, documented MVP featuring ${roleReq.recommendedTechnologies.slice(idx * 2, idx * 2 + 3).join(", ")} with comprehensive tests.`,
      skillsGained: roleReq.recommendedTechnologies.slice(idx * 2, idx * 2 + 3),
    }));

    // Skills to learn
    const skillsToLearn = roleReq.coreSkills.filter((s) => !matchedSkills.includes(s.toLowerCase())).slice(0, 6);

    // Roadmap
    const roadmap = [
      {
        phase: "Phase 1: Immediate Portfolio Polishing (Week 1)",
        goal: `Optimize existing top repositories for ${req.targetRole} ATS scanners and engineering reviewers.`,
        actions: [
          `Refine READMEs for top projects (${bestShowcaseProjects.map((p) => p.title).join(", ") || "primary repositories"}).`,
          `Address missing files: ${projectsNeedingImprovement[0]?.actionPlan || "Add test suites and dependency locks"}.`,
        ],
      },
      {
        phase: "Phase 2: High-Impact Gap Closure (Weeks 2-3)",
        goal: `Implement high-priority portfolio projects targeting missing market requirements.`,
        actions: [
          `Initiate build for: ${missingPortfolioProjects[0]?.title || "Domain Showcase Project"}.`,
          `Integrate industry-standard tooling: ${skillsToLearn.slice(0, 3).join(", ") || "Core frameworks"}.`,
        ],
      },
      {
        phase: "Phase 3: Career Alignment & Network Presence (Week 4)",
        goal: `Align LinkedIn and resume presentation with verified repository achievements.`,
        actions: [
          `Deploy ATS-optimized 3-bullet resume descriptions from the Resume Studio.`,
          `Publish technical project showcase posts using the LinkedIn Content Studio.`,
        ],
      },
    ];

    const summary = `Evaluated ${req.repositories.length} repositories and ${req.verifiedFacts.length} professional milestones against ${req.targetRole} market benchmarks. Profile currently matches ${matchedSkills.length} of ${targetCoreSkills.length} core technical requirements (${matchScore}% match score).`;

    return {
      matchScore,
      summary,
      bestShowcaseProjects,
      projectsNeedingImprovement,
      missingPortfolioProjects,
      skillsToLearn,
      roadmap,
      providerUsed: "BUILTIN_HEURISTIC",
    };
  }

  /**
   * Calls Google Gemini Flash API if user provided a key.
   */
  private static async callGeminiAPI(
    req: AIAnalysisRequest,
    roleReq: ReturnType<typeof getRoleRequirement>,
    apiKey: string
  ): Promise<AIAnalysisResponse | null> {
    const prompt = `You are a Senior Principal Technical Recruiter and Career Intelligence Engine.
Analyze the user's verified GitHub repositories and verified LinkedIn facts against the target role: "${req.targetRole}".

CRITICAL ANTI-HALLUCINATION RULES:
1. Treat external repositories as facts only. NEVER invent metrics, stars, responsibilities, or tools that are not listed in the repositories.
2. If a project has no test suite or is incomplete, clearly state so.
3. Be grounded, direct, and actionable.

Repositories Data:
${JSON.stringify(
  req.repositories.map((r) => ({
    name: r.name,
    description: r.description,
    language: r.language,
    technologies: r.technologies,
    structureScore: r.structureScore,
    missing: r.missingDocumentation,
  })),
  null,
  2
)}

Verified LinkedIn Milestones:
${JSON.stringify(req.verifiedFacts, null, 2)}

Target Role Requirements:
${JSON.stringify(roleReq, null, 2)}

Respond with STRICT JSON adhering to this schema:
{
  "matchScore": number (0-100),
  "summary": string,
  "bestShowcaseProjects": [
    {
      "repoId": string,
      "title": string,
      "reason": string,
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "actionPlan": string,
      "skillsGained": string[],
      "score": number
    }
  ],
  "projectsNeedingImprovement": [
    {
      "repoId": string,
      "title": string,
      "reason": string,
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "actionPlan": string,
      "skillsGained": string[],
      "score": number
    }
  ],
  "missingPortfolioProjects": [
    {
      "title": string,
      "reason": string,
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "actionPlan": string,
      "skillsGained": string[]
    }
  ],
  "skillsToLearn": string[],
  "roadmap": [
    {
      "phase": string,
      "goal": string,
      "actions": string[]
    }
  ]
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    return parsed;
  }
}
