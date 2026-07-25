function AuthCheckbox({
  name,
  checked,
  onChange,
  label,
  description = "",
  error = "",
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="flex gap-3 p-4 border border-color-card rounded-xl bg-color-card  shadow-sm cursor-pointer transition hover:border-indigo-400"
      >
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="mt-1 h-4 w-4 border border-color-card rounded text-indigo-900 focus:ring-indigo-200"
        />
        <span className="space-y-1">
          <span className="block font-semibold text-sm">
            {label}
          </span>
          {description && (
            <span className="block text-gray-500 text-sm">{description}</span>
          )}
        </span>
      </label>

      {error && <p className="font-medium text-red-600 text-sm">{error}</p>}
    </div>
  );
}

export default AuthCheckbox;
