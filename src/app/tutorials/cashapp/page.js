import { CheckCircle, ExternalLink, ShieldCheck, CreditCard, Send, Search } from 'lucide-react';

export const metadata = {
  title: 'Secure Payment Guide | Deftship Logistics',
  description: 'Official step-by-step instructions for settling shipping fees via Cash App Bitcoin.',
}

export default function CashAppTutorialPage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans antialiased">


      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-[#453BB1] text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck size={14} /> Secure Payment Portal
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Payment Guide: Cash App (BTC)
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Follow these verified steps to settle your logistics fees using Bitcoin. This method ensures faster customs clearance and immediate dispatch.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content: The Steps */}
          <section className="md:col-span-2 space-y-8">
            
            {/* Step 1 */}
            <div className="relative pl-12 pb-8 border-l-2 border-gray-200 last:border-0 last:pb-0">
              <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-[#453BB1] border-4 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-bold">1</div>
              <article className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="text-[#453BB1]" size={20} />
                  <h3 className="text-xl font-bold">Asset Acquisition</h3>
                </div>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  Open Cash App and navigate to the <strong>Bitcoin</strong> section. Enter the USD amount required to cover your shipment fees.
                </p>
                <a 
                  href="https://www.youtube.com/watch?v=ZWfJdmXl6KE" 
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#453BB1] text-white text-sm font-semibold hover:bg-[#362F8E] transition-colors"
                >
                  Watch Purchase Tutorial <ExternalLink size={14} />
                </a>
              </article>
            </div>

            {/* Step 2 */}
            <div className="relative pl-12 pb-8 border-l-2 border-gray-200 last:border-0 last:pb-0">
              <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-[#453BB1] border-4 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-bold">2</div>
              <article className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="text-[#453BB1]" size={20} />
                  <h3 className="text-xl font-bold">Destination Assignment</h3>
                </div>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  Navigate to <a href="/paynow" className="text-[#453BB1] font-medium underline underline-offset-4">deftship.site/paynow</a>. 
                  Generate your unique shipping wallet address. 
                </p>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
                  <div className="text-amber-600 font-bold text-lg">!</div>
                  <p className="text-xs text-amber-800 leading-normal">
                    <strong>CRITICAL:</strong> Ensure you select the <strong>Bitcoin Network</strong>. Sending funds via any other network (e.g., Lightning or ERC20) will result in permanent loss of assets.
                  </p>
                </div>
              </article>
            </div>

            {/* Step 3 */}
            <div className="relative pl-12 pb-8 border-l-2 border-gray-200 last:border-0 last:pb-0">
              <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-[#453BB1] border-4 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-bold">3</div>
              <article className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <Send className="text-[#453BB1]" size={20} />
                  <h3 className="text-xl font-bold">Execute Transfer</h3>
                </div>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  In Cash App, select <strong>Send Bitcoin</strong>. Paste the destination address and enter the exact BTC equivalent of your fee.
                </p>
                <a 
                  href="https://www.youtube.com/watch?v=YldIAkST7fw" 
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#453BB1] text-white text-sm font-semibold hover:bg-[#362F8E] transition-colors"
                >
                  Watch Transfer Tutorial <ExternalLink size={14} />
                </a>
              </article>
            </div>

            {/* Step 4 */}
            <div className="relative pl-12 last:border-0">
              <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-[#453BB1] border-4 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-bold">4</div>
              <article className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="text-[#453BB1]" size={20} />
                  <h3 className="text-xl font-bold">Verification</h3>
                </div>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  Once confirmed on the blockchain, copy the <strong>Transaction Hash (TxID)</strong> and submit it on the payment portal to finalize your shipment status.
                </p>
              </article>
            </div>
          </section>

          {/* Sidebar: Help & Info */}
          <aside className="space-y-6">
          

            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <h4 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-4">Fee Breakdown</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-slate-500">Service Fee</span>
                  <span className="font-medium">1% (Cash App)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500">Network Fee</span>
                  <span className="font-medium">Variable</span>
                </li>
              </ul>
              <p className="mt-4 text-[11px] text-slate-400 italic">
                *We recommend adding $5-10 to your purchase to cover minor network fluctuations.
              </p>
            </div>
          </aside>
        </div>
      </div>

    </main>
  );
}