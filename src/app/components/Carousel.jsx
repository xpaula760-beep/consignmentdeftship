"use client";

const LOGOS = [
  "ups", "fedex", "dhl", "usps", "dpd", "ebay", "etsy", 
  "shopify", "woocommerce", "bigcommerce", "rakuten", 
  "taobao", "stripe", "paypal", "square", "visa", "mastercard"
];

// Double the logos for a seamless loop
const rowItems = [...LOGOS, ...LOGOS];

export default function ManageShipmentsSection() {
  return (
    <section className="bg-[#252836] text-white py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <div className="text-center max-w-3xl mx-auto">
          <p className="uppercase tracking-[0.2em] text-[13px] font-semibold text-zinc-500">
            Manage Shipment
          </p>
          <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
            Manage All Your Shipments in One Place
          </h2>
          <p className="mt-6 text-zinc-400 text-lg leading-relaxed">
            Leverage our partnerships with more than 50 global carriers and leading e-commerce platforms. 
            Get started instantly with zero integration hassle.
          </p>
        </div>
      </div>

      {/* The Scrolling Container */}
      <div className="relative flex flex-col gap-10">
        
        {/* Gradient Overlays for "Fade" effect at edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-[#252836] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-[#252836] to-transparent z-10" />

        {/* Row 1 - Fast Left */}
        <div className="flex overflow-hidden group">
          <div className="flex gap-16 animate-marquee whitespace-nowrap">
            {rowItems.map((name, i) => (
              <Logo key={`row1-${name}-${i}`} name={name} />
            ))}
          </div>
        </div>

        {/* Row 2 - Faster Left (Offset) */}
        <div className="flex overflow-hidden group">
          <div className="flex gap-16 animate-marquee-fast whitespace-nowrap">
            {rowItems.slice(5).concat(rowItems.slice(0, 5)).map((name, i) => (
              <Logo key={`row2-${name}-${i}`} name={name} />
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }

        .animate-marquee-fast {
          animation: marquee 25s linear infinite;
        }

        /* Pause on hover for better UX */
        .group:hover .animate-marquee,
        .group:hover .animate-marquee-fast {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

function Logo({ name }) {
  return (
    <div className="flex items-center justify-center min-w-30 md:min-w-37.5 transition-all duration-300 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 cursor-pointer">
      <img
        src={`https://cdn.simpleicons.org/${name}/ffffff`}
        alt={name}
        className="h-8 md:h-10 w-auto object-contain"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}