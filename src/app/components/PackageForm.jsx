"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Film,
  ImagePlus,
  MapPinned,
  PackagePlus,
  Phone,
  Sparkles,
  Trash2,
  Truck
} from "lucide-react";

const normalizeMedia = (media = [], prefix = "media") =>
  (Array.isArray(media) ? media : []).map((item, index) => ({
    id: item?.public_id || `${prefix}-${index}`,
    secure_url: item?.secure_url || item,
    thumbnail_url: item?.thumbnail_url || item?.secure_url || item,
    duration: item?.duration,
    bytes: item?.bytes
  }));

const buildFormState = (initialData) => {
  if (!initialData) return emptyForm;

  return {
    ...emptyForm,
    itemName: initialData.itemName || "",
    description: initialData.description || "",
    receiverPhone: initialData.receiverPhone || "",
    deliveryTime: initialData.deliveryTime ? initialData.deliveryTime.slice(0, 16) : "",
    status: initialData.status || "pending",
    originAddress: initialData.origin?.address || "",
    originLat: initialData.origin?.lat ?? "",
    originLng: initialData.origin?.lng ?? "",
    destinationAddress: initialData.destination?.address || "",
    destinationLat: initialData.destination?.lat ?? "",
    destinationLng: initialData.destination?.lng ?? "",
    currentLat: initialData.currentLocation?.lat ?? "",
    currentLng: initialData.currentLocation?.lng ?? "",
    paused: typeof initialData.paused !== "undefined" ? initialData.paused : false,
    estimatedDeliveryTime: initialData.estimatedDeliveryTime
      ? initialData.estimatedDeliveryTime.slice(0, 16)
      : "",
    distanceKm: initialData.distanceKm ?? "",
    baseValue: initialData.baseValue ?? initialData.packageValue ?? "",
    shippingCost: typeof initialData.shippingCost !== "undefined" ? initialData.shippingCost : "",
    currency: initialData.currency || "USD"
  };
};

const buildItemState = (items = []) =>
  (Array.isArray(items) ? items : []).map((item, itemIndex) => ({
    name: item.name || "",
    description: item.description || "",
    valueUSD: item.value ?? item.valueUSD ?? "",
    existingImages: normalizeMedia(item.images || [], `item-${itemIndex}-existing`),
    fileUploads: [],
    previews: []
  }));

const emptyForm = {
  itemName: "",
  description: "",
  receiverPhone: "",
  deliveryTime: "",
  status: "pending",
  originAddress: "",
  originLat: "",
  originLng: "",
  destinationAddress: "",
  destinationLat: "",
  destinationLng: "",
  currentLat: "",
  currentLng: "",
  paused: false,
  estimatedDeliveryTime: "",
  distanceKm: "",
  baseValue: "",
  shippingCost: "",
  currency: "USD"
};

