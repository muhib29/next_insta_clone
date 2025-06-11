import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/db";
import MainHomePage from "@/Components/MainHomePage";
import Preloader from "@/Components/Preloader";
import { Suspense } from "react";
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

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <Suspense fallback={<Preloader />}>
        <div className="flex justify-center    py-4">
          <MainHomePage />
        </div>
      </Suspense>
    </div>
  );
}
