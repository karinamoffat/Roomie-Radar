import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { memberId, selectedOptions } = body;

    if (!memberId || !selectedOptions || !Array.isArray(selectedOptions)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const poll = await prisma.poll.findUnique({
      where: { id },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "Poll not found" },
        { status: 404 }
      );
    }

    // Check if poll is expired
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Poll has expired" },
        { status: 400 }
      );
    }

    // Verify selected options are valid
    const options = JSON.parse(poll.options);
    if (!selectedOptions.every((idx: number) => idx >= 0 && idx < options.length)) {
      return NextResponse.json(
        { error: "Invalid option indices" },
        { status: 400 }
      );
    }

    // Check if multiple selection is allowed
    if (!poll.allowMultiple && selectedOptions.length > 1) {
      return NextResponse.json(
        { error: "Multiple selection not allowed" },
        { status: 400 }
      );
    }

    // Upsert the response (update if exists, create if not)
    const response = await prisma.pollResponse.upsert({
      where: {
        pollId_memberId: {
          pollId: id,
          memberId,
        },
      },
      update: {
        selectedOptions: JSON.stringify(selectedOptions),
        votedAt: new Date(),
      },
      create: {
        pollId: id,
        memberId,
        selectedOptions: JSON.stringify(selectedOptions),
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            colorHex: true,
            emoji: true,
          },
        },
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error submitting vote:", error);
    return NextResponse.json(
      { error: "Failed to submit vote" },
      { status: 500 }
    );
  }
}


