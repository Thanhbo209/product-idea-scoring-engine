import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className=" flex items-center justify-center">
      <div className="w-md max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold">Sign In</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Doesn&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
