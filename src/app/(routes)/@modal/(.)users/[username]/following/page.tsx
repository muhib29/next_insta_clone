
import FollowingModal from "@/Components/FollowingModal";
import Preloader from "@/Components/Preloader";
import { Suspense } from "react";
import ModelFollowingContent from "@/Components/ModalFollowingContent";

export default async function ModalFollowingPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
  return (
    <FollowingModal>
      <Suspense fallback={<Preloader />}>
        <ModelFollowingContent username={username} />
      </Suspense>
    </FollowingModal>
  );
}