import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateATSResumeEntry } from "@/lib/ats";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const favorite = searchParams.get("favorite");

    const where: any = {};
    if (role) where.targetRole = role;
    if (favorite === "true") where.isFavorite = true;

    const entries = await prisma.resumeEntry.findMany({
      where,
      include: {
        repository: {
          select: { id: true, name: true, htmlUrl: true, stars: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const parsed = entries.map((e) => ({
      ...e,
      technologies: JSON.parse(e.technologies || "[]"),
      keyFeatures: JSON.parse(e.keyFeatures || "[]"),
      threeBulletVersion: JSON.parse(e.threeBulletVersion || "[]"),
      keywords: JSON.parse(e.keywords || "[]"),
    }));

    return NextResponse.json({ entries: parsed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repoId, targetRole, customTitle, customDescription, verifiableMetrics } = body;

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { username: "admin", targetRole: targetRole || "AI Engineer" },
      });
    }

    const role = targetRole || user.targetRole || "Software Developer";

    let repoData: any = null;
    if (repoId) {
      repoData = await prisma.repository.findUnique({
        where: { id: repoId },
      });
    }

    const title = customTitle || repoData?.name || "Featured Project";
    const description = customDescription || repoData?.description || "";
    const technologies: string[] = repoData ? JSON.parse(repoData.dependencies || "[]") : [];
    if (repoData?.primaryLanguage && !technologies.includes(repoData.primaryLanguage)) {
      technologies.unshift(repoData.primaryLanguage);
    }

    const features: string[] = repoData ? JSON.parse(repoData.reusableComponents || "[]") : [];
    const stars = repoData?.stars || 0;

    // Generate strict ATS entries
    const atsOutput = generateATSResumeEntry({
      title,
      description,
      technologies,
      keyFeatures: features,
      contributions: [],
      targetRole: role,
      verifiableMetrics,
      stars,
    });

    // Save to persistent database
    const savedEntry = await prisma.resumeEntry.create({
      data: {
        userId: user.id,
        repoId: repoId || undefined,
        targetRole: role,
        projectTitle: atsOutput.projectTitle,
        objective: atsOutput.objective,
        technologies: JSON.stringify(atsOutput.technologies),
        contributions: atsOutput.contributions,
        keyFeatures: JSON.stringify(atsOutput.keyFeatures),
        verifiableOutcomes: atsOutput.verifiableOutcomes,
        keywords: JSON.stringify(atsOutput.keywords),
        oneLineVersion: atsOutput.oneLineVersion,
        twoLineVersion: atsOutput.twoLineVersion,
        threeBulletVersion: JSON.stringify(atsOutput.threeBulletVersion),
        detailedVersion: atsOutput.detailedVersion,
      },
    });

    return NextResponse.json({
      success: true,
      entry: {
        ...savedEntry,
        technologies: atsOutput.technologies,
        keyFeatures: atsOutput.keyFeatures,
        threeBulletVersion: atsOutput.threeBulletVersion,
        keywords: atsOutput.keywords,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isFavorite, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Entry ID is required" }, { status: 400 });
    }

    const updated = await prisma.resumeEntry.update({
      where: { id },
      data: {
        isFavorite: isFavorite !== undefined ? isFavorite : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json({ success: true, entry: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Entry ID is required" }, { status: 400 });
    }

    await prisma.resumeEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Entry deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
