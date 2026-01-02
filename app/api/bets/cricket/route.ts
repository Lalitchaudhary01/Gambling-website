import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";
import { successResponse, errorResponse } from "@/lib/response";
import { BetStatus, TxnType, TxnStatus } from "@prisma/client";
import { isPlatformLive } from "@/lib/platform";

// Possible outcomes
const OUTCOMES = ["1", "2", "3", "4", "6", "WICKET"] as const;

function generateBallOutcome() {
  const rand = Math.floor(Math.random() * OUTCOMES.length);
  return OUTCOMES[rand];
}

export async function POST(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const { amount, prediction } = await req.json();

    if (!amount || amount <= 0 || !prediction) {
      return errorResponse("Invalid bet data", 400);
    }

    // 0️⃣ Platform LIVE check
    const live = await isPlatformLive();
    if (!live) {
      return errorResponse("Platform is currently offline", 403);
    }

    // 1️⃣ Fetch cricket game
    const game = await prisma.game.findUnique({
      where: { slug: "cricket" },
    });

    if (!game || !game.isActive) {
      return errorResponse("Cricket game not available", 400);
    }

    if (amount < game.minBet || amount > game.maxBet) {
      return errorResponse(
        `Bet must be between ${game.minBet} and ${game.maxBet}`,
        400
      );
    }

    // 2️⃣ Fetch odds from DB
    const odds = await prisma.gameOdds.findUnique({
      where: {
        gameSlug_outcome: {
          gameSlug: "cricket",
          outcome: prediction,
        },
      },
    });

    if (!odds) {
      return errorResponse("Odds not configured by admin", 400);
    }

    // 3️⃣ Wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: authUser.userId },
    });

    if (!wallet || wallet.balance < amount) {
      return errorResponse("Insufficient balance", 400);
    }

    // 4️⃣ Game result
    const result = generateBallOutcome();
    const isWin = prediction === result;
    const multiplier = isWin ? odds.multiplier : 0;
    const winAmount = isWin ? amount * multiplier : 0;

    // 🔐 5️⃣ ATOMIC TRANSACTION
    const bet = await prisma.$transaction(async (tx) => {
      // debit
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

      // bet record
      const betRecord = await tx.bet.create({
        data: {
          userId: authUser.userId,
          gameId: game.id,
          amount,
          multiplier,
          winAmount: isWin ? winAmount : null,
          status: isWin ? BetStatus.WON : BetStatus.LOST,
        },
      });

      // credit if win
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

      return betRecord;
    });

    return successResponse(
      {
        bet,
        result,
        prediction,
        isWin,
        winAmount,
        appliedOdds: odds.multiplier,
      },
      "Cricket bet placed"
    );
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error(err);
    return errorResponse("Cricket bet failed");
  }
}
