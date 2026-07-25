import { useEffect, useMemo, useState } from "react";
import { Link, router, useForm, usePage } from "@inertiajs/react";
import { route } from "@/ziggy";
import { FiArrowLeft, FiSave, FiTrash2 } from "react-icons/fi";

import LayoutAdminDashboard from "@/Layout/LayoutAdminDashboard";
import DeleteConfirmationModal from "@/Components/ImageCarouselManager/DeleteConfirmationModal";
import ButtonBasic from "@/Components/form/Button/ButtonBasic";
import { addToast } from "@/Components/Other/Toast";
import useOptimizedForm from "@/Pages/Admin/Other/forms/useOptimizedForm";
import ProfilePictureEditor from "@/Pages/User/Dashboard/components/ProfilePictureEditor";
import { useTranslation } from "@/i18n";
import {
  FieldError,
  UserFormFields,
  userFormSchema,
  userToForm,
} from "./components/UserForm";
import { notifyFormErrors } from "./components/userFormFeedback";

function hasDirtyFields(dirtyFields) {
  return Object.values(dirtyFields).some(Boolean);
}

function editablePayload(values, managedUser, editingSelf) {
  const { profile_picture: _profilePicture, ...payload } = values;

  return editingSelf
    ? { ...payload, role: managedUser.role }
    : payload;
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="font-semibold text-gray-500 text-xs uppercase">{label}</dt>
      <dd className="mt-1 font-semibold text-gray-900 text-sm dark:text-gray-100">
        {value}
      </dd>
    </div>
  );
}

function DangerZone({ user }) {
  const { t } = useTranslation();
  const form = useForm({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const listingCount = Number(user?.houses_count || 0);
  const deleteConfirmation = deleteModalOpen
    ? {
        title: t("actions.delete_user"),
        message: t("flash.user_delete_confirm", {
          name: user?.name || user?.email,
        }),
        confirmLabel: t("actions.delete_user"),
      }
    : null;

  const destroy = () => {
    if (!user?.can_delete || !user?.routes?.destroy) {
      return;
    }

    form.delete(user.routes.destroy, {
      preserveScroll: true,
      onFinish: () => setDeleteModalOpen(false),
    });
  };

  return (
    <section className="p-5 border border-red-200 rounded-lg bg-color-card shadow-sm dark:border-red-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-semibold text-lg text-red-700 dark:text-red-300">
            Delete user
          </h2>
          <p className="mt-1 text-gray-600 text-sm dark:text-gray-300">
            This removes the account
            {listingCount > 0
              ? ` and ${listingCount} listing${listingCount === 1 ? "" : "s"} owned by it`
              : ""}
            .
          </p>
          {!user?.can_delete ? (
            <p className="mt-2 font-medium text-gray-500 text-sm">
              This account cannot be deleted from here.
            </p>
          ) : null}
          <FieldError message={form.errors.user} />
        </div>

        <div className="lg:min-w-80 lg:text-right">
          <ButtonBasic
            type="button"
            variant="Red"
            disabled={form.processing || !user?.can_delete}
            className="inline-flex items-center gap-2"
            onClick={() => setDeleteModalOpen(true)}
          >
            <FiTrash2 />
            {t("actions.delete")}
          </ButtonBasic>
        </div>
      </div>

      <DeleteConfirmationModal
        confirmation={deleteConfirmation}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={destroy}
      />
    </section>
  );
}

function UserEdit({ managedUser, roles = [], userRoutes = {} }) {
  const { t } = useTranslation();
  const { props } = usePage();
  const schema = useMemo(() => userFormSchema(), []);
  const form = useOptimizedForm(schema, userToForm(managedUser));
  const editingSelf = Number(managedUser?.id) === Number(props.auth?.user?.id);
  const [processing, setProcessing] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const isDirty = hasDirtyFields(form.dirtyFields);

  useEffect(() => {
    if (Object.keys(serverErrors).length > 0) {
      setServerErrors({});
    }
  }, [form.values]);

  const submit = (event) => {
    event.preventDefault();

    if (!managedUser?.routes?.update) {
      return;
    }

    if (!form.isValid) {
      notifyFormErrors(form.errors, schema);
      return;
    }

    if (!isDirty) {
      addToast(t("forms.house.no_changes"), "neutral");
      return;
    }

    setServerErrors({});

    router.put(managedUser.routes.update, editablePayload(form.values, managedUser, editingSelf), {
      preserveScroll: true,
      onStart: () => setProcessing(true),
      onError: setServerErrors,
      onSuccess: (page) => {
        form.syncWithServer(
          page.props.managedUser
            ? userToForm(page.props.managedUser)
            : {
                ...form.values,
                role: editingSelf ? managedUser.role : form.values.role,
                password: "",
                password_confirmation: "",
              },
        );
      },
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl text-gray-950 dark:text-gray-100">
            Edit User
          </h1>
          <p className="mt-1 text-gray-500 text-sm">
            {managedUser?.name || managedUser?.email}
          </p>
        </div>

        <Link href={userRoutes.index || "#"}>
          <ButtonBasic variant="GrayOutline" className="inline-flex items-center gap-2">
            <FiArrowLeft />
            {t("actions.back")}
          </ButtonBasic>
        </Link>
      </header>

      <ProfilePictureEditor
        user={managedUser}
        updateUrl={managedUser?.routes?.profile_picture_update}
        heading="Edit profile picture"
        description="Upload and crop the avatar used for this account."
        cropInModal={true}
      />

      <section className="p-5 border border-gray-200 rounded-lg bg-color-card shadow-sm dark:border-gray-800">
        <form onSubmit={submit} className="space-y-5">
          <UserFormFields
            form={form}
            roles={roles}
            editingSelf={editingSelf}
            showProfileUrl={false}
            serverErrors={serverErrors}
          />
          <FieldError message={serverErrors.user} />

          <div className="flex justify-end gap-2">
            <ButtonBasic
              type="button"
              variant="GrayOutline"
              onClick={() => router.visit(userRoutes.index || route("admin.users"))}
            >
              {t("actions.cancel")}
            </ButtonBasic>
            <ButtonBasic
              type="submit"
              variant="Blue"
              disabled={processing || !managedUser?.routes?.update || !isDirty || !form.isValid}
              className="inline-flex items-center gap-2"
            >
              <FiSave />
              {t("actions.save")}
            </ButtonBasic>
          </div>
        </form>
      </section>

      <section className="p-5 border border-gray-200 rounded-lg bg-color-card shadow-sm dark:border-gray-800">
        <h2 className="font-semibold text-gray-950 text-lg dark:text-gray-100">
          Account details
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="User ID" value={managedUser?.id} />
          <Detail label="Houses" value={managedUser?.houses_count ?? 0} />
          <Detail label="Favorites" value={managedUser?.favorite_houses_count ?? 0} />
          <Detail label="Contact messages" value={managedUser?.contact_messages_count ?? 0} />
        </dl>
      </section>

    </div>
  );
}

UserEdit.layout = (page) => (
  <LayoutAdminDashboard children={page} titleKey="admin.users" />
);

export default UserEdit;
