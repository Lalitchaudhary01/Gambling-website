import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware";
import { successResponse, errorResponse } from "@/lib/response";

export async function PATCH(req: NextRequest) {
  try {
    requireAdmin(req);

    const { isActive, minBet, maxBet, rtp } = await req.json();

    const game = await prisma.game.update({
      where: { slug: "cricket" },
      data: {
        isActive,
        minBet,
        maxBet,
        rtp,
      },
    });

    return successResponse(game, "Cricket game settings updated");
  } catch (err: any) {
    if (err.message === "FORBIDDEN") {
      return errorResponse("Admin only", 403);
    }
    return errorResponse();
  }
}
