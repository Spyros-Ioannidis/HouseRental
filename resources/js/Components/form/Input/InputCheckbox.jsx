import React, { useMemo, useCallback } from "react";
import InputBase from "@/Components/form/Input/InputBase";

/* ----------------------------------------
   SINGLE OPTION ITEM (ISOLATED RENDER)
---------------------------------------- */

const CheckboxItem = React.memo(function CheckboxItem({
  opt,
  name,
  isChecked,
  wasChecked,
  onToggle,
  disabled,
  itemClassName,
  readOnly,
}) {
  const inputId = `${name}-${opt.value}`;

  const isChanged = isChecked !== wasChecked;

  return (
    <div className="w-full">
      <input
        id={inputId}
        type="checkbox"
        checked={isChecked}
        onChange={(e) => onToggle(opt.value, e.target.checked)}
        disabled={disabled}
        readOnly={readOnly}
        className="hidden peer"
      />

      <label
        htmlFor={inputId}
        className={`flex h-full w-full items-center justify-between border rounded-md font-medium transition-all cursor-pointer bg-color-primary dark:hover:bg-gray-900 ${
          itemClassName || "p-2 text-sm"
        } ${
          isChanged
            ? `border-orange-500 focus:ring-orange-700
       hover:bg-orange-100 dark:hover:bg-orange-950
       peer-checked:border-orange-500
       peer-checked:bg-orange-200 dark:peer-checked:bg-orange-950
       peer-checked:ring-1
       peer-checked:ring-orange-500
       peer-checked:hover:bg-orange-200 dark:peer-checked:hover:bg-orange-900
       peer-checked:hover:border-orange-600`
            : `border-indigo-500 focus:ring-indigo-700
       hover:bg-indigo-100 dark:hover:bg-indigo-950
       peer-checked:border-indigo-500
       peer-checked:bg-indigo-200 dark:peer-checked:bg-indigo-950
       peer-checked:ring-1
       peer-checked:ring-indigo-500
       peer-checked:hover:bg-indigo-200 dark:peer-checked:hover:bg-indigo-900
       peer-checked:hover:border-indigo-600`
        }`}
      >
        <span>{opt.label}</span>
      </label>
    </div>
  );
});

/* ----------------------------------------
   MAIN COMPONENT
---------------------------------------- */

function InputCheckbox({
  name,
  label,
  value = [],
  original = [],
  error = "",
  helperText = "",
  isDirty = false,
  onReset,
  onChange,
  options = [],
  itemClassName = "",
  optionsClassName = "grid auto-rows-fr grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4",
  showLabel = true,
  trackChanges = true,
  disabled,
  readOnly,
}) {
  /* ----------------------------------------
     NORMALIZE VALUES (MEMOIZED)
  ---------------------------------------- */
  const safeValue = useMemo(() => (Array.isArray(value) ? value : []), [value]);

  const safeOriginal = useMemo(
    () => (Array.isArray(original) ? original : []),
    [original],
  );

  /* ----------------------------------------
     STABLE TOGGLE HANDLER
  ---------------------------------------- */
  const handleToggle = useCallback(
    (optionValue, checked) => {
      if (!onChange) return;

      const newValue = checked
        ? [...safeValue, optionValue]
        : safeValue.filter((v) => v !== optionValue);

      onChange(newValue);
    },
    [onChange, safeValue],
  );

  /* ----------------------------------------
     RENDER
  ---------------------------------------- */

  return (
    <InputBase
      name={name}
      label={label}
      error={error}
      helperText={helperText}
      isDirty={isDirty}
      onReset={onReset}
      showLabel={showLabel}
      value={value}
    >
      <div className={optionsClassName}>
        {options.map((opt) => {
          const isChecked = safeValue.includes(opt.value);
          const wasChecked = trackChanges
            ? safeOriginal.includes(opt.value)
            : isChecked;

          return (
            <CheckboxItem
              key={opt.value}
              opt={opt}
              name={name}
              isChecked={isChecked}
              wasChecked={wasChecked}
              onToggle={handleToggle}
              disabled={disabled}
              itemClassName={itemClassName}
              readOnly={readOnly}
            />
          );
        })}
      </div>
    </InputBase>
  );
}

export default React.memo(InputCheckbox);
