import { ListingTypeEnum } from "@/_types/listing";

export function formatListingType(listingType: ListingTypeEnum) {
  switch (listingType) {
    case ListingTypeEnum.PUPPY_LISTING:
      return "Puppy";
    case ListingTypeEnum.PUPPY_LITTER_LISTING:
      return "Puppy";
    case ListingTypeEnum.SEMEN_LISTING:
      return "Semen";
    case ListingTypeEnum.STUD_LISTING:
      return "Stud & Bitch";
    case ListingTypeEnum.FUTURE_LISTING:
      return "Future";
    case ListingTypeEnum.WANTED_LISTING:
      return "Wanted Puppy";
    case ListingTypeEnum.OTHER_SERVICES:
      return "Other Services";
    default:
      return "Unknown";
  }
}


export function toTitleCaseFromId(id: string): string {
  return id
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}