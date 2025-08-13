import { verifySession } from "@/lib/session";
import AuthenticatedLayout from "@/components/layouts/authenticated-layout";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

export default async function AppLayout({ children }) {
  // Server-side protection
  const isAuthenticated = await verifySession();

  if (!isAuthenticated) {
    // This will automatically redirect to login
    // because of our middleware (shown later)
    return null;
  }

  return (
    <div>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </div>
  );
}
