import ErrorPage from "@/Components/Errors/ErrorPage";
import Layout from "@/Layout/Layout";
import { useTranslation } from "@/i18n";

function ServerError() {
  const { t } = useTranslation();
  return (
    <ErrorPage
      statusCode={500}
      title={t("errors.500_title")}
      message={t("errors.500_message")}
      actionText={t("errors.return_home")}
      actionUrl="/"
    />
  );
}

ServerError.layout = (page) => (
  <Layout
    children={page}
    titleKey="errors.500_title"
    descriptionKey="errors.500_message"
    fullHeight
  />
);

export default ServerError;
