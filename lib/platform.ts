import { prisma } from "@/lib/prisma";

export async function isPlatformLive() {
  const settings = await prisma.adminSetting.findFirst();
  return settings?.isPlatformLive ?? false;
}
