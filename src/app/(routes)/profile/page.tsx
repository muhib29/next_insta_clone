import { auth } from "@/auth";
import ProfilePageContent from "@/Components/ProfilePageContent";
import { prisma } from "@/db";
import { redirect } from "next/navigation";

export default async function Profile()
{
     const session = await auth();
      if (!session?.user?.email) {
          throw new Error("User email not found in session.");
        } 
        const profile = await prisma.profile.findFirst({
          where: { email: session?.user?.email as string },
        });
        if(!profile){
          return redirect('/settings')
        }
        
      return (
      <ProfilePageContent ourFollow={null}
      profile={profile}
      isOurProfile={true}
      />
    )
}