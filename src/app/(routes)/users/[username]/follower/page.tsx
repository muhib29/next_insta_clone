"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function FollowersPage() {
  const router = useRouter();

  useEffect(() => {
    router.back();
  }, [router]);

  return null; 
}