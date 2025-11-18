import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        responses: {
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
        },
        household: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "Poll not found" },
        { status: 404 }
      );
    }

    const options = JSON.parse(poll.options);
    const results = options.map((option: string, index: number) => {
      const votes = poll.responses.filter((response) => {
        const selectedIndices = JSON.parse(response.selectedOptions);
        return selectedIndices.includes(index);
      }).length;

      return {
        option,
        index,
        votes,
        percentage: poll.responses.length > 0
          ? Math.round((votes / poll.responses.length) * 100)
          : 0,
      };
    });

    const totalVotes = poll.responses.length;
    const totalMembers = poll.household.members.length;

    return NextResponse.json({
      poll: {
        id: poll.id,
        question: poll.question,
        options,
        allowMultiple: poll.allowMultiple,
        expiresAt: poll.expiresAt,
        createdAt: poll.createdAt,
      },
      results,
      totalVotes,
      totalMembers,
      voters: poll.responses.map((r) => r.member),
    });
  } catch (error) {
    console.error("Error fetching poll results:", error);
    return NextResponse.json(
      { error: "Failed to fetch poll results" },
      { status: 500 }
    );
  }
}


