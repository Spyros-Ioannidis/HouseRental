import { Head, usePage } from "@inertiajs/react";
import { useEffect } from "react";

import AdminDashboardHeader from "@/Components/Layout/AdminDashboardHeader";
import AdminDashboardSidebar from "@/Components/Layout/AdminDashboardSidebar";
import { addToast, ToastProvider } from "@/Components/Other/Toast";
import { useTranslation } from "@/i18n";
import { syncZiggy } from "@/ziggy";

const APP_NAME = "HouseRental";

export default function DashboardLayout({
  children,
  title = "Admin Dashboard",
  titleKey,
  titleValues = {},
}) {
  const { props } = usePage();
  syncZiggy(props.ziggy);

  const { flash = {} } = props;
  const { auth } = props;
  const { t } = useTranslation();
  const appName = t("meta.app_name");
  const resolvedTitle = titleKey ? t(titleKey, titleValues) : title;
  const pageTitle = `${resolvedTitle} | ${appName || APP_NAME}`;

  useEffect(() => {
    if (flash.message) {
      addToast(flash.message, flash.type ?? "success");
    }
  }, [flash.flash_id, flash.message, flash.type]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-color-primary text-color-primary">
      <Head title={pageTitle}>
        <meta
          head-key="robots"
          name="robots"
          content="noindex,nofollow,noarchive"
        />
      </Head>

      <AdminDashboardSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminDashboardHeader auth={auth}/>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <ToastProvider />
    </div>
  );
}
