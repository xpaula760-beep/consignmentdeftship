"use client";

import { useState, useRef } from "react";

export default function ViewPackageModal({ pkg, onClose }) {
  const images = (pkg?.items ?? []).flatMap((item) =>
    (item?.images || []).map((img) => ({
      url: img?.secure_url,
      name: item?.name,
      value: item?.value,
      description: item?.description,
    }))
  );

  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  const next = () => {
    if (!images.length) return;
    setIndex((i) => (i + 1) % images.length);
  };
  const prev = () => {
    if (!images.length) return;
    setIndex((i) => (i - 1 + images.length) % images.length);
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) next();
    if (diff < -50) prev();
    touchStartX.current = null;
  };

  if (!images.length) {
    return (
      <Modal onClose={onClose}>
        <div className="text-center text-zinc-500">No item images</div>
      </Modal>
    );
  }

  const current = images[index] || {};

  return (
    <Modal onClose={onClose}>
      <div
        className="relative"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Image */}
        <img
          src={current.url}
          alt={current.name}
          className="w-full h-64 md:h-96 object-contain bg-black rounded-lg"
        />

        {/* Desktop controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full items-center justify-center"
            >
              ‹
            </button>

            <button
              onClick={next}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full items-center justify-center"
            >
              ›
            </button>
          </>
        )}

        {/* Info */}
        <div className="mt-4 space-y-1">
          <div className="font-semibold">{current.name}</div>
          <div className="text-sm text-zinc-500">
            {pkg?.currency ?? ""} {current.value?.toLocaleString ? current.value.toLocaleString() : ""}
          </div>
          {current.description && (
            <div className="text-sm">{current.description}</div>
          )}
        </div>

        {/* Dots */}
        <div className="mt-3 flex justify-center gap-2">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${
                i === index ? "bg-black" : "bg-zinc-300"
              }`}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}
