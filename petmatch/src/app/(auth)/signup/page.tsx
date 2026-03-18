import { SignUpForm } from "@/components/auth/signup-form";
import { PawPrint } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4 py-8">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <PawPrint className="h-8 w-8 text-orange-500" />
        <span className="text-2xl font-bold text-orange-500">PetMatch</span>
      </Link>
      <SignUpForm />
    </div>
  );
}
