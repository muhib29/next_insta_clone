import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  // ✅ Event-based profile creation for new users
  events: {
    async signIn({ user }) {
      const existing = await prisma.profile.findUnique({
        where: { email: user.email! },
      });

      if (!existing) {
        await prisma.profile.create({
          data: {
            email: user.email!,
            name: user.name ?? "",
            avatar: user.image ?? "",
            username: user.email!.split("@")[0] + Math.floor(Math.random() * 10000), 
          },
        });
      }
    },
  },
});
