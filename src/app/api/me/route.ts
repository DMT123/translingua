import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    clerkId: userId,
    email: user?.emailAddresses?.[0]?.emailAddress ?? null,
    name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null,
  });
}
