import React, { useMemo, useState } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { MdDone } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";

import {
  PASSWORD_PATTERN,
  PASSWORD_REQUIREMENTS,
  PASSWORD_RULE_DESCRIPTION,
  getPasswordSignal,
} from "@/validation/passwordRules";

function PasswordInput({
  name = "password",
  label = "Password",
  value,
  onChange,
  error = "",
  placeholder = "Password",
  autoComplete,
  required = false,
  showRules = false,
  className = "",
}) {
  const [isEyeOpen, setIsEyeOpen] = useState(false);

  const signal = useMemo(() => getPasswordSignal(value), [value]);

  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={name} className="font-semibold">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          type={isEyeOpen ? "text" : "password"}
          name={name}
          id={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          pattern={showRules ? PASSWORD_PATTERN : undefined}
          title={showRules ? PASSWORD_RULE_DESCRIPTION : undefined}
          maxLength={showRules ? 255 : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`inputField-primary w-full !pr-12 ${
            error ? "inputField-style-error" : "inputField-style-primary"
          }`}
        />

        <button
          type="button"
          onClick={() => setIsEyeOpen((open) => !open)}
          className="absolute right-4 top-1/2 flex h-5 w-5 items-center justify-center text-[#777777] text-[1.5rem] -translate-y-1/2 cursor-pointer transform"
          aria-label={isEyeOpen ? "Hide password" : "Show password"}
        >
          {isEyeOpen ? <IoEyeOutline /> : <IoEyeOffOutline />}
        </button>
      </div>

      {showRules && (
        <>

          <div className="ml-2 mt-1 flex w-full gap-[6px] flex-col">
            {PASSWORD_REQUIREMENTS.map((hint) => (
              <div
                key={hint.type}
                className={`flex items-center gap-[8px] text-[0.8rem] ${
                  signal[hint.type] ? "text-green-500" : "text-red-500"
                }`}
              >
                {signal[hint.type] ? (
                  <MdDone className="text-[1rem]" />
                ) : (
                  <RxCross1 />
                )}
                {hint.text}
              </div>
            ))}
          </div>
        </>
      )}

      {error && (
        <p
          id={`${name}-error`}
          className="mt-1 font-medium text-red-600 text-sm"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default React.memo(PasswordInput);
