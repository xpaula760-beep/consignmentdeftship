import Image from "next/image";

export default function PrimeFreight() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Use flex-col on mobile and flex-row on md+; image first so text never appears above image */}
        <div className="flex flex-col md:flex-row items-center gap-8 max-w-4xl mx-auto">
          {/* Image on the LEFT (DOM first) */}
          <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-start">
            <Image
              src="https://res.cloudinary.com/daiii0a2n/image/upload/v1770138263/real-time-freight-quotes.BQTG3WNM_1_lsv1p4.svg"
              alt="Real-time freight quotes"
              width={420}
              height={160}
              className="w-full max-w-xs mx-auto h-auto"
            />
          </div>

          {/* Text on the RIGHT */}
          <div className="text-center md:text-left">
            <h3 className="tracking-tight text-2xl md:text-3xl font-extrabold">
              Real-Time Freight Quotes!
            </h3>

            <p className="mt-3 text-base text-zinc-600 leading-relaxed">
              Ensure timely and cost-effective freight transportation with our comprehensive range of services tailored to meet the specific requirements of your business. Our portfolio includes truckload (FTL), less-than-truckload (LTL) and specialty freight solutions, guaranteeing that your cargo reaches its destination on time and within budget. Benefit from our extensive network of over 100 top-tier LTL carriers, ensuring you consistently receive competitive rates for your freight.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
