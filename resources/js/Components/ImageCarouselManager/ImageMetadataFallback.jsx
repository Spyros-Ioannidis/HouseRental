const ImageMetadataFallback = ({ total = 0 }) => {
  return (
    <div className="flex flex-wrap gap-3">
      <span className="text-gray-500 text-sm">
        Loading image metadata{total ? ` 0 / ${total}` : ""}...
      </span>
    </div>
  );
};

export default ImageMetadataFallback;
