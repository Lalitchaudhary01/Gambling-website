import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";
import { successResponse, errorResponse } from "@/lib/response";
import { TxnType, TxnStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return errorResponse("Invalid amount", 400);
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.userId },
    });

    if (!wallet) {
      return errorResponse("Wallet not found", 404);
    }

    if (wallet.balance < amount) {
      return errorResponse("Insufficient balance", 400);
    }

    const updatedWallet = await prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: amount },
        },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: TxnType.DEBIT,
          status: TxnStatus.SUCCESS,
        },
      });

      return updated;
    });

    return successResponse(updatedWallet, "Wallet debited");
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse();
  }
}
