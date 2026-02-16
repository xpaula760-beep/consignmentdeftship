"use client";
import { useState, useEffect } from "react";

export default function ShippingStats() {
  const [stats, setStats] = useState({
    savingsPercent: 89,
    merchants: 3328,
    totalSavings: 18509633,
  });

  useEffect(() => {
    setStats({
      savingsPercent: 89 + (Math.floor(Math.random() * 3) - 1),
      merchants: 3328 + Math.floor(Math.random() * 50),
      totalSavings: 18509633 + Math.floor(Math.random() * 5000),
    });
  }, []);

  const statCards = [
    {
      label: "Potential Savings on Shipment",
      value: `${stats.savingsPercent}%`,
      color: "text-blue-600",
    },
    {
      label: "Number of Merchants",
      value: stats.merchants.toLocaleString(),
      color: "text-green-600",
    },
    {
      label: "Potential Savings on Shipments",
      value: `$${stats.totalSavings.toLocaleString()}`,
      color: "text-indigo-600",
    },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Our multi-carrier shipping software is well-equipped to support you as your needs grow.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition-transform hover:scale-105"
            >
              <span className={`text-4xl font-extrabold mb-2 ${stat.color}`}>
                {stat.value}
              </span>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
