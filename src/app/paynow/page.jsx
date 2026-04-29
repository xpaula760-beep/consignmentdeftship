"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { fetchPackageByTrackingNumber, submitPayment } from "@/app/services/package.api";

const WALLET = "bc1qhu8wce98tpgn58ah9hn0lwd5plzpk9xl57kgf7";

export default function PaymentPage() {
  const [step, setStep] = useState("form"); // slides: form -> details -> payment
  const [tracking, setTracking] = useState("");
  const [packageData, setPackageData] = useState(null);
  const [txHash, setTxHash] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [searching, setSearching] = useState(false);

  // Timer Logic
  useEffect(() => {
    if (!tracking) return;
    const saved = localStorage.getItem(`paynow_timer_${tracking}`);
    if (saved) setTimeLeft(parseInt(saved, 10));
  }, [tracking]);

  // Ensure a wallet timer is started when user reaches payment slide
  useEffect(() => {
    if (step !== "payment" || !tracking) return;
    const saved = localStorage.getItem(`paynow_timer_${tracking}`);
    if (!saved) {
      const newTimer = 24 * 60 * 60 * 1000;
      localStorage.setItem(`paynow_timer_${tracking}`, String(newTimer));
      localStorage.setItem(`paynow_expiry_${tracking}`, String(Date.now() + newTimer));
      setTimeLeft(newTimer);
      return;
    }
    setTimeLeft(parseInt(saved, 10));
  }, [step, tracking]);

  useEffect(() => {
    if (!timeLeft) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (!prev || prev <= 0) return null;
        const updated = prev - 1000;
        localStorage.setItem(`paynow_timer_${tracking}`, String(updated));
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, tracking]);

  // Utility Formatters
  const formatTime = (ms) => {
    if (!ms || ms <= 0) return "Expired";
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms / (1000 * 60)) % 60);
    const s = Math.floor((ms / 1000) % 60);
    return `${h}h ${m}m ${s}s`;
  };

  const formatCurrency = (value) => {
    if (value == null || value === "") return "—";
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
  };

  // Navigation Logic
  // Preview image derived from first item or package images
  const previewImg = (() => {
    if (!packageData) return null;
    const firstItem = Array.isArray(packageData.items) && packageData.items.length > 0 ? packageData.items[0] : null;
    if (firstItem) {
      if (typeof firstItem === "string") return null;
      const maybe = firstItem.image || (firstItem.images && firstItem.images[0]) || null;
      if (!maybe) return null;
      if (typeof maybe === 'string') return maybe;
      return maybe.secure_url || maybe.url || maybe.thumbnail_url || null;
    }
    const pkgMaybe = packageData.image || (packageData.images && packageData.images[0]) || null;
    if (!pkgMaybe) return null;
    if (typeof pkgMaybe === 'string') return pkgMaybe;
    return pkgMaybe.secure_url || pkgMaybe.url || pkgMaybe.thumbnail_url || null;
  })();

  const normalizeImgSrc = (maybe) => {
    if (!maybe) return null;
    if (typeof maybe === 'string') return maybe;
    return maybe.secure_url || maybe.url || maybe.thumbnail_url || null;
  };

  const handleSearch = async () => {
    if (!tracking.trim()) return alert("Please enter a tracking number.");
    setSearching(true);
    try {
      const data = await fetchPackageByTrackingNumber(tracking.trim());
      if (!data) return alert("Package not found.");
      setPackageData(data);
      setStep("details");
    } catch (err) {
      alert("Error retrieving package. Check your connection.");
    } finally {
      setSearching(false);
    }
  };

  const handlePrev = () => {
    if (step === "payment") setStep("details");
    else if (step === "details") setStep("form");
  };

  const handleNext = () => {
    if (step === "form" && packageData) setStep("details");
    else if (step === "details") setStep("payment");
  };

  // Tawk.to Logic
  const openChat = () => {
    if (typeof window === "undefined") return;
    if (!window.Tawk_API) {
      const s1 = document.createElement("script");
      s1.async = true;
      s1.src = 'https://embed.tawk.to/69e038da3937ef1c2e296e1e/1jm9ts67n';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      document.head.appendChild(s1);
      setTimeout(() => window.Tawk_API?.maximize?.(), 1000);
    } else {
      window.Tawk_API.maximize?.();
    }
  };

  const copyToClipboard = async (text, setCopied) => {
    try {
      await navigator.clipboard.writeText(String(text || ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("copy failed", err);
    }
  };

  const handleSubmitHash = async () => {
    if (!txHash) return alert("Enter transaction hash");
    if (!packageData?._id) return alert("Package missing");
    setSubmitting(true);
    try {
      await submitPayment(packageData._id, { txHash, address: WALLET });
      alert("Payment submitted for verification.");
      setStep("details");
    } catch (err) {
      alert("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-stone-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-3 tracking-tight">Payment Gateway</h1>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-md mx-auto">
            Retrieve your package details and complete the shipping fee payment via our secure Bitcoin portal.
          </p>
        </div>

        {/* Multi-step Navigation Icons */}
        {tracking && (
          <div className="flex justify-between items-center mb-6 px-2">
            <button
              onClick={handlePrev}
              disabled={step === "form"}
              className={`p-2 rounded-full transition-all ${step === "form" ? "text-zinc-300 cursor-not-allowed" : "bg-white shadow-sm border border-zinc-200 text-black hover:bg-zinc-100"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex gap-2">
              <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 'form' ? 'bg-black' : 'bg-zinc-200'}`} />
              <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 'details' ? 'bg-black' : 'bg-zinc-200'}`} />
              <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 'payment' ? 'bg-black' : 'bg-zinc-200'}`} />
            </div>

            <button
              onClick={handleNext}
              disabled={step === "payment" || (step === "form" && !packageData)}
              className={`p-2 rounded-full transition-all ${(step === "payment" || (step === "form" && !packageData)) ? "text-zinc-300 cursor-not-allowed" : "bg-white shadow-sm border border-zinc-200 text-black hover:bg-zinc-100"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Slide 1: Search Form */}
        {step === "form" && (
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Shipment Tracking</label>
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="e.g. DFT-12345678"
              className="w-full p-4 rounded-xl bg-zinc-50 border border-zinc-200 mb-6 text-lg font-mono focus:ring-2 focus:ring-black outline-none transition-all"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className={`w-full bg-black text-white font-bold py-4 rounded-xl transition-transform active:scale-[0.98] ${searching ? 'opacity-60 cursor-not-allowed' : 'hover:bg-zinc-800'}`}
            >
              {searching ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Retrieving...
                </span>
              ) : (
                'Retrieve Package Info'
              )}
            </button>
          </div>
        )}

        {/* Slide 2: Package Details */}
        {step === "details" && packageData && (
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-start gap-4">
                {previewImg ? (
                  <img
                    src={previewImg}
                    alt={packageData.itemName || 'Item preview'}
                    className="w-40 md:w-48 h-auto rounded-md object-cover"
                    onError={(e) => {
                      console.warn('preview image failed to load', e?.currentTarget?.src);
                      e.currentTarget.src = 'https://via.placeholder.com/320x240?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-40 h-28 bg-zinc-100 rounded-md flex items-center justify-center text-xs text-zinc-400">No Image</div>
                )}

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Tracking</p>
                  <p className="text-sm font-mono mb-2">{packageData.trackingNumber || packageData.tracking || packageData.trackingNo || packageData._id || '—'}</p>

                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Package Description</p>
                  <p className="text-xl font-semibold">{packageData.itemName || "General Shipment"}</p>
                </div>
              </div>

              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Pending</span>
            </div>

            {/* Items list + images (if provided) */}
            {packageData.items && packageData.items.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold uppercase text-zinc-400 mb-2">Items in Package</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {packageData.items.map((it, idx) => {
                    const name = typeof it === 'string' ? it : (it.name || it.title || 'Item');
                    const price = typeof it === 'string' ? null : (it.value ?? it.price ?? null);
                    const img = typeof it === 'string' ? null : (it.image || (it.images && it.images[0]) || null);
                    return (
                      <div key={idx} className="flex items-center gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                        {img ? (
                          <img
                            src={normalizeImgSrc(img)}
                            alt={name}
                            className="w-24 h-auto object-cover rounded-md"
                            onError={(e) => {
                              console.warn('item image failed to load', e?.currentTarget?.src);
                              e.currentTarget.src = 'https://via.placeholder.com/240x180?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-24 h-16 bg-zinc-200 rounded-md flex items-center justify-center text-xs text-zinc-500">No Image</div>
                        )}
                        <div>
                          <div className="text-sm font-semibold">{name}</div>
                          {price != null && (
                            <div className="text-xs text-zinc-500">{formatCurrency(price)}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-zinc-50 p-6 rounded-2xl mb-8 border border-zinc-100">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Required Shipping Fee</p>
              <p className="text-4xl font-black text-lime-300">{formatCurrency(packageData.shippingCost ?? packageData.fee ?? packageData.amount)}</p>
            </div>

            <button onClick={() => setStep("payment")} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-zinc-800 transition shadow-lg shadow-zinc-200">
              Proceed to Secure Payment
            </button>
          </div>
        )}

        {/* Slide 3: Payment/Wallet */}
        {step === "payment" && (
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <div className="bg-white p-4 rounded-2xl inline-block border border-zinc-100 shadow-sm mb-4">
                <QRCode value={`bitcoin:${WALLET}`} size={180} />
              </div>
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest">Scan to Pay with Bitcoin</p>

              {/* Amount to pay with copy button */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="bg-zinc-50 p-3 rounded-xl text-center">
                  <p className="text-xs text-zinc-400 uppercase">Amount</p>
                  <p className="text-lg font-bold">{formatCurrency(packageData?.shippingCost ?? packageData?.fee ?? packageData?.amount)}</p>
                </div>
                <button onClick={() => copyToClipboard(packageData?.shippingCost ?? packageData?.fee ?? packageData?.amount, setCopiedAmount)} className="p-2 bg-white rounded-full shadow-sm border border-zinc-100 hover:bg-zinc-50">
                  {copiedAmount ? (
                    <span className="text-sm font-semibold">Copied</span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 2a2 2 0 00-2 2v1H5a2 2 0 00-2 2v7a2 2 0 002 2h7a2 2 0 002-2v-1h1a2 2 0 002-2V8a2 2 0 00-2-2h-1V5a2 2 0 00-2-2H8z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Official Deposit Address</p>
                <div className="flex items-start gap-2">
                  <p className="flex-1 bg-zinc-50 p-4 rounded-xl text-xs font-mono break-all border border-zinc-100 text-zinc-600 select-all">{WALLET}</p>
                  <button onClick={() => copyToClipboard(WALLET, setCopiedAddress)} className="p-2 bg-white rounded-full shadow-sm border border-zinc-100 hover:bg-zinc-50">
                    {copiedAddress ? (
                      <span className="text-sm font-semibold">Copied</span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 2a2 2 0 00-2 2v1H5a2 2 0 00-2 2v7a2 2 0 002 2h7a2 2 0 002-2v-1h1a2 2 0 002-2V8a2 2 0 00-2-2h-1V5a2 2 0 00-2-2H8z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-red-50 p-3 rounded-xl border border-red-100">
                <span className="text-red-600 text-xs font-bold uppercase">Wallet Session:</span>
                <span className="text-red-600 font-mono text-sm font-bold">{timeLeft ? formatTime(timeLeft) : "..."}</span>
              </div>

              <div className="pt-2">
                <input
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Paste Transaction Hash (TxID)"
                  className="w-full p-4 rounded-xl bg-zinc-50 border border-zinc-200 mb-4 focus:ring-2 focus:ring-black outline-none transition-all"
                />
                <button onClick={handleSubmitHash} disabled={submitting} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-all">
                  {submitting ? "Verifying Transaction..." : "I Have Completed Payment"}
                </button>
              </div>
            </div>

            <div className="text-center text-xs text-zinc-400 pt-4 leading-relaxed">
              Having trouble finding your transaction hash? <br />
              <button onClick={openChat} className="text-black font-bold underline hover:text-zinc-600 transition-colors mt-1">
                Chat with a live agent for assistance
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
