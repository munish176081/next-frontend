import {
  ContactDetailsType,
  ListingLocationType,
  ListingTypeEnum,
  ListingType,
} from "@/_types/listing";

interface ExtractedListingData {
  location?: ListingLocationType;
  title?: string;
  description?: string;
  age?: number;
  minAge?: number;
  maxAge?: number;
  budget?: number;
  fee?: number;
  pricePerPuppy?: number;
  additionalNotes?: string;
  images: string[];
  details: {
    title?: string;
    specifications?: {
      name: string;
      value?: string;
    }[];
  };
  contactDetails: ContactDetailsType;
}

export function formatListingType(listingType: ListingTypeEnum) {
  switch (listingType) {
    case "puppy":
      return "Puppy";
    case "semen":
      return "Semen";
    case "stud_bitch":
      return "Stud & Bitch";
    case "future":
      return "Future";
    case "wanted_puppy":
      return "Wanted Puppy";
    case "other":
      return "Other";
    default:
      return "Unknown";
  }
}

export function extractListingImages(listing: ListingType) {
  const { type, fields } = listing;

  switch (type) {
    case "puppy": {
      return ["/images/no-image-available.jpg"];
    }

    case "wanted_puppy": {
      const images = fields.referenceImages;

      return images ?? ["/images/no-image-available.jpg"];
    }

    case "semen": {
      const images = fields.images;

      return images ?? ["/images/no-image-available.jpg"];
    }

    case "future": {
      const images = fields.images;

      return images ?? ["/images/no-image-available.jpg"];
    }

    default: {
      return ["/images/no-image-available.jpg"];
    }
  }
}

export function extractListingDetails(listing: ListingType) {
  const { type, fields } = listing;

  const extractedData: ExtractedListingData = {
    location: fields.contactDetails?.location,
    title: fields.title,
    description: fields.description,
    age: fields.age,
    minAge: fields.minAge,
    maxAge: fields.maxAge,
    budget: fields.budget,
    fee: fields.fee,
    pricePerPuppy: fields.pricePerPuppy,
    additionalNotes: fields.contactDetails?.additionalNotes,
    contactDetails: fields.contactDetails,
    images: [],
    details: {},
  };

  switch (type) {
    case "puppy": {
      extractedData.images = [];

      extractedData.details = {
        title: "Puppy Details",
      };
      break;
    }

    case "wanted_puppy": {
      extractedData.images = fields.referenceImages ?? [];

      extractedData.details = {
        title: "Wanted Puppy Details",
        specifications: [
          {
            name: "Required Breed",
            value: fields.breed,
          },
          {
            name: "Gender Preference",
            value: fields.genderPreference ?? "No Preference",
          },
          {
            name: "Age Range",
            value: `${fields.minAge} - ${fields.maxAge}`,
          },
          {
            name: "ANKC Number Requirement",
            value: fields.isAnkcNumberRequired ? "Required" : "Not Required",
          },
          {
            name: "Health Cerficate Requirement",
            value: fields.isHealthCeritificateRequired
              ? "Required"
              : "Optional",
          },
        ],
      };
      break;
    }
  }

  return extractedData;
}
