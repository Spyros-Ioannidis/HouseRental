import { useEffect, useMemo, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { FiArrowLeft, FiPlus } from "react-icons/fi";

import LayoutAdminDashboard from "@/Layout/LayoutAdminDashboard";
import ButtonBasic from "@/Components/form/Button/ButtonBasic";
import useOptimizedForm from "@/Pages/Admin/Other/forms/useOptimizedForm";
import { useTranslation } from "@/i18n";
import {
  emptyUserForm,
  FieldError,
  UserFormFields,
  userFormSchema,
} from "./components/UserForm";
import { notifyFormErrors } from "./components/userFormFeedback";

function UserCreate({ roles = [], userRoutes = {} }) {
  const { t } = useTranslation();
  const schema = useMemo(() => userFormSchema({ passwordRequired: true }), []);
  const form = useOptimizedForm(schema, emptyUserForm);
  const [processing, setProcessing] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  useEffect(() => {
    if (Object.keys(serverErrors).length > 0) {
      setServerErrors({});
    }
  }, [form.values]);

  const submit = (event) => {
    event.preventDefault();

    if (!userRoutes.store) {
      return;
    }

    if (!form.isValid) {
      notifyFormErrors(form.errors, schema);
      return;
    }

    setServerErrors({});

    router.post(userRoutes.store, form.values, {
      preserveScroll: true,
      onStart: () => setProcessing(true),
      onError: setServerErrors,
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">
            Add User
          </h1>
        </div>

        <Link href={userRoutes.index || "#"}>
          <ButtonBasic variant="GrayOutline" className="inline-flex items-center gap-2">
            <FiArrowLeft />
            {t("actions.back")}
          </ButtonBasic>
        </Link>
      </header>

      <section className="p-5 border border-gray-200 rounded-lg bg-color-card shadow-sm dark:border-gray-800">
        <form onSubmit={submit} className="space-y-5">
          <UserFormFields
            form={form}
            roles={roles}
            passwordRequired
            serverErrors={serverErrors}
          />
          <FieldError message={serverErrors.user} />

          <div className="flex justify-end gap-2">
            <Link href={userRoutes.index || "#"}>
              <ButtonBasic type="button" variant="GrayOutline">
                {t("actions.cancel")}
              </ButtonBasic>
            </Link>
            <ButtonBasic
              type="submit"
              variant="Blue"
              disabled={processing || !userRoutes.store || !form.isValid}
              className="inline-flex items-center gap-2"
            >
              <FiPlus />
              Add user
            </ButtonBasic>
          </div>
        </form>
      </section>
    </div>
  );
}

UserCreate.layout = (page) => (
  <LayoutAdminDashboard children={page} titleKey="admin.users" />
);

export default UserCreate;
