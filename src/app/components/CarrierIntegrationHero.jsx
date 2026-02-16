import Image from "next/image";

export default function CarrierIntegrationHero() {
  return (
    <section className="bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          
          {/* Text */}
          <div className="order-1 md:order-1 text-center md:text-left">
            <span className="inline-block mb-3 text-sm font-semibold tracking-wide uppercase text-zinc-500">
              Save Time, Save Money
            </span>

            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
              Streamline Carrier Integration Effortlessly
              <br />
              <span className="text-zinc-700">
                No Code, No Hassle
              </span>
            </h1>

            <p className="mt-6 max-w-xl mx-auto text-center md:mx-0 md:text-left text-base md:text-lg text-zinc-600 leading-relaxed">
              Discover a simpler way to integrate your own carriers using our
              out-of-the-box solution. With zero coding required, DeftShip
              significantly reduces development time—so you can focus on what
              truly matters. Seamlessly manage everything from freight to parcel
              carriers with ease.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-center md:justify-start">
              <button className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition">
                Get Started
              </button>
              <button className="rounded-md border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition">
                Learn More
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="order-2 md:order-2 flex justify-center">
            <Image
              src="https://res.cloudinary.com/daiii0a2n/image/upload/v1770136773/saving-money.v0qznyua_1_lgsbke.svg"
              alt="Save time and money with carrier integrations"
              width={520}
              height={520}
              priority
              className="w-full max-w-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
