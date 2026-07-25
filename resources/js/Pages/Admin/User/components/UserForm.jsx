import { useTranslation } from "@/i18n";
import InputBase from "@/Components/form/Input/InputBase";
import InputSelect from "@/Components/form/Input/InputSelect";
import InputText from "@/Components/form/Input/InputText";
import {
  PASSWORD_RULE_DESCRIPTION,
  validateStrongPassword,
} from "@/validation/passwordRules";

export const emptyUserForm = {
  first_name: "",
  last_name: "",
  email: "",
  role: "user",
  contact_phone: "",
  contact_email: "",
  profile_picture: "",
  email_verified: true,
  password: "",
  password_confirmation: "",
};

const userFieldLabels = {
  first_name: "First name",
  last_name: "Last name",
  email: "Email",
  role: "Role",
  contact_phone: "Contact phone",
  contact_email: "Contact email",
  profile_picture: "Profile picture URL",
  email_verified: "Email verified",
  password: "Password",
  password_confirmation: "Confirm password",
};

function isBlank(value) {
  return typeof value !== "string" || value.trim() === "";
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function requiredTrimmed(value) {
  return isBlank(value) ? "This field is required" : "";
}

function optionalEmail(value) {
  return isBlank(value) || isEmail(value) ? "" : "Enter a valid email address";
}

export function userFormSchema({ passwordRequired = false } = {}) {
  return {
    first_name: {
      label: userFieldLabels.first_name,
      type: "string",
      required: true,
      maxlength: 120,
      validate: requiredTrimmed,
    },
    last_name: {
      label: userFieldLabels.last_name,
      type: "string",
      required: true,
      maxlength: 120,
      validate: requiredTrimmed,
    },
    email: {
      label: userFieldLabels.email,
      type: "string",
      required: true,
      maxlength: 255,
      validate: (value) => {
        if (requiredTrimmed(value)) {
          return "This field is required";
        }

        return isEmail(value) ? "" : "Enter a valid email address";
      },
    },
    role: {
      label: userFieldLabels.role,
      type: "string",
      required: true,
    },
    contact_phone: {
      label: userFieldLabels.contact_phone,
      type: "string",
      maxlength: 40,
    },
    contact_email: {
      label: userFieldLabels.contact_email,
      type: "string",
      maxlength: 255,
      validate: optionalEmail,
    },
    profile_picture: {
      label: userFieldLabels.profile_picture,
      type: "string",
      maxlength: 2048,
    },
    email_verified: {
      label: userFieldLabels.email_verified,
      type: "boolean",
      required: true,
    },
    password: {
      label: userFieldLabels.password,
      type: "string",
      required: passwordRequired,
      minlength: 8,
      maxlength: 255,
      validate: validateStrongPassword,
    },
    password_confirmation: {
      label: userFieldLabels.password_confirmation,
      type: "string",
      required: passwordRequired,
      minlength: passwordRequired ? 8 : undefined,
      maxlength: 255,
      validate: (value, _rule, values) => {
        if (!values.password && !value) {
          return "";
        }

        if (!value) {
          return "Please confirm the password";
        }

        return value === values.password ? "" : "Passwords do not match";
      },
    },
  };
}

export function userToForm(user) {
  if (!user) {
    return emptyUserForm;
  }

  return {
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    role: user.role || "user",
    contact_phone: user.contact_phone || "",
    contact_email: user.contact_email || "",
    profile_picture: user.profile_picture || "",
    email_verified: Boolean(user.email_verified_at),
    password: "",
    password_confirmation: "",
  };
}

export function FieldError({ message }) {
  return message ? (
    <p className="mt-1 font-medium text-red-600 text-xs">{message}</p>
  ) : null;
}

function TextField({
  form,
  serverErrors = {},
  name,
  label,
  inputType = "text",
  required = false,
  placeholder = "",
  helperText = "",
}) {
  const field = form.getFieldProps(name);
  const { type: _validationType, ...fieldProps } = field;

  return (
    <InputText
      {...fieldProps}
      label={label}
      inputType={inputType}
      placeholder={placeholder}
      required={field.required ?? required}
      error={serverErrors[name] || field.error}
      helperText={helperText}
    />
  );
}

function SelectField({
  form,
  serverErrors = {},
  name,
  label,
  options,
  disabled = false,
}) {
  const { t } = useTranslation();
  const field = form.getFieldProps(name);

  return (
    <InputSelect
      {...field}
      label={label}
      options={options}
      disabled={disabled}
      helperText={disabled ? t("admin.self_role_locked") : ""}
      error={serverErrors[name] || field.error}
    />
  );
}

function VerifiedField({ form, serverErrors = {} }) {
  const field = form.getFieldProps("email_verified");

  return (
    <InputBase
      name="email_verified"
      value={field.value}
      error={serverErrors.email_verified || field.error}
      isDirty={field.isDirty}
      onReset={field.onReset}
      showLabel={false}
    >
      <label className="inline-flex min-h-10 items-center gap-3 px-3 py-2 border border-gray-200 rounded-md font-semibold text-gray-700 text-sm dark:border-gray-800 dark:text-gray-200">
        <input
          type="checkbox"
          checked={Boolean(field.value)}
          onChange={(event) => field.onChange(event.target.checked)}
          className="h-4 w-4 border-gray-300 rounded text-blue-700"
        />
        {userFieldLabels.email_verified}
      </label>
    </InputBase>
  );
}

export function UserFormFields({
  form,
  roles,
  editingSelf = false,
  passwordRequired = false,
  showProfileUrl = true,
  serverErrors = {},
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        form={form}
        serverErrors={serverErrors}
        name="first_name"
        label={userFieldLabels.first_name}
        required
      />
      <TextField
        form={form}
        serverErrors={serverErrors}
        name="last_name"
        label={userFieldLabels.last_name}
        required
      />
      <TextField
        form={form}
        serverErrors={serverErrors}
        name="email"
        label={userFieldLabels.email}
        inputType="email"
        required
      />
      <SelectField
        form={form}
        serverErrors={serverErrors}
        name="role"
        label={userFieldLabels.role}
        options={roles}
        disabled={editingSelf}
      />
      <TextField
        form={form}
        serverErrors={serverErrors}
        name="contact_phone"
        label={userFieldLabels.contact_phone}
        inputType="tel"
      />
      <TextField
        form={form}
        serverErrors={serverErrors}
        name="contact_email"
        label={userFieldLabels.contact_email}
        inputType="email"
      />
      {showProfileUrl ? (
        <TextField
          form={form}
          serverErrors={serverErrors}
          name="profile_picture"
          label={userFieldLabels.profile_picture}
          placeholder="/storage/DefaultProfilePicture.jpg"
        />
      ) : null}
      <div className="flex items-end">
        <VerifiedField form={form} serverErrors={serverErrors} />
      </div>
      <TextField
        form={form}
        serverErrors={serverErrors}
        name="password"
        label={userFieldLabels.password}
        inputType="password"
        required={passwordRequired}
        placeholder={passwordRequired ? "" : "Leave blank to keep current password"}
        helperText={PASSWORD_RULE_DESCRIPTION}
      />
      <TextField
        form={form}
        serverErrors={serverErrors}
        name="password_confirmation"
        label={userFieldLabels.password_confirmation}
        inputType="password"
        required={passwordRequired}
      />
    </div>
  );
}
