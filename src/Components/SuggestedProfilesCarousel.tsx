"use client";

import { useEffect, useState } from "react";
import { Profile } from "@prisma/client";
import SuggestedProfileCard from "./SuggestedProfileCard";
import { useSwipeable } from "react-swipeable";

export default function SuggestedProfilesCarousel({ currentUserId }: { currentUserId: string }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasSwiped, setHasSwiped] = useState(false);
  const [showSwipeOverlay, setShowSwipeOverlay] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const res = await fetch(`/api/suggestions?exclude=${currentUserId}`);
      const data = await res.json();
      setProfiles(data.profiles || []);
    };
    fetchSuggestions();
  }, [currentUserId]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSwipeOverlay(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setHasSwiped(true);
      setShowSwipeOverlay(false);
      setCurrentIndex((prev) => Math.min(prev + 1, profiles.length - 1));
    },
    onSwipedRight: () => {
      setHasSwiped(true);
      setShowSwipeOverlay(false);
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    },
    trackMouse: true,
  });

  if (profiles.length === 0) return null;

  return (
    <div {...swipeHandlers} className="relative overflow-hidden w-full max-w-sm mx-auto">
      {/* Swipe overlay */}
   {showSwipeOverlay && (
 <div
  className="absolute inset-0 flex items-center justify-center pointer-events-none dark:bg-opacity-50 bg-slate-100 dark:bg-black bg-opacity-20 backdrop-blur-sm rounded-lg z-20 text-black dark:text-white text-lg font-semibold tracking-wide animate-fadeInScale"
  style={{ animationFillMode: "forwards" }}
>
 {!hasSwiped ? (
  <span className="flex items-center gap-2 select-none">
    Swipe
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 animate-bounce"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  </span>
) : (
  <span className="hidden"></span>
)}
  </div>

)}


      <div
        className="flex transition-transform duration-300"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {profiles.map((profile) => (
          <div key={profile.id} className="w-full flex-shrink-0 px-2">
            <SuggestedProfileCard profile={profile} />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
}
