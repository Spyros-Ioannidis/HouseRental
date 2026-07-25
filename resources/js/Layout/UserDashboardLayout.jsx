import Layout from "@/Layout/Layout";

import UserDashboardPanelHeader from "@/Components/Layout/UserDashboardPanelHeader";
import UserDashboardSidebar from "@/Components/Layout/UserDashboardSidebar";
import { dashboardSectionHref } from "@/Pages/User/Dashboard/UserDashboardActions";

export function UserDashboardLayout({
  children,
  activeSection,
  user,
  description = "A",
  title = "S",
}) {
  return (
    <Layout
      titleKey="meta.user_title"
      descriptionKey="meta.user_description"
      canonical={dashboardSectionHref(activeSection)}
    >
      <div className="grid flex-1 grid-cols-1 items-stretch gap-8 p-3 lg:grid-cols-[280px_1fr]">
        <UserDashboardSidebar user={user} activeSection={activeSection} />

        <main>
          <UserDashboardPanelHeader title={title} description={description} />
          <div className="border-b border-color-card" />
          <div className="overflow-y-auto p-6 border-b border-color-card border-x rounded-b-2xl bg-color-card">
            {children}
          </div>
        </main>
      </div>
    </Layout>
  );
}

export default UserDashboardLayout;
