'use client';
import {ScaleLoader} from "react-spinners";

export default function Preloader() {
  return (
    <>
      <div className="flex h-screen w-full justify-center items-center text-center">
        <ScaleLoader
          color="#aaa"
          loading={true} speedMultiplier={4} />
      </div>
    </>
  );
}