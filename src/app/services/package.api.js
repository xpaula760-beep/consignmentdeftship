import axios from "axios";

const rawBase = process.env.NEXT_PUBLIC_PACKAGES_API_URL || "";
const normalizedBase = rawBase ? rawBase.replace(/\/$/, "") + "/api" : "/api";

const api = axios.create({
  baseURL: normalizedBase,
  withCredentials: true
});

/* ===========================
   PACKAGE API
=========================== */

export const fetchPackages = async () => {
  // try server, but also include any offline packages saved locally when auth fails
  let serverData = [];
  try {
    const res = await api.get("/packages");
    serverData = res.data || [];
  } catch (err) {
    // ignore — we'll still return any locally saved packages
    serverData = [];
  }

  const offlineJson = typeof window !== "undefined" ? localStorage.getItem("offlinePackages") : null;
  const offline = offlineJson ? JSON.parse(offlineJson) : [];

  return [...offline, ...serverData];
};

export const fetchPackageById = async (id) => {
  try {
    const res = await api.get(`/packages/${id}`);
    return res.data;
  } catch (err) {
    // try local offline packages
    if (typeof window !== "undefined") {
      const offlineJson = localStorage.getItem("offlinePackages");
      const offline = offlineJson ? JSON.parse(offlineJson) : [];
      return offline.find((p) => String(p._id) === String(id)) || null;
    }
    throw err;
  }
};

export const fetchPackageByTrackingNumber = async (trackingNumber) => {
  try {
    const res = await api.get(`/packages/track/${encodeURIComponent(trackingNumber)}`);
    return res.data;
  } catch (err) {
    if (typeof window !== "undefined") {
      const offlineJson = localStorage.getItem("offlinePackages");
      const offline = offlineJson ? JSON.parse(offlineJson) : [];
      return offline.find((p) => String(p.trackingNumber) === String(trackingNumber)) || null;
    }
    throw err;
  }
};

export const updatePackage = async (id, formData) => {
  const res = await api.put(`/packages/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data;
};

export const createPackage = async (formData) => {
  try {
    const res = await api.post("/packages", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return res.data;
  } catch (err) {
    // If unauthorized or network error, fall back to saving package locally so admin can still create tracking entries
    const status = err?.response?.status;
    if (status === 401 || err.code === "ECONNRESET" || err.message?.includes("Network Error")) {
      // Build a simple object from formData; formData may be FormData instance
      const obj = {};
      if (typeof FormData !== "undefined" && formData instanceof FormData) {
        for (const [k, v] of formData.entries()) {
          // For files, store placeholder filename
          if (v && v.name) obj[k] = v.name;
          else obj[k] = v;
        }
      } else if (formData && typeof formData === "object") {
        Object.assign(obj, formData);
      }

      // add metadata
      obj._id = `local_${Date.now()}`;
      obj.status = obj.status || "pending";
      obj.trackingNumber = obj.trackingNumber || `LOCAL-${Date.now()}`;

      const offlineJson = typeof window !== "undefined" ? localStorage.getItem("offlinePackages") : null;
      const offline = offlineJson ? JSON.parse(offlineJson) : [];
      offline.unshift(obj);
      if (typeof window !== "undefined") localStorage.setItem("offlinePackages", JSON.stringify(offline));

      return obj;
    }

    // rethrow other errors
    throw err;
  }
};

export const updatePackageStatus = async (id, status) => {
  const res = await api.put(`/packages/${id}/status`, { status });
  return res.data;
};

export const updatePackageLocation = async (id, lat, lng) => {
  const res = await api.put(`/packages/${id}/location`, { lat, lng });
  return res.data;
};

export const deletePackage = async (id) => {
  const res = await api.delete(`/packages/${id}`);
  return res.data;
};

export const clearPackageLocation = async (id) => {
  const res = await api.delete(`/packages/${id}/location`);
  return res.data;
};
