import { SignInForm } from "@/components/auth/SignInForm";

export const metadata = { title: "Sign In - Axon" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; verified?: string; reset?: string; error?: string }>;
}) {
  const { registered, verified, reset, error } = await searchParams;
  return (
    <SignInForm
      registered={registered === "true"}
      verified={verified === "true"}
      reset={reset === "true"}
      error={error}
    />
  );
}
