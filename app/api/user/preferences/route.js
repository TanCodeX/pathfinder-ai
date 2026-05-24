import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        saveChatHistory: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ saveChatHistory: user.saveChatHistory });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (typeof body.saveChatHistory !== "boolean") {
      return NextResponse.json(
        { error: "saveChatHistory must be a boolean" },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: {
        clerkUserId: userId,
      },
      data: {
        saveChatHistory: body.saveChatHistory,
      },
      select: {
        saveChatHistory: true,
      },
    });

    return NextResponse.json({ saveChatHistory: updatedUser.saveChatHistory });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
