import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ContentStudioService } from "@/lib/content";

export async function GET() {
  try {
    const posts = await prisma.contentPost.findMany({
      include: {
        repository: {
          select: { id: true, name: true, htmlUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const parsed = posts.map((p) => ({
      ...p,
      tags: JSON.parse(p.tags || "[]"),
    }));

    return NextResponse.json({ posts: parsed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { formatType, repoId, role, milestoneTitle, organization } = body;

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { username: "admin", targetRole: role || "AI Engineer" },
      });
    }

    let repoData: any = null;
    if (repoId) {
      repoData = await prisma.repository.findUnique({
        where: { id: repoId },
      });
    }

    const techList: string[] = repoData ? JSON.parse(repoData.dependencies || "[]") : [];
    if (repoData?.primaryLanguage && !techList.includes(repoData.primaryLanguage)) {
      techList.unshift(repoData.primaryLanguage);
    }

    const generated = ContentStudioService.generateContent(formatType || "ANNOUNCEMENT", {
      repoName: repoData?.name,
      repoDescription: repoData?.description,
      technologies: techList,
      role: role || user.targetRole,
      repoUrl: repoData?.htmlUrl,
      milestoneTitle,
      organization,
    });

    const saved = await prisma.contentPost.create({
      data: {
        userId: user.id,
        repoId: repoId || undefined,
        formatType: generated.formatType,
        title: generated.title,
        targetAudience: generated.targetAudience,
        conciseVersion: generated.conciseVersion,
        mediumVersion: generated.mediumVersion,
        detailedVersion: generated.detailedVersion,
        tags: JSON.stringify(generated.tags),
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        ...saved,
        tags: generated.tags,
        directShareUrl: generated.directShareUrl,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isFavorite, markPosted } = body;

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const updated = await prisma.contentPost.update({
      where: { id },
      data: {
        isFavorite: isFavorite !== undefined ? isFavorite : undefined,
        postedAt: markPosted ? new Date() : undefined,
      },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    await prisma.contentPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Post deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
