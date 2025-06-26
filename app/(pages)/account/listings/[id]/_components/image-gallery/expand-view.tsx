"use client";

import { ImageGallery } from "@/_components/common/image-gallery";
import { Button } from "@/_components/ui";
import { LayoutGridIcon } from "lucide-react";

interface ListingImageGalleryProps {
  images: string[];
}

export const ListingImageGalleryExpandView = ({
  images,
}: ListingImageGalleryProps) => {
  return (
    <ImageGallery
      imageUrls={images}
      trigger={
        <Button className="absolute bottom-5 right-5 space-x-2">
          <LayoutGridIcon />
          <span className="font-bold">View more images</span>
        </Button>
      }
    />
  );
};
