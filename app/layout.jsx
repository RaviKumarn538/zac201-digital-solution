import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata = {
  title: "ZAc201 Digital Solutions | Website Development Agency in Bhopal",
  description:
    "Premium website development agency for Bhopal MSMEs, startups, shops, coaching institutes, hotels, clinics, restaurants, and service businesses.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
