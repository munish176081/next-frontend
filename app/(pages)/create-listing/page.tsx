"use client";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import GoBackButton from "@/_components/common/go-back-button";
import { Input } from "@/_components/ui/form-fields/input";
import { LoadingButton } from "@/_components/ui/loading-button";
import { toast } from "@/_hooks/use-toast";
import { listingFormSchema, ListingFormType } from "@/_config/validate-schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/select";
import Textarea from "@/_components/ui/form-fields/textarea";
import { useFileUpload } from "@/_services/hooks/upload";

export const dynamic = 'force-dynamic';

const listingTips = [
  {
    title: "1. Upload Clear, Bright Photos",
    points: [
      "Minimum 4 high-quality photos",
      "Include front, side, and close-up shots",
      "Ensure good lighting and no filters",
    ],
    image: "/images/vectors/listtingDetailImage1.png",
    alignRight: true,
  },
  {
    title: "2. Write a Detailed Description",
    points: [
      "Mention the breed, personality, health, and temperament",
      "Include vaccination and training info",
    ],
    image: "/images/vectors/listtingDetailImage2.png",
    alignRight: false,
  },
  {
    title: "3. Be Honest & Transparent",
    points: [
      "Include real facts: age, breed, microchip, location",
      "Add any quirks to build trust",
    ],
    image: "/images/vectors/listtingDetailImage3.png",
    alignRight: true,
  },
  {
    title: "4. Add a Short Video",
    points: [
      "10-30 seconds of playtime/interaction",
      "Shows energy, behavior, and charm",
    ],
    image: "/images/vectors/listtingDetailImage4.png",
    alignRight: false,
  },
  {
    title: '5. Use the "DNA Verified" Badge',
    points: [
      "Adds credibility and increases trust",
      "Available for DNA-tested purebred pups",
    ],
    image: "/images/vectors/listtingDetailImage5.png",
    alignRight: true,
  },
];

function CreateListingForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ListingFormType>({
    resolver: zodResolver(listingFormSchema),
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    images: string[];
    videos: string[];
  }>({
    images: [],
    videos: [],
  });

  const { uploadFile: uploadImage, isUploading: isUploadingImage, progress: imageProgress } = useFileUpload({
    onSuccess: (result) => {
      setUploadedFiles(prev => ({
        ...prev,
        images: [...prev.images, result.finalUrl]
      }));
    }
  });

  const { uploadFile: uploadVideo, isUploading: isUploadingVideo, progress: videoProgress } = useFileUpload({
    onSuccess: (result) => {
      setUploadedFiles(prev => ({
        ...prev,
        videos: [...prev.videos, result.finalUrl]
      }));
    }
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        uploadImage({ file, fileType: 'image' });
      });
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        uploadVideo({ file, fileType: 'video' });
      });
    }
  };

  async function handleFormSubmit(data: ListingFormType) {
    try {
      console.log("Form data:", data);
      console.log("Uploaded files:", uploadedFiles);
      // TODO: Implement API call to submit listing with uploaded files
      toast({
        title: "Success",
        description: "Listing created successfully!",
      });
      reset();
      setUploadedFiles({ images: [], videos: [] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <>
    <section className="container grid grid-cols-2 gap-8 max-md:p-4 max-md:gap-4 rounded-40 p-8 bg-white relative max-md:grid-cols-1">
      <div className="absolute left-8 top-8 max-md:top-4 max-md:left-4 max-md:static max-w-max">
        <GoBackButton />
      </div>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex max-md:w-full flex-col items-start max-md:p-0">
        <span className="text-[32px] font-medium mt-16 max-md:text-[28px] max-md:mt-0">Start a new listing</span>
        
        <Input
          unstyled
          type="text"
          label="Title*"
          labelClassName="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm"
          inputClassName="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12"
          error={errors?.title?.message}
          required
          placeholder="Enter your Name"
          {...register("title")}
        />

        <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Breed*</label>
            <Select onValueChange={(value) => register("breed").onChange({ target: { value } })}>
              <SelectTrigger className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12">
                <SelectValue placeholder="Select Breed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="labrador">Labrador</SelectItem>
                <SelectItem value="golden-retriever">Golden Retriever</SelectItem>
                <SelectItem value="german-shepherd">German Shepherd</SelectItem>
                <SelectItem value="bulldog">Bulldog</SelectItem>
                <SelectItem value="poodle">Poodle</SelectItem>
              </SelectContent>
            </Select>
            {errors?.breed?.message && (
              <span className="text-red text-xs mt-1">{errors.breed.message}</span>
            )}
          </div>
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Age*</label>
            <Select onValueChange={(value) => register("age").onChange({ target: { value } })}>
              <SelectTrigger className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12">
                <SelectValue placeholder="Select Age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="puppy">Puppy</SelectItem>
                <SelectItem value="young">Young</SelectItem>
                <SelectItem value="adult">Adult</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
              </SelectContent>
            </Select>
            {errors?.age?.message && (
              <span className="text-red text-xs mt-1">{errors.age.message}</span>
            )}
          </div>
        </div>

        <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
          <Input
            unstyled
            type="text"
            label="Dog name*"
            labelClassName="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm"
            inputClassName="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12"
            error={errors?.dogName?.message}
            required
            placeholder="Enter Dog name"
            {...register("dogName")}
          />
          <Input
            unstyled
            type="text"
            label="Stud fee*"
            labelClassName="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm"
            inputClassName="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12"
            error={errors?.studFee?.message}
            required
            placeholder="Enter Stud fee"
            {...register("studFee")}
          />
        </div>

        <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
          <Input
            unstyled
            type="text"
            label="Microchip Number*"
            labelClassName="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm"
            inputClassName="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12"
            error={errors?.microchipNumber?.message}
            required
            placeholder="Enter Microchip Number"
            {...register("microchipNumber")}
          />
          <Input
            unstyled
            type="text"
            label="Stud fee*"
            labelClassName="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm"
            inputClassName="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12"
            error={errors?.studFee?.message}
            required
            placeholder="Enter Stud fee"
            {...register("studFee")}
          />
        </div>

        <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
          <Input
            unstyled
            type="text"
            label="Semen type*"
            labelClassName="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm"
            inputClassName="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12"
            error={errors?.semenType?.message}
            required
            placeholder="Select type"
            {...register("semenType")}
          />
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Collection date*</label>
            <input
              type="date"
              className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12"
              {...register("collectionDate")}
            />
            {errors?.collectionDate?.message && (
              <span className="text-red text-xs mt-1">{errors.collectionDate.message}</span>
            )}
          </div>
        </div>

        <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">ANKC/Breeder Registration Number*</label>
            <Select onValueChange={(value) => register("ankcNumber").onChange({ target: { value } })}>
              <SelectTrigger className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ankc">ANKC</SelectItem>
                <SelectItem value="breeder">Breeder Registration</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors?.ankcNumber?.message && (
              <span className="text-red text-xs mt-1">{errors.ankcNumber.message}</span>
            )}
          </div>
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Shipping Availability*</label>
            <div className="flex justify-start gap-3">
              <label className="relative overflow-hidden w-full">
                <input 
                  type="radio" 
                  value="yes"
                  className="absolute w-full h-full opacity-0 peer cursor-pointer" 
                  {...register("shippingAvailability")}
                />
                <span className="h-[70px] px-5 gap-1 rounded-full flex items-center border border-black justify-center peer-checked:bg-black peer-checked:text-white">Yes</span>
              </label>
              <label className="relative overflow-hidden w-full">
                <input 
                  type="radio" 
                  value="no"
                  className="absolute w-full h-full opacity-0 peer cursor-pointer" 
                  {...register("shippingAvailability")}
                />
                <span className="h-[70px] px-5 gap-1 rounded-full flex items-center border border-black justify-center peer-checked:bg-black peer-checked:text-white">No</span>
              </label>
            </div>
            {errors?.shippingAvailability?.message && (
              <span className="text-red text-xs mt-1">{errors.shippingAvailability.message}</span>
            )}
          </div>
        </div>

        <span className="text-[32px] font-medium mt-8 max-md:text-[28px] max-md:mt-10">Contact Details</span>
        
        <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
          <Input
            unstyled
            type="text"
            label="Name*"
            labelClassName="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm"
            inputClassName="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12"
            error={errors?.contactName?.message}
            required
            placeholder="Enter name"
            {...register("contactName")}
          />
          <Input
            unstyled
            type="text"
            label="Phone No*"
            labelClassName="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm"
            inputClassName="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12"
            error={errors?.phoneNumber?.message}
            required
            placeholder="Enter your Phone No"
            {...register("phoneNumber")}
          />
        </div>

        <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
          <Input
            unstyled
            type="email"
            label="Email*"
            labelClassName="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm"
            inputClassName="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12"
            error={errors?.email?.message}
            required
            placeholder="Enter Email"
            {...register("email")}
          />
          <Input
            unstyled
            type="text"
            label="Location*"
            labelClassName="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm"
            inputClassName="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12"
            error={errors?.location?.message}
            required
            placeholder="Enter Location"
            {...register("location")}
          />
        </div>

                <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
          <div className="flex flex-col w-full border-2 border-black/20 rounded-40 p-4 relative mt-6 h-[300px] items-center justify-center">
            <input 
              type="file" 
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute top-0 left-0 w-full h-full cursor-pointer opacity-0" 
            />
            <img className="w-24" src="/images/vectors/uploadImage.png" alt="" />
            <span className="text-[22px] font-medium text-black text-center flex flex-col">
              Upload at least 3 photos 
              <small className="text-sm font-normal text-[#4B4A4A8C]">(Should have max size of 2 MB)</small>
              {isUploadingImage && imageProgress && (
                <small className="text-sm font-normal text-blue-600 mt-2">
                  Uploading: {imageProgress.progress.toFixed(1)}%
                </small>
              )}
              {uploadedFiles.images.length > 0 && (
                <small className="text-sm font-normal text-green-600 mt-2">
                  {uploadedFiles.images.length} image(s) uploaded
                </small>
              )}
            </span>
          </div>
          <div className="flex flex-col w-full border-2 border-black/20 rounded-40 p-4 relative mt-6 h-[300px] items-center justify-center">
            <input 
              type="file" 
              multiple
              accept="video/*"
              onChange={handleVideoUpload}
              className="absolute top-0 left-0 w-full h-full cursor-pointer opacity-0" 
            />
            <img className="w-24" src="/images/vectors/uploadVideo.png" alt="" />
            <span className="text-[22px] font-medium text-black text-center flex flex-col">
              Upload at least 1 Video
              <small className="text-sm font-normal text-[#4B4A4A8C]">(Should have max size of 10 MB)</small>
              {isUploadingVideo && videoProgress && (
                <small className="text-sm font-normal text-blue-600 mt-2">
                  Uploading: {videoProgress.progress.toFixed(1)}%
                </small>
              )}
              {uploadedFiles.videos.length > 0 && (
                <small className="text-sm font-normal text-green-600 mt-2">
                  {uploadedFiles.videos.length} video(s) uploaded
                </small>
              )}
            </span>
          </div>
        </div>

        <Textarea
          label="Additional Notes"
          labelClassName="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm"
          textareaClassName="text-base max-md:text-xs max-md:p-4 max-md:rounded-2xl placeholder:text-[#4B4A4A8C] font-normal outline-none p-6 w-full h-60 rounded-40 border border-[#B5B5B5]"
          error={errors?.additionalNotes?.message}
          placeholder="Enter additional notes"
          {...register("additionalNotes")}
        />

        <LoadingButton
          loading={false}
          type="submit"
          className="w-full h-20 bg-black text-white text-[22px] rounded-full mt-7 max-md:h-12 max-md:text-base"
        >
          Submit
        </LoadingButton>
      </form>
      <div className="flex max-md:w-full flex-col gap-6 bg-listingBG bg-cover h-full bg-bottom rounded-40 border border-black/20 max-md:hidden">
        <div className="flex relative flex-col h-full justify-evenly">
          <span className="text-5xl font-medium w-full text-center">Create a Winning Ad!</span>
          {listingTips.map((tip, i) => (
            <div key={i} className="flex flex-col relative mb-12">
              <img className={`absolute ${tip.alignRight ? "right-0" : "left-0"} -top-12 z-10`} src={tip.image} alt={`Tip ${i + 1}`}/>
              <div className={`bg-[#4D4D4D]/15 border border-black/30 backdrop-blur-xl p-8 ${tip.alignRight ? "pr-20 rounded-r-full" : "pl-24 rounded-l-full ml-auto"} w-[calc(100%-60px)] text-white gap-5 min-h-60 flex flex-col justify-center`}>
                <span className="text-3xl font-medium">{tip.title}</span>
                <ul className="list-disc list-outside pl-4 text-xl font-medium">
                  {tip.points.map((point, j) => (<li key={j}>{point}</li>))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CreateListingForm />
    </Suspense>
  );
} 