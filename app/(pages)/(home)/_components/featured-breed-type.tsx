"use client";

import Section from "@/_components/common/section";
import { PawsIconIndigo } from "@/_components/icons/paws-icon-indigo";
import { PuppyButton } from "@/_components/ui/puppy-button";
import {
  Autoplay,
  Navigation,
  Swiper,
  SwiperSlide,
} from "@/_components/ui/slider";
import { useBreedCategories } from "@/_services/hooks/breeds/use-breed-categories";
import { useBreedsByCategory } from "@/_services/hooks/breeds/use-breeds-by-category";
import { truncateBreedDescription } from "@/_utils/text-utils";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect, useRef } from "react";

export const FeaturedBreedsByType = () => {
  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useBreedCategories();
  
  // Create filters from breed categories
  const filters = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    return categories.map((category: string) => ({
      id: category,
      label: category.charAt(0).toUpperCase() + category.slice(1) + ' Breeds'
    }));
  }, [categories]);

  const [selectedFilter, setSelectedFilter] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Set initial filter when categories are loaded
  useEffect(() => {
    if (filters.length > 0 && !selectedFilter) {
      setSelectedFilter(filters[0].id);
    }
  }, [filters, selectedFilter]);

  // Scroll to selected filter
  const scrollToFilter = (filterId: string) => {
    if (scrollContainerRef.current) {
      const selectedButton = scrollContainerRef.current.querySelector(`[data-filter-id="${filterId}"]`);
      if (selectedButton) {
        selectedButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  };

  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    scrollToFilter(filterId);
  };

  // Fetch breeds for the selected category
  const { data: breeds, isLoading: isLoadingBreeds, error: breedsError } = useBreedsByCategory(selectedFilter);

  const isLoading = isLoadingCategories || isLoadingBreeds;
  const error = categoriesError || breedsError;

  // Show loading state
  if (isLoading) {
    return (
      <section className="container rounded-max border border-black/20 bg-white flex flex-col relative p-8 shadow-section mt-16 max-md:mt-8 max-md:px-4 max-md:pt-6 max-md:pb-0 max-md:rounded-40">
        <div className="flex flex-col gap-4 items-center m-auto relative w-full">
          <PawsIconIndigo className="w-16 h-16 max-md:max-w-5 max-md:max-h-5"/>
          <h1 className="text-40 max-md:text-[32px] font-medium leading-none text-center">Browse by Breed Type</h1>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading breed types...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="container rounded-max border border-black/20 bg-white flex flex-col relative p-8 shadow-section mt-16 max-md:mt-8 max-md:px-4 max-md:pt-6 max-md:pb-0 max-md:rounded-40">
        <div className="flex flex-col gap-4 items-center m-auto relative w-full">
          <PawsIconIndigo className="w-16 h-16 max-md:max-w-5 max-md:max-h-5"/>
          <h1 className="text-40 max-md:text-[32px] font-medium leading-none text-center">Browse by Breed Type</h1>
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load breed types. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
    <section className="container rounded-max border border-black/20 bg-white flex flex-col relative p-8 shadow-section mt-16 max-md:mt-8 max-md:px-4 max-md:pt-6 max-md:pb-0 max-md:rounded-40">
      <div className="flex flex-col gap-4 items-center m-auto relative w-full">
        <PawsIconIndigo className="w-16 h-16 max-md:max-w-5 max-md:max-h-5"/>
        <h1 className="text-40 max-md:text-[32px] font-medium leading-none text-center">Browse by Breed Type</h1>
        <span className="text-xl max-md:text-base text-center font-[300] max-w-[900px] mt-2 w-full leading-normal">Meet our <strong className="font-semibold">adorable stars</strong>—each one nurtured in a <strong className="font-semibold">loving</strong> environment and ready for their forever home. Explore our <strong className="font-semibold">featured listings</strong> to find the <span className="relative font-semibold">perfect match <img className="absolute left-0 -bottom-2.5" src="/images/vectors/BroswByBreTypeLine.svg"/></span> for your family.</span>
        <PuppyButton iconSrc="/images/paws/paws-white-vertical.svg" altText="Paws icon" className="tracking-wide max-md:w-full max-md:order-2 max-md:-mt-4 max-md:mb-4">Browse Listing</PuppyButton> 
        <div className="flex relative h-48 w-full items-center -mt-8 max-md:mt-0 max-md:h-auto">
          <div className="flex relative z-10 bg-white p-2 rounded-full w-full shadow-section overflow-hidden">
            {/* Left fade overlay */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none"></div>
            {/* Right fade overlay */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none"></div>
            
            <div 
              ref={scrollContainerRef}
              className="flex w-full overflow-x-auto scrollbar-hide scroll-smooth"
            >
              <div className="flex gap-2 min-w-max px-2">
                {filters.map((filter: any, index: number) => (
                  <button 
                    key={filter.id} 
                    data-filter-id={filter.id}
                    onClick={() => handleFilterChange(filter.id)} 
                    className={`rounded-full font-semibold whitespace-nowrap px-8 max-md:px-6 leading-tight flex items-center text-base justify-center gap-2 h-12 max-md:h-10 max-md:text-xs transition-all duration-300 ease-in-out ${
                      selectedFilter === filter.id 
                        ? "bg-CPrimary text-white shadow-lg scale-105" 
                        : "bg-white text-gray-700 hover:bg-gray-50 hover:scale-102"
                    }`}
                  >
                    {index === filters.length - 1 && filter.label === "Companion/Designer Breeds" ? (
                      <>Companion/<br className="max-md:hidden" />Designer Breeds</>
                    ) : filter.label} 
                    <img className="w-4 h-4" src="/images/paws/image.png" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <img className="absolute top-0 left-0 -ml-8 min-w-[calc(100%+64px)] max-md:hidden" src="/images/comman/watermark.png" alt="yellow-bg" />
          <img src="/images/vectors/browsebybreadmob.svg" className="absolute -bottom-16 left-0 -mx-4 max-w-[calc(100%+32px)] max-md:flex hidden" alt="yellow-bg" />
        </div>
        <div className="group/section relative w-full max-md:w-[calc(100%+32px)] -mt-16 max-md:mt-0 max-md:overflow-hidden max-md:-mx-4 max-md:px-4">
          <Swiper loop={false} autoplay={{ delay: 2000 }} spaceBetween={16} navigation={{nextEl: ".swipperNextBtn", prevEl: ".swipperPrevBtn",}} breakpoints={{768: { slidesPerView: 1, spaceBetween: 10 }, 840: { slidesPerView: 2, spaceBetween: 10 }, 1100: { slidesPerView: 4, spaceBetween: 10 },}} className="!px-8 !pt-12 !pb-12 max-md:!pb-4 max-md:!pt-0 !-mx-8">
            {breeds && Array.isArray(breeds) ? breeds.map((breed: any, index: number) => (
                <SwiperSlide key={`breed-${breed.id}`} className="">
                  <Link href={`/explore?breed=${encodeURIComponent(breed.name)}`} className="group flex w-full flex-col rounded-3xl bg-white p-4 transition-all shadow-CCard hover:shadow-CCardHover max-md:hover:shadow-CCard h-full">
                    <div className="relative flex h-48 group-hover:h-60 max-md:group-hover:h-48 w-full overflow-hidden items-center justify-center rounded-2xl transition-all max-w-full self-center">
                      {breed.imageUrl ? (
                        <img className="w-full h-full object-cover" src={breed.imageUrl} alt={breed.name} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="text-center">
                            <PawsIconIndigo className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                            <p className="text-gray-500 text-sm">No Image</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-grow">
                      <h3 className="!text-2xl font-medium mt-3">{breed.name}</h3>
                      <span className="text-gray-500 mt-1 text-sm h-16 flex items-start leading-relaxed">
                        {truncateBreedDescription(breed.description || breed.temperament) || 'Find dogs from this breed'}
                      </span>
                      <div className="mt-auto pt-3">
                        <PuppyButton className="w-full text-sm md:text-base" iconSrc="/images/paws/paws-white-vertical.svg" altText="Paws icon">Find dogs from this breed</PuppyButton>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              )
            ) : null}
          </Swiper>
        </div>
      </div>
    </section>
    </>
  );
};
