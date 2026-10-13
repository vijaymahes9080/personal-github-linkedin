import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { GitHubService } from "@/lib/github";

export async function GET() {
  try {
    const accounts = await prisma.gitHubAccount.findMany({
      include: {
        repositories: {
          orderBy: { stars: "desc" },
        },
      },
    });

    const recentLogs = await prisma.syncLog.findMany({
      where: { source: "GITHUB" },
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    const totalRepos = await prisma.repository.count();

    return NextResponse.json({
      accounts,
      recentLogs,
      totalRepos,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, token } = body;

    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json({ error: "GitHub username is required" }, { status: 400 });
    }

    const cleanUsername = username.trim().replace(/^@/, "");
    const result = await GitHubService.syncAccountRepositories({
      username: cleanUsername,
      token: token ? token.trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${result.syncedCount} repositories for @${cleanUsername}`,
      account: result.account,
      syncedCount: result.syncedCount,
    });
  } catch (err: any) {
    // Log the failure in DB
    try {
      const user = await prisma.user.findFirst();
      if (user) {
        await prisma.syncLog.create({
          data: {
            userId: user.id,
            source: "GITHUB",
            status: "ERROR",
            details: `Sync failed: ${err.message}`,
          },
        });
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
