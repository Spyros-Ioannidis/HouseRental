import React, { useState, useRef } from "react";
import { TbUpload } from "react-icons/tb";

export default function ImageUploader({
  id = "image-input",
  maxFileSize,
  onChangeFiles,
}) {
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [dragover, setDragover] = useState(false);
  const [dragCount, setDragCount] = useState(0);
  const inputRef = useRef(null);

  const getImageUrl = (file) => URL.createObjectURL(file);

  const handleInputFileChange = (e) => {
    if (!e.target.files) return;

    const newImages = [];
    const newImageUrls = [];

    for (const file of e.target.files) {
      if (!file.type.startsWith("image")) continue;
      if (maxFileSize && file.size > maxFileSize) continue;
      newImages.push(file);
      newImageUrls.push(getImageUrl(file));
    }

    if (newImages.length === 0) return;

    // Replace previous state
    setImages(newImages);
    setImageUrls(newImageUrls);

    if (onChangeFiles) {
      onChangeFiles(newImages); // pass only new files
    }
    setImages([]);
    setImageUrls([]);
  };

  const openFileDialog = () => inputRef.current?.click();

  const onDragEnter = (e) => {
    e.preventDefault();
    setDragCount((count) => count + 1);
    setDragover(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragCount((count) => {
      const next = count - 1;
      if (next === 0) setDragover(false);
      return next;
    });
  };

  const onDragOver = (e) => e.preventDefault();

  const onDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    handleInputFileChange({ target: { files: e.dataTransfer.files } });
  };

  return (
    <>
      <div
        className={`h-80 w-130 p-4 border-2 border-dashed rounded-md cursor-pointer select-none transition ${dragover ? "bg-gray-200 border-blue-400" : "bg-gray-50 hover:bg-gray-200 border-gray-400"}`}
        onClick={openFileDialog}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="flex h-full w-full flex-col items-center justify-center">
          <TbUpload size={40} className="block text-gray-500" />
          <span className="font-medium text-gray-500 transition hover:text-gray-700">
            Drag & Drop your image here or
            <span className="font-semibold text-blue-500"> browse</span>
          </span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        id={id}
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleInputFileChange}
      />

      <div className="flex-col">
        {imageUrls.map((url, idx) => (
          <div key={idx} className="mt-1 text-center text-gray-600 text-xs">
            {images[idx]?.name}
          </div>
        ))}
      </div>
    </>
  );
}
