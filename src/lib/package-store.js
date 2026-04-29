import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const dataDirectory = path.join(process.cwd(), "data");
const packagesFile = path.join(dataDirectory, "packages.json");

let _useFileStore = true;

const ensureStore = async () => {
  if (!_useFileStore) return;
  try {
    await fs.mkdir(dataDirectory, { recursive: true });

    try {
      await fs.access(packagesFile);
    } catch {
      await fs.writeFile(packagesFile, "[]", "utf8");
    }
  } catch (err) {
    // If the runtime environment forbids filesystem writes (serverless),
    // avoid throwing and fall back to an in-memory behaviour.
    console.warn("package-store: filesystem unavailable, falling back to memory store", err?.message || err);
    _useFileStore = false;
  }
};

export const readPackages = async () => {
  if (!_useFileStore) return [];
  try {
    await ensureStore();
    const raw = await fs.readFile(packagesFile, "utf8");

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  } catch (err) {
    console.warn("package-store: failed to read packages, falling back to empty list", err?.message || err);
    _useFileStore = false;
    return [];
  }
};

export const writePackages = async (packages) => {
  if (!_useFileStore) {
    console.warn("package-store: write skipped — filesystem unavailable");
    return;
  }
  try {
    await ensureStore();
    await fs.writeFile(packagesFile, JSON.stringify(packages, null, 2), "utf8");
  } catch (err) {
    console.warn("package-store: failed to write packages — disabling file store", err?.message || err);
    _useFileStore = false;
  }
};

export const sortPackages = (packages) =>
  [...packages].sort((a, b) => {
    const left = new Date(b.updatedAt || b.createdAt || 0).getTime();
    const right = new Date(a.updatedAt || a.createdAt || 0).getTime();
    return left - right;
  });

export const createPackageId = () => crypto.randomUUID();

export const createTrackingNumber = () => {
  const stamp = Date.now().toString(36).toUpperCase();
  const token = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `PKG-${stamp}-${token}`;
};
