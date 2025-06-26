import { Button } from "../ui";
import { X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/_components/ui/drawer";
import { Heading } from "../ui/typegraphy";
import Image from "next/image";
import { DialogTitle } from "../ui/dialog";

interface ImageGalleryProps {
  imageUrls: string[];
  trigger?: React.ReactNode | string;
}

export const ImageGallery = ({ imageUrls, trigger }: ImageGalleryProps) => {
  return (
    <Drawer noBodyStyles>
      <DrawerTrigger asChild>
        {!trigger || typeof trigger === "string" ? (
          <Button className="mt-2 ml-auto block">
            {trigger ?? "Expand view"}
          </Button>
        ) : (
          trigger
        )}
      </DrawerTrigger>
      <DrawerContent className="h-screen z-[1000000] rounded-none">
        <div className="border-b h-14 absolute top-0 left-0 right-0">
          <DrawerClose>
            <X
              size={24}
              className="absolute top-1/2 transform -translate-y-1/2 right-4 cursor-pointer"
            />
          </DrawerClose>
        </div>

        <DialogTitle className="sr-only">Photo Gallery</DialogTitle>

        <div className="max-w-4xl mx-auto py-20 overflow-auto px-4 sm:px-6">
          <Heading tag="h3" className="md:!text-xl mb-6">
            Photo Gallery
          </Heading>

          <div className="columns-2 gap-2">
            {imageUrls.map((url, idx) => (
              <div
                className="relative mb-2 overflow-hidden rounded-md transition-all duration-300 md:rounded-xl lg:mb-3"
                key={idx}
              >
                <Image
                  src={url}
                  alt="gallery-img"
                  fill
                  className="!static object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
