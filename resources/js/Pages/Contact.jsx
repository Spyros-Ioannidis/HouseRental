import axios from "axios";
import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { route } from "@/ziggy";

import GradientButton from "@/Components/form/Button/GradientButton";
import Layout from "@/Layout/Layout";
import { useTranslation } from "@/i18n";
import InputBasic from "@/Components/form/Input/InputBasic";
import TextAreaBasic from "@/Components/form/Input/TextAreaBasic";
import { addToast } from "@/Components/Other/Toast";

const DEFAULT_CONTACT_SETTINGS = {
  email: "-",
  phone: "-",
  office: "-",
};

function Contact({ contactSettings = {} }) {
  const { t, locale } = useTranslation();
  const { data, setData, errors, reset, setError, clearErrors } = useForm({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resolvedContactSettings = {
    ...DEFAULT_CONTACT_SETTINGS,
    ...contactSettings,
  };
  const contactDetails = [
    {
      label: t("pages.contact.email"),
      value: resolvedContactSettings.email,
      icon: FiMail,
    },
    {
      label: t("pages.contact.phone"),
      value: resolvedContactSettings.phone,
      icon: FiPhone,
    },
    {
      label: t("pages.contact.office"),
      value: resolvedContactSettings.office,
      icon: FiMapPin,
    },
  ];

  const submit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    clearErrors();

    try {
      const response = await axios.post(route("contact.store", { locale }), data, {
        headers: { Accept: "application/json" },
      });

      reset();
      addToast(response.data?.message ?? t("flash.message_sent"), "success");
    } catch (error) {
      const response = error.response;

      if (response?.status === 422) {
        Object.entries(response.data?.errors ?? {}).forEach(([field, messages]) => {
          setError(field, Array.isArray(messages) ? messages[0] : messages);
        });
      } else if (response?.status === 429) {
        addToast(t("flash.contact_rate_limited"), "failure");
      } else {
        addToast(t("flash.contact_send_failed"), "failure");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-color-primary text-color-primary">
      <section aria-labelledby="contact-title" className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1
            id="contact-title"
            className="mt-3 max-w-3xl font-bold text-4xl tracking-tight sm:text-5xl"
          >
            {t("pages.contact.title")}
          </h1>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8">
        <form
          onSubmit={submit}
          aria-label={t("pages.contact.form_label")}
          className="p-6 border border-color-card rounded-lg shadow-sm"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <InputBasic
              name="name"
              label={t("forms.contact.name")}
              placeholder={t("forms.contact.your_name")}
              value={data.name}
              onChange={(event) => setData("name", event.target.value)}
              error={errors.name}
              required
            />
            <InputBasic
              name="email"
              label={t("forms.contact.email")}
              inputMode="email"
              placeholder={t("pages.contact.email_placeholder")}
              value={data.email}
              onChange={(event) => setData("email", event.target.value)}
              error={errors.email}
              required
            />
            <InputBasic
              name="phone"
              label={t("forms.contact.phone")}
              inputMode="tel"
              placeholder={t("pages.contact.phone_placeholder")}
              value={data.phone}
              onChange={(event) => setData("phone", event.target.value)}
              error={errors.phone}
            />
            <InputBasic
              name="subject"
              label={t("forms.contact.subject")}
              placeholder={t("pages.contact.subject_placeholder")}
              value={data.subject}
              onChange={(event) => setData("subject", event.target.value)}
              error={errors.subject}
              required
            />
          </div>

          <div className="mt-5">
            <TextAreaBasic
              name="message"
              label={t("forms.contact.message")}
              placeholder={t("forms.contact.details")}
              rows={7}
              value={data.message}
              onChange={(event) => setData("message", event.target.value)}
              error={errors.message}
              required
            />
          </div>

          <div className="mt-6">
            <GradientButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("actions.sending") : t("actions.send_message")}
            </GradientButton>
          </div>
        </form>

        <aside
          aria-labelledby="contact-information-title"
          className="p-6 border border-color-card rounded-lg bg-color-card shadow-sm"
        >
          <h2 id="contact-information-title" className="font-semibold text-xl">
            {t("pages.contact.information")}
          </h2>
          <div className="mt-6 space-y-5">
            {contactDetails.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-indigo-700">
                    <Icon aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-sm tracking-wide uppercase">
                      {item.label}
                    </p>
                    <p className="mt-1 font-semibold text-lg">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

Contact.layout = (page) => (
  <Layout
    children={page}
    titleKey="meta.contact_title"
    descriptionKey="meta.contact_description"
    canonical="/contact"
  />
);

export default Contact;
