export default function CheckboxGroup({
  options = [],
  value = [],
  onChange,
}) {
  const selectedValues = Array.isArray(value)
    ? value
    : value !== "" && value !== null && value !== undefined
      ? [value]
      : [];

  const toggle = (val) => {
    const isSelected = selectedValues.some(
      (selectedValue) => String(selectedValue) === String(val),
    );

    const updated = isSelected
      ? selectedValues.filter((selectedValue) => String(selectedValue) !== String(val))
      : [...selectedValues, val];

    if (onChange) onChange(updated);
  };

  if (options.length === 0) {
    return <p className="text-gray-500 text-sm">No options available</p>;
  }

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center gap-3 px-2 py-1.5 rounded-lg text-gray-700 text-sm transition-colors cursor-pointer hover:bg-gray-50"
        >
          <input
            type="checkbox"
            checked={selectedValues.some(
              (selectedValue) => String(selectedValue) === String(option.value),
            )}
            onChange={() => toggle(option.value)}
            className="h-4 w-4 border-gray-300 rounded text-indigo-700 focus:ring-indigo-500"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
