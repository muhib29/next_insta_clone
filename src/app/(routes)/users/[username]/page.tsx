import { getSessionEmail } from "@/action";
import ProfilePageContent from "@/Components/ProfilePageContent";
import { prisma } from "@/db";

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const sessionEmail = await getSessionEmail() || '';
    const { username } = await params;  // await the promise
  const profile = await prisma.profile.findFirstOrThrow({
    where: { username},
  });

  const ourFollow = await prisma.follower.findFirst({
    where: {
      followingProfileEmail: sessionEmail,
      followedProfileId: profile.id,
    },
  });

  return (
    <ProfilePageContent
      isOurProfile={profile.email === sessionEmail}
      ourFollow={ourFollow}
      profile={profile}
    />
  );
}