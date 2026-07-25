import React from "react";
import InputBase from "@/Components/form/Input/InputBase";
import {getInputFieldClasses, getDisabledClass} from "@/Components/form/Input/InputClasses";
import { useTranslation } from "@/i18n";

function InputSelect({
  // Props [InputBase]
  name,
  label,
  value,
  required = false,
  isDirty = false,
  onReset,
  error = "",
  helperText = "",
  className = "",

  // Props [InputSelect]
  options = [],
  placeholder,
  onChange,
  disabled,
  readOnly,
  InputWidth = "100%",
}) {
  const { t } = useTranslation();
  const borderClass = getInputFieldClasses({ error, required, value, isDirty });
  const disabledClass = getDisabledClass(disabled);

  return (
    <InputBase
      name={name}
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      className={className}
      isDirty={isDirty}
      onReset={onReset}
      value={value}
    >
      <select
        name={name}
        id={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className={`inputField-primary ${borderClass} ${disabledClass}`}
        style={{width: InputWidth }}
      >
        {(!required || placeholder) && (
          <option value="" disabled={required}>
            {placeholder ?? t("forms.select")}
          </option>
        )}

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </InputBase>
  );
}

export default React.memo(InputSelect);
