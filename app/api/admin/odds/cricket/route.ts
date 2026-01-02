import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);

    const { outcome, multiplier } = await req.json();

    const odds = await prisma.gameOdds.upsert({
      where: {
        gameSlug_outcome: {
          gameSlug: "cricket",
          outcome,
        },
      },
      update: {
        multiplier,
      },
      create: {
        gameSlug: "cricket",
        outcome,
        multiplier,
      },
    });

    return successResponse(odds, "Odds updated");
  } catch (err: any) {
    if (err.message === "FORBIDDEN") {
      return errorResponse("Admin only", 403);
    }
    return errorResponse();
  }
}
