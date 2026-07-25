import React from "react";

function TextAreaBasic({
  label,
  name,
  value,
  onChange,
  error = "",
  placeholder = "",
  autoComplete,
  required = false,
  icon: Icon,
  hint = "",
  rows = 4,
  inputProps = {},
  className = "",
}) {
  const describedBy = error
    ? `${name}-error`
    : hint
      ? `${name}-hint`
      : undefined;

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={name} className="mb-1 font-semibold text-color-primary">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-4 h-5 w-5 text-indigo-900" />
        )}

        <textarea
          id={name}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`inputField-primary inputField-style-primary w-full resize-y ${
            Icon ? "!pl-12" : ""
          } ${error ? "border-red-500" : ""}`}
          {...inputProps}
        />
      </div>

      {hint && !error && (
        <p id={`${name}-hint`} className="mt-1 text-gray-500 text-sm">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${name}-error`} className="mt-1 text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

export default React.memo(TextAreaBasic);
