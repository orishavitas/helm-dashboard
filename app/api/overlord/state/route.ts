import { NextResponse } from "next/server";

import { getOverlordState } from "@/lib/data/overlord";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  await requireUser();
  const state = await getOverlordState();
  return NextResponse.json(state);
}
