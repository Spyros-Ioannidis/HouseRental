import { FiUsers } from "react-icons/fi";
import { useTranslation } from "@/i18n";

const DEMO_CREDENTIALS = [
  {
    role: "Admin",
    email: "admin@example.com",
    password: "Admin#123",
  },
  {
    role: "Agent",
    email: "agent@example.com",
    password: "Agent#123",
  },
  {
    role: "User",
    email: "user@example.com",
    password: "User#123",
  },
];

function DemoCredentialsDropdown({ onSelect }) {
  const { t } = useTranslation();
  const handleChange = (event) => {
    const account = DEMO_CREDENTIALS.find(
      (credential) => credential.email === event.target.value,
    );

    if (account) {
      onSelect(account);
    }
  };

  return (
    <label className="block space-y-2 p-4 border border-color-card rounded-xl bg-color-card">
      <span className="flex items-center gap-2 font-semibold text-icolor-primary text-sm">
        <FiUsers className="h-4 w-4" />
        {t("auth.demo_credentials")}
      </span>
      <select
        defaultValue=""
        onChange={handleChange}
        className="w-full px-4 py-3 border border-color-card outline-none rounded-xl bg-color-card font-medium text-sm transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
      >
        <option value="" disabled>
          {t("auth.choose_demo")}
        </option>
        {DEMO_CREDENTIALS.map((credential) => (
          <option key={credential.email} value={credential.email}>
            {t(`auth.${credential.role.toLowerCase()}`)} - {credential.email}
          </option>
        ))}
      </select>
    </label>
  );
}

export default DemoCredentialsDropdown;
