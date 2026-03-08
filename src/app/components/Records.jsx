"use client";

import Image from "next/image";

export default function Records() {
  const stats = [
    { value: "89%", label: "Potential Savings on Shipments" },
    { value: "3,382", label: "Number of Merchants" },
    { value: "7,041,310", label: "Potential Savings on Shipments" },
  ];

  // images[0] = phone, images[1] & images[2] = QR/barcode images
  const images = [
    "https://res.cloudinary.com/dilkjlgrj/image/upload/v1770934943/iphone-shipment-view.BebAoHHq_xvd5rp.svg",
    "https://res.cloudinary.com/dilkjlgrj/image/upload/v1770934914/deftship-freight-qr.Bp_hhBw2_wxfi7t.svg",
    "https://res.cloudinary.com/dilkjlgrj/image/upload/v1770934903/deftship-freight-qr.Bp_hhBw2_rn2aso.svg",
  ];

  return (
    // Section background updated to #2F3142 with subtle gradient; force white text inside
    <section className="bg-[#2F3142] bg-linear-to-br from-[#2F3142] via-[#2F3142] to-[#394060]">
      <div className="mx-auto max-w-7xl px-4 py-10 text-white">
        <div className="mb-4">
          {/* Heading: larger, bolder for premium SaaS look */}
          <h3 className="tracking-tight text-3xl md:text-4xl font-extrabold text-white">
            OUR RECORDS
          </h3>

          {/* thin accent line under heading */}
          <div className="w-16 h-1 bg-blue-400 mt-2 rounded-full" />

          {/* Subheading: slightly larger and relaxed leading */}
          <p className="mt-2 text-white/90 max-w-2xl text-lg leading-relaxed">
            We continuously monitor global delivery performance and reliability to ensure your shipments arrive on time.
          </p>
        </div>

        {/* Stats cards */}
        <div className="flex justify-center mt-6">
          <div className="border-2 border-[#0B2A6F] rounded-md p-4">
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white text-black rounded-md p-4 border border-zinc-100 flex flex-col justify-center min-w-45"
                >
                  <h4 className="text-3xl md:text-4xl font-extrabold text-black leading-tight">
                    {stat.value}
                  </h4>
                  <p className="text-sm font-semibold text-black/70 mt-2">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*
          Below the stats: image group aligned to the right; App Store badges sit under the image
        */}
        <div className="mt-6 flex items-end justify-between gap-6 w-full">
          {/* LEFT: QR group + badges */}
          <div className="flex flex-col items-start gap-3 self-end">
            <div className="flex items-center gap-4">
              <div className="w-28 bg-white/5 rounded-xl p-2 border border-white/10 flex items-center justify-center drop-shadow-xl hover:scale-[1.02] transition-all duration-300">
                <Image src={images[1]} alt="qr-1" width={112} height={112} className="w-28 h-auto" />
              </div>

              <div className="w-28 bg-white/5 rounded-xl p-2 border border-white/10 flex items-center justify-center drop-shadow-xl hover:scale-[1.02] transition-all duration-300">
                <Image src={images[2]} alt="qr-2" width={112} height={112} className="w-28 h-auto" />
              </div>
            </div>

            {/* App store badges under the QR codes */}
            <div className="flex items-center gap-3">
              <a href="#" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 transition text-white">
                {/* Apple SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M16.365 1.43c0 1.02-.38 2.01-1.07 2.73-.74.78-1.85 1.36-2.85 1.36-.09-1.02.37-2.15 1.07-2.86.71-.72 1.84-1.23 2.88-1.23.02 0 .02 0 .02 0zM20.47 7.28c-.07.06-1.5 1.12-1.5 2.87 0 1.85 1.2 3.04 1.22 3.06-.02.07-.24.45-.78.89-.8.65-1.64.99-2.01 1.09-.44.13-1.12.28-1.95.28-.84 0-1.51-.15-1.99-.28-.44-.12-1.24-.44-2.07-1.09-1.2-.96-2.05-2.62-2.05-4.62 0-2.25 1.17-3.66 2.17-4.64.95-.93 2.22-1.46 3.53-1.46.79 0 1.58.18 2.28.54.51.27 1.09.66 1.82 1.23.28.2.52.37.74.54.1.07.18.12.24.16.02.01.04.03.05.04.02.01.03.02.04.03z" />
                </svg>
                <span className="text-sm text-white">App Store</span>
              </a>

              <a href="#" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 transition text-white">
                {/* Play Store SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M3.6 1.5C3.2 1.7 3 2.2 3 2.7v18.6c0 .5.2 1 .6 1.2.4.2.9.1 1.2-.1l14.1-9L4.8 1.6c-.3-.2-.8-.2-1.2-.1zM6.3 4.2l9.2 6.1-9.2 6.1V4.2z" />
                </svg>
                <span className="text-sm text-white">Google Play</span>
              </a>
            </div>
          </div>

          {/* RIGHT: phone image */}
          <div className="w-56">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 drop-shadow-xl hover:scale-[1.02] transition-all duration-300">
              <Image src={images[0]} alt="phone" width={224} height={448} className="w-56 h-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
