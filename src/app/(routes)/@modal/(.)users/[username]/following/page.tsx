// @modal/(.)users/[username]/following/page.tsx
import FollowingModal from "@/Components/FollowingModal";
import Preloader from "@/Components/Preloader";
import { Suspense } from "react";
import ModelFollowingContent from "@/Components/ModalFollowingContent";

export default function ModalFollowingPage({ params }: { params: { username: string } }) {
  return (
    <FollowingModal>
      <Suspense fallback={<Preloader />}>
        <ModelFollowingContent username={params.username} />
      </Suspense>
    </FollowingModal>
  );
}
