import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { checkLoginRateLimit, getIp } from "@/lib/rate-limit";

class RateLimitError extends CredentialsSignin {
  code = "rate_limited";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // Hydrate teamId on first sign-in or if missing from an older token
      if (token.id && !token.teamId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { teamId: true },
        });
        token.teamId = dbUser?.teamId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        if (token.teamId) session.user.teamId = token.teamId as string;
      }
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
      async authorize(credentials, request) {
        const email = credentials.email as string | undefined;
        const password = credentials.password as string | undefined;

        if (!email || !password) return null;

        const rl = await checkLoginRateLimit(getIp(request as Request), email);
        if (!rl.success) throw new RateLimitError();

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user?.password) return null;

        const isValid = await compare(password, user.password);

        if (!isValid) return null;

        // Block sign-in for unverified credential users (only when verification is enabled)
        if (
          process.env.EMAIL_VERIFICATION_ENABLED === "true" &&
          !user.emailVerified
        )
          return null;

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
