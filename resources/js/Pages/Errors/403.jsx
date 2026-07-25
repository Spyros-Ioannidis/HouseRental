import ErrorPage from "@/Components/Errors/ErrorPage";
import Layout from "@/Layout/Layout";
import { useTranslation } from "@/i18n";

function Forbidden() {
  const { t } = useTranslation();
  return (
    <ErrorPage
      statusCode={403}
      title={t("errors.403_title")}
      message={t("errors.403_message")}
      actionText={t("errors.return_home")}
      actionUrl="/"
    />
  );
}

Forbidden.layout = (page) => (
  <Layout
    children={page}
    titleKey="errors.403_title"
    descriptionKey="errors.403_message"
    fullHeight
  />
);

export default Forbidden;
