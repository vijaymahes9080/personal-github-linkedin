import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LinkedInService } from "@/lib/linkedin";

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ facts: [], profile: null });
    }

    const facts = await prisma.professionalFact.findMany({
      where: { userId: user.id },
      include: {
        relatedRepo: {
          select: { id: true, name: true, htmlUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const profile = await prisma.linkedInProfile.findUnique({
      where: { userId: user.id },
    });

    const parsedFacts = facts.map((f) => ({
      ...f,
      skills: JSON.parse(f.skills || "[]"),
    }));

    return NextResponse.json({
      facts: parsedFacts,
      profile,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, title, organization, startDate, endDate, description, skills, verificationStatus, relatedRepoId } = body;

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { username: "admin", targetRole: "AI Engineer" },
      });
    }

    if (!title || !category) {
      return NextResponse.json({ error: "Title and category are required" }, { status: 400 });
    }

    const fact = await LinkedInService.ingestManualFact({
      userId: user.id,
      category,
      title,
      organization,
      startDate,
      endDate,
      description,
      skills: Array.isArray(skills) ? skills : [],
      verificationStatus,
      relatedRepoId,
    });

    return NextResponse.json({ success: true, fact });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Fact ID is required" }, { status: 400 });
    }

    await prisma.professionalFact.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Fact deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
