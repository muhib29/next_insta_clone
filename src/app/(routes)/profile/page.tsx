import { auth } from "@/auth";
import ProfilePageContent from "@/Components/ProfilePageContent";
import { prisma } from "@/db";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function Profile() {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      throw new Error("User email not found in session.");
    }

    const profile = await prisma.profile.findFirst({
      where: { email },
    });

    if (!profile) {
      return redirect("/settings");
    }

    return (
      <ProfilePageContent
        ourFollow={null}
        profile={profile}
        isOurProfile={true}
      />
    );
  } catch (error) {
    console.error("Error loading profile:", error);

    return (
      <div className="text-center text-red-500 mt-10">
        Something went wrong while loading your profile.
      </div>
    );
  }
}
