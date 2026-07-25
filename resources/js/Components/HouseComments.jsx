import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiMessageSquare } from "react-icons/fi";
import { route } from "@/ziggy";
import { Comments } from "@svar-ui/react-comments";
import { Willow, WillowDark } from "@svar-ui/react-core";

import { addToast } from "@/Components/Other/Toast";
import { useTranslation } from "@/i18n";

import "@svar-ui/react-core/style.css";
import "@svar-ui/react-core/all.css";
import "@svar-ui/react-comments/style.css";

const hasId = (value) =>
  value !== null && value !== undefined && String(value).trim() !== "";

const normalizeDate = (value) => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const normalizeUser = (user) => {
  if (!user || !hasId(user.id)) {
    return null;
  }

  return {
    id: user.id,
    name: String(user.name ?? "Unknown"),
    avatar: user.avatar || undefined,
    color: user.color || undefined,
  };
};

const normalizeComment = (comment) => {
  if (!comment || !hasId(comment.id)) {
    return null;
  }

  const author =
    normalizeUser(comment.author) ||
    normalizeUser({
      id: comment.user,
      name: comment.author_name,
      avatar: comment.avatar,
    });

  if (!author) {
    return null;
  }

  return {
    ...comment,
    author,
    user: author.id,
    content: String(comment.content ?? ""),
    date: normalizeDate(comment.date),
  };
};

const normalizeComments = (comments = []) =>
  comments.map(normalizeComment).filter(Boolean);

const extractContent = (comment = {}) => String(comment.content ?? "").trim();

function useIsDarkTheme() {
  const [isDark, setIsDark] = useState(() =>
    typeof document === "undefined"
      ? false
      : document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

export default function HouseComments({ house }) {
  const { t, locale } = useTranslation();
  const isDark = useIsDarkTheme();
  const Theme = isDark ? WillowDark : Willow;
  const [comments, setComments] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [canComment, setCanComment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const endpoint = useMemo(
    () => route("houses.comments.index", { locale, house: house.id }),
    [house.id, locale],
  );

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const { data } = await axios.get(endpoint, {
        headers: { Accept: "application/json" },
      });

      setComments(normalizeComments(data.comments ?? []));
      setActiveUser(data.active_user ?? null);
      setCanComment(Boolean(data.can_comment));
    } catch (error) {
      setLoadError(t("comments.load_error"));
      addToast(
        error.response?.data?.message ?? t("comments.load_error"),
        "failure",
      );
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, t]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const activeUserForWidget = useMemo(
    () => normalizeUser(activeUser),
    [activeUser],
  );
  const canEditComments = canComment && activeUserForWidget !== null;

  const users = useMemo(() => {
    const byId = new Map();

    comments.forEach((comment) => {
      const author = normalizeUser(comment.author);

      if (!author) {
        return;
      }

      byId.set(author.id, author);
    });

    if (activeUserForWidget) {
      byId.set(activeUserForWidget.id, activeUserForWidget);
    }

    return [...byId.values()];
  }, [activeUserForWidget, comments]);

  const handleChange = useCallback(
    async ({ action, id, comment }) => {
      if (!canEditComments || isSaving) {
        return;
      }

      setIsSaving(true);

      try {
        if (action === "add") {
          const { data } = await axios.post(
            route("houses.comments.store", { locale, house: house.id }),
            { content: extractContent(comment) },
            { headers: { Accept: "application/json" } },
          );

          const savedComment = normalizeComment(data.comment);

          if (savedComment) {
            setComments((current) => [...current, savedComment]);
          }
          addToast(t("flash.comment_created"), "success");
        } else if (action === "update") {
          const { data } = await axios.put(
            route("houses.comments.update", {
              locale,
              house: house.id,
              comment: id,
            }),
            { content: extractContent(comment) },
            { headers: { Accept: "application/json" } },
          );

          const savedComment = normalizeComment(data.comment);

          if (savedComment) {
            setComments((current) =>
              current.map((item) =>
                String(item.id) === String(id) ? savedComment : item,
              ),
            );
          }
          addToast(t("flash.comment_updated"), "success");
        } else if (action === "delete") {
          await axios.delete(
            route("houses.comments.destroy", {
              locale,
              house: house.id,
              comment: id,
            }),
            { headers: { Accept: "application/json" } },
          );

          setComments((current) =>
            current.filter((item) => String(item.id) !== String(id)),
          );
          addToast(t("flash.comment_deleted"), "success");
        }
      } catch (error) {
        await loadComments();
        addToast(
          error.response?.data?.message ?? t("comments.save_error"),
          "failure",
        );
      } finally {
        setIsSaving(false);
      }
    },
    [canEditComments, house.id, isSaving, loadComments, locale, t],
  );

  return (
    <section className="max-h-100 min-w-0 overflow-x-hidden overflow-y-auto p-6 border border-color-card rounded-lg bg-color-card shadow-sm ">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-semibold">
          <FiMessageSquare aria-hidden="true" />
          {t("comments.title")}
        </h2>
        {isSaving && (
          <span className="font-medium text-gray-500 text-sm">
            {t("comments.saving")}
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-sm">{t("comments.loading")}</p>
      ) : loadError ? (
        <p className="font-semibold text-red-600 text-sm">{loadError}</p>
      ) : (
        <>
          {!canEditComments && (
            <p className="mb-4 px-4 py-3 border border-color-primary rounded-lg bg-color-primary text-color-secondary text-sm">
              {t("comments.readonly")}
            </p>
          )}

          <Theme>
            <Comments
              value={comments}
              users={users}
              activeUser={activeUserForWidget?.id}
              readonly={!canEditComments}
              onChange={handleChange}
            />
          </Theme>
        </>
      )}
    </section>
  );
}
