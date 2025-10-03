"use client";
import { BaseFormProps } from "./base-listing-form";
import PuppyListingForm from "./puppy-listing-form";
import FutureListingForm from "./future-listing-form";
import StudListingForm from "./stud-listing-form";
import SemenListingForm from "./semen-listing-form";
import WantedListingForm from "./wanted-listing-form";
import ServicesListingForm from "./services-listing-form";

interface ListingFormFactoryProps extends BaseFormProps {}

export default function ListingFormFactory(props: ListingFormFactoryProps) {
  const { selectedListingType } = props;

  switch (selectedListingType.id) {
    case 'PUPPY_LISTING':
      return <PuppyListingForm {...props} />;
    
    case 'FUTURE_LISTING':
      return <FutureListingForm {...props} />;
    
    case 'STUD_LISTING':
      return <StudListingForm {...props} />;
    
    case 'SEMEN_LISTING':
      return <SemenListingForm {...props} />;
    
    case 'WANTED_LISTING':
      return <WantedListingForm {...props} />;
    
    case 'OTHER_SERVICES':
      return <ServicesListingForm {...props} />;
    
    default:
      console.error('Unknown listing type:', selectedListingType.id);
      return (
        <div className="w-full p-8 text-center">
          <h2 className="text-2xl font-medium text-red-600">Unknown Listing Type</h2>
          <p className="text-gray-600 mt-2">The selected listing type is not supported.</p>
        </div>
      );
  }
}
