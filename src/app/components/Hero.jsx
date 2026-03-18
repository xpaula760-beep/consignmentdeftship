"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const Carousel = dynamic(() => import("./Carousel"), { ssr: false });

const PHRASES = [
  "E-commerce Orders",
  "International Shipments",
  "Cross-Border Deliveries",
  "Air Freight Logistics",
  "Global Parcel Shipping",
  "Express Courier Services",
  "Bulk Cargo Transport",
  "Warehouse Fulfillment",
  "Door-to-Door Delivery",
  "Import & Export Shipping",
  "Last-Mile Delivery",
  "B2B Logistics Solutions",
  "B2C Order Fulfillment",
  "High-Value Cargo",
  "Worldwide Distribution"
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PHRASES.length);
    }, 2500);

    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            
            {/* Image — First on mobile, second on desktop */}
            <div className="order-1 md:order-2 flex justify-center">
              <Image
                src="https://res.cloudinary.com/daiii0a2n/image/upload/v1770131667/deftship-discount.BokfWGeS_jhdnk5.svg"
                alt="DeftShip logistics illustration"
                width={520}
                height={520}
                priority
                className="w-full max-w-md h-auto"
              />
            </div>

            {/* Text Content */}
            <div className="order-2 md:order-1 text-left">
              <h1 className="text-[40px] leading-11 md:text-[60px] md:leading-16 font-bold tracking-tight text-[#252836]">
                Streamline your shipping with our all-in-one solution for{" "}
                <span className="block mt-2 text-[#443bb0] transition-all duration-500 ease-in-out">
                  {PHRASES[index]}
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-600 md:text-lg">
                A custom-built, cloud-based logistics solution designed to save
                customers time, effort, and money while building their businesses.
                Handle your shipping needs with ease using{" "}
                <span className="font-semibold text-zinc-900">DeftShip</span>.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-start">
                <button className="rounded-md bg-[#443bb0] px-8 py-4 text-white text-sm font-semibold hover:bg-[#362f8e] transition-colors shadow-sm">
                  Get Started
                </button>

                <Link
                  href="/track"
                  className="rounded-md border border-zinc-300 px-8 py-4 text-center text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  Track a Package
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Carousel />

      {/* Services/Rates Section */}
      <section className="bg-zinc-50/50 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="flex justify-center md:justify-start">
              <Image
                src="https://res.cloudinary.com/daiii0a2n/image/upload/v1770133586/deftship-services.opaVszvk_1_ismyg1.svg"
                alt="DeftShip services"
                width={420}
                height={420}
                className="w-full max-w-sm h-auto"
              />
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#252836] leading-tight">
                Get the Absolute Best Rates on Shipping
              </h2>

              <p className="mt-6 text-base leading-relaxed text-zinc-600 md:text-lg">
                No matter what you need to ship, we guarantee the best rates tailored to your specific requirements! 
                Easily compare parcel shipping quotes from industry leaders such as 
                <span className="font-medium text-zinc-900"> UPS, DHL Express, and USPS</span>. 
                Take advantage of our discounted shipping rates available across a diverse selection of courier services.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}