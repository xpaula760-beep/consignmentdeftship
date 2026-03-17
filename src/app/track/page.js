"use client";

import { useState } from "react";
import { fetchPackageByTrackingNumber } from "../services/package.api";
import dynamic from "next/dynamic";
import ItemCarousel from "../components/ItemCarousel";

const PlaneTrackingMap = dynamic(() => import("../components/PlaneTrackingMap"), {
  ssr: false,
});

function StatusBadge({ status }) {
  const map = {
    pending: "bg-yellow-500/20 text-yellow-300",
    "in-transit": "bg-blue-500/20 text-blue-300",
    delivered: "bg-green-500/20 text-green-300",
    cancelled: "bg-red-500/20 text-red-300",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        map[status] || "bg-zinc-700 text-white"
      }`}
    >
      {status}
    </span>
  );
}

function PackageDetails({ pkg }) {
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text || "");
    } catch (e) {
      console.warn("copy failed", e);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 rounded-xl shadow p-6 text-white">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{pkg.itemName}</h2>

          <div className="mt-2 text-sm text-slate-300">
            Receiver: {pkg.receiverPhone}
          </div>

          <div className="mt-2 text-sm">
            Tracking:{" "}
            <span className="font-mono">{pkg.trackingNumber}</span>
          </div>

          <div className="mt-2 text-sm">
            Value:{" "}
            <span className="font-medium">
              {typeof pkg.totalValue !== "undefined"
                ? `${pkg.totalValue} ${pkg.currency || ""}`
                : "—"}
            </span>
          </div>
        </div>

        <div className="flex flex-row md:flex-col md:items-end items-start gap-2">
          <StatusBadge status={pkg.status} />
          <button
            onClick={() => copy(pkg.trackingNumber)}
            className="px-3 py-1 rounded bg-slate-700 text-sm hover:bg-slate-600"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-xs text-slate-400">Origin</div>
          <div className="text-sm">{pkg.origin?.address || "—"}</div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-slate-400">Destination</div>
          <div className="text-sm">{pkg.destination?.address || "—"}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="text-sm text-slate-300">
          Distance: <span className="font-medium">{pkg.distanceKm ?? "—"} km</span>
        </div>
        <div className="text-sm text-slate-300">
          ETA:{" "}
          <span className="font-medium">
            {pkg.estimatedDeliveryTime
              ? new Date(pkg.estimatedDeliveryTime).toLocaleString()
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TrackPackagePage() {
  const [showDetails, setShowDetails] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setPkg(null);

    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number.");
      return;
    }

    try {
      setLoading(true);
      const data = await fetchPackageByTrackingNumber(trackingNumber.trim());
      setPkg(data);
    } catch {
      setError("Package not found. Please check tracking number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 py-12 px-4 text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Track Your Package
        </h1>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            className="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-400"
            placeholder="Enter tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />

          <button className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 w-full sm:w-auto">
            {loading ? "Searching..." : "Track"}
          </button>
        </form>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        {!pkg && (
          <div className="text-center text-sm text-slate-300">
            Enter a tracking number to see live status and ETA.
          </div>
        )}

        {pkg && (
          <>
            <PackageDetails pkg={pkg} />

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowDetails(true)}
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded"
              >
                View Package
              </button>
            </div>

            {pkg.origin?.lat && pkg.destination?.lat && (
              <div className="mt-6 max-w-3xl mx-auto h-56 md:h-72 rounded overflow-hidden">
                <PlaneTrackingMap pkg={pkg} />
              </div>
            )}

            {showDetails && (
              <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
                <div
                  className="absolute inset-0 bg-black/70"
                  onClick={() => setShowDetails(false)}
                />

                <div className="relative w-full max-w-3xl rounded-t-xl md:rounded-xl bg-slate-900 p-4 md:p-6 z-10 max-h-[95vh] md:max-h-[90vh] overflow-auto text-white">
                  <button
                    className="absolute top-3 right-3 p-2"
                    onClick={() => setShowDetails(false)}
                  >
                    ✕
                  </button>

                  <h3 className="text-lg font-semibold mb-4">Package Items</h3>

                  <ItemCarousel items={pkg.items} currency={pkg.currency} />

                  {pkg.videos && pkg.videos.length ? (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Package Videos</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {pkg.videos.map((video, index) => (
                          <video key={video.public_id || index} controls className="w-full rounded-lg bg-black" src={video.secure_url} />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
