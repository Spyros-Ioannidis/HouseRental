import { useId } from "react";

export default function CustomCheckbox({
  label = "Temp",
  checked = false,
  onChange,
  className="",
}) {
  const id = useId();

  const checkedClass = "border-blue-600 bg-blue-500 text-white";
  const uncheckedClass = "border-gray-300 bg-gray-100 text-black";

  const handleToggle = () => {
    onChange(!checked);
  };

  return (
    <label
      htmlFor={id}
      tabIndex={0}
      role="checkbox"
      aria-checked={checked}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggle();
        }
      }}
      className={`flex w-fit items-center justify-center px-4 py-1.5 border-2 rounded-md font-medium duration-200 transition-all cursor-pointer select-none hover:opacity-90 focus:outline-none ${checked ? checkedClass : uncheckedClass}`}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      {label}
    </label>
  );
}
