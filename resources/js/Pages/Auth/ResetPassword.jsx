import { useForm } from "@inertiajs/react";

import AuthPageShell from "@/Components/Auth/AuthPageShell";
import PasswordInput from "@/Components/Auth/PasswordInput";
import GradientButton from "@/Components/form/Button/GradientButton";
import InputBasic from "@/Components/form/Input/InputBasic";
import Layout from "@/Layout/Layout";
import { route } from "@/ziggy";
import { useTranslation } from "@/i18n";

function ResetPassword({ token, email = "" }) {
  const { t } = useTranslation();
  const form = useForm({
    token,
    email: email ?? "",
    password: "",
    password_confirmation: "",
  });

  const submit = (event) => {
    event.preventDefault();

    form.post(route("password.update"), {
      preserveScroll: true,
      onSuccess: () => form.reset("password", "password_confirmation"),
    });
  };

  return (
    <AuthPageShell
      title={t("auth.new_password_title")}
      subtitle={t("auth.new_password_subtitle")}
      switchText={t("auth.back_to")}
      switchHref={route("login")}
      switchLabel={t("auth.login")}
    >
      <form onSubmit={submit} className="space-y-5">
        <input type="hidden" name="token" value={form.data.token} readOnly />

        <InputBasic
          name="email"
          label={t("forms.contact.email")}
          placeholder="name@example.com"
          value={form.data.email}
          onChange={(event) => form.setData("email", event.target.value)}
          error={form.errors.email}
          required
        />

        <PasswordInput
          name="password"
          label={t("auth.new_password")}
          placeholder={t("auth.minimum_characters")}
          value={form.data.password}
          onChange={(event) => form.setData("password", event.target.value)}
          error={form.errors.password}
          autoComplete="new-password"
          required
          showRules
        />

        <PasswordInput
          name="password_confirmation"
          label={t("auth.confirm_password")}
          placeholder={t("auth.repeat_password")}
          value={form.data.password_confirmation}
          onChange={(event) =>
            form.setData("password_confirmation", event.target.value)
          }
          error={form.errors.password_confirmation}
          autoComplete="new-password"
          required
        />

        <GradientButton
          type="submit"
          disabled={form.processing}
          className="w-full"
        >
          {form.processing ? t("auth.updating") : t("auth.reset_password")}
        </GradientButton>
      </form>
    </AuthPageShell>
  );
}

ResetPassword.layout = (page) => (
  <Layout
    children={page}
    titleKey="meta.reset_password_title"
    descriptionKey="meta.reset_password_description"
    canonical="/reset-password"
  />
);

export default ResetPassword;
