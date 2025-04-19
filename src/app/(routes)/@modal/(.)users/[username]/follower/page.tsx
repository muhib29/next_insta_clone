import FollowingModal from "@/Components/FollowingModal";
import ModelFollowerContent from "@/Components/ModalFollowerContent";
import Preloader from "@/Components/Preloader";
import { Suspense } from "react";

export default function ModalFollwerPage({ params }: { params: { username: string } }) {
    return(
        <FollowingModal>
            <Suspense fallback={<Preloader />}>
                <ModelFollowerContent params={params}/> 
            </Suspense>
        </FollowingModal>
    )
}