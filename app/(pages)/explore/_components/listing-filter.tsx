"use client";

import { z } from "zod";
import { Button, Combobox } from "@/_components/ui";
import RangeSlider from "@/_components/ui/range-slider";
import { LISTING_TYPES } from "@/_config/data";
import { formatListingType } from "@/_utils/listing";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useSearchParams,
  useRouter,
  ReadonlyURLSearchParams,
} from "next/navigation";
import { ListingTypeEnum } from "@/_types/listing";
import { toast } from "@/_hooks/use-toast";
import { Routes } from "@/_config/routes";
import { useBreeds } from "@/_services/hooks/breeds/useBreeds";
import { LocationAutoComplete } from "@/_components/common/location-auto-complete";
import { useEffect } from "react";

export const listingFilterSchema = z
  .object({
    // @ts-expect-error must be const ts error can be ignore
    types: z.array(z.enum(LISTING_TYPES)).optional(),
    breed: z.string().optional(),
    age: z.string().optional(),
    location: z.string().optional(),
    minPrice: z.coerce
      .number()
      .optional()
      .refine((price) => (price ? price >= 0 : true), {
        message: "Min price must be greater than 0",
      }),
    maxPrice: z.coerce.number().max(100_000_000).optional(),
    priceTypes: z.array(z.enum(['price_on_request', 'price_range', 'price_available'])).optional(),
  })
  .refine(
    (data) => {
      if (data.minPrice && data.maxPrice && data.minPrice > data.maxPrice) {
        return false;
      }

      return true;
    },
    { message: "min price must be less than max price", path: ["minPrice"] }
  );

export type ListingFilterType = z.infer<typeof listingFilterSchema>;

