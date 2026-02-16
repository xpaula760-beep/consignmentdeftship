import Image from "next/image";

export default function ReliableShipping() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      {/*
        Ensure image is LEFT and text is RIGHT. Put image first in DOM so on mobile the image appears above text
        (text will not appear above image). Use flex with column on mobile and row on md+.
      */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Image on the LEFT (DOM first) - keep original sizing but responsive */}
        <div className="shrink-0 w-full md:w-auto">
          <div className="w-full max-w-[150%]">
            <Image
              src="https://res.cloudinary.com/dilkjlgrj/image/upload/v1770940531/multi-carrier-support.CVCnajyR_hcxazj.svg"
              alt="Multi Carrier Support"
              width={520}
              height={360}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Text on the RIGHT (aligned left for readability) */}
        <div className="flex-1 text-left pl-0 md:pl-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900">Reliable Shipping Solutions</h2>
          <p className="mt-3 text-base text-zinc-700">
            At Your Company Name, we believe that nothing is a barrier when it comes to delivering your shipments. Our
            commitment to reliability ensures that your business can thrive, no matter where you are in the world.
          </p>
        </div>
      </div>
    </section>
  );
}
