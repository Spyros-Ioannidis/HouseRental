import AuthPageShell from "@/Components/Auth/AuthPageShell";
import Layout from "@/Layout/Layout";
import GradientButton from "@/Components/form/Button/GradientButton";
import { Link, useForm } from "@inertiajs/react";
import { route } from "@/ziggy";
import { useTranslation } from "@/i18n";

function VerifyEmail({ status }) {
  const { t } = useTranslation();
  const { post, processing } = useForm({});

  const submit = (e) => {
    e.preventDefault();
    post(route("verification.send"));
  };

  return (
    <AuthPageShell
      title={t("auth.verify_title")}
      subtitle={t("auth.verify_subtitle")}
      switchText={t("auth.already_verified")}
      switchHref={route("login")}
      switchLabel={t("auth.back_to_login")}
    >
      <form onSubmit={submit} className="space-y-5">
        {status === "verification-link-sent" && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {t("auth.verification_sent")}
          </div>
        )}

        <div className="rounded-2xl border border-color-card bg-color-card px-4 py-4 text-sm leading-6">
          {t("auth.verification_prompt")}
        </div>

        <GradientButton type="submit" disabled={processing} className="w-full">
          {processing ? t("auth.sending") : t("auth.resend_verification")}
        </GradientButton>

        <div className="text-center">
          <Link
            href={route("logout")}
            method="post"
            as="button"
            className="font-semibold text-indigo-700 text-sm underline underline-offset-4 transition-colors hover:text-indigo-900"
          >
            {t("auth.logout")}
          </Link>
        </div>
      </form>
    </AuthPageShell>
  );
}

VerifyEmail.layout = (page) => (
  <Layout
    children={page}
    titleKey="meta.verify_email_title"
    descriptionKey="meta.verify_email_description"
    canonical="/verify-email"
  />
);

export default VerifyEmail;
