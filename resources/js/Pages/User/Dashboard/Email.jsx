import InputBasic from "@/Components/form/Input/InputBasic";
import GradientButton from "@/Components/form/Button/GradientButton";
import PasswordInput from "@/Components/Auth/PasswordInput";
import { useForm } from "@inertiajs/react";
import { FiMail } from "react-icons/fi";

import DashboardPanel from "./components/DashboardPanel";
import { namedRoute } from "./UserDashboardActions";
import UserDashboardLayout from "@/Layout/UserDashboardLayout";
import { useTranslation } from "@/i18n";

function Email({ user }) {
  const { t } = useTranslation();
  const form = useForm({
    email: user?.email || "",
    current_password: "",
  });

  const submit = (event) => {
    event.preventDefault();
    form.put(namedRoute("dashboard.email.update"), {
      preserveScroll: true,
      onSuccess: () => form.reset("current_password"),
    });
  };

  return (
    <form onSubmit={submit}>
      <div className="p-4 border border-amber-200 rounded-xl bg-amber-50 text-amber-800 text-sm">
        {t("account.current_login_email")}:{" "}
        <span className="font-semibold">{user?.email}</span>
      </div>

      <InputBasic
        name="email"
        label={t("account.new_login_email")}
        type="email"
        value={form.data.email}
        onChange={(event) => form.setData("email", event.target.value)}
        error={form.errors.email}
        icon={FiMail}
        required
      />
      <PasswordInput
        name="current_password"
        label={t("auth.confirm_password")}
        value={form.data.current_password}
        onChange={(event) =>
          form.setData("current_password", event.target.value)
        }
        error={form.errors.current_password}
        autoComplete="current-password"
        required
      />

      <GradientButton type="submit" disabled={form.processing} className="w-full">
        {form.processing ? t("auth.updating") : t("account.update_email")}
      </GradientButton>
    </form>
  );
}

Email.layout = (page) => {
  return (
    <UserDashboardLayout
      activeSection="email"
      user={page.props.user}
      title={page.props.translations?.account?.email ?? "Email"}
      description={page.props.translations?.account?.email_description ?? ""}
    >
      {page}
    </UserDashboardLayout>
  );
};

export default Email;
