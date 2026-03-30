import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Diecast Store | Premium Model Cars",
    description: "Cửa hàng mô hình xe tĩnh tỷ lệ 1:64, 1:43, 1:18",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="bg-[#0b0e14] text-white relative min-h-screen">
                {/* Global Background Pattern (gf) - Updated to Cyber Blue */}
                <div 
                    className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30l10-10-10-10-10 10z' fill='%23FF42B0' fill-opacity='1'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat'
                    }}
                />
                <div className="relative z-10">
                    {children}
                </div>
            </body>
        </html>
    );
}