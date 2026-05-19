import { NextResponse } from "next/server";

import { getOperationsState } from "@/lib/data/operations";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const user = await requireUser();
  const state = await getOperationsState(user.id);
  return NextResponse.json(state);
}
