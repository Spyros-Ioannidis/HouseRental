import React, { useEffect, useMemo, useState } from "react";
import { HiOutlineChevronDown, HiOutlineMagnifyingGlass } from "react-icons/hi2";

import InputBase from "@/Components/form/Input/InputBase";
import {
  getDisabledClass,
  getInputFieldClasses,
} from "@/Components/form/Input/InputClasses";
import { useTranslation } from "@/i18n";

function optionMatches(option, query) {
  const text = `${option.label ?? ""} ${option.value ?? ""}`.toLowerCase();

  return text.includes(query.toLowerCase());
}

function InputSelectSearch({
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

  // Props [InputSelectSearch]
  options = [],
  placeholder,
  noOptionsLabel,
  onChange,
  disabled = false,
  readOnly = false,
  InputWidth = "100%",
  maxVisibleOptions = 10,
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const borderClass = getInputFieldClasses({ error, required, value, isDirty });
  const disabledClass = getDisabledClass(disabled);
  const listboxId = `${name}-listbox`;

  const selectedOption = useMemo(
    () => options.find((option) => String(option.value) === String(value)),
    [options, value],
  );

  const visibleOptions = useMemo(() => {
    const normalizedQuery = query.trim();
    const selectedLabel = String(selectedOption?.label ?? "").trim();
    const shouldShowAllOptions =
      selectedOption && normalizedQuery === selectedLabel;
    const matchedOptions = normalizedQuery && !shouldShowAllOptions
      ? options.filter((option) => optionMatches(option, normalizedQuery))
      : options;

    return matchedOptions.slice(0, Math.max(1, maxVisibleOptions));
  }, [maxVisibleOptions, options, query, selectedOption]);

  useEffect(() => {
    if (!isOpen) {
      setQuery(selectedOption?.label ?? "");
    }
  }, [isOpen, selectedOption?.label]);

  useEffect(() => {
    const selectedIndex = visibleOptions.findIndex(
      (option) => String(option.value) === String(value),
    );

    setActiveIndex(
      selectedIndex >= 0 ? selectedIndex : visibleOptions.length > 0 ? 0 : -1,
    );
  }, [value, visibleOptions]);

  const emitChange = (nextValue) => {
    onChange?.({
      target: {
        name,
        value: nextValue,
      },
      currentTarget: {
        name,
        value: nextValue,
      },
    });
  };

  const handleInputChange = (event) => {
    const nextQuery = event.target.value;

    setQuery(nextQuery);
    setIsOpen(true);

    if (selectedOption && nextQuery !== selectedOption.label) {
      emitChange("");
    }
  };

  const handleSelect = (option) => {
    setQuery(option.label ?? "");
    setIsOpen(false);
    setActiveIndex(-1);
    emitChange(option.value);
  };

  const closeOptions = () => {
    setIsOpen(false);
    setActiveIndex(-1);
    setQuery(selectedOption?.label ?? "");
  };

  const handleKeyDown = (event) => {
    if (disabled || readOnly) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        visibleOptions.length === 0
          ? -1
          : current >= visibleOptions.length - 1
            ? 0
            : current + 1,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        visibleOptions.length === 0
          ? -1
          : current <= 0
            ? visibleOptions.length - 1
            : current - 1,
      );
    }

    if (event.key === "Enter" && isOpen && activeIndex >= 0) {
      event.preventDefault();
      handleSelect(visibleOptions[activeIndex]);
    }

    if (event.key === "Escape") {
      closeOptions();
    }
  };

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      closeOptions();
    }
  };

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
      <div className="relative" style={{ width: InputWidth }} onBlur={handleBlur}>
        <input type="hidden" name={name} value={value ?? ""} />
        <HiOutlineMagnifyingGlass
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 text-gray-400 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          type="search"
          id={name}
          value={query}
          onChange={handleInputChange}
          onFocus={() => !disabled && !readOnly && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t("forms.select")}
          disabled={disabled}
          readOnly={readOnly}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          className={`inputField-primary w-full !px-10 ${borderClass} ${disabledClass}`}
        />
        <HiOutlineChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 h-5 w-5 text-gray-400 transition-transform -translate-y-1/2 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />

        {isOpen && !disabled && !readOnly && (
          <div
            id={listboxId}
            role="listbox"
            className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-auto py-1 border border-gray-200 rounded-md bg-color-primary shadow-lg dark:border-gray-700"
          >
            {visibleOptions.length > 0 ? (
              visibleOptions.map((option, index) => {
                const isSelected = String(option.value) === String(value);
                const isActive = index === activeIndex;

                return (
                  <button
                    key={`${option.value}-${index}`}
                    type="button"
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(option)}
                    className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                      isActive || isSelected
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-gray-500 text-sm dark:text-gray-400">
                {noOptionsLabel ?? t("filters.no_options")}
              </div>
            )}
          </div>
        )}
      </div>
    </InputBase>
  );
}

export default React.memo(InputSelectSearch);
