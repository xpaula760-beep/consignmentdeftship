import { NextResponse } from "next/server";
import { readPackages } from "@/lib/package-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { trackingNumber } = await params;
  const packages = await readPackages();
  const pkg = packages.find(
    (entry) =>
      String(entry.trackingNumber || "").toLowerCase() ===
      String(trackingNumber || "").toLowerCase()
  );

  if (!pkg) {
    return NextResponse.json({ message: "Package not found." }, { status: 404 });
  }

  return NextResponse.json(pkg);
}
