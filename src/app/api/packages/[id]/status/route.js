import { NextResponse } from "next/server";
import { readPackages, writePackages } from "@/lib/package-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  const { id } = await params;
  const { status } = await request.json();
  const packages = await readPackages();
  const index = packages.findIndex((entry) => String(entry._id) === String(id));

  if (index === -1) {
    return NextResponse.json({ message: "Package not found." }, { status: 404 });
  }

  packages[index] = {
    ...packages[index],
    status: status || packages[index].status,
    updatedAt: new Date().toISOString()
  };

  await writePackages(packages);
  return NextResponse.json(packages[index]);
}
