import React from "react";
import InputBase from "@/Components/form/Input/InputBase";
import {
  getInputFieldClasses,
  getDisabledClass,
} from "@/Components/form/Input/InputClasses";

function TextArea({
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

  // Props [TextArea]
  placeholder,
  onChange,
  disabled,
  readOnly,

  minlength,
  maxlength,
  rows = 4,
  InputWidth = "100%",
}) {
  const borderClass = getInputFieldClasses({ error, required, value, isDirty });
  const disabledClass = getDisabledClass(disabled);

  return (
    <InputBase
      name={name}
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      isDirty={isDirty}
      onReset={onReset}
      value={value}
    >
      <textarea
        name={name}
        id={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        minLength={minlength}
        maxLength={maxlength}
        rows={rows}
        className={`inputField-primary ${borderClass} ${disabledClass}`}
        style={{width: InputWidth }}
      />
    </InputBase>
  );
}

export default React.memo(TextArea);
