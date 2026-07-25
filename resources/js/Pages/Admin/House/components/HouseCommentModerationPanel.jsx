import axios from "axios";
import { useState } from "react";
import { FiMessageSquare, FiTrash2 } from "react-icons/fi";
import { route } from "@/ziggy";

import ButtonBasic from "@/Components/form/Button/ButtonBasic";
import { addToast } from "@/Components/Other/Toast";
import { useTranslation } from "@/i18n";

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export default function HouseCommentModerationPanel({
  houseId,
  comments = [],
  canModerate = false,
}) {
  const { t, locale } = useTranslation();
  const [items, setItems] = useState(comments);
  const [deletingId, setDeletingId] = useState(null);

  if (!canModerate) {
    return null;
  }

  const deleteComment = async (commentId) => {
    setDeletingId(commentId);

    try {
      await axios.delete(
        route("houses.comments.destroy", {
          locale,
          house: houseId,
          comment: commentId,
        }),
        { headers: { Accept: "application/json" } },
      );

      setItems((current) => current.filter((item) => item.id !== commentId));
      addToast(t("comments.delete_success"), "success");
    } catch (error) {
      addToast(error.response?.data?.message ?? t("comments.delete_error"), "failure");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="p-4 border border-gray-200 rounded-xl bg-color-card shadow-cst-xl dark:border-gray-800">
      <h2 className="mb-4 inline-flex items-center gap-2 font-semibold text-gray-950 text-lg dark:text-gray-100">
        <FiMessageSquare aria-hidden="true" />
        {t("comments.moderation_title")}
      </h2>

      {items.length > 0 ? (
        <div className="grid gap-3">
          {items.map((comment) => (
            <article
              key={comment.id}
              className="p-4 border border-gray-200 rounded-lg bg-color-primary dark:border-gray-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-950 dark:text-gray-100">
                    {comment.author_name}
                  </p>
                  <p className="font-medium text-gray-500 text-xs dark:text-gray-400">
                    {formatDate(comment.created_at)}
                  </p>
                </div>
                <ButtonBasic
                  type="button"
                  variant="Red"
                  disabled={deletingId === comment.id}
                  onClick={() => deleteComment(comment.id)}
                  className="inline-flex items-center gap-2"
                >
                  <FiTrash2 aria-hidden="true" />
                  {t("actions.delete")}
                </ButtonBasic>
              </div>
              <p className="mt-3 leading-6 text-gray-700 text-sm whitespace-pre-line dark:text-gray-300">
                {comment.content}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm dark:text-gray-400">
          {t("comments.empty")}
        </p>
      )}
    </section>
  );
}
