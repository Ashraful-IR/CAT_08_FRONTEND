import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/common/Navbar";
import { MobileTabBar } from "@/components/common/MobileTabBar";
import { Footer } from "@/components/common/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata = {
  title: {
    default: "DocAppoint — Book your doctor",
    template: "%s · DocAppoint",
  },
  description:
    "Discover doctors, view profiles and reviews, and book an appointment in minutes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <Providers>
          <Navbar />
          <main className="flex-1 pt-[104px] pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
