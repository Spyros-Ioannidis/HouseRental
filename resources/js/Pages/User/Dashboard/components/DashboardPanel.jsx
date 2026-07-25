export default function DashboardPanel({
  as: Component = "section",
  children,
  className = "",
  description,
  spacing = "space-y-6",
  title,
  ...props
}) {
  return (
    <Component
      {...props}
      className={`p-6 border border-gray-200 rounded-2xl bg-white shadow-sm ${spacing} ${className}`}
    >
      <div>
        <h2 className="font-bold text-gray-950 text-xl">{title}</h2>
        {description && (
          <p className="mt-1 text-gray-500 text-sm">{description}</p>
        )}
      </div>

      {children}
    </Component>
  );
}
