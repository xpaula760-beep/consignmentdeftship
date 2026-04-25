"use client";

import { useEffect, useState } from "react";
import PackageForm from "@/app/components/PackageForm";
import EditPackageModal from "@/app/components/EditPackageModal";
import {
  fetchPackages,
  createPackage,
  updatePackageStatus,
  updatePackageLocation,
  deletePackage,
  clearPackageLocation
} from "@/app/services/package.api";

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [viewPaymentsFor, setViewPaymentsFor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const loadPackages = async () => {
    const data = await fetchPackages();
    setPackages(data || []);
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleCreate = async (formData) => {
    setLoading(true);
    try {
      await createPackage(formData);
      loadPackages();
    } catch (err) {
      // show a user-friendly error
      const msg = err?.response?.data?.message || (err?.response?.data?.errors ? err.response.data.errors.join('; ') : err.message || 'Create failed');
      console.error('Create package failed:', msg);
      alert('Create failed: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, id) => {
    await navigator.clipboard.writeText(text || "");
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Packages</h1>

        <button
          onClick={() => setShowForm(true)}
          className="hidden md:inline-flex rounded-md bg-black px-4 py-2 text-white"
        >
          Add Package
        </button>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-14 h-14 rounded-full bg-black text-white text-2xl shadow-lg"
      >
        +
      </button>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-auto max-h-[calc(100vh-12rem)]">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-zinc-50 z-10">
              <tr className="text-left text-zinc-600">
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {packages.map((pkg) => (
                <tr key={pkg._id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{pkg.itemName}</div>
                    <div className="text-xs text-zinc-500">
                      {pkg.receiverPhone}
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono">
                    {pkg.trackingNumber}
                  </td>

                  <td className="px-4 py-3 capitalize">
                    {pkg.status}
                  </td>

                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <select
                      value={pkg.status}
                      onChange={(e) =>
                        updatePackageStatus(pkg._id, e.target.value).then(loadPackages)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => setEditingId(pkg._id)}
                      className="border rounded px-2 py-1"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleCopy(pkg.trackingNumber, pkg._id)}
                      className="border rounded px-2 py-1"
                    >
                      {copiedId === pkg._id ? "Copied" : "Copy"}
                    </button>

                    <button
                      onClick={() => setViewPaymentsFor(pkg)}
                      className="border rounded px-2 py-1"
                    >
                      Payments
                    </button>

                    <button
                      onClick={() => deletePackage(pkg._id).then(loadPackages)}
                      className="border rounded px-2 py-1 text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <PackageForm onSubmit={handleCreate} loading={loading} />
        </Modal>
      )}

      {editingId && (
        <EditPackageModal
          id={editingId}
          onClose={() => setEditingId(null)}
          onSaved={loadPackages}
        />
      )}

      {viewPaymentsFor && (
        <PaymentsModal pkg={viewPaymentsFor} onClose={() => setViewPaymentsFor(null)} onRefresh={loadPackages} />
      )}
    </div>
  );
}

function PaymentsModal({ pkg, onClose, onRefresh }) {
  const [verifying, setVerifying] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-dvh w-full overflow-auto rounded-t-3xl bg-white shadow-xl sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-4 py-4 sm:px-6">
          <h2 className="text-xl font-bold">Payments — {pkg.trackingNumber}</h2>
          <button onClick={onClose} className="text-2xl text-zinc-500 hover:text-zinc-900">×</button>
        </div>
        <div className="p-4">
          {(!pkg.payments || pkg.payments.length === 0) && <div className="text-zinc-500">No payments submitted yet.</div>}

          {pkg.payments && pkg.payments.map((p) => (
            <div key={p.id} className="border-b py-3">
              <div className="text-sm text-zinc-500">{new Date(p.createdAt).toLocaleString()}</div>
              <div className="font-mono text-sm break-all">{p.txHash}</div>
              <div className="text-xs text-zinc-600">Address: {p.address}</div>
            </div>
          ))}

          <div className="mt-4 flex gap-2">
            <button onClick={onClose} className="px-3 py-2 border rounded">Close</button>
            <button onClick={() => { setVerifying(true); /* optional: mark status or notify */ setTimeout(()=>{ setVerifying(false); onRefresh(); onClose(); }, 800); }} className="px-3 py-2 bg-green-600 text-white rounded">Mark Verified</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-dvh w-full overflow-auto rounded-t-3xl bg-white shadow-xl sm:max-h-[90vh] sm:max-w-4xl sm:rounded-lg" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-4 py-4 sm:px-6">
          <h2 className="text-xl font-bold">Add Package</h2>
          <button onClick={onClose} className="text-2xl text-zinc-500 hover:text-zinc-900">
            ×
          </button>
        </div>
        <div className="p-3 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
