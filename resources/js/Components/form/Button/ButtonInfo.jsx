import axios from "axios";
import { useState } from "react";
import { FaCheck, FaCopy } from "react-icons/fa";

import { addToast } from "@/Components/Other/Toast";

const ButtonInfo = ({
  endpoint,
  Info,
  InfoName,
  Icon,
  iconProps = {},
  className = "",
}) => {
  const [info, setInfo] = useState(Info ?? "");
  const [showInfo, setShowInfo] = useState(Boolean(Info));
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const label = InfoName ?? "info";

  const revealInfo = async () => {
    if (showInfo) return;

    if (!endpoint) {
      setInfo(Info ?? "");
      setShowInfo(Boolean(Info));
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.get(endpoint);
      const nextInfo = response.data?.value ?? "";

      if (!nextInfo) {
        addToast(`No ${label} is available`, "neutral");
        return;
      }

      setInfo(nextInfo);
      setShowInfo(true);
    } catch {
      addToast(`Could not reveal ${label}`, "failure");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!info) return;

    try {
      await navigator.clipboard.writeText(info);
      setCopied(true);
      addToast(`Copied ${label} to clipboard`, "success");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      addToast(`Could not copy ${label}`, "failure");
    }
  };

  return (
    <div className={`min-w-0 ${className}`}>
      {showInfo ? (
        <button
          type="button"
          onClick={handleCopy}
          className="flex min-w-0 w-full items-center justify-between gap-3 px-4 py-3 border border-color-card rounded-lg
           bg-color-card font-semibold  text-left text-sm transition cursor-pointer
           hover:border-indigo-200 hover:bg-indigo-100
           dark:hover:border-indigo-800 dark:hover:bg-indigo-950
           "
          title={`Copy ${label}`}
        >
          <span className="flex min-w-0 items-center gap-2">
            {Icon && <Icon {...iconProps} />}
            <span className="truncate">{info}</span>
          </span>
          {copied ? (
            <FaCheck className="shrink-0 text-emerald-600" aria-hidden="true" />
          ) : (
            <FaCopy className="shrink-0 text-indigo-700" aria-hidden="true" />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={revealInfo}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-700 font-semibold text-sm
          text-white shadow-sm transition disabled:opacity-70 disabled:cursor-not-allowed hover:bg-indigo-800 cursor-pointer"
        >
          {Icon && <Icon {...iconProps} />}
          {isLoading ? `Loading ${label}...` : `Show ${label}`}
        </button>
      )}
    </div>
  );
};

export default ButtonInfo;
