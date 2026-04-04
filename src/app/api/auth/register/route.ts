import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { randomBytes, createHash } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { checkRegisterRateLimit, getIp, rateLimitResponse } from "@/lib/rate-limit";

const RegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required."),
    email: z.email("Invalid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  const rateLimit = await checkRegisterRateLimit(getIp(request));
  if (!rateLimit.success) return rateLimitResponse(rateLimit.reset);
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid input.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 },
      );
    }

    const hashedPassword = await hash(password, 12);
    const emailVerificationEnabled =
      process.env.EMAIL_VERIFICATION_ENABLED === "true";

    const rawVerificationToken = emailVerificationEnabled
      ? randomBytes(32).toString("hex")
      : undefined;
    const verificationToken =
      rawVerificationToken !== undefined
        ? createHash("sha256").update(rawVerificationToken).digest("hex")
        : undefined;
    const verificationTokenExpiry = emailVerificationEnabled
      ? new Date(Date.now() + 24 * 60 * 60 * 1000)
      : undefined;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        ...(emailVerificationEnabled && {
          verificationToken,
          verificationTokenExpiry,
        }),
        ...(!emailVerificationEnabled && { emailVerified: new Date() }),
      },
    });

    if (emailVerificationEnabled) {
      await sendVerificationEmail(email, rawVerificationToken!);
    }

    return NextResponse.json(
      {
        success: true,
        emailVerificationRequired: emailVerificationEnabled,
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
