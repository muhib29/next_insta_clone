// app/(routes)/@modal/(.)users/[username]/follower/page.tsx
import FollowingModal from "@/Components/FollowingModal";
import ModalFollowerContent from "@/Components/ModalFollowerContent"; 
import Preloader from "@/Components/Preloader";
import { Suspense } from "react";

export default async function ModalFollowerPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    return (
        <FollowingModal>
            <Suspense fallback={<Preloader />}>
                <ModalFollowerContent username={username} />
            </Suspense>
        </FollowingModal>
    );
}