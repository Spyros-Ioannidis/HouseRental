import InputBasic from "@/Components/form/Input/InputBasic";
import GradientButton from "@/Components/form/Button/GradientButton";
import { useForm } from "@inertiajs/react";
import { FiAtSign, FiPhone, FiUser } from "react-icons/fi";

import ProfilePictureEditor from "./components/ProfilePictureEditor";
import { namedRoute } from "./UserDashboardActions";
import UserDashboardLayout from "@/Layout/UserDashboardLayout";
import { useTranslation } from "@/i18n";

function Profile({ user }) {
  const { t } = useTranslation();
  const form = useForm({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    contact_phone: user?.contact_phone || "",
    contact_email: user?.contact_email || "",
  });

  const submit = (event) => {
    event.preventDefault();
    form.post(namedRoute("dashboard.profile.update"), { preserveScroll: true });
  };

  return (
    <div className="space-y-6">
      <ProfilePictureEditor user={user} />

      <form
        onSubmit={submit}
        className="space-y-6"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <InputBasic
            name="first_name"
            label={t("account.first_name")}
            value={form.data.first_name}
            onChange={(event) => form.setData("first_name", event.target.value)}
            error={form.errors.first_name}
            icon={FiUser}
            required
          />
          <InputBasic
            name="last_name"
            label={t("account.last_name")}
            value={form.data.last_name}
            onChange={(event) => form.setData("last_name", event.target.value)}
            error={form.errors.last_name}
            icon={FiUser}
            required
          />
          <InputBasic
            name="contact_phone"
            label={t("account.contact_phone")}
            value={form.data.contact_phone}
            onChange={(event) =>
              form.setData("contact_phone", event.target.value)
            }
            error={form.errors.contact_phone}
            icon={FiPhone}
            inputProps={{ inputMode: "tel" }}
          />
          <InputBasic
            name="contact_email"
            label={t("account.public_contact_email")}
            type="email"
            value={form.data.contact_email}
            onChange={(event) =>
              form.setData("contact_email", event.target.value)
            }
            error={form.errors.contact_email}
            icon={FiAtSign}
            className="sm:col-span-2"
          />
        </div>

        <GradientButton
          type="submit"
          disabled={form.processing}
          className="w-full sm:w-auto"
        >
          {form.processing ? t("actions.saving") : t("account.save_profile")}
        </GradientButton>
      </form>
    </div>
  );
}

Profile.layout = (page) => {
  return (
    <UserDashboardLayout
      activeSection="profile"
      user={page.props.user}
      title={page.props.translations?.account?.profile ?? "Profile"}
      description={page.props.translations?.account?.profile_description ?? ""}
    >
      {page}
    </UserDashboardLayout>
  );
};

export default Profile;
