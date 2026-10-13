import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const repoId = searchParams.get("id");

    if (!repoId) {
      return NextResponse.json({ error: "Repository ID is required" }, { status: 400 });
    }

    const repo = await prisma.repository.findUnique({
      where: { id: repoId },
      include: {
        githubAccount: true,
        resumeEntries: true,
        relatedFacts: true,
      },
    });

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    // Safely parse JSON strings
    const safeParse = (str: string, fallback: any) => {
      try {
        return JSON.parse(str);
      } catch {
        return fallback;
      }
    };

    return NextResponse.json({
      repo: {
        ...repo,
        topics: safeParse(repo.topics, []),
        languagesBreakdown: safeParse(repo.languagesBreakdown, {}),
        dependencies: safeParse(repo.dependencies, []),
        folderTree: safeParse(repo.folderTree, []),
        reusableComponents: safeParse(repo.reusableComponents, []),
        demonstratedSkills: safeParse(repo.demonstratedSkills, []),
        missingDocumentation: safeParse(repo.missingDocumentation, []),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
