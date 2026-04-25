export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-50/50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-2">
            <span className="text-xl font-bold tracking-tight text-zinc-900">
              Deft<span className="text-indigo-600">Ship</span>
            </span>
            <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-600">
              Global logistics simplified. Track, manage, and deliver with precision 
              across borders and time zones.
            </p>
          </div>

          {/* Column 1: Company */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Company</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600">
              <li><a href="/about" className="hover:text-indigo-600 transition-colors">About Us</a></li>
              <li><a href="/status" className="hover:text-indigo-600 transition-colors">System Status</a></li>
              <li><a href="/contact" className="hover:text-indigo-600 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Column 2: Support */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Support</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600">
              <li><a href="/help-desk" className="hover:text-indigo-600 transition-colors">Help Desk</a></li>
              <li><a href="/api-docs" className="hover:text-indigo-600 transition-colors">API Reference</a></li>
              <li><a href="/help" className="hover:text-indigo-600 transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600">
              <li><a href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</a></li>
              <li><a href="/terms" className="hover:text-indigo-600 transition-colors">Terms</a></li>
              
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-zinc-200 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm font-medium text-zinc-900">
                © {currentYear} DeftShip. All rights reserved.
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Shenzhen Yuanrui Information Technology Co., Ltd.
              </p>
            </div>
            
            {/* ICP License Tag */}
            <div className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-200">
              粤ICP备2023010424号-1
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}