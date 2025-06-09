import { Profile, Follower } from "@prisma/client";
import { Suspense } from "react";
import ProfilePageInfo from "./ProfilePageInfo";
import ProfileNav from "./ProfileNav";
import ProfilePosts from "./ProfilePosts";
import Preloader from "./Preloader";
import { prisma } from "@/db";

export default async function ProfilePageContent({
  profile,
  isOurProfile=false,
  ourFollow=null,
}: {
  profile:Profile;
  isOurProfile?:boolean;
  ourFollow:Follower|null;
}) {
  const [postCount, followersCount, followingCount] = await Promise.all([
    prisma.post.count({
      where: { author: profile.email }, // Use profile.id or profile.email to ensure correct filtering
    }),
    prisma.follower.count({
      where: { followedProfileId: profile.id }, // Make sure `profile.id` matches the `followedProfileId`
    }),
    prisma.follower.count({
      where: { followingProfileId: profile.id }, // Make sure `profile.id` matches the `followingProfileId`
    }),
  ]);
  return (
    <main>
      <ProfilePageInfo
          profile={profile}
          isOurProfile={isOurProfile}
          ourFollow={ourFollow} 
          stats={{ postCount, followersCount, followingCount }}
      />
      <ProfileNav
        username={profile.username || profile.email.split('@')[0]} // fallback to email username
        isOurProfile={isOurProfile}
      />
      <section className="mt-4">
        <Suspense fallback={<Preloader />}>
          <ProfilePosts isOurProfile={isOurProfile} email={profile.email}/>
        </Suspense>
      </section>
    </main>
  );
}

