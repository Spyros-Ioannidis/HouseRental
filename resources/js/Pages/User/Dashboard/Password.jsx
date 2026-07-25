import GradientButton from "@/Components/form/Button/GradientButton";
import PasswordInput from "@/Components/Auth/PasswordInput";
import { useForm } from "@inertiajs/react";

import DashboardPanel from "./components/DashboardPanel";
import { namedRoute } from "./UserDashboardActions";
import UserDashboardLayout from "@/Layout/UserDashboardLayout";
import { useTranslation } from "@/i18n";

function Password() {
  const { t } = useTranslation();
  const form = useForm({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const submit = (event) => {
    event.preventDefault();
    form.put(namedRoute("dashboard.password.update"), {
      preserveScroll: true,
      onSuccess: () => form.reset(),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <PasswordInput
        name="current_password"
        label={t("account.current_password")}
        value={form.data.current_password}
        onChange={(event) =>
          form.setData("current_password", event.target.value)
        }
        error={form.errors.current_password}
        autoComplete="current-password"
        required
      />
      <PasswordInput
        name="password"
        label={t("account.new_password")}
        value={form.data.password}
        onChange={(event) => form.setData("password", event.target.value)}
        error={form.errors.password}
        autoComplete="new-password"
        required
        showRules
      />
      <PasswordInput
        name="password_confirmation"
        label={t("account.confirm_new_password")}
        value={form.data.password_confirmation}
        onChange={(event) =>
          form.setData("password_confirmation", event.target.value)
        }
        error={form.errors.password_confirmation}
        autoComplete="new-password"
        required
      />

      <GradientButton type="submit" disabled={form.processing} className="w-full">
        {form.processing ? t("auth.updating") : t("account.update_password")}
      </GradientButton>
    </form>
  );
}

Password.layout = (page) => {
  return (
    <UserDashboardLayout
      activeSection="password"
      user={page.props.user}
      title={page.props.translations?.account?.password ?? "Password"}
      description={page.props.translations?.account?.password_description ?? ""}
    >
      {page}
    </UserDashboardLayout>
  );
};

export default Password;
