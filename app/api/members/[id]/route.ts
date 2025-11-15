import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, colorHex, emoji, currentMood, tonightActivity, isAtGym, isAtLibrary, gymTime, libraryTime } = body;

    const updateData: {
      name?: string;
      colorHex?: string;
      emoji?: string;
      currentMood?: string;
      tonightActivity?: string;
      isAtGym?: boolean;
      isAtLibrary?: boolean;
      gymTime?: Date | null;
      libraryTime?: Date | null;
    } = {};
    if (name) updateData.name = name;
    if (colorHex) updateData.colorHex = colorHex;
    if (emoji !== undefined) updateData.emoji = emoji;
    if (currentMood !== undefined) updateData.currentMood = currentMood;
    if (tonightActivity !== undefined) updateData.tonightActivity = tonightActivity;
    if (isAtGym !== undefined) updateData.isAtGym = isAtGym;
    if (isAtLibrary !== undefined) updateData.isAtLibrary = isAtLibrary;
    if (gymTime !== undefined) updateData.gymTime = gymTime ? new Date(gymTime) : null;
    if (libraryTime !== undefined) updateData.libraryTime = libraryTime ? new Date(libraryTime) : null;

    const member = await prisma.member.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        household: true,
        statuses: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error fetching member:", error);
    return NextResponse.json(
      { error: "Failed to fetch member" },
      { status: 500 }
    );
  }
}
