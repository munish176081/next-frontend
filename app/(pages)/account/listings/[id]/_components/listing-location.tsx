import { Heading, Text } from "@/_components/ui/typegraphy";
import { ListingLocationType } from "@/_types/listing";

export const ListingLocation = ({
  location,
  className,
}: {
  location: ListingLocationType;
  className?: string;
}) => {
  return (
    <div className={className}>
      <Heading tag="h3">Location</Heading>
      <Text className="mt-3 text-secondary">
        {location?.fullAddress || `${location?.city || ''}, ${location?.state || ''}, ${location?.country || ''}`.trim() || "No address"}
      </Text>
    </div>
  );
};
