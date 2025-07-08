'use client';

import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="w-full bg-black text-white dark:bg-white dark:text-black font-medium py-3 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition duration-200"
    >
      Sign in with Google
    </button>
  );
}
