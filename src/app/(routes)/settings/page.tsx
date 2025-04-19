import { auth } from "@/auth";
import SettingsForm from "@/Components/SettingsForm";
import { prisma } from "@/db";


export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.email) {
    return 'not logged in';
  }
  const profile = await prisma.profile.findFirst({
    where: {email: session.user.email},
  });
  
  return (
    <SettingsForm profile={profile} />
  )
}
