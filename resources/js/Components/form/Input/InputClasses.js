export function isEmptyInputValue(value) {
    return value === "" || value == null;
}

export function getInputFieldClasses({ error, required, value, isDirty }) {
    const hasError = error || (required && isEmptyInputValue(value));

    if (hasError)
        return "inputField-style-error";
    if (isDirty)
        return "inputField-style-isDirty";

    return "inputField-style-primary";
}

export function getDisabledClass(disabled) {
    return disabled ? "inputField-disabled" : "";
}
