import AuthPageShell from "@/Components/Auth/AuthPageShell";
import DemoCredentialsDropdown from "@/Components/Auth/DemoCredentialsDropdown";
import InputBasic from "@/Components/form/Input/InputBasic";
import Layout from "@/Layout/Layout";
import GradientButton from "@/Components/form/Button/GradientButton";
import { Link, useForm } from "@inertiajs/react";
import PasswordInput from "@/Components/Auth/PasswordInput";
import { route } from "@/ziggy";
import { useTranslation } from "@/i18n";

function Login() {
  const { t } = useTranslation();
  const { data, setData, post, processing, errors, clearErrors } = useForm({
    email: "",
    password: "",
  });

  const fillDemoAccount = (account) => {
    setData("email", account.email);
    setData("password", account.password);
    clearErrors();
  };

  const submit = (e) => {
    e.preventDefault();
    post(route("login"));
  };

  return (
    <AuthPageShell
      title={t("auth.welcome_back")}
      subtitle={t("auth.login_subtitle")}
      switchText={t("auth.new_to_site")}
      switchHref={route("register")}
      switchLabel={t("auth.create_account")}
      >
      <form onSubmit={submit} className="space-y-5">
        <DemoCredentialsDropdown onSelect={fillDemoAccount} />

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
          placeholder={t("auth.enter_password")}
          value={data.password}
          onChange={(e) => setData("password", e.target.value)}
          error={errors.password}
          autoComplete="current-password"
          required
        />

        <div className="text-right">
          <Link
            href={route("password.request")}
            className="font-semibold text-indigo-700 text-sm underline underline-offset-4 transition-colors hover:text-indigo-900"
          >
            {t("auth.forgot_password")}
          </Link>
        </div>

        <GradientButton type="submit" disabled={processing} className="w-full">
          {processing ? t("auth.logging_in") : t("auth.login")}
        </GradientButton>
      </form>
    </AuthPageShell>
  );
}

Login.layout = (page) => (
  <Layout
    children={page}
    titleKey="meta.login_title"
    descriptionKey="meta.login_description"
    canonical="/login"
  />
);

export default Login;
