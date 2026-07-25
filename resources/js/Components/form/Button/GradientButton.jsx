const GradientButton = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn gradient gradient-hover ${disabled ? "cursor-not-allowed opacity-60 hover:shadow-lg" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default GradientButton;
