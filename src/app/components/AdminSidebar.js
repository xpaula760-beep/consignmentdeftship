"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminSidebar({ open = false, onClose = () => {} }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch((process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "") : "") + "/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (e) {
      // ignore network errors
    }
    // navigate to login page
    router.push('/admin/login');
  };

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:block w-64 border-r bg-white p-4">
        <div className="mb-6 text-lg font-semibold">Admin</div>
        <nav className="flex flex-col gap-2">
          <Link className="rounded px-2 py-1 hover:bg-zinc-100" href="/admin/dashboard">Dashboard</Link>
          <Link className="rounded px-2 py-1 hover:bg-zinc-100" href="/admin/packages">Packages</Link>
          <Link className="rounded px-2 py-1 hover:bg-zinc-100" href="/admin/admins">Admins</Link>
          <button onClick={handleLogout} className="mt-3 text-left rounded px-2 py-1 hover:bg-zinc-100">Logout</button>
        </nav>
      </aside>

      {/* Mobile off-canvas sidebar (render only when open to avoid focus/aria-hidden issues) */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={onClose} />

          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white p-4 transform transition-transform translate-x-0">
            <div className="mb-6 flex items-center justify-between">
              <div className="text-lg font-semibold">Admin</div>
              <button onClick={onClose} className="text-zinc-600">✕</button>
            </div>

            <nav className="flex flex-col gap-2">
              <Link onClick={onClose} className="rounded px-2 py-1 hover:bg-zinc-100" href="/admin/dashboard">Dashboard</Link>
              <Link onClick={onClose} className="rounded px-2 py-1 hover:bg-zinc-100" href="/admin/packages">Packages</Link>
              <Link onClick={onClose} className="rounded px-2 py-1 hover:bg-zinc-100" href="/admin/admins">Admins</Link>
              <button onClick={() => { onClose(); handleLogout(); }} className="mt-3 text-left rounded px-2 py-1 hover:bg-zinc-100">Logout</button>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
