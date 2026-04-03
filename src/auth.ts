import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;

      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;

      return session;
    },
  },
  ...authConfig,
  providers: [
    // Keep all providers from authConfig except Credentials (which is a placeholder)
    ...authConfig.providers.filter(
      (provider) => (provider as { id?: string }).id !== "credentials",
    ),
    // Override Credentials with real bcrypt validation
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials.email as string | undefined;
        const password = credentials.password as string | undefined;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user?.password) return null;

        const isValid = await compare(password, user.password);

        if (!isValid) return null;

        // Block sign-in for unverified credential users
        if (!user.emailVerified) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
});
