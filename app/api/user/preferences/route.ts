import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    if (!preferences) {
      return NextResponse.json({ 
        namingValues: {}, 
        customOptions: {} 
      });
    }

    return NextResponse.json({
      namingValues: JSON.parse(preferences.namingValues),
      customOptions: JSON.parse(preferences.customOptions),
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { namingValues = {}, customOptions = {} } = body;

    await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        namingValues: JSON.stringify(namingValues),
        customOptions: JSON.stringify(customOptions),
      },
      create: {
        userId: session.user.id,
        namingValues: JSON.stringify(namingValues),
        customOptions: JSON.stringify(customOptions),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}