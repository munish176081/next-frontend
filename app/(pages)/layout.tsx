import { Toaster } from "@/_components/ui/toaster";
import Providers from "@/providers";
import type { Metadata } from "next";
import { Inter, Lato, Playfair_Display, Satisfy } from "next/font/google";
import "./globals.css";
import { VerifyEmailBannerWrapper } from "@/_components/top-banners/verify-email-banner-wrapper";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

const satisfy = Satisfy({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-satisfy",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title:
    "Puppies & Dogs for sale Perth, Sydney, Adelaide, Brisbane & Melbourne",
  description:
    "Puppies and older dogs for sale. Litters from puppy breeders showcased on pups4sale.com.au.",
  keywords: "puppies, pup, puppies, puppy, dogs, animals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${lato.variable} ${satisfy.variable} ${inter.variable} font-inter tracking-normal antialiased`}
      >
        <Providers>
          {
            <>
              {children}
              <VerifyEmailBannerWrapper />
            </>
          }
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
