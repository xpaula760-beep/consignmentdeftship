import { NextResponse } from "next/server";
import { buildPackagePayload } from "@/lib/package-payload";
import { readPackages, writePackages } from "@/lib/package-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  const packages = await readPackages();
  const pkg = packages.find((entry) => String(entry._id) === String(id));

  if (!pkg) {
    return NextResponse.json({ message: "Package not found." }, { status: 404 });
  }

  return NextResponse.json(pkg);
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const packages = await readPackages();
    const index = packages.findIndex((entry) => String(entry._id) === String(id));

    if (index === -1) {
      return NextResponse.json({ message: "Package not found." }, { status: 404 });
    }

    const current = packages[index];
    const formData = await request.formData();
    const payload = await buildPackagePayload(formData, current);
    const updatedPackage = {
      ...current,
      ...payload,
      updatedAt: new Date().toISOString()
    };

    packages[index] = updatedPackage;
    await writePackages(packages);

    return NextResponse.json(updatedPackage);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Unable to update package." },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const packages = await readPackages();
  const nextPackages = packages.filter((entry) => String(entry._id) !== String(id));

  if (nextPackages.length === packages.length) {
    return NextResponse.json({ message: "Package not found." }, { status: 404 });
  }

  await writePackages(nextPackages);
  return NextResponse.json({ success: true });
}
