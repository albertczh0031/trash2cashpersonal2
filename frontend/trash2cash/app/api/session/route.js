import { NextResponse } from "next/server";
import { createSession, verifySession, deleteSession } from "@/lib/session";

export async function GET() {
  const session = await verifySession();
  return NextResponse.json({ authenticated: !!session, user: session?.user });
}

export async function POST(request) {
  try {
    const { user } = await request.json();

    if (!user?.id) {
      throw new Error("User ID is required");
    }

    await createSession(user);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE() {
  await deleteSession();
  return NextResponse.json({ success: true });
}
