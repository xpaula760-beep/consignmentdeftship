"use client";

import { useEffect, useState } from "react";

export default function ChatWidget() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Tawk_API) {
      setLoaded(true);
      return;
    }

    // avoid adding twice
    if (document.getElementById("tawk-script")) {
      setLoaded(true);
      return;
    }

    const s = document.createElement("script");
    s.id = "tawk-script";
    s.async = true;
    s.src = "https://embed.tawk.to/69e038da3937ef1c2e296e1e/1jm9ts67n";
    s.charset = "UTF-8";
    s.setAttribute("crossorigin", "*");
    s.addEventListener("load", () => setLoaded(true));
    document.head.appendChild(s);

    return () => {
      // leave the script (so chat session persists), but cleanup listener
      s.removeEventListener && s.removeEventListener("load", () => setLoaded(true));
    };
  }, []);

  const openChat = () => {
    if (typeof window === "undefined") return;
    // Tawk API may not be ready immediately after script load; try safely
    if (window.Tawk_API && typeof window.Tawk_API.maximize === "function") {
      window.Tawk_API.maximize();
    } else {
      // fallback: try again after a short delay
      setTimeout(() => window.Tawk_API?.maximize?.(), 800);
    }
  };

  return (
    <div>
      <button
        aria-label="Open live chat"
        title="Chat with support"
        onClick={openChat}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openChat();
        }}
        className={`fixed right-5 bottom-5 ${loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'} z-50 flex items-center justify-center rounded-full bg-black text-white shadow-lg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-opacity duration-300`}
        style={{ width: 56, height: 56 }}
      >
        <span className="sr-only">Chat with support</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M2 5.5A3.5 3.5 0 015.5 2h9A3.5 3.5 0 0118 5.5v4A3.5 3.5 0 0114.5 13H9.7L6 16.5V13H5.5A3.5 3.5 0 012 9.5v-4z" />
        </svg>
      </button>
    </div>
  );
}
