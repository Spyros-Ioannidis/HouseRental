import ErrorPage from "@/Components/Errors/ErrorPage";
import Layout from "@/Layout/Layout";
import { useTranslation } from "@/i18n";

function PageExpired() {
  const { t } = useTranslation();
  return (
    <ErrorPage
      statusCode={419}
      title={t("errors.419_title")}
      message={t("errors.419_message")}
      actionText={t("errors.sign_in_again")}
      actionUrl="/login"
    />
  );
}

PageExpired.layout = (page) => (
  <Layout
    children={page}
    titleKey="errors.419_title"
    descriptionKey="errors.419_message"
    fullHeight
  />
);

export default PageExpired;
