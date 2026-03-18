import { Suspense } from "react";
import { SignInForm } from "@/components/auth/signin-form";
import { PawPrint } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <PawPrint className="h-8 w-8 text-orange-500" />
        <span className="text-2xl font-bold text-orange-500">PetMatch</span>
      </Link>
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
