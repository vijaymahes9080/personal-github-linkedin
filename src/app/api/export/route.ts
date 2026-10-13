import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    const user = await prisma.user.findFirst({
      include: {
        githubAccounts: {
          include: {
            repositories: true,
          },
        },
        linkedinProfile: true,
        facts: true,
        analyses: {
          include: {
            recommendations: true,
          },
        },
        resumeEntries: true,
        contentPosts: true,
        syncLogs: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "No user data found" }, { status: 404 });
    }

    if (format === "csv") {
      // Export Resume Entries as CSV
      const rows = [
        ["Project Title", "Target Role", "Technologies", "Objective", "One Line Version", "Two Line Version", "Three Bullets"].join(","),
      ];

      for (const entry of user.resumeEntries) {
        const clean = (str: string) => `"${(str || "").replace(/"/g, '""').replace(/\n/g, " ")}"`;
        rows.push(
          [
            clean(entry.projectTitle),
            clean(entry.targetRole),
            clean(entry.technologies),
            clean(entry.objective),
            clean(entry.oneLineVersion),
            clean(entry.twoLineVersion),
            clean(entry.threeBulletVersion),
          ].join(",")
        );
      }

      const csvContent = rows.join("\r\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="career-intelligence-resume-export-${Date.now()}.csv"`,
        },
      });
    }

    // Default JSON backup
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      user: {
        username: user.username,
        targetRole: user.targetRole,
        aiProvider: user.aiProvider,
      },
      githubAccounts: user.githubAccounts,
      linkedinProfile: user.linkedinProfile,
      verifiedFacts: user.facts,
      roleAnalyses: user.analyses,
      resumeEntries: user.resumeEntries,
      contentPosts: user.contentPosts,
      syncLogs: user.syncLogs,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="career-intelligence-backup-${Date.now()}.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
