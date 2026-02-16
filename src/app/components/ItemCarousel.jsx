"use client";

import { useRef, useState } from "react";

export default function ItemCarousel({ items = [], currency = "USD" }) {
  const [index, setIndex] = useState(0);
  const startX = useRef(null);

  if (!items.length) {
    return <div className="text-sm text-zinc-500">No items</div>;
  }

  const clamp = (i) => (i + items.length) % items.length;
  const go = (dir) => setIndex((i) => clamp(i + dir));

  const onStart = (e) => {
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const onEnd = (e) => {
    if (startX.current == null) return;
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diff = endX - startX.current;
    if (Math.abs(diff) > 50) diff < 0 ? go(1) : go(-1);
    startX.current = null;
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* IMAGE AREA */}
      <div
        className="relative h-105 rounded-xl overflow-hidden bg-black"
        onTouchStart={onStart}
        onTouchEnd={onEnd}
        onMouseDown={onStart}
        onMouseUp={onEnd}
      >
        {/* BLURRED BACKGROUND */}
        <div
          className="absolute inset-0 bg-center bg-cover scale-110 blur-2xl opacity-60 transition-all duration-500"
          style={{
            backgroundImage: `url(${items[index]?.images?.[0]?.secure_url || ""})`
          }}
        />

        {/* SLIDER */}
        <div
          className="relative h-full flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${index * 100}%)`
          }}
        >
          {items.map((it, i) => {
            const img = it.images?.[0]?.secure_url;
            return (
              <div
                key={i}
                className="min-w-full h-full flex items-center justify-center"
              >
                {img ? (
                  <img
                    src={img}
                    alt={it.name}
                    className="h-[85%] object-contain drop-shadow-xl"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://via.placeholder.com/400x600?text=No+Image")
                    }
                  />
                ) : (
                  <div className="text-white/70">No image</div>
                )}
              </div>
            );
          })}
        </div>

        {/* SWIPE ARROWS */}
        <button
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-sm uppercase tracking-wider opacity-80 hover:opacity-100"
        >
          ← Swipe
        </button>

        <button
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-sm uppercase tracking-wider opacity-80 hover:opacity-100"
        >
          Swipe →
        </button>
      </div>

      {/* INFO */}
      <div className="mt-4 text-center space-y-1">
        <div className="font-semibold text-lg">
          {items[index]?.name || "Item"}
        </div>

        {items[index]?.description && (
          <div className="text-sm text-zinc-600">
            {items[index].description}
          </div>
        )}

        <div className="mt-2 text-sm font-medium">
          {currency} {items[index]?.value?.toLocaleString() || "—"}
        </div>
      </div>

      {/* DOTS */}
      <div className="mt-4 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2.5 h-2.5 rounded-full transition ${
              i === index ? "bg-black" : "bg-zinc-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
