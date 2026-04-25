import { NextResponse } from "next/server";
import { readPackages, writePackages } from "@/lib/package-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { txHash, address, payer } = body || {};

    if (!txHash || !address) {
      return NextResponse.json({ message: "txHash and address are required." }, { status: 400 });
    }

    const packages = await readPackages();
    const index = packages.findIndex((p) => String(p._id) === String(id));

    if (index === -1) {
      return NextResponse.json({ message: "Package not found." }, { status: 404 });
    }

    const payment = {
      id: `pay_${Date.now()}`,
      txHash: String(txHash),
      address: String(address),
      payer: payer || null,
      createdAt: new Date().toISOString()
    };

    const pkg = packages[index];
    pkg.payments = Array.isArray(pkg.payments) ? pkg.payments : [];
    pkg.payments.unshift(payment);
    pkg.updatedAt = new Date().toISOString();

    packages[index] = pkg;
    await writePackages(packages);

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Unable to save payment." }, { status: error.status || 500 });
  }
}
