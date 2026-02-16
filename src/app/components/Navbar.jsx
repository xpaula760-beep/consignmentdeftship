import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-zinc-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-zinc-900">
          DeftShip
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-700">
          <Link href="/track" className="hover:text-zinc-900">Track</Link>
          <Link href="/pricing" className="hover:text-zinc-900">Pricing</Link>
          <Link href="/admin" className="hover:text-zinc-900">Admin</Link>
        </div>

        <div className="md:hidden">
          <Link href="/track" className="text-sm text-zinc-700">Track</Link>
        </div>
      </div>
    </nav>
  );
}
