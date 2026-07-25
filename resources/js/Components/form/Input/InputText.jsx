import React from "react";
import InputBase from "@/Components/form/Input/InputBase";
import {getInputFieldClasses, getDisabledClass} from "@/Components/form/Input/InputClasses";

function InputText({
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

  // Props [InputText]
  inputType = "text",
  inputMode,
  placeholder,
  onChange,
  onKeyDown,
  disabled,
  readOnly,
  minlength,
  maxlength,
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
      <input
        type={inputType}
        inputMode={inputMode}
        name={name}
        id={name}
        value={value ?? ""}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        minLength={minlength}
        maxLength={maxlength}
        className={`inputField-primary ${borderClass} ${disabledClass}`}
        style={{width: InputWidth }}
      />
    </InputBase>
  );
}

export default React.memo(InputText);
