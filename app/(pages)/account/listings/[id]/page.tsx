"use client";

import { notFound } from "next/navigation";
import { ListingImageGallery } from "./_components/image-gallery";
import { Divider } from "@/_components/ui/divider";
import { ListingDetails } from "./_components/listing-details";
import { Heading } from "@/_components/ui/typegraphy";
import { ListingLocation } from "./_components/listing-location";
import { ListingPoints } from "./_components/listing-points";
import { useUserListing } from "@/_services/hooks/user/use-user-listing";
import { ListingResponseDto } from "@/_types/listing";

type PageProps = {
  params: { id: string };
};

const ListingDetail = ({ params: { id: listingId } }: PageProps) => {
  const { data: listing, isPending } = useUserListing(listingId);

  if (isPending) return <div>Loading...</div>;

  if (!listing) return notFound();

  // Extract data from the new listing structure
  const title = listing.title;
  const description = listing.description;
  const location = listing.location;
  const price = listing.price;
  const breed = listing.breed;
  
  // Extract from metadata
  const contactInfo = listing.metadata?.contactInfo;
  const images = listing.metadata?.images || [];
  
  // Extract from fields (dynamic data)
  const fields = listing.fields || {};
  const age = fields.age || fields.dateOfBirth;
  const minAge = fields.minAge;
  const maxAge = fields.maxAge;
  const budget = fields.budget;
  const additionalNotes = fields.additionalNotes || fields.description;
  
  // Build specifications based on listing type
  const specifications = [];
  
  if (breed) {
    specifications.push({
      name: "Breed",
      value: breed,
    });
  }
  
  if (price) {
    specifications.push({
      name: "Price",
      value: `$${price}`,
    });
  }
  
  if (fields.gender) {
    specifications.push({
      name: "Gender",
      value: fields.gender,
    });
  }
  
  if (fields.vaccinationStatus) {
    specifications.push({
      name: "Vaccination Status",
      value: fields.vaccinationStatus,
    });
  }
  
  if (fields.microchipNumber) {
    specifications.push({
      name: "Microchip Number",
      value: fields.microchipNumber,
    });
  }

  return (
    <div className="pb-40">
      <ListingImageGallery listing={listing} />

      <div className="mt-10 max-w-3xl">
        <p>{location}</p>
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

        {specifications.length > 0 && (
          <ListingDetails
            className="mt-7"
            title="Listing Details"
            details={specifications}
          />
        )}

        {location && (
          <ListingLocation location={{ fullAddress: location, city: '', state: '', country: '' }} className="mt-7" />
        )}
      </div>
    </div>
  );
};

export default ListingDetail;
