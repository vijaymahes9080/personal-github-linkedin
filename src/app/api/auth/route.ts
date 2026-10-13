import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("session_auth");

  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: "admin",
        targetRole: "AI Engineer",
      },
    });
  }

  const hasPassword = Boolean(user.passwordHash);
  const isAuthenticated = !hasPassword || sessionCookie?.value === "authenticated_user";

  return NextResponse.json({
    isAuthenticated,
    hasPasswordProtection: hasPassword,
    user: {
      id: user.id,
      username: user.username,
      targetRole: user.targetRole,
      aiProvider: user.aiProvider,
      hasGeminiApiKey: Boolean(user.geminiApiKey || process.env.GEMINI_API_KEY),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, pin, targetRole, aiProvider, geminiApiKey } = body;

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { username: "admin", targetRole: "AI Engineer" },
      });
    }

    if (action === "login") {
      if (user.passwordHash && user.passwordHash !== pin) {
        return NextResponse.json({ error: "Invalid Security PIN" }, { status: 401 });
      }

      const res = NextResponse.json({ success: true, message: "Authenticated successfully" });
      res.cookies.set("session_auth", "authenticated_user", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return res;
    }

    if (action === "logout") {
      const res = NextResponse.json({ success: true, message: "Logged out" });
      res.cookies.delete("session_auth");
      return res;
    }

    if (action === "set_pin") {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: pin ? String(pin).trim() : null },
      });
      return NextResponse.json({ success: true, message: pin ? "Security PIN set" : "PIN removed" });
    }

    if (action === "update_settings") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          targetRole: targetRole || user.targetRole,
          aiProvider: aiProvider || user.aiProvider,
          geminiApiKey: geminiApiKey !== undefined ? geminiApiKey : user.geminiApiKey,
        },
      });
      return NextResponse.json({ success: true, message: "Settings saved" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
