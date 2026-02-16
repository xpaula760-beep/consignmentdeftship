// Backup of original homepage — created before replacing with Hero-only route
export default function HomeBackup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="space-y-6 text-center">
        <a href="/admin/login" className="inline-block px-8 py-4 bg-black text-white rounded-lg shadow hover:opacity-95">Admin Login</a>
        <a href="/track" className="inline-block px-8 py-4 border border-zinc-200 rounded-lg hover:bg-zinc-100">Track Package</a>
      </div>
    </div>
  );
}
