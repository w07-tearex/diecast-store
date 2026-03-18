import { Inter } from "next/font/google";
import "../globals.css";
import ParticlesBackground from "@/components/ParticlesBackground";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import MainMenu from "@/components/MainMenu";

const inter = Inter({ subsets: ["latin"] });

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} bg-[#0d1117] text-zinc-100 min-h-screen relative overflow-x-hidden`}>
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute -bottom-[300px] left-1/2 -translate-x-1/2 w-[1500px] h-[700px] bg-gradient-to-r from-blue-900 via-cyan-800 to-indigo-900 opacity-40 blur-[120px] rounded-[100%]"></div>
        <div className="absolute inset-0 w-full h-full mix-blend-color-dodge">
          <ParticlesBackground />
        </div>
      </div>

      <div className="fixed top-0 left-0 right-0 z-50 w-full">
        <Header />
        <MainMenu />
      </div>

      <main className="pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

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