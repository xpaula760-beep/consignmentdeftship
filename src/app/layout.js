import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Professional metadata for Deftship
export const metadata = {
  title: "Deftship | Seamless International Shipping & Logistics",
  description: "Deftship helps businesses send goods internationally with speed and security. Reliable global shipping solutions for the modern world.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        /* Adding this here ensures browser extensions like ColorZilla don't break hydration */
        suppressHydrationWarning
      >
        {process.env.NODE_ENV === "production" && (
          <Script
            id="smartsupp-live-chat"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                var _smartsupp = window._smartsupp || {};
                _smartsupp.key = 'b4f3de85fcdab68282fbd58035c28b27860fa233';
                window._smartsupp = _smartsupp;
                window.smartsupp || (function(d) {
                  var s, c, o = window.smartsupp = function() { o._.push(arguments); };
                  o._ = [];
                  s = d.getElementsByTagName('script')[0];
                  c = d.createElement('script');
                  c.type = 'text/javascript';
                  c.charset = 'utf-8';
                  c.async = true;
                  c.src = 'https://www.smartsuppchat.com/loader.js?';
                  s.parentNode.insertBefore(c, s);
                })(document);
              `,
            }}
          />
        )}
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <noscript>
          Powered by <a href="https://www.smartsupp.com" target="_blank" rel="noreferrer">Smartsupp</a>
        </noscript>
      </body>
    </html>
  );
}