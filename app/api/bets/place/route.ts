import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";
import { successResponse, errorResponse } from "@/lib/response";
import { BetStatus, TxnType, TxnStatus } from "@prisma/client";

// DEMO multiplier logic (simple & controlled)
function generateMultiplier() {
  // 70% chance lose early, 30% chance win
  const r = Math.random();
  if (r < 0.7) return 0; // LOST
  return Number((1 + Math.random() * 4).toFixed(2)); // 1x - 5x
}

export async function POST(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const { gameSlug, amount } = await req.json();

    if (!gameSlug || !amount || amount <= 0) {
      return errorResponse("Invalid bet data", 400);
    }

    // 1️⃣ Fetch game
    const game = await prisma.game.findUnique({
      where: { slug: gameSlug },
    });

    if (!game || !game.isActive) {
      return errorResponse("Game not available", 400);
    }

    if (amount < game.minBet || amount > game.maxBet) {
      return errorResponse(
        `Bet must be between ${game.minBet} and ${game.maxBet}`,
        400
      );
    }

    // 2️⃣ Fetch wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: authUser.userId },
    });

    if (!wallet || wallet.balance < amount) {
      return errorResponse("Insufficient balance", 400);
    }

    // 3️⃣ Decide result (DEMO)
    const multiplier = generateMultiplier();
    const isWin = multiplier > 0;
    const winAmount = isWin ? amount * multiplier : 0;

    // 4️⃣ ATOMIC TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      // Debit wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: TxnType.DEBIT,
          status: TxnStatus.SUCCESS,
        },
      });

      // Create bet
      const bet = await tx.bet.create({
        data: {
          userId: authUser.userId,
          gameId: game.id,
          amount,
          multiplier,
          winAmount: isWin ? winAmount : null,
          status: isWin ? BetStatus.WON : BetStatus.LOST,
        },
      });

      // Credit if win
      if (isWin) {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: winAmount } },
        });

        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            amount: winAmount,
            type: TxnType.CREDIT,
            status: TxnStatus.SUCCESS,
          },
        });
      }

      return bet;
    });

    return successResponse(result, "Bet placed successfully");
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error(err);
    return errorResponse("Bet failed");
  }
}
