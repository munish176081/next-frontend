import { Heading } from "@/_components/ui/typegraphy";
import { ContactDetailsType } from "@/_types/listing";

export const ListingOwnerDetails = ({
  name,
  className,
}: ContactDetailsType & { className?: string }) => {
  return (
    <div className={className}>
      <Heading tag="h3">Owner Details</Heading>

      <Heading className="mt-4" tag="h5">
        {name}
      </Heading>
    </div>
  );
};
