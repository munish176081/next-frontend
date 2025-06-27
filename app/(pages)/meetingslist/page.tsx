"use client";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

const rows = [
  {
    image:"/images/vectors/meetingDog1.png",
    listing: "Golden Retriever",
    breed: "Golden Retriever",
    price: "$1200",
    type: "Puppy Listing",
    status: "Active",
    availability: "Available",
  },
  {
    image:"/images/vectors/meetingDog2.png",
    listing: "Labrador Retriever",
    breed: "Labrador Retriever",
    price: "$1200",
    type: "Puppy Listing",
    status: "Active",
    availability: "Reserved",
  },
  {
    image:"/images/vectors/meetingDog3.png",
    listing: "Siberian Husky",
    breed: "Siberian Husky",
    price: "$1200",
    type: "Puppy Listing",
    status: "Pending",
    availability: "Sold Out",
  },
  {
    image:"/images/vectors/meetingDog4.png",
    listing: "French Bulldog",
    breed: "French Bulldog",
    price: "$1200",
    type: "Puppy Listing",
    status: "Expired",
    availability: "Available",
  },
  {
    image:"/images/vectors/meetingDog5.png",
    listing: "German Shepherd",
    breed: "German Shepherd",
    price: "$1200",
    type: "Puppy Listing",
    status: "Pending",
    availability: "Reserved",
  },
];

const statusStyles = {
  Active: "text-[#74D27E] bg-[#87D78E4D] border border-[#74D27E]",
  Pending: "text-[#FFCE20] bg-[#EFC95133] border border-[#FFCE20]",
  Expired: "text-[#EE5D50] bg-[#EE5D5033] border border-[#EE5D50]",
};

function MeetingsList() {
  return (
    <>
    <div className="flex flex-col gap-8 max-md:gap-4">
      <section className="flex container gap-4 items-center max-md:flex-col">
        <span className="text-5xl font-semibold">Hello, <span className="text-[#797777]">Jaz</span></span>
        <div className="ml-auto flex gap-4 items-center max-md:w-full max-md:justify-center">
          <select className="text-lg max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 h-[70px] rounded-full border-none w-52 max-md:h-12 appearance-none bg-selectArrow2 bg-no-repeat bg-[90%] font-medium">
            <option>Add Listing</option>
          </select>
          <span className="h-[70px] w-[70px] min-w-[70px] max-md:h-12 max-md:w-12 max-md:min-w-12 bg-white rounded-full items-center justify-center flex cursor-pointer relative"><img className="w-8 max-md:w-5 invert" src="/images/vectors/search.svg" /></span>
          <span className="h-[70px] w-[70px] min-w-[70px] max-md:h-12 max-md:w-12 max-md:min-w-12 bg-white rounded-full items-center justify-center flex cursor-pointer relative"><span className="w-6 h-6 max-md:w-3 max-md:h-3 absolute rounded-full bg-CPrimary right-0 top-0"></span><img className="w-8 max-md:w-5" src="/images/vectors/notification.svg" /></span>
        </div>
      </section>
      <section className="container relative flex gap-6 items-start">
        <div className="w-24 min-w-24 rounded-max bg-white flex flex-col gap-8 py-4 items-center max-md:hidden">
          <span className="w-16 h-16 flex items-center justify-center rounded-full"><img src="/images/vectors/menu1.png" alt="Menu1" /></span>
          <span className="w-16 h-16 flex items-center justify-center rounded-full"><img src="/images/vectors/menu2.png" alt="Menu2" /></span>
          <span className="w-16 h-16 flex items-center justify-center rounded-full"><img src="/images/vectors/menu3.png" alt="Menu3" /></span>
          <span className="w-16 h-16 flex items-center justify-center rounded-full bg-[#FFD9E8]"><img src="/images/vectors/menu4.png" alt="Menu4" /></span>
        </div>
        <div className="w-full p-4 rounded-40 bg-white">
          <div className="flex flex-col border border-black/20 rounded-[20px] pb-4">
            <div className="flex gap-4 items-center p-6 justify-between">
              <span className="text-[22px] font-semibold">Meetings</span>
              <div className="flex h-10 rounded-full border border-black/20 text-xs gap-3 items-center px-6 cursor-pointer justify-center"><img className="w-4" src="/images/vectors/filter.png" /> Filter</div>
            </div>
            <div className="overflow-auto w-full">
              <table className="w-full text-left">
                <thead className="text-[#A3AED0] text-sm border-b border-[#E9EDF7]">
                  <tr>
                    <th className="px-8 py-3 font-medium">Image</th>
                    <th className="px-8 py-3 font-medium">Title</th>
                    <th className="px-8 py-3 font-medium">Breed</th>
                    <th className="px-8 py-3 font-medium">Price</th>
                    <th className="px-8 py-3 font-medium">Type</th>
                    <th className="px-8 py-3 font-medium text-center">STATUS</th>
                    <th className="px-8 py-3 font-medium text-center">Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td className="px-8 py-3 text-sm font-medium"><span className="w-20 h-20 flex rounded-xl overflow-hidden"><img className="w-full h-full object-cover" src={row.image} alt={row.listing} /></span></td>
                      <td className="px-8 py-3 text-sm font-medium whitespace-nowrap">{row.listing}</td>
                      <td className="px-8 py-3 text-sm font-medium whitespace-nowrap">{row.breed}</td>
                      <td className="px-8 py-3 text-sm font-medium whitespace-nowrap">{row.price}</td>
                      <td className="px-8 py-3 text-sm font-medium whitespace-nowrap">{row.type}</td>
                      <td className="px-8 py-3 text-sm font-medium whitespace-nowrap text-center"><span className={`min-h-6 text-[10px] rounded-full w-14 mx-auto flex items-center justify-center ${statusStyles[row.status as keyof typeof statusStyles] || ''}`}>{row.status}</span></td>
                      <td className="px-8 py-3 text-sm font-medium whitespace-nowrap text-center">{row.availability}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MeetingsList />
    </Suspense>
  );
}
