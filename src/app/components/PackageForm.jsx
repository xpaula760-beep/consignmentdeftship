"use client";

import { useState, useEffect } from "react";

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
  const [form, setForm] = useState(emptyForm);
    const [existingImages, setExistingImages] = useState([]);
    const [fileUploads, setFileUploads] = useState([]);
    const [localPreviews, setLocalPreviews] = useState([]);
    const [itemsData, setItemsData] = useState([]);

    // keep baseValue in sync with sum of item values + existing base (we'll only update derived total in backend)
    useEffect(() => {
      const sum = itemsData.reduce((acc, it) => acc + (parseFloat(it.valueUSD) || 0), 0);
      // keep baseValue as the previous base (do not overwrite admin base), but update form.baseValue to reflect sum when empty
      setForm((prev) => ({ ...prev, baseValue: prev.baseValue !== undefined && prev.baseValue !== "" ? prev.baseValue : (sum ? sum.toFixed(2) : "") }));
    }, [itemsData]);

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        itemName: initialData.itemName || "",
        description: initialData.description || "",
        receiverPhone: initialData.receiverPhone || "",
        deliveryTime: initialData.deliveryTime
          ? initialData.deliveryTime.slice(0, 16)
          : "",
        status: initialData.status || "pending",
        originAddress: initialData.origin?.address || "",
        originLat: initialData.origin?.lat ?? "",
        originLng: initialData.origin?.lng ?? "",
        destinationAddress: initialData.destination?.address || "",
        destinationLat: initialData.destination?.lat ?? "",
        destinationLng: initialData.destination?.lng ?? "",
        currentLat: initialData.currentLocation?.lat ?? "",
        currentLng: initialData.currentLocation?.lng ?? "",
        paused: typeof initialData.paused !== 'undefined' ? initialData.paused : prev.paused,
        estimatedDeliveryTime: initialData.estimatedDeliveryTime ? initialData.estimatedDeliveryTime.slice(0,16) : prev.estimatedDeliveryTime,
        distanceKm: initialData.distanceKm ?? prev.distanceKm,
        baseValue: initialData.baseValue ?? initialData.packageValue ?? prev.baseValue,
        shippingCost: typeof initialData.shippingCost !== 'undefined' ? initialData.shippingCost : prev.shippingCost,
        currency: initialData.currency || prev.currency
      }));
      // if there are existing images, keep their URLs so we can send them back if unchanged
      if (initialData.images && initialData.images.length) {
        setExistingImages(initialData.images.map((i) => i.secure_url));
      }

      // populate itemsData from initialData.items
      if (initialData.items && Array.isArray(initialData.items)) {
        setItemsData(initialData.items.map((it) => ({
          name: it.name || "",
          description: it.description || "",
          valueUSD: it.value ?? it.valueUSD ?? "",
          existingImages: (it.images || []).map((im) => (typeof im === 'string' ? im : im.secure_url)),
          fileUploads: [],
          previews: []
        })));
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => formData.append(key, value));

    // include existing image URLs so backend can keep them (when editing)
    if (existingImages && existingImages.length) {
      formData.append("existingImages", JSON.stringify(existingImages));
    }

    // append any newly selected files
    fileUploads.forEach((f) => formData.append("images", f));

    // include items as JSON and per-item existing images + files
    if (itemsData && itemsData.length) {
      // items payload without images (images handled separately)
      const itemsPayload = itemsData.map((it) => ({ name: it.name, description: it.description, value: it.valueUSD ? Number(it.valueUSD) : 0 }));
      formData.append("items", JSON.stringify(itemsPayload));

      // existingItemImages: mapping index -> [urls]
      const existingItemImages = {};
      itemsData.forEach((it, idx) => {
        if (it.existingImages && it.existingImages.length) existingItemImages[idx] = it.existingImages;
      });
      if (Object.keys(existingItemImages).length) formData.append("existingItemImages", JSON.stringify(existingItemImages));

      // append per-item files with fieldname itemImage-<idx>
      itemsData.forEach((it, idx) => {
        if (it.fileUploads && it.fileUploads.length) {
          it.fileUploads.forEach((f) => formData.append(`itemImage-${idx}`, f));
        }
      });
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input
        name="itemName"
        placeholder="Item name"
        className="input w-full"
        value={form.itemName}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Item description"
        className="input w-full h-24"
        value={form.description}
        onChange={handleChange}
        required
      />

      <input
        name="receiverPhone"
        placeholder="Receiver phone"
        className="input w-full"
        value={form.receiverPhone}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm mb-1 block">Origin address</label>
          <input name="originAddress" placeholder="Origin address" className="input w-full" value={form.originAddress} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm mb-1 block">Destination address</label>
          <input name="destinationAddress" placeholder="Destination address" className="input w-full" value={form.destinationAddress} onChange={handleChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input name="originLat" placeholder="Origin lat" className="input w-full" value={form.originLat} onChange={handleChange} />
        <input name="originLng" placeholder="Origin lng" className="input w-full" value={form.originLng} onChange={handleChange} />
        <input name="destinationLat" placeholder="Destination lat" className="input w-full" value={form.destinationLat} onChange={handleChange} />
        <input name="destinationLng" placeholder="Destination lng" className="input w-full" value={form.destinationLng} onChange={handleChange} />
      </div>

      <input
        type="datetime-local"
        name="deliveryTime"
        className="input w-full"
        value={form.deliveryTime}
        onChange={handleChange}
        required
      />

      <input
        type="datetime-local"
        name="estimatedDeliveryTime"
        className="input w-full"
        value={form.estimatedDeliveryTime}
        onChange={handleChange}
      />

      <select
        name="status"
        className="input w-full"
        value={form.status}
        onChange={handleChange}
      >
        <option value="pending">Pending</option>
        <option value="in-transit">In Transit</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <input
        type="file"
        multiple
        accept="image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            setFileUploads(files);
            setLocalPreviews(files.map((f) => URL.createObjectURL(f)));
          }}
      />
        <div className="flex gap-2 mt-2">
          {existingImages.map((url, i) => (
            <img key={`exist-${i}`} src={url} className="w-20 h-20 object-cover rounded" alt={`exist-${i}`} />
          ))}
          {localPreviews.map((url, i) => (
            <img key={`new-${i}`} src={url} className="w-20 h-20 object-cover rounded" alt={`new-${i}`} />
          ))}
        </div>

        {/* Items section */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Items</h4>
            <button type="button" className="btn-secondary" onClick={() => setItemsData((s) => [...s, { name: '', description: '', valueUSD: '', existingImages: [], fileUploads: [], previews: [] }])}>Add Item</button>
          </div>

          <div className="space-y-4 mt-3">
            {itemsData.map((it, idx) => (
              <div key={idx} className="p-3 border rounded">
                <div className="flex items-center justify-between">
                  <strong>Item {idx + 1}</strong>
                  <button type="button" className="text-red-500" onClick={() => setItemsData((s) => s.filter((_, i) => i !== idx))}>Remove</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  <input name={`item-name-${idx}`} placeholder="Name" className="input" value={it.name} onChange={(e) => setItemsData((s) => { const copy = [...s]; copy[idx].name = e.target.value; return copy; })} />
                  <input name={`item-value-${idx}`} placeholder="Value USD" className="input" value={it.valueUSD} onChange={(e) => setItemsData((s) => { const copy = [...s]; copy[idx].valueUSD = e.target.value; return copy; })} />
                  <input type="file" multiple accept="image/*" onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setItemsData((s) => {
                      const copy = [...s];
                      copy[idx].fileUploads = files;
                      copy[idx].previews = files.map((f) => URL.createObjectURL(f));
                      return copy;
                    });
                  }} />
                </div>
                <textarea placeholder="Item description" className="input w-full mt-2" value={it.description} onChange={(e) => setItemsData((s) => { const copy = [...s]; copy[idx].description = e.target.value; return copy; })} />

                <div className="flex gap-2 mt-2">
                  {(it.existingImages || []).map((u, j) => <img key={`it-${idx}-exist-${j}`} src={u} className="w-16 h-16 object-cover rounded" alt="item-exist" />)}
                  {(it.previews || []).map((u, j) => <img key={`it-${idx}-new-${j}`} src={u} className="w-16 h-16 object-cover rounded" alt="item-new" />)}
                </div>
              </div>
            ))}
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input type="number" step="0.01" name="baseValue" placeholder="Base value" className="input" value={form.baseValue} onChange={handleChange} />
        <input type="number" step="0.01" name="shippingCost" placeholder="Shipping cost" className="input" value={form.shippingCost} onChange={handleChange} />
        <input name="currency" placeholder="Currency (USD)" className="input" value={form.currency} onChange={handleChange} />
        <input type="number" step="0.01" name="distanceKm" placeholder="Distance (km)" className="input" value={form.distanceKm} onChange={handleChange} />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="paused" checked={form.paused} onChange={handleChange} />
          <span className="text-sm">Paused</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? "Saving..." : "Save Package"}
      </button>

    </form>
  );
}
