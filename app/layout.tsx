'use client'

import type { Metadata } from "next";
import { Open_Sans as Inter } from "next/font/google";
import DisableIOSBounce from '@/components/DisableIOSBounce'
import { AuthProvider } from '@/utils/auth'
import { ModalProvider } from '@/contexts/ModalContext'
import { ReferenceProvider } from '@/contexts/ReferenceContext'
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Colormxr",
//   description: "",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <DisableIOSBounce>
        <AuthProvider>
          <body suppressHydrationWarning className={inter.className}>
            <ModalProvider>
              <ReferenceProvider>
                {children}
              </ReferenceProvider>
            </ModalProvider>
          </body>
        </AuthProvider>
      </DisableIOSBounce>
    </html>
  );
}