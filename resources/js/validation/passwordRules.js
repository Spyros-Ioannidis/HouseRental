export const PASSWORD_RULE_DESCRIPTION =
  "Use at least 8 characters with at least one letter, one number, and one special character.";

export const PASSWORD_PATTERN =
  "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,255}$";

export const PASSWORD_REQUIREMENTS = [
  {
    text: "Minimum number of characters is 8.",
    type: "length",
  },
  {
    text: "Should contain at least one letter.",
    type: "letter",
  },
  {
    text: "Should contain at least one number.",
    type: "number",
  },
  {
    text: "Should contain at least one special character.",
    type: "symbol",
  },
];

export function getPasswordSignal(value = "") {
  const password = value || "";

  return {
    length: password.length >= 8,
    letter: /[A-Za-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

export function validateStrongPassword(value) {
  if (!value) {
    return "";
  }

  const password = String(value);

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (password.length > 255) {
    return "Password must be at most 255 characters.";
  }

  if (!/[A-Za-z]/.test(password)) {
    return "Password must contain at least one letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one special character.";
  }

  return "";
}
