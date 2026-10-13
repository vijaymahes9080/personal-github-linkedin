import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { IntelligenceEngine } from "@/lib/gemini";

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ analyses: [] });
    }

    const analyses = await prisma.roleAnalysis.findMany({
      where: { userId: user.id },
      include: {
        recommendations: {
          include: {
            repository: {
              select: { id: true, name: true, htmlUrl: true, structureScore: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const parsedAnalyses = analyses.map((a) => ({
      ...a,
      strengths: JSON.parse(a.strengths || "[]"),
      gaps: JSON.parse(a.gaps || "[]"),
      roadmap: JSON.parse(a.roadmap || "[]"),
    }));

    return NextResponse.json({ analyses: parsedAnalyses });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetRole } = body;

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { username: "admin", targetRole: targetRole || "AI Engineer" },
      });
    }

    const roleToAnalyze = targetRole || user.targetRole || "AI Engineer";

    // Update user target role preference
    await prisma.user.update({
      where: { id: user.id },
      data: { targetRole: roleToAnalyze },
    });

    // Fetch existing analyzed repositories
    const repos = await prisma.repository.findMany();
    const facts = await prisma.professionalFact.findMany({
      where: { userId: user.id },
    });

    const parsedRepos = repos.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      language: r.primaryLanguage,
      technologies: JSON.parse(r.dependencies || "[]"),
      skills: JSON.parse(r.demonstratedSkills || "[]"),
      structureScore: r.structureScore,
      completionStatus: r.completionStatus,
      missingDocumentation: JSON.parse(r.missingDocumentation || "[]"),
    }));

    const parsedFacts = facts.map((f) => ({
      category: f.category,
      title: f.title,
      organization: f.organization,
      skills: JSON.parse(f.skills || "[]"),
    }));

    // Run hybrid intelligence analysis
    const analysisResult = await IntelligenceEngine.analyzeRole({
      targetRole: roleToAnalyze,
      repositories: parsedRepos,
      verifiedFacts: parsedFacts,
      geminiApiKey: user.geminiApiKey,
    });

    // Save to persistent database
    const savedAnalysis = await prisma.roleAnalysis.create({
      data: {
        userId: user.id,
        targetRole: roleToAnalyze,
        matchScore: analysisResult.matchScore,
        summary: analysisResult.summary,
        strengths: JSON.stringify(analysisResult.skillsToLearn),
        gaps: JSON.stringify(analysisResult.missingPortfolioProjects.map((p) => p.title)),
        roadmap: JSON.stringify(analysisResult.roadmap),
      },
    });

    // Save recommendations
    for (const best of analysisResult.bestShowcaseProjects) {
      await prisma.recommendation.create({
        data: {
          roleAnalysisId: savedAnalysis.id,
          repoId: best.repoId,
          type: "BEST_SHOWCASE",
          title: best.title,
          reason: best.reason,
          priority: best.priority,
          actionPlan: best.actionPlan,
          skillsGained: JSON.stringify(best.skillsGained),
        },
      });
    }

    for (const imp of analysisResult.projectsNeedingImprovement) {
      await prisma.recommendation.create({
        data: {
          roleAnalysisId: savedAnalysis.id,
          repoId: imp.repoId,
          type: "NEEDS_IMPROVEMENT",
          title: imp.title,
          reason: imp.reason,
          priority: imp.priority,
          actionPlan: imp.actionPlan,
          skillsGained: JSON.stringify(imp.skillsGained),
        },
      });
    }

    for (const missing of analysisResult.missingPortfolioProjects) {
      await prisma.recommendation.create({
        data: {
          roleAnalysisId: savedAnalysis.id,
          type: "MISSING_PORTFOLIO",
          title: missing.title,
          reason: missing.reason,
          priority: missing.priority,
          actionPlan: missing.actionPlan,
          skillsGained: JSON.stringify(missing.skillsGained),
        },
      });
    }

    // Log analysis event
    await prisma.syncLog.create({
      data: {
        userId: user.id,
        source: "AI_ANALYSIS",
        status: "SUCCESS",
        details: `Generated role recommendations for "${roleToAnalyze}" (${analysisResult.providerUsed}). Match score: ${analysisResult.matchScore}%.`,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysisResult,
        id: savedAnalysis.id,
        createdAt: savedAnalysis.createdAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
