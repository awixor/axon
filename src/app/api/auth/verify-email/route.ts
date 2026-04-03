import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=missing_token", request.url),
    );
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findUnique({
    where: { verificationToken: tokenHash },
    select: {
      id: true,
      emailVerified: true,
      verificationTokenExpiry: true,
    },
  });

  if (!user) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_token", request.url),
    );
  }

  if (user.emailVerified) {
    return NextResponse.redirect(new URL("/login?verified=true", request.url));
  }

  if (
    user.verificationTokenExpiry &&
    user.verificationTokenExpiry < new Date()
  ) {
    return NextResponse.redirect(
      new URL("/login?error=token_expired", request.url),
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  return NextResponse.redirect(new URL("/login?verified=true", request.url));
}
