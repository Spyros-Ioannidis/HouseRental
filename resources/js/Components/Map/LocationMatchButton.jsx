import { FaMapMarkerAlt } from "react-icons/fa";

function LocationMatchButton({ disabled, isSelected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-start gap-3 px-3 py-2 border rounded-lg text-left text-sm transition disabled:opacity-60 disabled:cursor-not-allowed ${
        isSelected
          ? "border-indigo-500 bg-indigo-50 text-indigo-950"
          : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/60"
      }`}
    >
      <span className="mt-0.5 text-indigo-700">
        <FaMapMarkerAlt aria-hidden="true" />
      </span>
      <span>{children}</span>
    </button>
  );
}

export default LocationMatchButton;
