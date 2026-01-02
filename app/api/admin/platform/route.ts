import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware";
import { successResponse, errorResponse } from "@/lib/response";

export async function PATCH(req: NextRequest) {
  try {
    requireAdmin(req);
    const { isPlatformLive } = await req.json();

    const settings = await prisma.adminSetting.update({
      where: { id: "global-settings" },
      data: { isPlatformLive },
    });

    return successResponse(settings, "Platform status updated");
  } catch (err: any) {
    if (err.message === "FORBIDDEN") {
      return errorResponse("Admin only", 403);
    }
    return errorResponse();
  }
}
