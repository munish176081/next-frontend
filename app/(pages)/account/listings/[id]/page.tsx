"use client";

import { notFound } from "next/navigation";
import { ListingImageGallery } from "./_components/image-gallery";
import { Divider } from "@/_components/ui/divider";
import { ListingDetails } from "./_components/listing-details";
import { Heading } from "@/_components/ui/typegraphy";
import { ListingLocation } from "./_components/listing-location";
import { ListingPoints } from "./_components/listing-points";
import { extractListingDetails } from "@/_utils/listing";
import { useUserListing } from "@/_services/hooks/user/use-user-listing";

type PagePropws = {
  params: { id: string };
};

const ListingDetail = ({ params: { id: listingId } }: PagePropws) => {
  const { data: listing, isPending } = useUserListing(listingId);

  if (isPending) return <div>Loading...</div>;

  if (!listing) return notFound();

  const {
    location,
    title,
    description,
    age,
    minAge,
    maxAge,
    budget,
    additionalNotes,
    details,
    // contactDetails,
  } = extractListingDetails(listing);

  return (
    <div className="pb-40">
      <ListingImageGallery listing={listing} />

      <div className="mt-10 max-w-3xl">
        <p>{location?.address}</p>
        <Heading className="uppercase mt-2">{title}</Heading>
        <p className="mt-1">{description}</p>

        <ListingPoints
          points={[
            {
              name: "Age",
              value: age,
            },
            {
              name: "Age Range",
              value: minAge ? `${minAge} - ${maxAge}` : undefined,
            },
            {
              name: "Budget",
              value: budget ? `$${budget}` : undefined,
            },
          ]}
          className="mt-3 md:mt-4"
        />

        <Divider className="my-5" />

        {additionalNotes && <p>{additionalNotes}</p>}

        {details && (
          <ListingDetails
            className="mt-7"
            title={details.title}
            details={details.specifications}
          />
        )}
        {/* On personal detail page, we do not need it */}
        {/* {contactDetails && (
            <ListingOwnerDetails className="mt-7" {...contactDetails} />
          )} */}

        {location?.address && (
          <ListingLocation location={location} className="mt-7" />
        )}
      </div>
    </div>
  );
};

export default ListingDetail;
