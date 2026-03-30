import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import MainMenu from "@/components/MainMenu";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

const inter = Inter({ subsets: ["latin"] });

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} bg-[#030708] text-zinc-100 min-h-screen relative`}>
      <ScrollToTop />
      <div className="fixed top-0 left-0 right-0 z-50 w-full">
        <Header />
        <MainMenu />
      </div>

      <main className="pt-32 max-w-7xl mx-auto px-4 py-8 relative">
        {children}
      </main>

      <Footer />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #3f3f46',
          },
          success: {
            iconTheme: { primary: '#FF42B0', secondary: '#fff' },
          },
        }}
      />
    </div>
  );
}