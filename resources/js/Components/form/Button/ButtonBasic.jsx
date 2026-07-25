export default function ButtonBasic({
  children,
  onClick,
  disabled = false,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) {
  // const VariantClass = {
  //   Green: "bg-green-500 text-gray-800 hover:bg-green-600",
  //   Blue: "bg-blue-400 text-white hover:bg-blue-500",
  //   Red: "bg-red-500 text-white hover:bg-red-600",
  // };

  const VariantClass = {
    primary: "bg-blue-400 text-white",
    Green: "bg-green-500 text-gray-800",
    Blue: "bg-blue-700 text-white",
    Red: "bg-red-500 text-white",
    Indigo: "bg-indigo-700 text-white",
    GrayOutline: "border border-gray-300 bg-color-card text-gray-700 dark:border-gray-700 dark:text-gray-100",
  };

  const VariantClass_Hover = {
    primary: "hover:bg-blue-500",
    Green: "hover:bg-green-600",
    Blue: "hover:bg-blue-600",
    Red: "hover:bg-red-600",
    Indigo: "hover:bg-indigo-800",
    GrayOutline: "hover:bg-gray-50",
  };

  const resolvedVariant = VariantClass[variant] ? variant : "primary";
  const BaseClass =
    "inline-flex items-center justify-center px-4 py-2 rounded-md font-medium duration-200 transition-colors";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${BaseClass} ${VariantClass[resolvedVariant]} ${disabled ? "opacity-50 cursor-not-allowed hover:bg-none" : `cursor-pointer ${VariantClass_Hover[resolvedVariant]}`} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
