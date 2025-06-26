import { UserListingType } from "@/_types/listing";
import Image from "next/image";
import { ListingImageGalleryExpandView } from "./expand-view";
import { extractListingImages } from "@/_utils/listing";

interface ListingImageGalleryProps {
  listing: UserListingType;
}

export const ListingImageGallery = ({ listing }: ListingImageGalleryProps) => {
  const images = extractListingImages(listing);

  const featuredImage = images[0];

  if (!featuredImage) return null;

  const sideImg1 = images[1];
  const sideImg2 = images[2];

  return (
    <div className="relative">
      <div className="flex space-x-3 rounded-xl overflow-hidden h-[700px]">
        <div className="w-full min-w-[66%] relative">
          <Image
            src={featuredImage}
            alt="Puppy image"
            fill
            objectFit="cover"
            objectPosition="center"
          />
        </div>

        {sideImg1 && (
          <div className="min-w-[33%] w-full h-full flex flex-col space-y-3">
            <div className="min-h-[1/5] h-full relative">
              <Image
                src={sideImg1}
                alt="Puppy image"
                fill
                objectFit="cover"
                objectPosition="center"
              />
            </div>

            {sideImg2 && (
              <div className="min-h-[1/5] h-full relative">
                <Image
                  src={sideImg2}
                  alt="Puppy image"
                  fill
                  objectFit="cover"
                  objectPosition="center"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <ListingImageGalleryExpandView images={images} />
    </div>
  );
};
