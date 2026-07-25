import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import { Link } from "@inertiajs/react";

const cleanPaginationLabel = (label = "") =>
  String(label)
    .replace("&laquo;", "Previous")
    .replace("&raquo;", "Next")
    .replace(/<[^>]*>/g, "");

export default function Pagination({ links = [], onPageChange, className = "" }) {
  const ClassLink_BASE =
    "inline-flex h-10 w-10 items-center justify-center pb-0.25 border rounded-xl font-medium duration-200 transition-all";
    // border-gray-300 bg-white text-gray-700 hover:bg-gray-50
  const ClassLink_Active =
    // "text-white border-indigo-900 gradient gradient-hover shadow-lg";
    "border-indigo-900 bg-indigo-900 text-white shadow-lg hover:bg-[#3730a3]";
  const ClassLink_Inactive =
    "border-gray-400 text-color-primary dark:border-[#2e424f] dark:hover:bg-gray-800 hover:bg-gray-200";
  const ClassLink_Disabled =
    "pointer-events-none border-gray-300 text-gray-400 dark:border-gray-800 dark:text-gray-800";

  if (links.length <= 3) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-wrap items-center gap-2 ${className}`}
    >
      {links.map((link) => {
        const label = cleanPaginationLabel(link.label);
        const isPrevious = label.includes("Previous");
        const isNext = label.includes("Next");
        const ariaLabel = isPrevious || isNext ? label : `Page ${label}`;
        let content;

        if (isPrevious) {
          content = <HiOutlineChevronLeft size={24} className="pt-0.25" aria-hidden="true" />;
        } else if (isNext) {
          content = <HiOutlineChevronRight size={24} className="pt-0.25" aria-hidden="true" />;
        } else {
          content = <span>{label}</span>;
        }

        return link.url ? (
          <Link
            key={link.label}
            href={link.url}
            onClick={
              onPageChange
                ? (e) => {
                    e.preventDefault();
                    onPageChange(link.url);
                  }
                : undefined
            }
            className={`${ClassLink_BASE} ${link.active ? ClassLink_Active : ClassLink_Inactive}`}
            aria-label={ariaLabel}
            aria-current={link.active ? "page" : undefined}
          >
            {content}
          </Link>
        ) : (
          <span
            key={link.label}
            className={`${ClassLink_BASE} ${ClassLink_Disabled}`}
            aria-label={ariaLabel}
            aria-disabled="true"
          >
            {content}
          </span>
        );
      })}
    </nav>
  );
}
