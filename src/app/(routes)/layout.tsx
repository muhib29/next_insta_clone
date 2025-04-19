import AppShell from "@/Components/AppShell"; // Adjust path if needed
import "../globals.css";
import "@radix-ui/themes/styles.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import ThemeObserver from "@/Components/ThemeObserver";
import { Toaster } from "react-hot-toast";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode, 
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white t dark:bg-black dark:text-white`}>
        <Theme>
          {modal}
          <AppShell>
            {children}
            <Toaster position="top-right" reverseOrder={false} />
          </AppShell>
        </Theme>
        <ThemeObserver />
      </body>
    </html>
  );
}
