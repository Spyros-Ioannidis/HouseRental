import ErrorPage from "@/Components/Errors/ErrorPage";
import Layout from "@/Layout/Layout";
import { useTranslation } from "@/i18n";

function ServiceUnavailable() {
  const { t } = useTranslation();
  return (
    <ErrorPage
      statusCode={503}
      title={t("errors.503_title")}
      message={t("errors.503_message")}
    />
  );
}

ServiceUnavailable.layout = (page) => (
  <Layout
    children={page}
    titleKey="errors.503_title"
    descriptionKey="errors.503_message"
    fullHeight
  />
);

export default ServiceUnavailable;
