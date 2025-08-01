import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-jwt";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  return NextResponse.json({
    session,
    hasSession: !!session,
    timestamp: new Date().toISOString(),
  });
}