export const extractFilterDataFromSeach = (params: ReadonlyURLSearchParams) => {
  const types = params.get("types");
  const breed = params.get("breed") ? decodeURIComponent(params.get("breed")!) : null;
  const age = params.get("age");
  const location = params.get("location");
  const address = params.get("address");
  const lat = params.get("lat");
  const lng = params.get("lng");
  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");
  const priceTypes = params.get("priceTypes");
  const search = params.get("search");
  const page = params.get("page");

  console.log(params, search);

  return {
    ...(types && {
      types: types.split(",") as ListingTypeEnum[],
    }),
    ...(breed && { breed }),
    ...(age && { age }),
    ...(location && { location }),
    ...(address && { address }),
    ...(lat && { lat }),
    ...(lng && { lng }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
    ...(priceTypes && { priceTypes: priceTypes.split(",") as ('price_on_request' | 'price_range' | 'price_available')[] }),
    ...(search && { search }),
    ...(page && { page: Number(page) }),
  };
};

type ListingFilterProps = {
  showFilterBtn: boolean;
  setShowFilterBtn: (value: boolean) => void;
};
export const ListingFilter = ({ showFilterBtn, setShowFilterBtn }: ListingFilterProps) => {
  const searchParams = useSearchParams();
  const { lat, lng, address, maxPrice, minPrice, breed, age, location, priceTypes, ...defaultValues } =
    extractFilterDataFromSeach(searchParams);

  // Fetch breeds from API
  const { breeds, isLoading: breedsLoading } = useBreeds();

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useForm<ListingFilterType>({
    defaultValues: {
      types: defaultValues.types || [],
      breed: breed || "",
      age: age || "",
      location: location || "",
      ...(minPrice && { minPrice: +minPrice }),
      ...(maxPrice && { maxPrice: +maxPrice }),
      priceTypes: priceTypes || ['price_on_request', 'price_range', 'price_available'],
      ...defaultValues,
    },
    mode: "onChange",
    resolver: zodResolver(listingFilterSchema),
  });
  const router = useRouter();
  const minInputPrice = watch("minPrice") ?? 0;
  const maxInputPrice = watch("maxPrice") ?? 0;
  const minPriceSpan = watch("minPrice") ?? 0;
  const maxPriceSpan = watch("maxPrice") ?? 0;

  /**
   * Sync form values when URL params actually change
   * (e.g., navigating from home with a pre-selected breed).
   *
   * IMPORTANT: We reset the form from the URL, instead of
   * overwriting user edits on every render. This fixes the issue
   * where selecting filters (breed, location, age, etc.) would
   * immediately get reverted back to the old URL values.
   */
  useEffect(() => {
    const {
      lat: _lat,
      lng: _lng,
      address: _address,
      maxPrice: syncMaxPrice,
      minPrice: syncMinPrice,
      breed: syncBreed,
      age: syncAge,
      location: syncLocation,
      priceTypes: syncPriceTypes,
      ...syncDefaultValues
    } = extractFilterDataFromSeach(searchParams);

    reset({
      types: syncDefaultValues.types || [],
      breed: syncBreed || "",
      age: syncAge || "",
      location: syncLocation || "",
      ...(syncMinPrice && { minPrice: +syncMinPrice }),
      ...(syncMaxPrice && { maxPrice: +syncMaxPrice }),
      priceTypes: syncPriceTypes || ['price_on_request', 'price_range', 'price_available'],
      ...syncDefaultValues,
    });
    // Using stringified search params as a stable dependency so this
    // only runs when the URL query actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString(), reset]);

  function handleFormSubmit(data: ListingFilterType) {
    if (Object.keys(errors).length > 0) {
      toast({ title: "Invalid filter" });
      return;
    }

    const params = new URLSearchParams();

    if (data.types) {
      params.set("types", data.types.join(","));
    }

    if (data.breed) {
      params.set("breed", data.breed);
    }

    if (data.age) {
      params.set("age", data.age);
    }

    if (data.location) {
      params.set("location", data.location);
    }

    if (data.minPrice) {
      params.set("minPrice", data.minPrice.toString());
    }

    if (data.maxPrice) {
      params.set("maxPrice", data.maxPrice.toString());
    }

    if (data.priceTypes && data.priceTypes.length > 0) {
      params.set("priceTypes", data.priceTypes.join(","));
    }

    router.push(`${Routes.public.explore}?${params.toString()}`);
    
    // Close filter after applying (especially important on mobile)
    setShowFilterBtn(false);
  }
  return (
    <form noValidate onSubmit={handleSubmit((d) => handleFormSubmit(d))} className={`min-w-80 w-80 p-4 rounded-3xl bg-white border border-black/20 flex flex-col gap-4 sticky top-6 max-h-[calc(100vh-50px)]
    
    max-md:!fixed max-md:z-50 max-md:max-h-screen max-md:top-0 max-md:border-none max-md:rounded-none max-md:w-full max-md:left-0 ${showFilterBtn ? "" : "max-md:hidden"}`}>
      <span className="text-2xl font-semibold flex justify-between items-center">
        Filter 
        <button 
          type="button"
          onClick={() => setShowFilterBtn(false)} 
          className="w-8 h-8 p-1.5 justify-center items-center flex hover:bg-gray-100 rounded-full transition-colors lg:hidden"
          aria-label="Close filter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="w-full h-full">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
          </svg>
        </button>
      </span>
      <div className="flex flex-col h-[calc(100%-112px)] overflow-y-auto -mr-4 pr-4 gap-6 pb-3">
        <Controller name="types" control={control} render={({ field }) => (
          <div className="flex flex-col gap-2">
            <span className="text-xl font-medium">Listing Types</span>
            <div className="flex flex-wrap justify-start gap-2">
              {LISTING_TYPES.map((type) => (
                <label key={type} className="relative overflow-hidden">
                  <input type="checkbox" className="absolute w-full h-full opacity-0 peer cursor-pointer" id={type} value={type} checked={field.value?.includes(type)} onChange={(e) => {const updatedFields = [...field.value!];const index = updatedFields.indexOf(type);const isExist = index >= 0;const { checked } = e.target;if (isExist && checked) return;if (!checked && isExist) {updatedFields.splice(index, 1);field.onChange(updatedFields);return;}if (checked && !isExist) {updatedFields.push(type); field.onChange(updatedFields);}}}/>
                  <span className="h-10 px-3 text-[13px] border-2 border-black/20 rounded-full flex items-center bg-[#F3F3F3] justify-center peer-checked:border-black peer-checked:pr-8 peer-checked:bg-CPrimary/20 text-[#736E6E]">{formatListingType(type)} Listing</span><svg xmlns="http://www.w3.org/2000/svg" className="hidden peer-checked:inline w-4 h-4 absolute right-3 top-0 bottom-0 my-auto cursor-pointer" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                </label>
              ))}
            </div>
          </div>
        )}/>
        <div className="flex flex-col gap-2">
          <span className="text-xl font-medium">Gender</span>
          <div className="flex flex-wrap justify-start gap-3">
            <label className="relative overflow-hidden"><input type="radio" name="genderFilter" className="absolute w-full h-full opacity-0 peer cursor-pointer" /><span className="h-10 px-5 gap-1 rounded-full flex items-center bg-[#F3F3F3] justify-center peer-checked:bg-black peer-checked:text-white"><svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="mask0_3_14246" maskUnits="userSpaceOnUse" x="0" y="0" width="15" height="16"><path d="M0.224609 0.499369H14.9645V15.2393H0.224609V0.499369Z" fill="white"/></mask><g mask="url(#mask0_3_14246)"><path d="M8.82227 6.64062L13.1214 2.34149" stroke="currentColor" strokeWidth="1.38186"strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.44562 14.3179C3.07127 14.3179 1.14648 12.3931 1.14648 10.0187C1.14648 7.64439 3.07127 5.7196 5.44562 5.7196C7.81997 5.7196 9.74475 7.64439 9.74475 10.0187C9.74475 12.3931 7.81997 14.3179 5.44562 14.3179Z" stroke="currentColor" strokeWidth="1.38186"strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.3574 1.4205H12.8141C13.4921 1.4205 14.0424 1.97079 14.0424 2.64882V5.10547" stroke="currentColor" strokeWidth="1.38186"strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/></g></svg>Male</span></label>
            <label className="relative overflow-hidden"><input type="radio" name="genderFilter" className="absolute w-full h-full opacity-0 peer cursor-pointer" /><span className="h-10 px-5 gap-1 rounded-full flex items-center bg-[#F3F3F3] justify-center peer-checked:bg-black peer-checked:text-white"><svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.17578 9.67554V14.189" stroke="currentColor" strokeWidth="1.35403"strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.36719 12.3838H6.97792" stroke="currentColor" strokeWidth="1.35403"strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/><path d="M1.26172 5.46288C1.26172 3.30246 3.01293 1.55125 5.17335 1.55125C7.33377 1.55125 9.08498 3.30246 9.08498 5.46288C9.08498 7.6233 7.33377 9.37451 5.17335 9.37451C3.01293 9.37451 1.26172 7.6233 1.26172 5.46288Z" stroke="currentColor" strokeWidth="1.35403"strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/></svg>Female</span></label>
          </div>
        </div>
       
        <Controller name="breed" control={control} render={({ field }) => (
          <div className="flex flex-col gap-2">
            <span className="text-xl font-medium">Breed</span>
            <div className="flex flex-col">
              {breedsLoading ? (
                <div className="w-full h-12 bg-[#F1F1F1] rounded-full flex items-center justify-center text-sm text-[#736E6E]">
                  Loading breeds...
                </div>
              ) : (
                <Combobox 
                  showLabel={false} 
                  label="Select breed" 
                  value={field.value || ""} 
                  setValue={(value) => field.onChange(value)} 
                  options={[...breeds].sort((a, b) => 
                    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
                  ).map((breed) => ({
                    value: breed.name,
                    label: breed.name,
                  }))} 
                  btnClassName="w-full border-none !bg-[#F1F1F1] rounded-full !h-12 p-2 px-4 text-sm text-[#736E6E] font-light justify-between flex" 
                  popoverClassName="w-[--radix-popover-trigger-width]" 
                  error={errors?.breed?.message}
                />
              )}
            </div>
          </div>
        )}/>
        
        <Controller name="age" control={control} render={({ field }) => (
          <div className="flex flex-col gap-2">
            <span className="text-xl font-medium">Age</span>
            <div className="flex flex-col">
              <Combobox 
                showLabel={false} 
                label="Select age" 
                value={field.value || ""} 
                setValue={(value) => field.onChange(value)} 
                options={[
                  { value: "puppy", label: "Puppy (8-12 weeks)" },
                  { value: "young", label: "Young (3-6 months)" },
                  { value: "adult", label: "Adult (1-3 years)" },
                  { value: "senior", label: "Senior (7+ years)" },
                  { value: "any", label: "Any Age" }
                ]} 
                btnClassName="w-full border-none !bg-[#F1F1F1] rounded-full !h-12 p-2 px-4 text-sm text-[#736E6E] font-light justify-between flex" 
                popoverClassName="w-[--radix-popover-trigger-width]" 
                error={errors?.age?.message}
              />
            </div>
          </div>
        )}/>
        
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <span className="text-xl font-medium">Location</span>
              <div className="flex flex-col">
                <LocationAutoComplete
                  onSearchPlace={(place) => {
                    if (!place) return;

                    const components = place.address_components ?? [];
                    const isInAustralia = components.some(
                      (c) =>
                        c.types.includes("country") && c.short_name === "AU"
                    );

                    if (!isInAustralia) {
                      field.onChange(place.formatted_address || "");
                      return;
                    }

                    const suburb = components.find((c) =>
                      c.types.includes("locality")
                    )?.long_name;
                    const postcode = components.find((c) =>
                      c.types.includes("postal_code")
                    )?.long_name;
                    const state = components.find((c) =>
                      c.types.includes("administrative_area_level_1")
                    )?.short_name;

                    const parts = [suburb, postcode, state].filter(Boolean);
                    const formatted =
                      parts.length > 0
                        ? parts.join(", ")
                        : place.formatted_address || "";

                    field.onChange(formatted);
                  }}
                  loader={
                    <div className="w-full h-12 bg-[#F1F1F1] rounded-full flex items-center justify-center text-sm text-[#736E6E]">
                      Loading...
                    </div>
                  }
                >
                  <input
                    type="text"
                    placeholder="Select location"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full border-none !bg-[#F1F1F1] rounded-full !h-12 p-2 px-4 text-sm text-[#736E6E] font-light outline-none"
                  />
                </LocationAutoComplete>
                {errors?.location?.message && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.location.message}
                  </span>
                )}
              </div>
            </div>
          )}
        />
        
        <Controller name="priceTypes" control={control} render={({ field }) => (
          <div className="flex flex-col gap-2">
            <span className="text-xl font-medium">Price Type</span>
            <div className="flex flex-col gap-2">
              {[
                { value: "price_on_request", label: "Price on Request" },
                { value: "price_range", label: "Price Range" },
                { value: "price_available", label: "Fixed Price Available" }
              ].map((option) => (
                <label key={option.value} className="relative overflow-hidden">
                  <input 
                    type="checkbox" 
                    className="absolute w-full h-full opacity-0 peer cursor-pointer" 
                    id={option.value} 
                    value={option.value} 
                    checked={field.value?.includes(option.value as 'price_on_request' | 'price_range' | 'price_available')} 
                    onChange={(e) => {
                      const updatedFields = [...(field.value || [])];
                      const index = updatedFields.indexOf(option.value as 'price_on_request' | 'price_range' | 'price_available');
                      const isExist = index >= 0;
                      const { checked } = e.target;
                      if (isExist && checked) return;
                      if (!checked && isExist) {
                        updatedFields.splice(index, 1);
                        field.onChange(updatedFields);
                        return;
                      }
                      if (checked && !isExist) {
                        updatedFields.push(option.value as 'price_on_request' | 'price_range' | 'price_available');
                        field.onChange(updatedFields);
                      }
                    }}
                  />
                  <span className="h-10 px-3 text-[13px] border-2 border-black/20 rounded-full flex items-center bg-[#F3F3F3] justify-center peer-checked:border-black peer-checked:pr-8 peer-checked:bg-CPrimary/20 text-[#736E6E] w-full">{option.label}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="hidden peer-checked:inline w-4 h-4 absolute right-3 top-0 bottom-0 my-auto cursor-pointer" viewBox="0 0 384 512">
                    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                  </svg>
                </label>
              ))}
            </div>
          </div>
        )}/>
        
        <div className="flex flex-col gap-4">
          <span className="text-xl font-medium">Price Range</span>
          <div className="flex flex-col gap-6 mx-3">
            <RangeSlider color="primary" range min={0} max={10_000} value={[minInputPrice, maxInputPrice]} dots={false} size="lg" onChange={(value) => {if (!Array.isArray(value)) return;const [minPrice, maxPrice] = value;setValue("minPrice", minPrice);setValue("maxPrice", maxPrice);}}/>
            <div className="flex gap-4 -mx-3">
              <span className="flex flex-col bg-[#F1F1F1] h-12 justify-center leading-tight rounded-full w-full items-center text-[#736E6E]">Min<span className="text-base font-semibold text-black">${minPriceSpan || "0"}</span></span>
              <span className="flex flex-col bg-[#F1F1F1] h-12 justify-center leading-tight rounded-full w-full items-center text-[#736E6E]">Max<span className="text-base font-semibold text-black">${maxPriceSpan || "0"}</span></span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="rounded-full h-12 w-full text-base" 
          type="button" 
          onClick={() => {
            handleFormSubmit({});
            reset();
          }}
        >
          Reset
        </Button>
        <Button 
          className="rounded-full h-12 w-full text-base" 
          type="submit"
        >
          Apply
        </Button>
      </div>



      
    </form>
  );
};
