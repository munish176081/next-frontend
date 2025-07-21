import { Heading } from "@/_components/ui/typegraphy";

export const ListingOwnerDetails = ({
  name,
  className,
}: { name: string; className?: string }) => {
  return (
    <div className={className}>
      <Heading tag="h3">Owner Details</Heading>

      <Heading className="mt-4" tag="h5">
        {name}
      </Heading>
    </div>
  );
};
