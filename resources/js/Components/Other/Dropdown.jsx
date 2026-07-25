import { useState } from "react";
import { HiOutlineChevronDown } from "react-icons/hi2";

export default function Dropdown({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-500">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-left hover:cursor-pointer"
      >
        <span className="textprimaryprimary">{title}</span>

        <span
          className={`duration-300 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <HiOutlineChevronDown />
        </span>
      </button>

      <div
        className={`grid duration-300 ease-in-out transition-all ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden p-0.5">
          <div className="space-y-2 pb-3 text-gray-600 text-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
