import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<void> {
  const resetUrl = encodeURI(`${process.env.NEXTAUTH_URL}/reset-password?token=${token}`);

  await resend.emails.send({
    from: "Axon <onboarding@resend.dev>",
    to: email,
    subject: "Reset your Axon password",
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #fafafa; padding: 40px 32px; border-radius: 8px;">
        <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px;">Reset your password</h1>
        <p style="color: #a1a1aa; margin: 0 0 32px; font-size: 14px;">
          Click the button below to reset your Axon password. This link expires in 1 hour.
        </p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #fafafa; color: #0a0a0a; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
          Reset password
        </a>
        <p style="color: #52525b; font-size: 12px; margin: 32px 0 0;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const verifyUrl = encodeURI(`${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`);

  await resend.emails.send({
    from: "Axon <onboarding@resend.dev>",
    to: email,
    subject: "Verify your Axon account",
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #fafafa; padding: 40px 32px; border-radius: 8px;">
        <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px;">Verify your email</h1>
        <p style="color: #a1a1aa; margin: 0 0 32px; font-size: 14px;">
          Click the button below to verify your Axon account. This link expires in 24 hours.
        </p>
        <a href="${verifyUrl}"
           style="display: inline-block; background: #fafafa; color: #0a0a0a; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
          Verify email
        </a>
        <p style="color: #52525b; font-size: 12px; margin: 32px 0 0;">
          If you didn't create an Axon account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
