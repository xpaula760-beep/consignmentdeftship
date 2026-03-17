"use client";

import { useEffect, useState } from "react";
import PackageForm from "./PackageForm";
import { fetchPackageById, updatePackage, deletePackage } from "../services/package.api";

export default function EditPackageModal({ id, onClose, onSaved }) {
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPackageById(id).then(setPkg).catch(() => setPkg(null));
  }, [id]);

  const handleSave = async (formData) => {
    setLoading(true);
    try {
      await updatePackage(id, formData);
      onSaved && onSaved();
      onClose && onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this package?")) return;
    setLoading(true);
    try {
      await deletePackage(id);
      onSaved && onSaved();
      onClose && onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!pkg) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl md:max-w-2xl bg-white rounded-xl p-4 md:p-6 z-10 max-h-[90vh] overflow-auto">
        <button className="absolute top-3 right-3 p-2 rounded hover:bg-zinc-100" onClick={onClose} aria-label="Close">✕</button>

        <div className="space-y-4">
          <div className="pb-4 md:pb-6">
            <h3 className="text-lg font-semibold">Edit Package</h3>
            <p className="text-sm text-zinc-500">Make changes and save. Scroll within this dialog on small screens.</p>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
              <div><span className="font-semibold">Package:</span> {pkg.itemName || "—"}</div>
              <div><span className="font-semibold">Tracking:</span> {pkg.trackingNumber || "—"}</div>
              <div><span className="font-semibold">Value:</span> {(typeof pkg.totalValue !== 'undefined' ? `${pkg.currency || 'USD'} ${pkg.totalValue}` : "—")}</div>
              <div><span className="font-semibold">Shipping:</span> {typeof pkg.shippingCost !== 'undefined' ? `${pkg.currency || 'USD'} ${pkg.shippingCost}` : '—'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="md:col-span-1">
              <PackageForm initialData={pkg} onSubmit={handleSave} loading={loading} />
            </div>

            <div className="md:col-span-1 space-y-4">
              <div className="p-3 border rounded">
                <h4 className="font-medium">Preview</h4>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {pkg.images && pkg.images.length ? (
                    pkg.images.map((img, i) => (
                      <img key={i} src={img.secure_url} alt={`img-${i}`} className="w-full h-28 object-cover rounded" />
                    ))
                  ) : (
                    <div className="w-full h-28 bg-zinc-50 flex items-center justify-center text-zinc-400">No images</div>
                  )}
                </div>

                {pkg.videos && pkg.videos.length ? (
                  <div className="mt-4 space-y-2">
                    <h5 className="text-sm font-medium">Videos</h5>
                    {pkg.videos.map((video, i) => (
                      <video key={video.public_id || i} controls className="w-full rounded border bg-black" src={video.secure_url} />
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="p-3 border rounded">
                <h4 className="font-medium">Items</h4>
                <div className="mt-2 space-y-2">
                  {pkg.items && pkg.items.length ? pkg.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3 border-b last:border-b-0 pb-2">
                      <div className="w-12 h-12 bg-zinc-100 rounded overflow-hidden">
                        {it.images && it.images[0] ? (
                          <img src={it.images[0].secure_url} className="w-full h-full object-cover" alt={it.name || `Item ${idx + 1}`} />
                        ) : null}
                      </div>
                      <div className="flex-1 text-sm">
                        <div className="font-medium">{it.name}</div>
                        <div className="text-zinc-500">{typeof it.value !== 'undefined' ? `${pkg.currency || 'USD'} ${it.value}` : ''}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-sm text-zinc-500">No items</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-start gap-4">
            <div>
              <button className="btn-danger mr-2" onClick={handleDelete} disabled={loading}>Delete</button>
            </div>
            <div className="text-sm text-zinc-500">Use the form&apos;s Save button to persist changes.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
