"use client";
const listingOptions = [
  {
    title: "Individual Puppy Listing",
    desc: "Showcase a single puppy with detailed information, ideal for focused buyers seeking a specific companion.",
    image: "/images/vectors/startListing1.jpg",
  },
  {
    title: "Full Litter Listing",
    desc: "Display an entire litter in one listing, allowing buyers to choose from multiple pups with shared lineage and characteristics.",
    image: "/images/vectors/startListing2.png",
  },
  {
    title: "Stud Listing",
    desc: "Showcase a male dog for breeding services with images and detailed info.",
    image: "/images/vectors/startListing1.jpg",
  },
  {
    title: "Semen Listing",
    desc: "List preserved semen for breeding. Include breed, traits, and health records.",
    image: "/images/vectors/startListing1.jpg",
  },
  {
    title: "Expected Litter",
    desc: "List an upcoming litter with breed, sire and dam, and due date.",
    image: "/images/vectors/startListing1.jpg",
  },
  {
    title: "Wanted Listing",
    desc: "Create a listing to let breeders know what kind of puppy you're looking for.",
    image: "/images/vectors/startListing1.jpg",
  },
];

const Startlisting = () => {
  return (
    <>
    <section className="container relative overflow-hidden p-8 rounded-max bg-white max-md:p-4 max-md:rounded-40">
      <div className="absolute left-10 top-8 text-xs flex items-center bg-[#F3F3F3] p-0.5 rounded-full pr-2 gap-1 font-medium max-md:top-4 max-md:left-4 max-md:static max-w-max"><span className="flex size-6 bg-black rounded-full items-center justify-center"><img src="/images/vectors/arrowLeftWhite.svg" /></span> Go Back</div>
      <span className="text-[40px] font-medium flex justify-center w-full max-md:text-[32px] max-md:mt-4">Start a new listing</span>
      <div className="grid grid-cols-2 gap-6 relative z-10 mt-8 max-md:flex-col max-md:gap-4 max-md:mt-4 max-md:grid-cols-1">
        {listingOptions.map(({ title, desc, image }, index) => (
          <div key={index} className="overflow-hidden flex flex-col gap-2 w-full">
            <div className="p-6 border border-black/20 rounded-40 bg-white gap-2 flex flex-col max-md:p-4 max-md:rounded-[20px] items-center">
              <span className="w-full h-[350px] max-md:h-[170px] flex rounded-2xl overflow-hidden">
                <img className="w-full h-full object-cover" src={image} alt={title} />
              </span>
              <span className="text-[22px] font-medium max-md:text-[18px]">{title}</span>
              <span className="text-xs text-center max-w-[400px] text-[#8A8585]">{desc}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-8 max-md:flex-col gap-6">
        <span className="bg-[#F3F3F3] h-3 w-full rounded-full flex overflow-hidden max-w-[500px]"><span className="bg-CSecondary h-full rounded-full transition-all duration-300" style={{ width: `50%` }}></span></span>
        <button className="px-6 h-16 min-w-44 bg-black text-white text-lg rounded-full max-md:h-12 max-md:text-base">Next</button>
      </div>
    </section>
    </>
  );
};

export default Startlisting;
