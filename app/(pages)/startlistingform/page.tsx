"use client";
import { Suspense } from "react";
import GoBackButton from "@/_components/common/go-back-button";

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

function Startlistingform() {
  return (
    <>
    <section className="container grid grid-cols-2 gap-8 max-md:p-4 max-md:gap-4 rounded-40 p-8 bg-white relative max-md:grid-cols-1">
      <div className="absolute left-8 top-8 max-md:top-4 max-md:left-4 max-md:static max-w-max">
        <GoBackButton />
      </div>
      <div className="flex max-md:w-full flex-col items-start max-md:p-0">
        <span className="text-[32px] font-medium mt-16 max-md:text-[28px] max-md:mt-0">Start a new listing</span>
        <div className="flex flex-col w-full">
          <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Title*</label>
          <input placeholder="Enter your Name" className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12" />
        </div>
        <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Breed*</label>
            <select className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12 appearance-none bg-selectArrow2 bg-no-repeat bg-[95%]">
              <option>Select Breed</option>
            </select>
          </div>
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Age*</label>
            <select className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12 appearance-none bg-selectArrow2 bg-no-repeat bg-[95%]">
              <option>Select Age</option>
            </select>
          </div>
        </div>
        <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Dog name*</label>
            <input placeholder="Enter Dog name" className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12" />
          </div>
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Stud fee*</label>
            <input placeholder="Enter Stud fee" className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12" />
          </div>
        </div>
        <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Microchip Number*</label>
            <input placeholder="Enter Microchip Number" className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12" />
          </div>
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Stud fee*</label>
            <input placeholder="Enter Stud fee" className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12" />
          </div>
        </div>
        <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Semen type*</label>
            <input placeholder="Select type" className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12" />
          </div>
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Collection date*</label>
            <input type="date" className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12" />
          </div>
        </div>
        <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">ANKC/Breeder Registration Number*</label>
            <select className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12 appearance-none bg-selectArrow2 bg-no-repeat bg-[95%]">
              <option>Select type</option>
            </select>
          </div>
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Shipping Availability*</label>
            <div className="flex justify-start gap-3">
              <label className="relative overflow-hidden w-full"><input type="radio" name="shipping" className="absolute w-full h-full opacity-0 peer cursor-pointer" /><span className="h-[70px] px-5 gap-1 rounded-full flex items-center border border-black justify-center peer-checked:bg-black peer-checked:text-white">Yes</span></label>
              <label className="relative overflow-hidden w-full"><input type="radio" name="shipping" className="absolute w-full h-full opacity-0 peer cursor-pointer" /><span className="h-[70px] px-5 gap-1 rounded-full flex items-center border border-black justify-center peer-checked:bg-black peer-checked:text-white">No</span></label>
            </div>
          </div>
        </div>
        <span className="text-[32px] font-medium mt-8 max-md:text-[28px] max-md:mt-10">Contact Details</span>
        <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Name*</label>
            <input placeholder="Enter name" className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12" />
          </div>
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Phone No*</label>
            <input placeholder="Enter your Phone No" className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12" />
          </div>
        </div>
        <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Email*</label>
            <input placeholder="Enter Email" className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12" />
          </div>
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Location *</label>
            <input placeholder="Enter Location" className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12" />
          </div>
        </div>
        <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
          <div className="flex flex-col w-full border-2 border-black/20 rounded-40 p-4 relative mt-6 h-[300px] items-center justify-center">
          <input type="file" className="absolute top-0 left-0 w-full h-full cursor-pointer opacity-0" />
            <img className="w-24" src="/images/vectors/uploadImage.png" alt="" />
            <span className="text-[22px] font-medium text-black text-center flex flex-col">Upload at least 3 photos <small className="text-sm font-normal text-[#4B4A4A8C]">(Should have max size of 2 MB)</small></span>
          </div>
          <div className="flex flex-col w-full border-2 border-black/20 rounded-40 p-4 relative mt-6 h-[300px] items-center justify-center">
          <input type="file" className="absolute top-0 left-0 w-full h-full cursor-pointer opacity-0" />
            <img className="w-24" src="/images/vectors/uploadVideo.png" alt="" />
            <span className="text-[22px] font-medium text-black text-center flex flex-col">Upload at least 1 Video<small className="text-sm font-normal text-[#4B4A4A8C]">(Should have max size of 10 MB)</small></span>
          </div>
        </div>
        <div className="flex flex-col w-full">
          <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Additional Notes</label>
          <textarea placeholder="Enter your Name" className="text-base max-md:text-xs max-md:p-4 max-md:rounded-2xl placeholder:text-[#4B4A4A8C] font-normal outline-none p-6 w-full h-60 rounded-40 border border-[#B5B5B5]"></textarea>
        </div>
        <button className="w-full h-20 bg-black text-white text-[22px] rounded-full mt-7 max-md:h-12 max-md:text-base">Submit</button>
      </div>
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
      <Startlistingform />
    </Suspense>
  );
}
