export function validateField(value, rule = {}, values = {}) {
  const {
    type,
    required,
    min,
    max,
    minlength,
    maxlength,
    validate,
  } = rule;

  // REQUIRED
  if (required && (value === "" || value == null)) {
    return "This field is required";
  }

  if (typeof validate === "function") {
    const customError = validate(value, rule, values);
    if (customError) return customError;
  }

  // EMPTY optional field
  if (!required && (value === "" || value == null)) {
    // return "empty";
    return "";
  }

  // TYPE CHECK
  if (type === "number") {
    const num = Number(value);
    // const num = value;
    if (typeof num !== "number" || Number.isNaN(num)) {
      return "Must be a number";
    }

    if (min != null && num < min) return `Value must be more than ${min}`;
    if (max != null && num > max) return `Value must be less than ${max}`;

    return "";
  }

  if (type === "string") {
    if (typeof value !== "string") {
      return "Must be a string";
    }

    if (minlength != null && value.length < minlength) {
      return `Must be at least ${minlength} characters`;
    }

    if (maxlength != null && value.length > maxlength) {
      return `Must be at most ${maxlength} characters`;
    }
  }

  if (type === "boolean" && typeof value !== "boolean") {
    return "Must be true or false";
  }

  return "";
}



export function validateForm(values, schema) {
  const errors = {};
  let isValid = true;

  for (const key in schema) {
    const error = validateField(values[key], schema[key], values);

    errors[key] = error;

    if (error) isValid = false;
  }

  return { errors, isValid };
}
