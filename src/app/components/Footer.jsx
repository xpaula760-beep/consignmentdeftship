export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-zinc-600">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <div>© {new Date().getFullYear()} DeftShip. All rights reserved.</div>
            <div className="text-xs text-zinc-500 mt-1">粤ICP备2023010424号-1</div>
            <div className="text-xs text-zinc-500">Copyright: Shenzhen Yuanrui Information Technology Co., Ltd.</div>
          </div>

          <div className="flex flex-wrap gap-4">
            <a href="/about" className="hover:underline">About</a>
            <a href="/help-desk" className="hover:underline">Help Desk</a>
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <a href="/api-docs" className="hover:underline">API Docs</a>
            <a href="/help" className="hover:underline">Help</a>
            <a href="/contact" className="hover:underline">Contact Us</a>
            <a href="/status" className="hover:underline">Status</a>
            <a href="/legal" className="hover:underline">Legal</a>
            <a href="/terms" className="hover:underline">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
