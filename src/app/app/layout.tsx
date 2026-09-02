import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="atmosphere flex min-h-screen">
      <AppSidebar
        user={{ name: user.name, plan: user.plan, credits: user.credits }}
      />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
