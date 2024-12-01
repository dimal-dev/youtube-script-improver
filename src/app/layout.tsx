import type {Metadata} from "next";
import localFont from "next/font/local";
import "./globals.css";
import HeadNav from "@/lib/ui/head-nav";
import Link from "next/link";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "YouTube Script Improver",
    description: "🧐",
};

export default async function RootLayout({children, params}: Readonly<{ children: React.ReactNode; params: { pathname: string } }>) {
    const res = await params;
    console.log('parama', res, 'papama')
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <div className="border-b-2 py-6">
            <div className='text-xl lg:text-3xl 2xl:text-5xl font-bold text-red-500 text-center'>
                <Link href='/'>
                    YouTube Script Improver
                </Link>
            </div>
        </div>
        <HeadNav />
        {children}
        </body>
        </html>
    );
}
