import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "PesanLagi - Auto-Responder AI Telegram untuk UMKM Indonesia | Balas Chat 24/7",
  description: "Otomatisasi balas chat Telegram 24/7 dengan AI cerdas. Jawab stok, ongkir, dan status order dalam hitungan detik. Hemat biaya admin, kurangi order hilang. Gratis coba demo!",
  keywords: "auto responder telegram, ai chatbot, chatbot telegram, umkm, toko online, telegram bot, automasi chat, customer service otomatis, bot telegram Indonesia, chatbot toko online",
  authors: [{ name: "PesanLagi" }],
  creator: "PesanLagi",
  publisher: "PesanLagi",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "PesanLagi - AI Telegram Auto-Responder | Balas Chat 24/7 Tanpa Admin Ekstra",
    description: "Otomatisasi balas chat Telegram 24/7 dengan AI cerdas. Hemat biaya admin, kurangi order hilang. Gratis coba demo sekarang!",
    url: "https://pesanlagi.web.id",
    siteName: "PesanLagi",
    images: [
      {
        url: "/pesanlagi-logo.png",
        width: 1200,
        height: 630,
        alt: "PesanLagi - AI Telegram Auto-Responder",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PesanLagi - AI Telegram Auto-Responder | Balas Chat 24/7",
    description: "Otomatisasi balas chat Telegram 24/7 dengan AI cerdas. Hemat biaya admin, kurangi order hilang.",
    images: ["/pesanlagi-logo.png"],
    creator: "@pesanlagi",
  },
  metadataBase: new URL("https://pesanlagi.web.id"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/pesanlagi-logo.png",
    apple: "/pesanlagi-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="31SJ99EkgEHbo1EKLGqMQ";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
