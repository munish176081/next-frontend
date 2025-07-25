"use client";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import GoBackButton from "@/_components/common/go-back-button";
import { LISTING_TYPES, getShortCodeFromId } from "@/_config/listing-types";

export const dynamic = 'force-dynamic';

function Startlisting() {
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const router = useRouter();

  const handleListingSelect = (listingEnum: string) => {
    setSelectedListing(listingEnum);
  };

  const handleNext = () => {
    if (selectedListing) {
      const shortCode = getShortCodeFromId(selectedListing);
      router.push(`/startlistingform?type=${shortCode}`);
    }
  };

  return (
    <>
    <section className="container relative overflow-hidden p-8 rounded-max bg-white max-md:p-4 max-md:rounded-40">
      <div className="absolute left-10 top-8 max-md:top-4 max-md:left-4 max-md:static max-w-max">
        <GoBackButton />
      </div>
      <span className="text-[40px] font-medium flex justify-center w-full max-md:text-[32px] max-md:mt-4">Start a new listing</span>
      <div className="grid grid-cols-2 gap-6 relative z-10 mt-8 max-md:flex-col max-md:gap-4 max-md:mt-4 max-md:grid-cols-1">
        {LISTING_TYPES.map((listing, index) => (
          <div 
            key={listing.id} 
            className={`overflow-hidden flex flex-col gap-2 w-full cursor-pointer  ${
              selectedListing === listing.id ? 'border-2 border-black rounded-[48px]' : ''
            }`}
            onClick={() => handleListingSelect(listing.id)}
          >
            <div className={`p-6 border border-black/20 rounded-40 bg-white gap-2 flex flex-col max-md:p-4 max-md:rounded-[20px] items-center transition-all duration-300 ${
              selectedListing === listing.id ? 'border-black bg-gray-50' : 'hover:border-black/40'
            }`}>
              <span className="w-full h-[350px] max-md:h-[170px] flex rounded-2xl overflow-hidden">
                <img className="w-full h-full object-cover" src={listing.image} alt={listing.title} />
              </span>
              <div className="flex items-center justify-center w-full">
                <span className="text-[22px] font-medium max-md:text-[18px]">{listing.title}</span>
                {/* <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">{listing.price}</span> */}
              </div>
              <span className="text-xs text-center max-w-[400px] text-[#8A8585]">{listing.description}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-8 max-md:flex-col gap-6">
        <span className="bg-[#F3F3F3] h-3 w-full rounded-full flex overflow-hidden max-w-[500px] invisible">
          <span className="bg-CSecondary h-full rounded-full transition-all duration-300" style={{ width: `50%` }}></span>
        </span>
        <button 
          className={`px-6 h-16 min-w-44 text-white text-lg rounded-full max-md:h-12 max-md:text-base transition-all duration-300 ${
            selectedListing ? 'bg-black hover:bg-gray-800' : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={handleNext}
          disabled={!selectedListing}
        >
          Next
        </button>
      </div>
    </section>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Startlisting />
    </Suspense>
  );
}
