import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PlanForm } from "../plan-form";

export default async function NewInsurancePlanPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  if (session.user.role !== "INSURANCE_PROVIDER") redirect("/dashboard");

  return <PlanForm />;
}
