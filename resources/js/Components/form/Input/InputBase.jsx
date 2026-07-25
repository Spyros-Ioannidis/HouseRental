import React from "react";
import InputReset from "@/Components/form/InputReset";
import { useTranslation } from "@/i18n";
import { isEmptyInputValue } from "@/Components/form/Input/InputClasses";

function InputBase({
  name,
  label,
  value,
  required = false,
  isDirty = false,
  onReset,
  error = "",
  helperText = "",
  className = "",
  showLabel = true,

  children,
}) {
  const { t } = useTranslation();
  const isEmptyRequiredError = required && isEmptyInputValue(value);

  return (
    <div className={`flex flex-col ${className}`}>
      {showLabel && (
        <label htmlFor={name} className="mb-1 font-semibold text-color-primary">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input + Reset */}
      <div className="flex items-center gap-2">
        {children}

        {onReset && (
          <div className="flex w-6 items-center justify-center">
            <div className={isDirty ? "opacity-100" : "opacity-0 pointer-events-none"}>
              <InputReset onClick={onReset} />
            </div>
          </div>
        )}
      </div>

      {/* Helper */}
      {helperText && !error && !isEmptyRequiredError && (
        <p className="mt-1 text-gray-500 text-sm">{helperText}</p>
      )}

      {/* Error */}
      {(error || isEmptyRequiredError) && (
        <p className="mt-1 text-red-500 text-sm">
          {error || t("forms.required")}
        </p>
      )}
    </div>
  );
}

export default React.memo(InputBase);
