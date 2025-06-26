import MapView from "@/_components/ui/map-view";
import { Heading, Text } from "@/_components/ui/typegraphy";
import { ListingLocationType } from "@/_types/listing";
import { isValidNumber } from "@/_utils/common";

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
      <Text className="mt-3 text-secondary">{location.address}</Text>

      {isValidNumber(location.lat) && isValidNumber(location.lng) && (
        <MapView
          lat={+location.lat!}
          lng={+location.lng!}
          mapContainerClassName="w-full h-[230px] sm:h-[400px] xl:h-[600px] mt-6"
        />
      )}
    </div>
  );
};
