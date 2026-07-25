import { useForm } from "@inertiajs/react";

import AuthPageShell from "@/Components/Auth/AuthPageShell";
import GradientButton from "@/Components/form/Button/GradientButton";
import InputBasic from "@/Components/form/Input/InputBasic";
import Layout from "@/Layout/Layout";
import { route } from "@/ziggy";
import { useTranslation } from "@/i18n";

function ForgotPassword() {
  const { t } = useTranslation();
  const form = useForm({
    email: "",
  });

  const submit = (event) => {
    event.preventDefault();

    form.post(route("password.email"), {
      preserveScroll: true,
    });
  };

  return (
    <AuthPageShell
      title={t("auth.reset_title")}
      subtitle={t("auth.reset_subtitle")}
      switchText={t("auth.remembered")}
      switchHref={route("login")}
      switchLabel={t("auth.login")}
    >
      <form onSubmit={submit} className="space-y-5">
        <InputBasic
          name="email"
          label={t("forms.contact.email")}
          placeholder="name@example.com"
          value={form.data.email}
          onChange={(event) => form.setData("email", event.target.value)}
          error={form.errors.email}
          required
        />

        <GradientButton
          type="submit"
          disabled={form.processing}
          className="w-full"
        >
          {form.processing ? t("auth.sending") : t("auth.send_reset_link")}
        </GradientButton>
      </form>
    </AuthPageShell>
  );
}

ForgotPassword.layout = (page) => (
  <Layout
    children={page}
    titleKey="meta.forgot_password_title"
    descriptionKey="meta.forgot_password_description"
    canonical="/forgot-password"
  />
);

export default ForgotPassword;
