import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { route } from "@/ziggy";
import { addToast } from "@/Components/Other/Toast";
import { useTranslation } from "@/i18n";

const UploadContext = createContext();

const MAX_PARALLEL = 6;
const MAX_UPLOADS_PER_HOUSE = 20;
const IMAGE_ROUTES = {
  store: "houses.images.store",
  reorder: "houses.images.reorder",
  destroy: "houses.images.destroy",
  destroyBatch: "houses.images.destroy-batch",
};
const EMPTY_FILES = [];

const mapInitialFiles = (files = EMPTY_FILES) => {
  const fileList = Array.isArray(files) ? files : [];

  return fileList.map((file) => ({
    id: `${file.id}`,
    file: null,
    name: file.name ?? file.original_name,
    url: file.url ?? file.image ?? file.path,
    size: file.size ?? 0,
    loadedBytes: file.size ?? 0,
    totalBytes: file.size ?? 0,
    progress: 100,
    status: "done",
    cancelSource: null,
    serverId: file.id,
    isExisting: true,
  }));
};

const createUploadId = () => {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
};

export default function UploadProvider({
  children,
  houseId,
  imageRoutes = IMAGE_ROUTES,
  routeParamName = "house",
  initialImageCount = 0,
  imagesLoaded = true,
  initialFiles = EMPTY_FILES,
  onUploadsChange,
}) {
  const { t } = useTranslation();
  const resolvedHouseId = houseId ?? route().params?.house;
  const [uploads, setUploads] = useState(() => mapInitialFiles(initialFiles));

  const queueRef = useRef(uploads);
  const [savingOrder, setSavingOrder] = useState(false);
  const [deletingIds, setDeletingIds] = useState(() => new Set());
  const [uploadLimitError, setUploadLimitError] = useState("");
  const orderSaveTokenRef = useRef(0);
  const orderSaveChainRef = useRef(Promise.resolve());
  const previousHouseIdRef = useRef(resolvedHouseId);
  const lastUploadSummaryRef = useRef(null);
  const uploadCount = imagesLoaded
    ? uploads.length
    : initialImageCount + uploads.length;
  const remainingUploads = Math.max(MAX_UPLOADS_PER_HOUSE - uploadCount, 0);

  useEffect(() => {
    const serverUploads = mapInitialFiles(initialFiles);
    const serverIds = new Set(serverUploads.map((item) => `${item.serverId}`));
    const isSameHouse = previousHouseIdRef.current === resolvedHouseId;
    const transientUploads = isSameHouse
      ? queueRef.current.filter((item) => {
          return !item.isExisting && !serverIds.has(`${item.serverId}`);
        })
      : [];
    const nextUploads = [...serverUploads, ...transientUploads];

    queueRef.current = nextUploads;
    setUploads(nextUploads);
    setSavingOrder(false);
    setDeletingIds(new Set());
    setUploadLimitError("");
    orderSaveTokenRef.current += 1;
    previousHouseIdRef.current = resolvedHouseId;
  }, [initialFiles, resolvedHouseId]);

  useEffect(() => {
    if (!onUploadsChange) return;

    const summary = {
      uploadCount,
      savingOrder,
      deletingCount: deletingIds.size,
      hasPendingUploads: uploads.some((item) =>
        ["queued", "uploading"].includes(item.status),
      ),
      hasImageErrors: uploads.some((item) =>
        ["cancelled", "error"].includes(item.status),
      ),
    };
    const previous = lastUploadSummaryRef.current;

    if (
      previous &&
      previous.uploadCount === summary.uploadCount &&
      previous.savingOrder === summary.savingOrder &&
      previous.deletingCount === summary.deletingCount &&
      previous.hasPendingUploads === summary.hasPendingUploads &&
      previous.hasImageErrors === summary.hasImageErrors
    ) {
      return;
    }

    lastUploadSummaryRef.current = summary;
    onUploadsChange(summary);
  }, [deletingIds, onUploadsChange, savingOrder, uploadCount, uploads]);

  const syncState = (list) => {
    queueRef.current = list;
    setUploads([...list]);
  };

  const imageRoute = (name, params = {}) => {
    return route(name, {
      [routeParamName]: resolvedHouseId,
      ...params,
    });
  };

  const markDeleting = (ids) => {
    setDeletingIds((currentIds) => {
      const nextIds = new Set(currentIds);
      ids.forEach((id) => nextIds.add(id));
      return nextIds;
    });
  };

  const unmarkDeleting = (ids) => {
    setDeletingIds((currentIds) => {
      const nextIds = new Set(currentIds);
      ids.forEach((id) => nextIds.delete(id));
      return nextIds;
    });
  };

  const addFiles = (files) => {
    const fileList = Array.from(files ?? []);
    const currentCount = imagesLoaded
      ? queueRef.current.length
      : initialImageCount + queueRef.current.length;
    const remainingCount = MAX_UPLOADS_PER_HOUSE - currentCount;

    if (fileList.length === 0) return;

    if (fileList.length > remainingCount) {
      setUploadLimitError(
        t("uploads.limit", {
          current: currentCount,
          max: MAX_UPLOADS_PER_HOUSE,
        }),
      );
      return;
    }

    setUploadLimitError("");

    const newItems = fileList.map((file) => ({
      id: createUploadId(),
      file,
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      loadedBytes: 0,
      totalBytes: file.size,
      progress: 0,
      status: "queued",
      cancelSource: null,
      serverId: null,
      isExisting: false,
    }));

    const updated = [...queueRef.current, ...newItems];
    syncState(updated);
    processQueue();
  };

  const processQueue = () => {
    const uploading = queueRef.current.filter(
      (f) => f.status === "uploading",
    ).length;
    const next = queueRef.current.find((f) => f.status === "queued");

    if (next && uploading < MAX_PARALLEL) {
      uploadFile(next);
      processQueue();
    }
  };

  const uploadFile = async (item) => {
    const source = axios.CancelToken.source();

    item.status = "uploading";
    item.cancelSource = source;
    syncState(queueRef.current);

    const formData = new FormData();
    formData.append("file", item.file);

    try {
      const res = await axios.post(imageRoute(imageRoutes.store), formData, {
        cancelToken: source.token,
        onUploadProgress: (e) => {
          const totalBytes = e.total || item.totalBytes || item.size || 0;

          item.loadedBytes = e.loaded;
          item.totalBytes = totalBytes;
          item.progress = totalBytes
            ? Math.round((e.loaded * 100) / totalBytes)
            : 0;
          syncState(queueRef.current);
        },
      });

      item.status = "done";
      item.serverId = res.data.id;
      item.name = res.data.name ?? item.name;
      item.url = res.data.url ?? item.url;
      item.size = res.data.size ?? item.size;
      item.loadedBytes = item.size;
      item.totalBytes = item.size;
      item.progress = 100;
    } catch (err) {
      if (axios.isCancel(err)) {
        item.status = "cancelled";
      } else if (err.response?.status === 422 && err.response?.data?.message) {
        item.status = "error";
        setUploadLimitError(err.response.data.message);
        addToast(err.response.data.message, "failure");
      } else {
        item.status = "error";
        addToast(t("uploads.upload_failed"), "failure");
      }
    }

    syncState(queueRef.current);
    processQueue();
  };

  const cancelUpload = (id) => {
    const item = queueRef.current.find((f) => f.id === id);
    if (item?.cancelSource) {
      item.cancelSource.cancel();
    }
  };

  const removeFile = async (id) => {
    const item = queueRef.current.find((f) => f.id === id);
    if (!item) return;

    markDeleting([id]);

    try {
      if (item.serverId) {
        await axios.delete(
          imageRoute(imageRoutes.destroy, { image: item.serverId }),
        );
      }

      const updated = queueRef.current.filter((f) => f.id !== id);
      syncState(updated);
    } catch {
      addToast(t("uploads.delete_failed"), "failure");
    } finally {
      unmarkDeleting([id]);
    }
  };

  const removeFiles = async (ids) => {
    const selectedIds = new Set(ids);
    const items = queueRef.current.filter((f) => selectedIds.has(f.id));
    const itemIds = items.map((item) => item.id);
    const serverIds = items.filter((f) => f.serverId).map((f) => f.serverId);

    if (items.length === 0) return;

    markDeleting(itemIds);

    try {
      if (serverIds.length > 0) {
        await axios.delete(imageRoute(imageRoutes.destroyBatch), {
          data: {
            ids: serverIds,
          },
        });
      }

      const updated = queueRef.current.filter((f) => !selectedIds.has(f.id));
      syncState(updated);
    } catch {
      addToast(
        selectedIds.size === queueRef.current.length
          ? t("uploads.delete_all_failed")
          : t("uploads.delete_selected_failed"),
        "failure",
      );
    } finally {
      unmarkDeleting(itemIds);
    }
  };

  const retryUpload = (id) => {
    const item = queueRef.current.find((f) => f.id === id);
    if (!item) return;

    item.status = "queued";
    item.progress = 0;
    syncState(queueRef.current);
    processQueue();
  };

  const persistOrder = (list, previousList) => {
    const saveToken = orderSaveTokenRef.current + 1;
    const orderedIds = list.filter((f) => f.serverId).map((f) => f.serverId);

    orderSaveTokenRef.current = saveToken;
    setSavingOrder(true);

    orderSaveChainRef.current = orderSaveChainRef.current.then(async () => {
      try {
        await axios.post(imageRoute(imageRoutes.reorder), {
          ids: orderedIds,
        });
      } catch {
        if (orderSaveTokenRef.current === saveToken) {
          syncState(previousList);
        }

        addToast(t("uploads.order_failed"), "failure");
      } finally {
        if (orderSaveTokenRef.current === saveToken) {
          setSavingOrder(false);
        }
      }
    });
  };

  const reorderUploads = (fromIndices, toIndex) => {
    const previousList = [...queueRef.current];
    const list = [...queueRef.current];
    const draggedItems = fromIndices.map((i) => list[i]);

    for (let i = fromIndices.length - 1; i >= 0; i--) {
      list.splice(fromIndices[i], 1);
    }

    list.splice(toIndex, 0, ...draggedItems);
    syncState(list);
    persistOrder(list, previousList);
  };

  return (
    <UploadContext.Provider
      value={{
        uploads,
        uploadCount,
        maxUploads: MAX_UPLOADS_PER_HOUSE,
        remainingUploads,
        uploadLimitError,
        addFiles,
        cancelUpload,
        removeFile,
        removeFiles,
        retryUpload,
        reorderUploads,
        savingOrder,
        deletingIds,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export const useUpload = () => useContext(UploadContext);
