import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);

    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.userId },
      include: { transactions: true },
    });

    if (!wallet) {
      return errorResponse("Wallet not found", 404);
    }

    return successResponse(wallet);
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse();
  }
}
