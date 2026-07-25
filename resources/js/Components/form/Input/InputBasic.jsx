import React from "react";

function InputBasic({
  label,
  name,
  type = "text",
  value,
  onChange,
  error = "",
  placeholder = "",
  autoComplete,
  required = false,
  icon: Icon,
  hint = "",
  inputProps = {},
  className ="",
}) {
  const describedBy = error
    ? `${name}-error`
    : hint
      ? `${name}-hint`
      : undefined;

  return (
    <div className={`flex flex-col ${className}`}>
      {label &&(<label htmlFor={name} className="mb-1 font-semibold text-color-primary">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>)}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 h-5 w-5 text-indigo-900 -translate-y-1/2 transform" />
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`inputField-primary inputField-style-primary w-full ${
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

export default React.memo(InputBasic);
