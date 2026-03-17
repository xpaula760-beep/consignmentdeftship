import {
  getPackageMediaFolder,
  normalizeMediaArray,
  uploadFilesToCloudinary
} from "@/lib/cloudinary";

const parseJson = (value, fallback) => {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const parseNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const parseBoolean = (value, fallback = false) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return String(value) === "true";
};

const getFiles = (formData, key) =>
  formData
    .getAll(key)
    .filter(Boolean)
    .filter((file) => typeof file === "object" && typeof file.arrayBuffer === "function" && file.size > 0);

const ensureValidPackage = ({ itemName, description, receiverPhone, deliveryTime }) => {
  if (!itemName || itemName.length < 2) {
    const error = new Error("Item name is required.");
    error.status = 400;
    throw error;
  }

  if (!description || description.length < 10) {
    const error = new Error("Description is required and must be at least 10 characters.");
    error.status = 400;
    throw error;
  }

  if (!receiverPhone || receiverPhone.length < 7) {
    const error = new Error("Receiver phone is required.");
    error.status = 400;
    throw error;
  }

  if (!deliveryTime) {
    const error = new Error("Delivery time is required.");
    error.status = 400;
    throw error;
  }
};

export const buildPackagePayload = async (formData, existingPackage = null) => {
  const trackingNumber =
    String(formData.get("trackingNumber") || existingPackage?.trackingNumber || "draft-package").trim() ||
    "draft-package";
  const itemsPayload = parseJson(formData.get("items"), existingPackage?.items || []);
  const existingImages = normalizeMediaArray(
    parseJson(formData.get("existingImages"), null),
    existingPackage?.images || []
  );
  const existingVideos = normalizeMediaArray(
    parseJson(formData.get("existingVideos"), null),
    existingPackage?.videos || []
  );
  const existingItemImages = parseJson(formData.get("existingItemImages"), {});

  const packageImageUploads = await uploadFilesToCloudinary(
    getFiles(formData, "images"),
    getPackageMediaFolder(trackingNumber, "images")
  );
  const packageVideoUploads = await uploadFilesToCloudinary(
    getFiles(formData, "videos"),
    getPackageMediaFolder(trackingNumber, "videos")
  );

  const items = await Promise.all(
    (Array.isArray(itemsPayload) ? itemsPayload : []).map(async (item, index) => {
      const uploadedImages = await uploadFilesToCloudinary(
        getFiles(formData, `itemImage-${index}`),
        getPackageMediaFolder(trackingNumber, `items/item-${index + 1}`)
      );

      return {
        name: item?.name?.trim?.() || "",
        description: item?.description?.trim?.() || "",
        value: parseNumber(item?.value ?? item?.valueUSD, 0),
        images: [
          ...normalizeMediaArray(existingItemImages?.[index], existingPackage?.items?.[index]?.images || []),
          ...uploadedImages
        ]
      };
    })
  );

  const itemValueTotal = items.reduce((sum, item) => sum + parseNumber(item.value, 0), 0);
  const baseValue = parseNumber(formData.get("baseValue"), existingPackage?.baseValue ?? 0);
  const totalValue = baseValue > 0 ? baseValue : itemValueTotal;

  const payload = {
    itemName: String(formData.get("itemName") || existingPackage?.itemName || "").trim(),
    description: String(formData.get("description") || existingPackage?.description || "").trim(),
    receiverPhone: String(formData.get("receiverPhone") || existingPackage?.receiverPhone || "").trim(),
    deliveryTime: String(formData.get("deliveryTime") || existingPackage?.deliveryTime || ""),
    estimatedDeliveryTime: String(
      formData.get("estimatedDeliveryTime") || existingPackage?.estimatedDeliveryTime || ""
    ),
    status: String(formData.get("status") || existingPackage?.status || "pending"),
    paused: parseBoolean(formData.get("paused"), existingPackage?.paused || false),
    origin: {
      address: String(formData.get("originAddress") || existingPackage?.origin?.address || "").trim(),
      lat: parseNumber(formData.get("originLat"), existingPackage?.origin?.lat ?? 0),
      lng: parseNumber(formData.get("originLng"), existingPackage?.origin?.lng ?? 0)
    },
    destination: {
      address: String(
        formData.get("destinationAddress") || existingPackage?.destination?.address || ""
      ).trim(),
      lat: parseNumber(formData.get("destinationLat"), existingPackage?.destination?.lat ?? 0),
      lng: parseNumber(formData.get("destinationLng"), existingPackage?.destination?.lng ?? 0)
    },
    currentLocation: {
      lat: parseNumber(formData.get("currentLat"), existingPackage?.currentLocation?.lat ?? 0),
      lng: parseNumber(formData.get("currentLng"), existingPackage?.currentLocation?.lng ?? 0)
    },
    distanceKm: parseNumber(formData.get("distanceKm"), existingPackage?.distanceKm ?? 0),
    baseValue,
    totalValue,
    shippingCost: parseNumber(formData.get("shippingCost"), existingPackage?.shippingCost ?? 0),
    currency: String(formData.get("currency") || existingPackage?.currency || "USD").trim() || "USD",
    items,
    images: [...existingImages, ...packageImageUploads],
    videos: [...existingVideos, ...packageVideoUploads]
  };

  ensureValidPackage(payload);

  return payload;
};
