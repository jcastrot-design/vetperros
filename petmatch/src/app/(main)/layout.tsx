import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { EmergencyButton } from "@/components/shared/emergency-button";
import { PushNotificationPrompt } from "@/components/shared/push-notification-prompt";

// Rutas accesibles sin login
const PUBLIC_PATHS = ["/adoption", "/services", "/vets", "/marketplace", "/providers", "/lost-pets", "/teleconsulta"];

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || headersList.get("x-invoke-path") || "";
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!session && !isPublic) redirect("/signin");

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      {session && <Sidebar role={session.user.role} className="hidden md:flex" />}

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <PageWrapper>{children}</PageWrapper>
        </main>
      </div>

      {/* Mobile bottom nav */}
      {session && <MobileNav />}

      {/* Emergency veterinary button (owners only) */}
      {session?.user.role === "OWNER" && <EmergencyButton />}

      {/* Push notification prompt */}
      {session && <PushNotificationPrompt />}
    </div>
  );
}
