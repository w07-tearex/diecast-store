import type { Metadata } from "next";
import "./globals.css";
import { SanityLive } from "@/sanity/lib/live";

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
            <body>
                <SanityLive />
                {children}
            </body>
        </html>
    );
}