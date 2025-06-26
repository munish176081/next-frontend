"use client";

import { z } from "zod";
import { SearchLocationInput } from "@/_components/common/search-location-input";
import { Button, Combobox } from "@/_components/ui";
import { Checkbox, FieldError } from "@/_components/ui/form-fields";
import AdvancedRadio from "@/_components/ui/form-fields/advanced-radiobox";
import RangeSlider from "@/_components/ui/range-slider";
import { Heading } from "@/_components/ui/typegraphy";
import { DOG_BREEDS_OPTIONS, LISTING_TYPES } from "@/_config/data";
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
import { optionalLocationSchema } from "@/_config/validate-schema";
import { Routes } from "@/_config/routes";

export const listingFilterSchema = z
  .object({
    // @ts-expect-error must be const ts error can be ignore
    types: z.array(z.enum(LISTING_TYPES)).optional(),
    breed: z.string().optional(),
    location: optionalLocationSchema.optional(),
    minPrice: z.coerce
      .number()
      .optional()
      .refine((price) => (price ? price >= 0 : true), {
        message: "Min price must be greater than 0",
      }),
    maxPrice: z.coerce.number().max(100_000_000).optional(),
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
  const breed = params.get("breed");
  const address = params.get("address");
  const lat = params.get("lat");
  const lng = params.get("lng");
  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");

  return {
    ...(types && {
      types: types.split(",") as ListingTypeEnum[],
    }),
    ...(breed && { breed }),
    ...(address && { address }),
    ...(lat && { lat }),
    ...(lng && { lng }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
  };
};

export const ListingFilter = () => {
  const searchParams = useSearchParams();
  const { lat, lng, address, maxPrice, minPrice, ...defaultValues } =
    extractFilterDataFromSeach(searchParams);

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
      types: [],
      breed: "",
      location: {
        ...(lat && { lat: +lat }),
        ...(lng && { lng: +lng }),
        ...(address && { address }),
      },
      ...(minPrice && { minPrice: +minPrice }),
      ...(maxPrice && { maxPrice: +maxPrice }),
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

    const location = data.location;

    if (location) {
      if (location.address) params.set("address", location.address);
      if (location.lat) params.set("lat", location.lat.toString());
      if (location.lng) params.set("lng", location.lng.toString());
    }

    if (data.minPrice) {
      params.set("minPrice", data.minPrice.toString());
    }

    if (data.maxPrice) {
      params.set("maxPrice", data.maxPrice.toString());
    }

    router.push(`${Routes.public.explore}?${params.toString()}`);
  }

  return (
    <form noValidate onSubmit={handleSubmit((d) => handleFormSubmit(d))} className="min-w-80 w-80 p-4 rounded-3xl bg-white border border-black/20 flex flex-col gap-4 sticky top-6 max-h-[calc(100vh-50px)]">
      <span className="text-2xl font-semibold">Filter</span>
      <div className="flex flex-col h-[calc(100%-112px)] overflow-y-auto -mr-4 pr-4 gap-6 pb-3">
        <Controller name="types" control={control} render={({ field }) => (
          <div className="flex flex-col gap-2">
            <span className="text-xl font-medium">Listing Types</span>
            <div className="flex flex-wrap justify-start gap-2">
              {LISTING_TYPES.map((type) => (
                <label key={type} className="relative overflow-hidden">
                  <input type="checkbox" className="absolute w-full h-full opacity-0 peer cursor-pointer" id={type} value={type} checked={field.value?.includes(type)} onChange={(e) => {const updatedFields = [...field.value!];const index = updatedFields.indexOf(type);const isExist = index >= 0;const { checked } = e.target;if (isExist && checked) return;if (!checked && isExist) {updatedFields.splice(index, 1);field.onChange(updatedFields);return;}if (checked && !isExist) {updatedFields.push(type); field.onChange(updatedFields);}}}/>
                  <span className="h-10 px-3 text-[13px] border-2 border-black/20 rounded-full flex items-center bg-[#F3F3F3] justify-center peer-checked:border-black peer-checked:bg-CPrimary/20 text-[#736E6E]">{formatListingType(type)} Listing </span>
                </label>
              ))}
            </div>
          </div>
        )}/>
        <div className="flex flex-col gap-2">
          <span className="text-xl font-medium">Gender</span>
          <div className="flex flex-wrap justify-start gap-3">
            <label className="relative overflow-hidden"><input type="radio" name="genderFilter" className="absolute w-full h-full opacity-0 peer cursor-pointer" /><span className="h-10 px-5 gap-1 rounded-full flex items-center bg-[#F3F3F3] justify-center peer-checked:bg-black peer-checked:text-white"><svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="mask0_3_14246" maskUnits="userSpaceOnUse" x="0" y="0" width="15" height="16"><path d="M0.224609 0.499369H14.9645V15.2393H0.224609V0.499369Z" fill="white"/></mask><g mask="url(#mask0_3_14246)"><path d="M8.82227 6.64062L13.1214 2.34149" stroke="currentColor" stroke-width="1.38186" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.44562 14.3179C3.07127 14.3179 1.14648 12.3931 1.14648 10.0187C1.14648 7.64439 3.07127 5.7196 5.44562 5.7196C7.81997 5.7196 9.74475 7.64439 9.74475 10.0187C9.74475 12.3931 7.81997 14.3179 5.44562 14.3179Z" stroke="currentColor" stroke-width="1.38186" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.3574 1.4205H12.8141C13.4921 1.4205 14.0424 1.97079 14.0424 2.64882V5.10547" stroke="currentColor" stroke-width="1.38186" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></g></svg>Male</span></label>
            <label className="relative overflow-hidden"><input type="radio" name="genderFilter" className="absolute w-full h-full opacity-0 peer cursor-pointer" /><span className="h-10 px-5 gap-1 rounded-full flex items-center bg-[#F3F3F3] justify-center peer-checked:bg-black peer-checked:text-white"><svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.17578 9.67554V14.189" stroke="currentColor" stroke-width="1.35403" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.36719 12.3838H6.97792" stroke="currentColor" stroke-width="1.35403" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M1.26172 5.46288C1.26172 3.30246 3.01293 1.55125 5.17335 1.55125C7.33377 1.55125 9.08498 3.30246 9.08498 5.46288C9.08498 7.6233 7.33377 9.37451 5.17335 9.37451C3.01293 9.37451 1.26172 7.6233 1.26172 5.46288Z" stroke="currentColor" stroke-width="1.35403" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg>Female</span></label>
          </div>
        </div>
        <Controller name="breed" control={control} render={({ field }) => (
          <div className="flex flex-col gap-2">
            <span className="text-xl font-medium">Breeder</span>
            <div className="flex flex-col">
              <Combobox showLabel={false} label="Select breeder" value={field.value!} setValue={(value) => field.onChange(value)} options={DOG_BREEDS_OPTIONS.map((option) => ({value: option.value,label: option.label,}))} btnClassName="w-full border-none !bg-[#F1F1F1] rounded-full !h-12 p-2 px-4 text-sm text-[#736E6E] font-light justify-between flex" popoverClassName="w-[--radix-popover-trigger-width]" error={errors?.breed?.message}/>
            </div>
          </div>
        )}/>
        <Controller name="breed" control={control} render={({ field }) => (
          <div className="flex flex-col gap-2">
            <span className="text-xl font-medium">Breed</span>
            <div className="flex flex-col">
              <Combobox showLabel={false} label="Select breed" value={field.value!} setValue={(value) => field.onChange(value)} options={DOG_BREEDS_OPTIONS.map((option) => ({value: option.value,label: option.label,}))} btnClassName="w-full border-none !bg-[#F1F1F1] rounded-full !h-12 p-2 px-4 text-sm text-[#736E6E] font-light justify-between flex" popoverClassName="w-[--radix-popover-trigger-width]" error={errors?.breed?.message}/>
            </div>
          </div>
        )}/>
        <Controller name="breed" control={control} render={({ field }) => (
          <div className="flex flex-col gap-2">
            <span className="text-xl font-medium">Age</span>
            <div className="flex flex-col">
              <Combobox showLabel={false} label="Select age" value={field.value!} setValue={(value) => field.onChange(value)} options={DOG_BREEDS_OPTIONS.map((option) => ({value: option.value,label: option.label,}))} btnClassName="w-full border-none !bg-[#F1F1F1] rounded-full !h-12 p-2 px-4 text-sm text-[#736E6E] font-light justify-between flex" popoverClassName="w-[--radix-popover-trigger-width]" error={errors?.breed?.message}/>
            </div>
          </div>
        )}/>
        <Controller name="breed" control={control} render={({ field }) => (
          <div className="flex flex-col gap-2">
            <span className="text-xl font-medium">Location</span>
            <div className="flex flex-col">
              <Combobox showLabel={false} label="Select location" value={field.value!} setValue={(value) => field.onChange(value)} options={DOG_BREEDS_OPTIONS.map((option) => ({value: option.value,label: option.label,}))} btnClassName="w-full border-none !bg-[#F1F1F1] rounded-full !h-12 p-2 px-4 text-sm text-[#736E6E] font-light justify-between flex" popoverClassName="w-[--radix-popover-trigger-width]" error={errors?.breed?.message}/>
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
        <Button variant="outline" className="rounded-full h-12 w-full text-base" type="button" onClick={() => {handleFormSubmit({});reset();}}>Reset</Button>
        <Button className="rounded-full h-12 w-full text-base" type="submit">Apply</Button>
      </div>

      {/* <Controller
        name="location"
        control={control}
        render={({ field }) => (
          <SearchLocationInput
            locationInputAddress={field.value?.address}
            onChangeSearchInput={(value) => {
              field.onChange({
                address: value,
              });
            }}
            onChangePlace={(place) => {
              if (!place) return;

              field.onChange({
                address: place.formatted_address!,
                ...(place.geometry?.location?.toJSON() ?? {}),
              });
            }}
            error={
              errors.location?.message ||
              errors?.location?.address?.message ||
              errors?.location?.lat?.message ||
              errors?.location?.lng?.message
            }
          />
        )}
      /> */}


      {/* {errors.minPrice && (
        <FieldError size="xl" error={errors.minPrice?.message} />
      )} */}

      
    </form>
  );
};
