"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { fetchPackageByTrackingNumber } from "../services/package.api";
import dynamic from "next/dynamic";
import ItemCarousel from "../components/ItemCarousel";
import { useSearchParams } from "next/navigation";

const PlaneTrackingMap = dynamic(() => import("../components/PlaneTrackingMap"), {
  ssr: false
});

const videoExtensionPattern = /\.(mp4|mov|webm|m4v|m3u8|ogg|ogv)(\?|$)/i;

const statusStyles = {
  pending: "border-amber-400/25 bg-amber-400/15 text-amber-100",
  "in-transit": "border-sky-400/25 bg-sky-400/15 text-sky-100",
  delivered: "border-emerald-400/25 bg-emerald-400/15 text-emerald-100",
  cancelled: "border-rose-400/25 bg-rose-400/15 text-rose-100"
};

const isVideoAsset = (asset) => {
  if (!asset?.secure_url) return false;
  if (asset.resource_type === "video") return true;
  return videoExtensionPattern.test(asset.secure_url);
};

const extractPackageVideos = (pkg) => {
  const explicitVideos = Array.isArray(pkg?.videos) ? pkg.videos : [];
  const packageImages = Array.isArray(pkg?.images) ? pkg.images : [];
  const itemImages = Array.isArray(pkg?.items) ? pkg.items.flatMap((it) => (Array.isArray(it.images) ? it.images : [])) : [];
  const fallbackVideos = [...packageImages, ...itemImages].filter(isVideoAsset);

  return [...explicitVideos, ...fallbackVideos].filter((asset, index, list) => {
    const url = asset?.secure_url;
    return url && list.findIndex((entry) => entry?.secure_url === url) === index;
  });
};

const extractPackageImages = (pkg) => {
  const packageImages = Array.isArray(pkg?.images) ? pkg.images : [];
  const itemImages = Array.isArray(pkg?.items) ? pkg.items.flatMap((it) => (Array.isArray(it.images) ? it.images : [])) : [];
  const candidates = [...packageImages, ...itemImages];
  return candidates
    .filter((asset) => asset?.secure_url && !isVideoAsset(asset))
    .filter((asset, index, list) => list.findIndex((entry) => entry?.secure_url === asset?.secure_url) === index);
};

const formatCurrency = (amount, currency = "USD") => {
  if (typeof amount !== "number") return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString();
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium capitalize backdrop-blur ${
        statusStyles[status] || "border-white/15 bg-white/10 text-white"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}

function SummaryCard({ label, value, helper }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_60px_-38px_rgba(56,189,248,0.8)] backdrop-blur">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
      {helper ? <div className="mt-1 text-sm text-slate-400">{helper}</div> : null}
    </div>
  );
}

