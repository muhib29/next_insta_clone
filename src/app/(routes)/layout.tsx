// app/layout.tsx
import "../globals.css";
import "@radix-ui/themes/styles.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import ThemeObserver from "@/Components/ThemeObserver";
import { Toaster } from "react-hot-toast";
import AppShell from "@/Components/AppShell";
import { auth, signIn } from "@/auth";
import Image from "next/image";
import { SessionProvider } from "next-auth/react";
import { prisma } from "@/db";
import '@fortawesome/fontawesome-free/css/all.min.css';


const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default async function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const session = await auth();

  let sessionUserId: string | null = null;

  if (session?.user?.email) {
    const profile = await prisma.profile.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    sessionUserId = profile?.id || null;
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black dark:text-white`}
      >
        <SessionProvider session={session}>
          <Theme>
            {sessionUserId ? (
              <>
                {modal}
                <AppShell sessionUserId={sessionUserId}>
                  {children}
                  <Toaster position="top-right" reverseOrder={false} />
                </AppShell>
              </>
            ) : (
              <LoginScreen />
            )}
          </Theme>
          <ThemeObserver />
        </SessionProvider>
      </body>
    </html>
  );
}
function LoginScreen() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black">
      {/* Main Content */}
      <div className="flex flex-1 gap-1">
        {/* Left Side - Image */}
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-100 dark:bg-neutral-900">
          <Image
            src="/loginImage.png"
            alt="Login Illustration"
            width={500}
            height={500}
            className="object-contain"
          />
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 shadow-xl rounded-lg p-10">
            <div className="flex justify-center mb-8">
              <Image
                src="/Instagram_logo.svg.png"
                alt="Instagram Logo"
                width={150}
                height={150}
                className="dark:invert"
                priority
              />  
            </div>

            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
            >
              <button className="w-full bg-black text-white dark:bg-white dark:text-black font-medium py-3 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition duration-200">
                Sign in with Google
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Don’t have an account?{" "}
              <span className="font-semibold text-black dark:text-white">
                Sign up with Google
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 dark:text-gray-400 py-6 space-y-2">
        <div className="flex flex-wrap justify-center gap-4 px-4">
          <span>Meta</span>
          <span>About</span>
          <span>Blog</span>
          <span>Jobs</span>
          <span>Help</span>
          <span>API</span>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Locations</span>
          <span>Instagram Lite</span>
          <span>Threads</span>
          <span>Contact Uploading & Non-Users</span>
          <span>Meta Verified</span>
        </div>
        <div className="flex flex-wrap justify-center text-center gap-4 px-4 pt-2">
          <select
            className="bg-transparent border-none outline-none text-xs text-gray-500 dark:text-gray-400"
            defaultValue="en"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
            <p className="py-1">© 2025 Instagram from Meta</p>
        </div>
      </footer>
    </div>
  );
}