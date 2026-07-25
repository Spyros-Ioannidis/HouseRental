import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

export default function InputSearch({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  label = "Search",
}) {
  return (
    <div className="relative">
      <HiOutlineMagnifyingGlass
        className="absolute left-4 top-1/2 h-5 w-5 text-gray-400 -translate-y-1/2 transform"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSearch) {
            onSearch();
          }
        }}
        placeholder={placeholder}
        aria-label={label || placeholder}
        className="inputField-primary inputField-style-primary w-full !pl-12 !pr-4"
      />
    </div>
  );
}
