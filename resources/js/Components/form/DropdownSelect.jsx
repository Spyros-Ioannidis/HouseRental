import React from "react";

function DropdownSelect({
  name,
  value,
  options = [],
  onChange,
  ariaLabel,
  className = "",
}) {
  return (
    <select
      name={name}
      id={name}
      value={value ?? ""}
      aria-label={ariaLabel}
      onChange={onChange}
      className={`outline-none bg-transparent ${className}`}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          aria-label={option.label}
        >
          {option.display ?? option.label}
        </option>
      ))}
    </select>
  );
}

export default React.memo(DropdownSelect);
