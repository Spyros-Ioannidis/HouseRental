import ErrorPage from "@/Components/Errors/ErrorPage";
import Layout from "@/Layout/Layout";
import { useTranslation } from "@/i18n";

function PageNotFound() {
  const { t } = useTranslation();
  return (
    <ErrorPage
      statusCode={404}
      title={t("errors.404_title")}
      message={t("errors.404_message")}
      actionText={t("errors.browse_houses")}
      actionUrl="/houses"
    />
  );
}

PageNotFound.layout = (page) => (
  <Layout
    children={page}
    titleKey="errors.404_title"
    descriptionKey="errors.404_message"
    fullHeight
  />
);

export default PageNotFound;
