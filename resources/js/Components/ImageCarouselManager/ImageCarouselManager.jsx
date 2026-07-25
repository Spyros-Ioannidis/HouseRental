import ImageReorder from "@/Components/ImageCarouselManager/ImageReorder";
import ImageUploadBox from "@/Components/ImageCarouselManager/ImageUploadBox";
import UploadProvider from "@/Components/ImageCarouselManager/UploadProvider";

const HOUSE_IMAGE_ROUTES = {
  store: "houses.images.store",
  reorder: "houses.images.reorder",
  destroy: "houses.images.destroy",
  destroyBatch: "houses.images.destroy-batch",
};
const EMPTY_IMAGES = [];

export default function ImageCarouselManager({
  houseId,
  existingImages = EMPTY_IMAGES,
  imageCount,
  imageRoutes = HOUSE_IMAGE_ROUTES,
  routeParamName = "house",
  onUploadsChange,
}) {
  const initialImages = Array.isArray(existingImages)
    ? existingImages
    : EMPTY_IMAGES;
  const initialImageCount = imageCount ?? initialImages.length;

  return (
    <section className="border rounded-xl bg-color-card shadow-cst-xl dark:border-gray-800">
      <UploadProvider
        houseId={houseId}
        imageRoutes={imageRoutes}
        initialFiles={initialImages}
        initialImageCount={initialImageCount}
        routeParamName={routeParamName}
        onUploadsChange={onUploadsChange}
      >
        <div className="p-6 pb-0">
          <ImageUploadBox id={`${routeParamName}-${houseId}-image-input`} />
        </div>
        <ImageReorder />
      </UploadProvider>
    </section>
  );
}
