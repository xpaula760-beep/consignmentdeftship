import crypto from "node:crypto";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const baseFolder = process.env.CLOUDINARY_PACKAGE_FOLDER || "consignment/packages";

const buildSignature = (params) => {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(payload + apiSecret).digest("hex");
};

const ensureConfigured = () => {
  if (!cloudName || !apiKey || !apiSecret) {
    const error = new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment."
    );
    error.status = 500;
    throw error;
  }
};

const normalizeCloudinaryAsset = (result) => ({
  public_id: result.public_id,
  secure_url: result.secure_url,
  resource_type: result.resource_type,
  format: result.format,
  bytes: result.bytes,
  duration: result.duration,
  width: result.width,
  height: result.height,
  created_at: result.created_at,
  thumbnail_url:
    result.resource_type === "video" && result.public_id
      ? `https://res.cloudinary.com/${cloudName}/video/upload/so_0/${result.public_id}.jpg`
      : result.secure_url
});

export const normalizeMediaArray = (value, fallback = []) => {
  if (!value) {
    return Array.isArray(fallback) ? fallback : [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item) return null;
        if (typeof item === "string") {
          return {
            secure_url: item,
            resource_type: "image",
            thumbnail_url: item
          };
        }

        return {
          ...item,
          secure_url: item.secure_url || item.url || "",
          thumbnail_url: item.thumbnail_url || item.secure_url || item.url || ""
        };
      })
      .filter(Boolean)
      .filter((item) => item.secure_url);
  }

  return normalizeMediaArray(fallback, []);
};

const getResourceType = (file) => {
  if (file?.type?.startsWith("video/")) return "video";
  if (file?.type?.startsWith("image/")) return "image";
  return "raw";
};

export const uploadFileToCloudinary = async (file, folder) => {
  ensureConfigured();

  const resourceType = getResourceType(file);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = buildSignature({ folder, timestamp });
  const body = new FormData();
  const buffer = await file.arrayBuffer();

  body.append("file", new Blob([buffer], { type: file.type || "application/octet-stream" }), file.name);
  body.append("api_key", apiKey);
  body.append("timestamp", String(timestamp));
  body.append("folder", folder);
  body.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(payload?.error?.message || "Cloudinary upload failed.");
    error.status = response.status;
    throw error;
  }

  return normalizeCloudinaryAsset(payload);
};

export const uploadFilesToCloudinary = async (files = [], folder = baseFolder) => {
  if (!files.length) return [];
  return Promise.all(files.map((file) => uploadFileToCloudinary(file, folder)));
};

export const getPackageMediaFolder = (trackingNumber, section = "general") => {
  const safeTrackingNumber = (trackingNumber || "draft-package").replace(/[^a-zA-Z0-9-_]/g, "-");
  return `${baseFolder}/${safeTrackingNumber}/${section}`;
};
