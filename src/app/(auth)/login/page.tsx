import { SignInForm } from "@/components/auth/SignInForm";

export const metadata = { title: "Sign In - Axon" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; verified?: string; error?: string }>;
}) {
  const { registered, verified, error } = await searchParams;
  return (
    <SignInForm
      registered={registered === "true"}
      verified={verified === "true"}
      error={error}
    />
  );
}
