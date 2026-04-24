import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthProvider from "./AuthProvider";

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
            id="tawk-live-chat"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `<!--Start of Tawk.to Script-->
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/69e038da3937ef1c2e296e1e/1jm9ts67n';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
<!--End of Tawk.to Script-->`,
            }}
          />
        )}
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
        <noscript>
          Live chat enabled by <a href="https://www.tawk.to" target="_blank" rel="noreferrer">Tawk.to</a>
        </noscript>
      </body>
    </html>
  );
}