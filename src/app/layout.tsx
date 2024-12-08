import type {Metadata} from "next";
import localFont from "next/font/local";
import "./globals.css";
import HeadNav from "@/lib/ui/head-nav";
import Link from "next/link";
import React from "react";
import hei from '@/lib/test'

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

export default async function RootLayout({children}: {
    children: React.ReactNode,
    headerActions?: React.ReactNode,
    pageName?: React.ReactNode,
}) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            {children}
        </body>
        </html>
    );
}

export function RootLayoutOverridable({children, headerActions, pageName}: {
    children: React.ReactNode,
    headerActions?: React.ReactNode,
    pageName?: React.ReactNode,
}) {
    return (
        <>
            <div className='flex justify-center pt-3'>
                <div>
                    <div className='text-xl lg:text-3xl 2xl:text-5xl font-bold text-red-500 text-center'>
                        <Link href='/'>
                            YouTube Script Improver
                        </Link>
                    </div>
                    <div className='flex items-center'>
                        <h1 className='text-center pr-2 border-r-2'>
                            {pageName || `Set the page's name!`}
                        </h1>
                        <HeadNav/>
                    </div>
                </div>
                <div>
                    {headerActions}
                </div>
            </div>
            <hr/>
            <div>
                {children}
            </div>
        </>
    );
}
