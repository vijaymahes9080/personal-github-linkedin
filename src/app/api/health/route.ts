import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Check DB connectivity
    const userCount = await prisma.user.count();
    const repoCount = await prisma.repository.count();
    const factCount = await prisma.professionalFact.count();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: true,
        userCount,
        repoCount,
        factCount,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: err.message || "Database connection error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
