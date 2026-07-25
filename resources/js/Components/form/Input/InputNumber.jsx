import React from "react";
import InputBase from "@/Components/form/Input/InputBase";
import {getInputFieldClasses, getDisabledClass} from "@/Components/form/Input/InputClasses";

function InputNumber({
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
  placeholder,
  onChange,
  disabled,
  readOnly,

  min,
  max,
  step = "any",
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
      // error={valueError}
      helperText={helperText}
      isDirty={isDirty}
      onReset={onReset}
      value={value}
    >
      <input
        type="text"
        inputMode="numeric"
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
        className={`inputField-primary ${borderClass} ${disabledClass}`}
        style={{width: InputWidth }}
      />
    </InputBase>
  );
}

export default React.memo(InputNumber);
