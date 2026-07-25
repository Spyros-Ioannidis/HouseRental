import { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import AvatarEditor from "react-avatar-editor";
import { FiEdit3, FiRotateCw, FiUpload, FiZoomIn } from "react-icons/fi";
import { route } from "@/ziggy";

import Modal from "@/Components/Other/Modal";
import ButtonBasic from "@/Components/form/Button/ButtonBasic";
import GradientButton from "@/Components/form/Button/GradientButton";
import { getInitials } from "../UserDashboardActions";

export default function ProfilePictureEditor({
  user,
  updateUrl,
  heading = "Manage profile picture",
  description = "Edit the current avatar or upload a new image, then crop it before saving.",
  cropInModal = true,
}) {
  const editorRef = useRef(null);
  const inputRef = useRef(null);
  const [cropImage, setCropImage] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cropMode, setCropMode] = useState(null);
  const [scale, setScale] = useState(1.2);
  const [rotate, setRotate] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const cropOpen = Boolean(cropMode && cropImage);

  useEffect(() => () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const resetCropState = () => {
    setCropMode(null);
    setCropImage("");
    setScale(1.2);
    setRotate(0);
    setErrors({});

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const closeCropper = () => {
    if (processing) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    resetCropState();
  };

  const openCurrentEditor = () => {
    if (!user?.profile_picture) return;

    setCropImage(user.profile_picture);
    setCropMode("current");
    setScale(1.2);
    setRotate(0);
    setErrors({});
  };

  const selectNewPicture = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    setCropImage(nextPreviewUrl);
    setCropMode("upload");
    setScale(1.2);
    setRotate(0);
    setErrors({});
  };

  const saveCroppedPicture = async () => {
    if (!editorRef.current || processing) return;

    let blob = null;

    try {
      const canvas = editorRef.current.getImageScaledToCanvas();
      blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    } catch {
      setErrors({ profile_picture: "The selected image could not be prepared." });
      return;
    }

    if (!blob) {
      setErrors({ profile_picture: "The selected image could not be prepared." });
      return;
    }

    const file = new File([blob], "profile-picture.png", {
      type: "image/png",
    });

    router.post(
      updateUrl || route("dashboard.profile-picture.update"),
      { profile_picture: file },
      {
        forceFormData: true,
        preserveScroll: true,
        onStart: () => {
          setProcessing(true);
          setErrors({});
        },
        onError: setErrors,
        onSuccess: () => {
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }

          resetCropState();
        },
        onFinish: () => setProcessing(false),
      },
    );
  };

  const cropTitle =
    cropMode === "current" ? "Edit current profile picture" : "Crop new picture";
  const cropActions = (
    <div className="flex flex-wrap justify-end gap-2">
      <ButtonBasic
        type="button"
        variant="GrayOutline"
        onClick={closeCropper}
        disabled={processing}
      >
        Cancel
      </ButtonBasic>
      <GradientButton
        type="button"
        onClick={saveCroppedPicture}
        disabled={processing}
      >
        {processing ? "Uploading..." : "Save cropped picture"}
      </GradientButton>
    </div>
  );
  const cropEditor = (
    <div className="mt-5 space-y-5">
      <div className="flex justify-center p-5 border border-color-primary rounded-lg bg-color">
        <AvatarEditor
          ref={editorRef}
          image={cropImage}
          width={240}
          height={240}
          border={32}
          borderRadius={120}
          color={[15, 23, 42, 0.55]}
          scale={scale}
          rotate={rotate}
          crossOrigin="anonymous"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="flex items-center gap-2 font-semibold text-gray-700 text-sm dark:text-gray-200">
            <FiZoomIn className="h-4 w-4" />
            Zoom
          </span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={scale}
            onChange={(event) => setScale(Number(event.target.value))}
            className="w-full accent-indigo-950"
          />
        </label>
        <label className="space-y-2">
          <span className="flex items-center gap-2 font-semibold text-gray-700 text-sm dark:text-gray-200">
            <FiRotateCw className="h-4 w-4" />
            Rotate
          </span>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={rotate}
            onChange={(event) => setRotate(Number(event.target.value))}
            className="w-full accent-indigo-950"
          />
        </label>
      </div>

      {errors.profile_picture && (
        <p className="font-medium text-red-600 text-sm">
          {errors.profile_picture}
        </p>
      )}
    </div>
  );

  return (
    <section className="grid gap-5 p-5 border border-color-card rounded-lg bg-color-card sm:grid-cols-[9rem_minmax(0,1fr)]">
      <div className="flex flex-col items-center gap-3">
        {user?.profile_picture ? (
          <img
            src={user.profile_picture}
            alt="Current profile"
            className="h-32 w-32 ring-4 ring-white rounded-full object-cover"
          />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center ring-4 ring-white rounded-full bg-indigo-950 font-bold text-3xl text-white">
            {getInitials(user?.name)}
          </div>
        )}
        <p className="font-semibold text-center text-gray-700 text-sm dark:text-gray-200">
          Profile picture
        </p>
      </div>

      <div className="flex flex-col justify-center gap-4">
        <div>
          <h2 className="font-semibold text-color-primary text-lg">
            {heading}
          </h2>
          <p className="mt-1 text-gray-500 text-sm">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ButtonBasic
            type="button"
            variant="GrayOutline"
            onClick={openCurrentEditor}
            disabled={!user?.profile_picture}
            className="inline-flex items-center gap-2"
          >
            <FiEdit3 aria-hidden="true" />
            Edit current profile picture
          </ButtonBasic>

          <ButtonBasic
            type="button"
            variant="Blue"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2"
          >
            <FiUpload aria-hidden="true" />
            Upload a new picture
          </ButtonBasic>
        </div>


        <input
          ref={inputRef}
          id="profile_picture"
          name="profile_picture"
          type="file"
          accept="image/*"
          onChange={selectNewPicture}
          className="sr-only"
        />
      </div>

      {cropInModal ? (
        <Modal
          open={cropOpen}
          onClose={closeCropper}
          title={cropTitle}
          size="lg"
          footer={cropActions}
        >
          {cropEditor}
        </Modal>
      ) : cropOpen ? (
        <div className="pt-5 border-gray-200 border-t sm:col-span-2 dark:border-gray-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold text-base text-color-primary">
              {cropTitle}
            </h3>
            {cropActions}
          </div>
          {cropEditor}
        </div>
      ) : null}
    </section>
  );
}
