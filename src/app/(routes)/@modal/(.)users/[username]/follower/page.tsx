import FollowingModal from "@/Components/FollowingModal";
import ModalFollowerContent from "@/Components/ModalFollowerContent"; // make sure this matches filename!
import Preloader from "@/Components/Preloader";
import { Suspense } from "react";

// Temporary fix: using 'any' if you're unsure
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