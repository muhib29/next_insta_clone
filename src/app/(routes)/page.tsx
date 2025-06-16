import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/db";
import MainHomePage from "@/Components/MainHomePage";
import Preloader from "@/Components/Preloader";
import { Suspense } from "react";
import MobileTopBar from "@/Components/MobileTopBar";
export default async function Home() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/");
  }

  const profile = await prisma.profile.findUnique({
    where: {
      email: session.user.email, // make sure email is a unique field in your schema
    },
  });

  if (!profile) {
    redirect("/settings");
  }

  let sessionUserId: string | null = null;

  if (session?.user?.email) {
    const profile = await prisma.profile.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    sessionUserId = profile?.id || null;
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <Suspense fallback={<Preloader />}>
        <div className="flex justify-center    py-4">
          {sessionUserId &&
            <MobileTopBar userId={sessionUserId} />
          }
          <MainHomePage />
        </div>
      </Suspense>
    </div>
  );
}
