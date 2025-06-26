import { Heading } from "@/_components/ui/typegraphy";
import { cn } from "@/_lib/utils";

interface ListingDetailsProps {
  title?: string;
  details?: {
    name: string;
    value?: string;
  }[];
  className?: string;
}

export const ListingDetails = ({
  className,
  title,
  details,
}: ListingDetailsProps) => {
  return (
    <div className={cn(className)}>
      <Heading tag="h3">{title}</Heading>

      {details?.map((detail, i) => (
        <div
          key={`${detail.name}-${i}`}
          className="grid grid-cols-1 gap-[2px] border-b border-gray-lighter py-2 leading-6 sm:grid-cols-2 sm:gap-1 sm:py-3 md:py-4 lg:grid-cols-1 lg:gap-2 xl:grid-cols-2"
        >
          <span className="text-gray opacity-80 sm:text-secondary sm:opacity-100 lg:text-gray lg:opacity-80 xl:text-secondary xl:opacity-100">
            {detail.name}
          </span>
          <span className="text-secondary sm:text-end lg:text-left xl:text-end">
            {detail.value}
          </span>
        </div>
      ))}
    </div>
  );
};