function MediaRail({ images, videos, onOpen }) {
  if (!images.length && !videos.length) return null;

  const cards = [
    ...videos.map((video, index) => ({ type: "video", asset: video, key: `video-${video.public_id || index}` })),
    ...images.map((image, index) => ({ type: "image", asset: image, key: `image-${image.public_id || index}` }))
  ];

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-white">Shipment evidence</div>
          <div className="text-sm text-slate-400">Photos and delivery videos attached to this package.</div>
        </div>
        <button
          onClick={onOpen}
          className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20"
        >
          View package
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {cards.slice(0, 6).map(({ type, asset, key }) => (
          <div key={key} className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
            <div className="relative aspect-video overflow-hidden bg-black">
              {type === "video" ? (
                <video
                  src={asset.secure_url}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <img
                  src={asset.secure_url}
                  alt="Shipment evidence"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-black/80 via-black/20 to-transparent px-4 py-3 text-xs uppercase tracking-[0.2em] text-white/80">
                <span>{type === "video" ? "Video proof" : "Photo proof"}</span>
                {type === "video" && asset.duration ? <span>{Math.round(asset.duration)}s</span> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailsGrid({ pkg }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Origin</div>
        <div className="mt-3 text-base font-medium text-white">{pkg.origin?.address || "—"}</div>
        <div className="mt-2 text-sm text-slate-400">
          {pkg.origin?.lat && pkg.origin?.lng ? `${pkg.origin.lat}, ${pkg.origin.lng}` : "Coordinates unavailable"}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Destination</div>
        <div className="mt-3 text-base font-medium text-white">{pkg.destination?.address || "—"}</div>
        <div className="mt-2 text-sm text-slate-400">
          {pkg.destination?.lat && pkg.destination?.lng
            ? `${pkg.destination.lat}, ${pkg.destination.lng}`
            : "Coordinates unavailable"}
        </div>
      </div>
    </div>
  );
}

function PackageViewerModal({ pkg, open, onClose }) {
  const images = useMemo(() => extractPackageImages(pkg), [pkg]);
  const videos = useMemo(() => extractPackageVideos(pkg), [pkg]);
  const [selectedTab, setSelectedTab] = useState(videos.length ? "videos" : "photos");
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  if (!open || !pkg) return null;

  const selectedVideo = videos[selectedVideoIndex] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur md:items-center md:p-6">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-4xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),rgba(15,23,42,0.98)_40%,rgba(2,6,23,1))] text-white shadow-[0_50px_140px_-70px_rgba(14,165,233,0.85)] md:rounded-4xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-8">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">View package</div>
            <h3 className="mt-1 text-xl font-semibold">{pkg.itemName}</h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="grid flex-1 gap-0 overflow-auto md:grid-cols-[1.2fr_0.8fr]">
          <div className="border-b border-white/10 p-5 md:border-b-0 md:border-r md:p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {[
                { id: "videos", label: `Videos ${videos.length ? `(${videos.length})` : ""}`, disabled: !videos.length },
                { id: "photos", label: `Photos ${images.length ? `(${images.length})` : ""}`, disabled: !images.length },
                { id: "items", label: `Items ${pkg.items?.length ? `(${pkg.items.length})` : ""}`, disabled: !(pkg.items && pkg.items.length) }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setSelectedTab(tab.id)}
                  disabled={tab.disabled}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    selectedTab === tab.id
                      ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-50"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {tab.label.trim()}
                </button>
              ))}
            </div>

            {selectedTab === "videos" && videos.length ? (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-[1.75rem] border border-violet-300/20 bg-black shadow-[0_30px_90px_-60px_rgba(168,85,247,0.9)]">
                  <video
                    key={selectedVideo?.secure_url}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-video w-full bg-black object-contain"
                    src={selectedVideo?.secure_url}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {videos.map((video, index) => (
                    <button
                      key={video.public_id || video.secure_url || index}
                      onClick={() => setSelectedVideoIndex(index)}
                      className={`overflow-hidden rounded-3xl border text-left transition ${
                        selectedVideoIndex === index
                          ? "border-violet-300/40 bg-violet-300/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <video
                        src={video.secure_url}
                        muted
                        playsInline
                        preload="metadata"
                        className="aspect-video w-full bg-black object-cover"
                      />
                      <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-300">
                        <span className="font-medium text-white">Video proof {index + 1}</span>
                        <span>{video.duration ? `${Math.round(video.duration)}s` : "Cloudinary asset"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {selectedTab === "photos" && images.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {images.map((image, index) => (
                  <div key={image.public_id || image.secure_url || index} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                    <img src={image.secure_url} alt={`Package evidence ${index + 1}`} className="aspect-4/3 w-full object-cover" />
                    <div className="px-4 py-3 text-sm text-slate-300">Package photo {index + 1}</div>
                  </div>
                ))}
              </div>
            ) : null}

            {selectedTab === "items" && pkg.items?.length ? (
              <div className="space-y-5">
                <ItemCarousel items={pkg.items} currency={pkg.currency} />

                <div className="grid gap-3 md:grid-cols-2">
                  {pkg.items.map((item, index) => (
                    <div key={`${item.name || "item"}-${index}`} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="text-base font-semibold text-white">{item.name || `Item ${index + 1}`}</div>
                      <div className="mt-1 text-sm text-slate-400">{item.description || "No description provided."}</div>
                      <div className="mt-3 text-sm font-medium text-cyan-100">
                        {formatCurrency(item.value, pkg.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {((selectedTab === "videos" && !videos.length) ||
              (selectedTab === "photos" && !images.length) ||
              (selectedTab === "items" && !pkg.items?.length)) && (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center text-slate-400">
                No media available in this section yet.
              </div>
            )}
          </div>

          <div className="space-y-4 p-5 md:p-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Tracking summary</div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <StatusBadge status={pkg.status} />
                <div className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-sm font-mono text-cyan-100">
                  {pkg.trackingNumber}
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{pkg.description || "No shipment description."}</p>
            </div>

            <SummaryCard label="Declared value" value={formatCurrency(pkg.totalValue ?? pkg.baseValue, pkg.currency)} helper={`Base value ${formatCurrency(pkg.baseValue, pkg.currency)}`} />
            <SummaryCard label="Estimated arrival" value={formatDateTime(pkg.estimatedDeliveryTime)} helper={`Delivery time ${formatDateTime(pkg.deliveryTime)}`} />
            <SummaryCard label="Shipment route" value={pkg.distanceKm ? `${pkg.distanceKm} km` : "Awaiting route estimate"} helper={pkg.paused ? "Tracking currently paused" : "Tracking active"} />

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Receiver</div>
              <div className="mt-3 text-base font-medium text-white">{pkg.receiverPhone || "—"}</div>
              <div className="mt-4 grid gap-3 text-sm text-slate-400">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Current location</div>
                  <div className="mt-1 text-slate-200">
                    {pkg.currentLocation?.lat && pkg.currentLocation?.lng
                      ? `${pkg.currentLocation.lat}, ${pkg.currentLocation.lng}`
                      : "No live coordinates yet"}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Updated</div>
                  <div className="mt-1 text-slate-200">{formatDateTime(pkg.currentLocation?.updatedAt || pkg.updatedAt)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PackageDetails({ pkg, onOpen }) {
  const images = useMemo(() => extractPackageImages(pkg), [pkg]);
  const videos = useMemo(() => extractPackageVideos(pkg), [pkg]);

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-4xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),rgba(15,23,42,0.96)_42%,rgba(2,6,23,1))] p-6 shadow-[0_50px_130px_-80px_rgba(6,182,212,0.9)] backdrop-blur md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-100/80">
            Package insight
            <StatusBadge status={pkg.status} />
          </div>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">{pkg.itemName}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{pkg.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onOpen}
              className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              View package media
            </button>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono text-cyan-100">
              {pkg.trackingNumber}
            </div>
          </div>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-md">
          <SummaryCard label="Total value" value={formatCurrency(pkg.totalValue ?? pkg.baseValue, pkg.currency)} helper={`${pkg.items?.length || 0} tracked item${pkg.items?.length === 1 ? "" : "s"}`} />
          <SummaryCard label="ETA" value={formatDateTime(pkg.estimatedDeliveryTime)} helper={pkg.distanceKm ? `${pkg.distanceKm} km route` : "Route estimate pending"} />
          <SummaryCard label="Receiver" value={pkg.receiverPhone || "—"} helper="Verified contact" />
          <SummaryCard label="Media proof" value={`${images.length} photos / ${videos.length} videos`} helper="Playback ready" />
        </div>
      </div>

      <div className="mt-8">
        <DetailsGrid pkg={pkg} />
      </div>

      <MediaRail images={images} videos={videos} onOpen={onOpen} />
    </div>
  );
}

function TrackPackagePageContent() {
  const searchParams = useSearchParams();
  const [showDetails, setShowDetails] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const queryTrackingNumber = searchParams.get("trackingNumber") || "";

  const runSearch = async (value) => {
    setError("");
    setPkg(null);

    const normalizedTrackingNumber = value.trim();
    if (!normalizedTrackingNumber) {
      setError("Please enter a tracking number.");
      return;
    }

    try {
      setLoading(true);
      const data = await fetchPackageByTrackingNumber(normalizedTrackingNumber);
      if (!data) {
        setError("Package not found. Please check the tracking number.");
        return;
      }
      // debug: quickly log media counts to help diagnose missing images
      try {
        // eslint-disable-next-line no-console
        console.debug("Loaded package", data.trackingNumber, {
          images: Array.isArray(data.images) ? data.images.length : 0,
          videos: Array.isArray(data.videos) ? data.videos.length : 0,
          items: Array.isArray(data.items) ? data.items.length : 0
        });
      } catch (e) {}
      setPkg(data);
    } catch {
      setError("Package not found. Please check the tracking number.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!queryTrackingNumber) return;
    setTrackingNumber(queryTrackingNumber);
    runSearch(queryTrackingNumber);
  }, [queryTrackingNumber]);

  const handleSearch = async (e) => {
    e.preventDefault();
    await runSearch(trackingNumber);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),rgba(15,23,42,1)_35%,rgba(2,6,23,1))] px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100/80">
            Live delivery tracking
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">Track your shipment</h1>
          <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
            Follow route progress and  inspect package details.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mx-auto mt-10 max-w-3xl rounded-4xl border border-white/10 bg-slate-950/70 p-4 shadow-[0_40px_120px_-90px_rgba(34,211,238,0.8)] backdrop-blur md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />

            <button className="rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 sm:min-w-40">
              {loading ? "Searching..." : "Track package"}
            </button>
          </div>
        </form>

        {error ? <p className="mt-4 text-center text-sm text-rose-300">{error}</p> : null}

        {!pkg ? (
          <div className="mx-auto mt-12 max-w-3xl rounded-4xl border border-dashed border-white/10 bg-white/3 px-6 py-12 text-center text-slate-400">
            Enter a tracking number to view live route status and package items.
          </div>
        ) : (
          <div className="mt-12 space-y-8">
            <PackageDetails pkg={pkg} onOpen={() => setShowDetails(true)} />

            {pkg.origin?.lat && pkg.destination?.lat ? (
              <div className="overflow-hidden rounded-4xl border border-white/10 bg-slate-950/70 p-3 shadow-[0_40px_120px_-90px_rgba(14,165,233,0.75)] md:p-4">
                <div className="mb-3 px-2 pt-2">
                  <div className="text-sm font-semibold text-white">Live route overview</div>
                  <div className="text-sm text-slate-400">Origin, destination, and latest location plotted on the shipment map.</div>
                </div>
                <div className="h-64 overflow-hidden rounded-3xl md:h-80">
                  <PlaneTrackingMap pkg={pkg} />
                </div>
              </div>
            ) : null}

            <PackageViewerModal pkg={pkg} open={showDetails} onClose={() => setShowDetails(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPackagePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),rgba(15,23,42,1)_35%,rgba(2,6,23,1))] px-4 py-12 text-white">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100/80">
                Live delivery tracking
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">Track your shipment</h1>
              <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">Loading tracking search…</p>
            </div>
          </div>
        </div>
      }
    >
      <TrackPackagePageContent />
    </Suspense>
  );
}
