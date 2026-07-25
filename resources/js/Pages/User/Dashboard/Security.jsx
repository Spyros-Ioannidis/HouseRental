import { router } from "@inertiajs/react";
import { FiCheckCircle, FiMail } from "react-icons/fi";

import DashboardPanel from "./components/DashboardPanel";
import { namedRoute } from "./UserDashboardActions";
import UserDashboardLayout from "@/Layout/UserDashboardLayout";

function Security({ user }) {
  const isVerified = Boolean(user?.email_verified_at);

  const resendVerification = () => {
    router.post(
      namedRoute("dashboard.verification.send"),
      {},
      {
        preserveScroll: true,
      },
    );
  };

  return (
    <DashboardPanel
      title="Security"
      description="Review verification state, role, and account access details."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="p-5 border border-gray-200 rounded-xl">
          <p className="font-semibold text-gray-500 text-sm">Email status</p>
          <p
            className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm ${
              isVerified
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <FiCheckCircle className="h-4 w-4" />
            {isVerified ? "Verified" : "Pending verification"}
          </p>
        </div>

        <div className="p-5 border border-gray-200 rounded-xl">
          <p className="font-semibold text-gray-500 text-sm">Account role</p>
          <p className="mt-3 capitalize font-bold text-gray-950 text-lg">
            {user?.role || "user"}
          </p>
        </div>
      </div>

      <dl className="divide-gray-100 divide-y border border-gray-200 rounded-xl text-sm">
        <div className="flex items-center justify-between gap-4 p-4">
          <dt className="font-semibold text-gray-500">User ID</dt>
          <dd className="font-semibold text-gray-950">{user?.id}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 p-4">
          <dt className="font-semibold text-gray-500">Login email</dt>
          <dd className="font-semibold text-gray-950 truncate">
            {user?.email}
          </dd>
        </div>
      </dl>

      {!isVerified && (
        <button
          type="button"
          onClick={resendVerification}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-amber-300 rounded-xl bg-amber-50 font-semibold text-amber-800 text-sm transition hover:bg-amber-100"
        >
          <FiMail className="h-4 w-4" />
          Resend verification
        </button>
      )}
    </DashboardPanel>
  );
}

Security.layout = (page) => {
  return (
    <UserDashboardLayout
      activeSection="security"
      user={page.props.user}
    >
      {page}
    </UserDashboardLayout>
  );
};

export default Security;
