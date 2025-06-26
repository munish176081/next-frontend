import { Button } from "../ui";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { ImageGallery } from "./image-gallery";
import { FieldError } from "../ui/form-fields";
import { cn } from "@/_lib/utils";

interface ImagePreviewProps {
  images: { url: string; error?: string }[];
  maxInPreview?: number;
  onDelete?: (idx: number) => void;
  className?: string;
}

export const ImagePreview = ({
  images,
  maxInPreview,
  onDelete,
  className,
}: ImagePreviewProps) => {
  if (images.length === 0) return null;

  return (
    <div className={cn("border p-4", className)}>
      <div className="columns-3 gap-2">
        {images
          .slice(0, maxInPreview ?? images.length)
          .map(({ url, error }, idx) => (
            <div key={idx} className={cn("relative mb-2", error && "pb-5")}>
              <Image
                src={url}
                alt="Image"
                className="object-cover !static"
                fill
              />
              {onDelete && (
                <Button
                  variant="ghost"
                  size="auto"
                  className="absolute top-3 right-3 bg-gray-100 hover:bg-gray-300 rounded-full p-1 active:scale-95"
                  type="button"
                  onClick={() => onDelete(idx)}
                >
                  <Trash2 size={16} />
                </Button>
              )}
              {error && (
                <FieldError
                  className="absolute bottom-0"
                  size="lg"
                  error={error}
                />
              )}
            </div>
          ))}
      </div>

      <div className="flex justify-end space-x-3">
        {maxInPreview && images.length > maxInPreview && (
          <Button className="mt-2 ml-auto block">
            View all {images.length} images
          </Button>
        )}

        <ImageGallery imageUrls={images.map(({ url }) => url)} />
      </div>
    </div>
  );
};
