import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse("Email and password required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      return errorResponse("Invalid credentials", 401);
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return errorResponse("Invalid credentials", 401);
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
    });

    return successResponse(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          balance: user.wallet?.balance ?? 0,
        },
      },
      "Login successful"
    );
  } catch (error) {
    console.error(error);
    return errorResponse("Login failed");
  }
}
