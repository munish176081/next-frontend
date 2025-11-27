"use client";

import { notFound } from "next/navigation";
import { useState } from "react";
import { ListingImageGallery } from "./_components/image-gallery";
import { Divider } from "@/_components/ui/divider";
import { ListingDetails } from "./_components/listing-details";
import { Heading } from "@/_components/ui/typegraphy";
import { ListingLocation } from "./_components/listing-location";
import { ListingPoints } from "./_components/listing-points";
import { useUserListing } from "@/_services/hooks/user/use-user-listing";
import { ListingResponseDto, ListingTypeEnum, ListingStatusEnum } from "@/_types/listing";
import { ListingPaymentModal } from "@/_components/payments/listing-payment-modal";
import { useReactivateListing } from "@/_services/hooks/listings/use-reactivate-listing";
import { useSyncListingSubscription } from "@/_services/hooks/listings/use-sync-listing-subscription";
import { Button } from "@/_components/ui/button";

type PageProps = {
  params: { id: string };
};

const ListingDetail = ({ params: { id: listingId } }: PageProps) => {
  const { data: listing, isPending, refetch } = useUserListing(listingId);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const reactivateListingMutation = useReactivateListing();
  const syncSubscriptionMutation = useSyncListingSubscription();

  if (isPending) return <div>Loading...</div>;

  if (!listing) return notFound();

  const isExpired = !listing.isActive || listing.status === ListingStatusEnum.EXPIRED;

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
  const age = fields.age; // Use the calculated age from backend
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
    const microchipNumbers = Array.isArray(fields.microchipNumber) 
      ? fields.microchipNumber 
      : [fields.microchipNumber];
    specifications.push({
      name: "Microchip Number" + (microchipNumbers.length > 1 ? "s" : ""),
      value: microchipNumbers.join(", "),
    });
  }

  const handlePaymentSuccess = async (paymentData: { isFeatured: boolean; paymentMethod: string; paymentId: string; subscriptionId?: string }) => {
    try {
      await reactivateListingMutation.mutateAsync({
        id: listingId,
        subscriptionId: paymentData.subscriptionId || paymentData.paymentId,
        paymentId: paymentData.paymentId,
      });
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Error reactivating listing:', error);
    }
  };

  return (
    <div className="pb-40">
      {isExpired && (
        <div className="mb-6 border border-yellow-500 bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">This listing is inactive. Reactivate it to make it visible to the public.</span>
            <div className="flex gap-2 ml-4">
              <Button
                onClick={async () => {
                  try {
                    await syncSubscriptionMutation.mutateAsync(listingId);
                    refetch();
                  } catch (error) {
                    console.error('Error syncing subscription:', error);
                  }
                }}
                variant="outline"
                disabled={syncSubscriptionMutation.isPending}
              >
                {syncSubscriptionMutation.isPending ? 'Syncing...' : 'Sync Status'}
              </Button>
              <Button
                onClick={() => setShowPaymentModal(true)}
              >
                Reactivate Listing
              </Button>
            </div>
          </div>
        </div>
      )}
      
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

      {showPaymentModal && (
        <ListingPaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          listingType={listing.type as ListingTypeEnum}
          listingTitle={listing.title}
          listingBreed={listing.breed || ''}
          listingLocation={listing.location || ''}
          listingImage={listing.metadata?.images?.[0]}
          listingId={listingId}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={(error) => {
            console.error('Payment error:', error);
          }}
        />
      )}
    </div>
  );
};

export default ListingDetail;
