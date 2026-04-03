import { SignInForm } from "@/components/auth/SignInForm";

export const metadata = { title: "Sign In - Axon" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;
  return <SignInForm registered={registered === "true"} />;
}
