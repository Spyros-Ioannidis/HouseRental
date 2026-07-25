import { useForm } from "@inertiajs/react";

import Layout from "@/Layout/Layout";
import GradientButton from "@/Components/form/Button/GradientButton";
import AuthCheckbox from "@/Components/Auth/AuthCheckbox";
import AuthPageShell from "@/Components/Auth/AuthPageShell";
import InputBasic from "@/Components/form/Input/InputBasic";
import PasswordInput from "@/Components/Auth/PasswordInput";
import { route } from "@/ziggy";
import { useTranslation } from "@/i18n";

function Register() {
  const { t } = useTranslation();
  const { data, setData, post, processing, errors } = useForm({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    bypass_email_verification: false,
  });

  const passwordsMatchCheck =
    data.password &&
    data.password_confirmation &&
    data.password !== data.password_confirmation;


  const submit = (e) => {
    e.preventDefault();
    if (passwordsMatchCheck) return;
    post(route("register"));
  };

  return (
    <AuthPageShell
      title={t("auth.create_account_title")}
      subtitle={t("auth.register_subtitle")}
      switchText={t("auth.already_have_account")}
      switchHref={route("login")}
      switchLabel={t("auth.login")}
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <InputBasic
            name="first_name"
            label={t("auth.first_name")}
            placeholder={t("auth.first_name")}
            value={data.first_name}
            onChange={(e) => setData("first_name", e.target.value)}
            error={errors.first_name}
            required
          />

          <InputBasic
            name="last_name"
            label={t("auth.last_name")}
            placeholder={t("auth.last_name")}
            value={data.last_name}
            onChange={(e) => setData("last_name", e.target.value)}
            error={errors.last_name}
            required
          />
        </div>

        <InputBasic
          name="email"
          label={t("forms.contact.email")}
          placeholder="name@example.com"
          value={data.email}
          onChange={(e) => setData("email", e.target.value)}
          error={errors.email}
          required
        />

        <PasswordInput
          name="password"
          label={t("auth.password")}
          placeholder={t("auth.minimum_characters")}
          value={data.password}
          onChange={(e) => setData("password", e.target.value)}
          error={errors.password}
          autoComplete="new-password"
          required
          showRules
        />

        <PasswordInput
          name="password_confirmation"
          label={t("auth.confirm_password")}
          placeholder={t("auth.repeat_password")}
          value={data.password_confirmation}
          onChange={(e) => setData("password_confirmation", e.target.value)}
          error={
            passwordsMatchCheck
              ? t("auth.passwords_do_not_match")
              : errors.password_confirmation
          }
          autoComplete="new-password"
          required
        />

        <AuthCheckbox
          name="bypass_email_verification"
          checked={data.bypass_email_verification}
          onChange={(e) =>
            setData("bypass_email_verification", e.target.checked)
          }
          label={t("auth.bypass_verification")}
          description={t("auth.bypass_description")}
          error={errors.bypass_email_verification}
        />

        <GradientButton type="submit" disabled={processing} className="w-full">
          {processing ? t("auth.creating_account") : t("auth.create_account")}
        </GradientButton>
      </form>
    </AuthPageShell>
  );
}

Register.layout = (page) => (
  <Layout
    children={page}
    titleKey="meta.register_title"
    descriptionKey="meta.register_description"
    canonical="/register"
  />
);

export default Register;
