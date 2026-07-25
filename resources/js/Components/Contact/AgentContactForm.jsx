import { usePage } from "@inertiajs/react";
import axios from "axios";
import { useId, useState } from "react";
import { FiMail, FiPhone, FiSend } from "react-icons/fi";
import { route } from "@/ziggy";

import GradientButton from "@/Components/form/Button/GradientButton";
import { addToast } from "@/Components/Other/Toast";
import { useTranslation } from "@/i18n";
import InputBasic from "@/Components/form/Input/InputBasic";
import TextAreaBasic from "@/Components/form/Input/TextAreaBasic";

function AgentContactForm({
  agent,
  house = null,
  title = null,
  body = null,
}) {
  const { props } = usePage();
  const { t, locale } = useTranslation();
  const titleId = useId();
  const authUser = props.auth?.user;
  const agentName = agent?.name ?? t("forms.contact.agent_fallback");
  const subject = house?.title
    ? t("forms.contact.subject_listing", { title: house.title })
    : t("forms.contact.subject_agent", { agent: agentName });

  const [data, setData] = useState({
    name: authUser?.name ?? "",
    email: authUser?.email ?? "",
    phone: authUser?.contact_phone ?? "",
    subject,
    message: "",
    agent_id: agent?.id ?? null,
    house_id: house?.id ?? null,
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const updateField = (field, value) => {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
    setErrors((current) => {
      if (!current[field]) return current;

      const nextErrors = { ...current };
      delete nextErrors[field];

      return nextErrors;
    });
  };

  const submit = async (event) => {
    event.preventDefault();

    setProcessing(true);
    setErrors({});

    try {
      const response = await axios.post(route("contact.store", { locale }), data, {
        headers: {
          Accept: "application/json",
        },
      });

      setData((current) => ({
        ...current,
        message: "",
      }));
      addToast(response.data?.message ?? t("forms.contact.sent"), "success");
    } catch (error) {
      const response = error.response;

      if (response?.status === 422) {
        const nextErrors = Object.fromEntries(
          Object.entries(response.data?.errors ?? {}).map(([field, messages]) => [
            field,
            Array.isArray(messages) ? messages[0] : messages,
          ]),
        );

        setErrors(nextErrors);
        addToast(response.data?.message ?? t("forms.contact.validation_error"), "failure");
      } else if (response?.status === 429) {
        addToast(t("forms.contact.rate_limited"), "failure");
      } else {
        addToast(response?.data?.message ?? t("forms.contact.send_error"), "failure");
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      aria-labelledby={titleId}
      className="p-5 border border-color-card rounded-lg bg-color-card shadow-sm"
    >
      <div>
        <h2 id={titleId} className="font-semibold text-color-primary text-lg">
          {title ?? t("forms.contact.default_title")}
        </h2>
      </div>

      <div className="mt-5 grid gap-4">
        <InputBasic
          name="name"
          label={t("forms.contact.name")}
          value={data.name}
          onChange={(event) => updateField("name", event.target.value)}
          error={errors.name}
          placeholder={t("forms.contact.your_name")}
          required
        />
        <InputBasic
          name="email"
          label={t("forms.contact.email")}
          value={data.email}
          onChange={(event) => updateField("email", event.target.value)}
          error={errors.email}
          inputMode="email"
          placeholder="name@example.com"
          required
        />
        <InputBasic
          name="phone"
          label={t("forms.contact.phone")}
          value={data.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          error={errors.phone}
          inputMode="tel"
          placeholder="+30 210 000 0000"
        />
        <InputBasic
          name="subject"
          label={t("forms.contact.subject")}
          value={data.subject}
          onChange={(event) => updateField("subject", event.target.value)}
          error={errors.subject}
          placeholder={t("forms.contact.agent_help")}
          required
        />
        <TextAreaBasic
          name="message"
          label={t("forms.contact.message")}
          value={data.message}
          onChange={(event) => updateField("message", event.target.value)}
          error={errors.message}
          placeholder={t("forms.contact.details")}
          rows={5}
          required
        />
      </div>

      {(errors.agent_id || errors.house_id) && (
        <p className="mt-4 font-semibold text-red-600 text-sm">
          {errors.agent_id || errors.house_id}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <GradientButton type="submit" disabled={processing}>
          <span className="inline-flex items-center gap-2">
            <FiSend aria-hidden="true" />
            {processing ? t("forms.contact.sending") : t("forms.contact.send_to_agent")}
          </span>
        </GradientButton>
      </div>
    </form>
  );
}

export default AgentContactForm;
