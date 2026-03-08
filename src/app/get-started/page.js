"use client";

import Link from "next/link";

export default function GetStarted() {
  const steps = [
    {
      number: "1",
      title: "Visit the Tracking Page",
      description:
        "Go to our tracking page to begin tracking your shipment in real time.",
    },
    {
      number: "2",
      title: "Enter Your Tracking Number",
      description:
        "Input the tracking number provided to you when your package was shipped.",
    },
    {
      number: "3",
      title: "Contact Support if Needed",
      description:
        "If you need more information or encounter any issues, our support team is ready to assist you.",
    },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#443bb0]/10 via-white to-[#443bb0]/5 py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
          Track Your Package
        </h1>

        <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
          Follow these simple steps to easily track your shipment and stay
          updated on your delivery status.
        </p>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mt-14">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition"
            >
              {/* Step number */}
              <div className="w-12 h-12 rounded-full bg-[#443bb0] text-white flex items-center justify-center text-lg font-bold mx-auto mb-5">
                {step.number}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>

              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14">
          <Link
            href="/track"
            className="inline-block bg-[#443bb0] hover:bg-[#3a319c] text-white font-semibold px-8 py-4 rounded-lg shadow-md transition"
          >
            Go to Tracking Page
          </Link>
        </div>

        {/* Footer Message */}
        <p className="mt-10 text-gray-600 text-sm">
          Thank you for trusting us with your package. We are committed to
          delivering your shipment safely and on time.
        </p>
      </div>
    </section>
  );
}