export default function PackageForm({
  onSubmit,
  loading = false,
  initialData = null
}) {
  const [form, setForm] = useState(() => buildFormState(initialData));
  const [existingImages, setExistingImages] = useState(() => normalizeMedia(initialData?.images || [], "existing-image"));
  const [existingVideos, setExistingVideos] = useState(() => normalizeMedia(initialData?.videos || [], "existing-video"));
  const [fileUploads, setFileUploads] = useState([]);
  const [videoUploads, setVideoUploads] = useState([]);
  const [localPreviews, setLocalPreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [itemsData, setItemsData] = useState(() => buildItemState(initialData?.items || []));

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.itemName || form.itemName.trim().length < 2) return alert("Item name is required.");
    if (!form.description || form.description.trim().length < 10) return alert("Description must be at least 10 characters.");
    if (!form.receiverPhone || form.receiverPhone.trim().length < 7) return alert("Receiver phone is required.");
    if (!form.deliveryTime) return alert("Delivery time is required.");

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => formData.append(key, value));

    if (existingImages && existingImages.length) {
      formData.append("existingImages", JSON.stringify(existingImages));
    }

    if (existingVideos && existingVideos.length) {
      formData.append("existingVideos", JSON.stringify(existingVideos));
    }

    fileUploads.forEach((f) => formData.append("images", f));
    videoUploads.forEach((f) => formData.append("videos", f));

    if (itemsData && itemsData.length) {
      const itemsPayload = itemsData.map((it) => ({ name: it.name, description: it.description, value: it.valueUSD ? Number(it.valueUSD) : 0 }));
      formData.append("items", JSON.stringify(itemsPayload));

      const existingItemImages = {};
      itemsData.forEach((it, idx) => {
        if (it.existingImages && it.existingImages.length) existingItemImages[idx] = it.existingImages;
      });
      if (Object.keys(existingItemImages).length) formData.append("existingItemImages", JSON.stringify(existingItemImages));

      itemsData.forEach((it, idx) => {
        if (it.fileUploads && it.fileUploads.length) {
          it.fileUploads.forEach((f) => formData.append(`itemImage-${idx}`, f));
        }
      });
    }

    onSubmit(formData);
  };

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20";
  const panelClass =
    "rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_20px_70px_-30px_rgba(56,189,248,0.45)] backdrop-blur";

  const totals = useMemo(() => {
    const itemsValue = itemsData.reduce((sum, item) => sum + (parseFloat(item.valueUSD) || 0), 0);
    const declaredValue = parseFloat(form.baseValue) || itemsValue || 0;
    const shippingCost = parseFloat(form.shippingCost) || 0;

    return {
      itemsValue,
      declaredValue,
      shippingCost,
      assetCount: existingImages.length + localPreviews.length + existingVideos.length + videoPreviews.length
    };
  }, [existingImages.length, existingVideos.length, form.baseValue, form.shippingCost, itemsData, localPreviews.length, videoPreviews.length]);

  const makePreviewList = (files) =>
    files.map((file, index) => ({
      id: `${file.name}-${file.size}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));

  const formatBytes = (bytes = 0) => {
    if (!bytes) return "";
    const sizes = ["B", "KB", "MB", "GB"];
    const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
    const value = bytes / 1024 ** unitIndex;
    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${sizes[unitIndex]}`;
  };

  const updateItem = (index, updater) => {
    setItemsData((state) => {
      const copy = [...state];
      copy[index] = updater(copy[index]);
      return copy;
    });
  };

  const addItem = () => {
    setItemsData((state) => [
      ...state,
      { name: "", description: "", valueUSD: "", existingImages: [], fileUploads: [], previews: [] }
    ]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-4xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),rgba(15,23,42,0.95)_40%,rgba(2,6,23,1))] p-4 text-white md:p-6"
    >
      <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-400/10 p-5 shadow-[0_24px_80px_-50px_rgba(34,211,238,0.85)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              <Sparkles className="h-4 w-4" />
              Cloudinary-ready shipment form
            </div>
            <h2 className="mt-3 text-2xl font-semibold">Create a shipment with image and video proof</h2>
            <p className="mt-2 text-sm text-slate-200">
              Upload package photos, delivery videos, and item snapshots in one flow. Videos are sent to Cloudinary from the backend.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm md:min-w-72">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="text-slate-400">Assets</div>
              <div className="mt-1 text-2xl font-semibold">{totals.assetCount}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="text-slate-400">Declared value</div>
              <div className="mt-1 text-2xl font-semibold">
                {form.currency} {totals.declaredValue.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-6">
          <section className={panelClass}>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-300">
                <PackagePlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Package overview</h3>
                <p className="text-sm text-slate-400">Capture the basic shipment information first.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm text-slate-300">Package name</span>
                <input
                  name="itemName"
                  placeholder="MacBook Pro, Designer samples, Retail order..."
                  className={inputClass}
                  value={form.itemName}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm text-slate-300">Description</span>
                <textarea
                  name="description"
                  placeholder="Describe the package contents, handling notes, or delivery instructions."
                  className={`${inputClass} min-h-32 resize-y`}
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm text-slate-300">
                  <Phone className="h-4 w-4 text-cyan-300" />
                  Receiver phone
                </span>
                <input
                  name="receiverPhone"
                  placeholder="+1 555 019 220"
                  className={inputClass}
                  value={form.receiverPhone}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm text-slate-300">
                  <Truck className="h-4 w-4 text-cyan-300" />
                  Status
                </span>
                <select
                  name="status"
                  className={inputClass}
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="pending">Pending</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm text-slate-300">Delivery time</span>
                <input
                  type="datetime-local"
                  name="deliveryTime"
                  className={inputClass}
                  value={form.deliveryTime}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-slate-300">Estimated arrival</span>
                <input
                  type="datetime-local"
                  name="estimatedDeliveryTime"
                  className={inputClass}
                  value={form.estimatedDeliveryTime}
                  onChange={handleChange}
                />
              </label>
            </div>
          </section>

          <section className={panelClass}>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-400/15 p-3 text-emerald-300">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Route & coordinates</h3>
                <p className="text-sm text-slate-400">Add addresses and optional map coordinates for live tracking.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-slate-300">Origin address</span>
                <input name="originAddress" placeholder="Warehouse or pickup address" className={inputClass} value={form.originAddress} onChange={handleChange} />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-300">Destination address</span>
                <input name="destinationAddress" placeholder="Receiver address" className={inputClass} value={form.destinationAddress} onChange={handleChange} />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <input name="originLat" placeholder="Origin latitude" className={inputClass} value={form.originLat} onChange={handleChange} />
              <input name="originLng" placeholder="Origin longitude" className={inputClass} value={form.originLng} onChange={handleChange} />
              <input name="destinationLat" placeholder="Destination latitude" className={inputClass} value={form.destinationLat} onChange={handleChange} />
              <input name="destinationLng" placeholder="Destination longitude" className={inputClass} value={form.destinationLng} onChange={handleChange} />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <input name="currentLat" placeholder="Current latitude" className={inputClass} value={form.currentLat} onChange={handleChange} />
              <input name="currentLng" placeholder="Current longitude" className={inputClass} value={form.currentLng} onChange={handleChange} />
              <input type="number" step="0.01" name="distanceKm" placeholder="Distance (km)" className={inputClass} value={form.distanceKm} onChange={handleChange} />
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                <input type="checkbox" name="paused" checked={form.paused} onChange={handleChange} className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-400" />
                Pause tracking updates
              </label>
            </div>
          </section>

          <section className={panelClass}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-fuchsia-400/15 p-3 text-fuchsia-300">
                  <Box className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Items & valuation</h3>
                  <p className="text-sm text-slate-400">Split a shipment into multiple tracked items when needed.</p>
                </div>
              </div>

              <button
                type="button"
                className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20"
                onClick={addItem}
              >
                Add Item
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <input type="number" step="0.01" name="baseValue" placeholder="Declared package value" className={inputClass} value={form.baseValue} onChange={handleChange} />
              <input type="number" step="0.01" name="shippingCost" placeholder="Shipping cost" className={inputClass} value={form.shippingCost} onChange={handleChange} />
              <input name="currency" placeholder="Currency" className={inputClass} value={form.currency} onChange={handleChange} />
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                Item total: <span className="font-semibold text-white">{form.currency} {totals.itemsValue.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {itemsData.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/50 p-6 text-sm text-slate-400">
                  No individual items yet. Add one if you want image-by-item proof and separate value tracking.
                </div>
              )}

              {itemsData.map((it, idx) => (
                <div key={idx} className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">Item {idx + 1}</h4>
                      <p className="text-sm text-slate-400">Attach close-up images for this item.</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200 hover:bg-red-400/20"
                      onClick={() => setItemsData((state) => state.filter((_, itemIndex) => itemIndex !== idx))}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <input name={`item-name-${idx}`} placeholder="Item name" className={inputClass} value={it.name} onChange={(e) => updateItem(idx, (current) => ({ ...current, name: e.target.value }))} />
                    <input name={`item-value-${idx}`} placeholder="Value in USD" className={inputClass} value={it.valueUSD} onChange={(e) => updateItem(idx, (current) => ({ ...current, valueUSD: e.target.value }))} />
                    <label className="rounded-2xl border border-dashed border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:bg-slate-900/70">
                      <span className="block font-medium">Item photos</span>
                      <span className="mt-1 block text-xs text-slate-400">PNG, JPG, WEBP</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="mt-3 block w-full text-xs text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-cyan-400/20 file:px-3 file:py-2 file:text-cyan-200"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          updateItem(idx, (current) => ({
                            ...current,
                            fileUploads: files,
                            previews: makePreviewList(files)
                          }));
                        }}
                      />
                    </label>
                  </div>

                  <textarea placeholder="Item description" className={`${inputClass} mt-4 min-h-24`} value={it.description} onChange={(e) => updateItem(idx, (current) => ({ ...current, description: e.target.value }))} />

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {(it.existingImages || []).map((image, imageIndex) => (
                      <div key={image.id || imageIndex} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80">
                        <img src={image.thumbnail_url || image.secure_url} className="h-28 w-full object-cover" alt={`item-${idx}-existing-${imageIndex}`} />
                        <button
                          type="button"
                          className="w-full border-t border-white/10 px-3 py-2 text-xs text-red-200 hover:bg-red-400/10"
                          onClick={() => updateItem(idx, (current) => ({
                            ...current,
                            existingImages: current.existingImages.filter((_, currentImageIndex) => currentImageIndex !== imageIndex)
                          }))}
                        >
                          Remove image
                        </button>
                      </div>
                    ))}

                    {(it.previews || []).map((preview, previewIndex) => (
                      <div key={preview.id || previewIndex} className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-900/80">
                        <img src={preview.url} className="h-28 w-full object-cover" alt={preview.name} />
                        <div className="border-t border-white/10 px-3 py-2 text-xs text-slate-300">
                          <div className="truncate">{preview.name}</div>
                          <div className="text-slate-500">{formatBytes(preview.size)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className={panelClass}>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300">
                <ImagePlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Package photos</h3>
                <p className="text-sm text-slate-400">Use multiple angles for better verification.</p>
              </div>
            </div>

            <label className="block rounded-3xl border border-dashed border-white/15 bg-slate-950/50 p-4 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:bg-slate-900/70">
              <span className="font-medium">Select package images</span>
              <span className="mt-1 block text-xs text-slate-400">Drag files here or use the picker. JPG, PNG, WEBP supported.</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="mt-4 block w-full text-xs text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-cyan-400/20 file:px-3 file:py-2 file:text-cyan-200"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setFileUploads(files);
                  setLocalPreviews(makePreviewList(files));
                }}
              />
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {existingImages.map((image, index) => (
                <div key={image.id || index} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80">
                  <img src={image.thumbnail_url || image.secure_url} className="h-36 w-full object-cover" alt={`existing-package-${index}`} />
                  <button
                    type="button"
                    className="w-full border-t border-white/10 px-3 py-2 text-xs text-red-200 hover:bg-red-400/10"
                    onClick={() => setExistingImages((state) => state.filter((_, imageIndex) => imageIndex !== index))}
                  >
                    Remove image
                  </button>
                </div>
              ))}

              {localPreviews.map((image, index) => (
                <div key={image.id || index} className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-900/80">
                  <img src={image.url} className="h-36 w-full object-cover" alt={image.name} />
                  <div className="border-t border-white/10 px-3 py-2 text-xs text-slate-300">
                    <div className="truncate">{image.name}</div>
                    <div className="text-slate-500">{formatBytes(image.size)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={panelClass}>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-violet-400/15 p-3 text-violet-300">
                <Film className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Cloudinary video uploads</h3>
                <p className="text-sm text-slate-400">Attach unboxing, pickup, or dispatch clips. The backend uploads them to Cloudinary.</p>
              </div>
            </div>

            <label className="block rounded-3xl border border-dashed border-violet-300/20 bg-violet-400/5 p-4 text-sm text-slate-300 transition hover:border-violet-300/40 hover:bg-violet-400/10">
              <span className="font-medium">Select delivery videos</span>
              <span className="mt-1 block text-xs text-slate-400">MP4, MOV, WEBM and most standard video formats are supported by Cloudinary.</span>
              <input
                type="file"
                multiple
                accept="video/*"
                className="mt-4 block w-full text-xs text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-violet-400/20 file:px-3 file:py-2 file:text-violet-200"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setVideoUploads(files);
                  setVideoPreviews(makePreviewList(files));
                }}
              />
            </label>

            <div className="mt-4 space-y-3">
              {existingVideos.map((video, index) => (
                <div key={video.id || index} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80">
                  <video controls preload="metadata" src={video.secure_url} className="h-48 w-full bg-black object-cover" />
                  <div className="flex items-center justify-between gap-3 border-t border-white/10 px-3 py-2 text-xs text-slate-300">
                    <div>
                      <div className="font-medium">Existing Cloudinary video</div>
                      <div className="text-slate-500">{video.duration ? `${Math.round(video.duration)}s` : "Stored asset"}</div>
                    </div>
                    <button
                      type="button"
                      className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-red-200 hover:bg-red-400/20"
                      onClick={() => setExistingVideos((state) => state.filter((_, videoIndex) => videoIndex !== index))}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {videoPreviews.map((video, index) => (
                <div key={video.id || index} className="overflow-hidden rounded-2xl border border-violet-400/20 bg-slate-900/80">
                  <video controls preload="metadata" src={video.url} className="h-48 w-full bg-black object-cover" />
                  <div className="border-t border-white/10 px-3 py-2 text-xs text-slate-300">
                    <div className="truncate font-medium">{video.name}</div>
                    <div className="text-slate-500">{formatBytes(video.size)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={panelClass}>
            <h3 className="text-lg font-semibold">Submission summary</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                <span>Items in shipment</span>
                <span className="font-semibold text-white">{itemsData.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                <span>Declared value</span>
                <span className="font-semibold text-white">{form.currency} {totals.declaredValue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                <span>Shipping cost</span>
                <span className="font-semibold text-white">{form.currency} {totals.shippingCost.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving package..." : "Save package"}
            </button>
          </section>
        </div>
      </div>
    </form>
  );
}
