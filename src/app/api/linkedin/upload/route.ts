import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LinkedInService } from "@/lib/linkedin";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    let type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const textContent = await file.text();

    // Infer type from filename if not explicitly provided
    const filename = file.name.toLowerCase();
    if (!type) {
      if (filename.includes("position") || filename.includes("experience")) {
        type = "POSITIONS";
      } else if (filename.includes("skill")) {
        type = "SKILLS";
      } else if (filename.includes("certif")) {
        type = "CERTIFICATIONS";
      } else if (filename.includes("project")) {
        type = "PROJECTS";
      } else {
        type = "POSITIONS";
      }
    }

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { username: "admin", targetRole: "AI Engineer" },
      });
    }

    const validTypes = ["POSITIONS", "SKILLS", "CERTIFICATIONS", "PROJECTS", "EDUCATION"] as const;
    const matchedType = validTypes.find((t) => t === type) || "POSITIONS";

    const importedFacts = await LinkedInService.ingestDataExport(
      matchedType,
      textContent,
      user.id
    );

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedFacts.length} records from ${file.name}`,
      count: importedFacts.length,
      type: matchedType,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
