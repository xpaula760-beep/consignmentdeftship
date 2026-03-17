import { NextResponse } from "next/server";
import { buildPackagePayload } from "@/lib/package-payload";
import {
  createPackageId,
  createTrackingNumber,
  readPackages,
  sortPackages,
  writePackages
} from "@/lib/package-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const packages = await readPackages();
  return NextResponse.json(sortPackages(packages));
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const packages = await readPackages();
    const trackingNumber = createTrackingNumber();
    const now = new Date().toISOString();
    formData.set("trackingNumber", trackingNumber);
    const payload = await buildPackagePayload(formData);

    const newPackage = {
      _id: createPackageId(),
      trackingNumber,
      createdAt: now,
      updatedAt: now,
      ...payload
    };

    packages.unshift(newPackage);
    await writePackages(packages);

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Unable to create package." },
      { status: error.status || 500 }
    );
  }
}
