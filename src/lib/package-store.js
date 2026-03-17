import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const dataDirectory = path.join(process.cwd(), "data");
const packagesFile = path.join(dataDirectory, "packages.json");

const ensureStore = async () => {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(packagesFile);
  } catch {
    await fs.writeFile(packagesFile, "[]", "utf8");
  }
};

export const readPackages = async () => {
  await ensureStore();
  const raw = await fs.readFile(packagesFile, "utf8");

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writePackages = async (packages) => {
  await ensureStore();
  await fs.writeFile(packagesFile, JSON.stringify(packages, null, 2), "utf8");
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
