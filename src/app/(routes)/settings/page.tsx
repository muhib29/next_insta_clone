import { auth } from "@/auth";
import SettingsForm from "@/Components/SettingsForm";
import { prisma } from "@/db";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <div className="text-center text-red-500 mt-10">
        You must be logged in to access this page.
      </div>
    );
  }

  const profile = await prisma.profile.findFirst({
    where: { email: session.user.email },
  });

  return <SettingsForm profile={profile} />;
}