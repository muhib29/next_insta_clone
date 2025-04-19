import { auth, signIn } from "@/auth";
import MainHomePage from "@/Components/MainHomePage";
import Preloader from "@/Components/Preloader";
import { Suspense } from "react";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      {session ? (
        <Suspense fallback={<Preloader />}>
          <div className="flex justify-center px-4 py-4">
            <MainHomePage />
          </div>
        </Suspense>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <button className="bg-black text-white dark:bg-white dark:text-black font-semibold px-6 py-2 rounded-md hover:bg-gray-800 hover:text-white dark:hover:bg-gray-200 dark:hover:text-black transition duration-200">
              Sign in with Google
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
