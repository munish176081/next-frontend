"use client";
import {Autoplay, Navigation, Swiper, SwiperSlide,} from "@/_components/ui/slider";
import ActionIcon from "@/_components/ui/action-icon";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

const blogs = [
  {
    id: "123",
    category: "Travel & Adventure",
    title: "Smooth Sailing for Lake Union Cruising",
    description: "Get your pup accustomed to the waves with simple training steps. Make every voyage an exciting adventure.",
    author: "Knapp Phebe",
    date: "March 2, 2025",
    image: "/images/vectors/blog1.jpg",
    flip: true,
  },
  {
    id: "123",
    category: "Travel & Adventure",
    title: "Adventure Cove: Lake Union Cruising",
    description: "Explore hidden coves and scenic routes perfect for curious canines. Pack your dog's essentials and set sail!",
    author: "Sydney Writers",
    date: "February 28, 2025",
    image: "/images/vectors/blog2.jpg",
  },
  {
    id: "123",
    category: "Travel & Adventure",
    title: "Adventure Cove: Lake Union Cruising",
    description: "Explore hidden coves and scenic routes perfect for curious canines. Pack your dog's essentials and set sail!",
    author: "Sydney Writers",
    date: "February 28, 2025",
    image: "/images/vectors/blog3.jpg",
  },
  {
    id: "123",
    category: "Travel & Adventure",
    title: "Smooth Sailing for Lake Union Cruising",
    description: "Ready for a mini island adventure? Discover the best dog-friendly spots to anchor and explore near Lake Union.",
    author: "Knapp Phebe",
    date: "March 2, 2025",
    image: "/images/vectors/blog4.jpg",
  },
  {
    id: "123",
    category: "Health & Nutrition",
    title: "Choosing the Right Life Vest for Your Pup",
    description: "A practical guide to picking the perfect flotation device, ensuring safety without sacrificing comfort or style.",
    author: "Dr. Emily Ross (Vet)",
    date: "February 1, 2025",
    image: "/images/vectors/blog5.jpg",
  },
  {
    id: "123",
    category: "Grooming & Care",
    title: "City Meets Nature: Urban Docking Tips",
    description: "Combine city life with natural beauty. Navigate bustling docks while keeping your pup safe and happy on the go.",
    author: "Sarah K.",
    date: "February 10, 2025",
    image: "/images/vectors/blog6.jpg",
  },
  {
    id: "123",
    category: "Travel & Adventure",
    title: "Smooth Sailing for Lake Union Cruising",
    description: "Get your pup accustomed to the waves with simple training steps. Make every voyage an exciting adventure.",
    author: "Knapp Phebe",
    date: "March 2, 2025",
    image: "/images/vectors/blog7.jpg",
  },
  {
    id: "123",
    category: "Travel & Adventure",
    title: "Adventure Cove: Lake Union Cruising",
    description: "Explore hidden coves and scenic routes perfect for curious canines. Pack your dog's essentials and set sail!",
    author: "Sydney Writers",
    date: "February 28, 2025",
    image: "/images/vectors/blog8.jpg",
  },
  {
    id: "123",
    category: "Travel & Adventure",
    title: "Adventure Cove: Lake Union Cruising",
    description: "Explore hidden coves and scenic routes perfect for curious canines. Pack your dog's essentials and set sail!",
    author: "Sydney Writers",
    date: "February 28, 2025",
    image: "/images/vectors/blog9.jpg",
  },
];

function BlogDetail() {
  return (
    <>
    {/* bg-blogDetails bg-no-repeat bg-top bg-contain */}
    <div className="relative">
      <img className="absolute w-full top-0 max-md:top-[350px]" src="/images/vectors/blogDetails.png" alt="" />
      <section className="container flex flex-col gap-6 relative z-10 max-md:items-start max-md:gap-3 max-2xl:px-4">
        <span className="bg-black/15 py-3 px-6 text-[22px] mx-auto max-md:m-0 font-medium rounded-full max-md:text-xs max-md:py-2 max-md:px-4">Travel & Adventure</span>
        <span className="text-center max-md:text-left text-[64px] font-semibold mx-auto max-md:m-0 max-md:text-[32px]">Smooth Sailing for Lake Union Cruising</span>
        <span className="text-center max-md:text-left text-[22px] mx-auto max-md:m-0 max-md:text-sm">Get your pup accustomed to the waves with simple training steps.<br className="max-md:hidden" />Make every voyage an exciting adventure.</span>
        <span className="h-[750px] w-full flex rounded-40 overflow-hidden max-md:h-auto"><img className="w-full h-full object-cover object-center" src="/images/vectors/blog1.jpg" /></span>
        <span className="text-[#545454] text-2xl max-md:text-base font-medium">By Knapp Phebe • March 2, 2025</span>
        <span className="text-[40px] font-medium mt-4  max-md:text-[28px]">Introduction</span>
        <span className="text-[#606060] text-2xl max-md:text-[18px]">Taking your pup on a boat ride can be a fun and rewarding experience, but proper preparation is key. Whether it's a short trip or a weekend adventure, helping your dog get comfortable on the water ensures a stress-free and enjoyable time for both of you.</span>
        <span className="text-2xl max-md:text-lg font-medium">1. Start with Dry Land Training</span>
        <span className="text-[#606060] text-[22px] max-md:text-base">Taking your pup on a boat ride can be a fun and rewarding experience, but proper preparation is key. Whether it's a short trip or a weekend adventure, helping your dog get comfortable on the water ensures a stress-free and enjoyable time for both of you.</span>
        <span className="text-2xl max-md:text-lg font-medium">2. Use Positive Reinforcement</span>
        <span className="text-[#606060] text-[22px] max-md:text-base">Reward your dog with treats and praise when they calmly sit or explore the boat. Gradual exposure paired with positive reinforcement builds confidence.</span>
        <span className="text-2xl max-md:text-lg font-medium">3. Invest in a Canine Life Jacket</span>
        <span className="text-[#606060] text-[22px] max-md:text-base">Even if your dog is a great swimmer, a life jacket adds an extra layer of safety. Choose one with a handle so you can easily lift your pup out of the water if needed.</span>
        <span className="text-2xl max-md:text-lg font-medium">4. Introduce Short Trips First</span>
        <span className="text-[#606060] text-[22px] max-md:text-base">Begin with short, slow rides to help your dog adjust. Keep an eye on their behavior—if they seem stressed, comfort them and keep sessions brief.</span>
        <span className="text-2xl max-md:text-lg font-medium">5. Keep Safety in Mind</span>
        <ul className="text-[#606060] text-[22px] max-md:text-base list-disc list-inside">
          <li>Ensure your dog has a shaded spot to rest.</li>
          <li>Bring fresh water and a non-slip mat for comfort.</li>
          <li>Never leave them unattended near open water.</li>
        </ul>
        <span className="text-2xl max-md:text-lg font-medium">6. Make It a Fun Experience</span>
        <span className="text-[#606060] text-[22px] max-md:text-base">Bring their favorite toys or a chew treat to keep them entertained. Over time, your pup will associate boat rides with fun and relaxation.</span>
        <span className="text-[40px] font-medium max-md:text-[28px]">Final Thoughts</span>
        <span className="text-[#606060] text-2xl max-md:text-[18px]">With patience and preparation, your furry friend can become the perfect sailing companion. Ready to set sail? Take it slow, stay safe, and enjoy the adventure together!</span>
        <div className="flex justify-between text-[40px] items-center font-semibold mt-20 max-md:text-[32px] max-md:mt-3">
          Related Articles
          <div className="flex gap-4 justify-center">
            <ActionIcon rounded="full" className="bg-black !h-24 max-md:hidden !w-24 swipperPrevBtn"><img className="-scale-x-100" src="/images/vectors/nextPrevArrow.svg" /></ActionIcon>
            <ActionIcon rounded="full" className="bg-black !h-24 max-md:hidden !w-24 swipperNextBtn"><img src="/images/vectors/nextPrevArrow.svg" /></ActionIcon>
          </div>
        </div>
        <div className="w-full flex">
          <Swiper loop={false} modules={[Autoplay, Navigation]} autoplay={{ delay: 2000 }} slidesPerView={1} spaceBetween={12} navigation={{nextEl: ".swipperNextBtn",prevEl: ".swipperPrevBtn",}} breakpoints={{300: {slidesPerView: 1.1,spaceBetween: 20,},840: {slidesPerView: 3,spaceBetween: 20,},1280: {slidesPerView: 4,spaceBetween: 20,},}}>
            {blogs.map((post, index: number) => (
              <SwiperSlide key={index}  className="!py-6 max-md:px-0 max-md:!py-0">
                <div key={post.id} className="flex flex-col w-full border h-[550px] border-black/20 rounded-40 overflow-hidden relative">
                  <div className="w-full h-full z-10 absolute bg-gradient-to-b from-black/0 to-black/80 flex flex-col items-start justify-end text-white p-4 gap-3">
                    <span className="flex px-4 h-8 items-center justify-center text-[10px] bg-white/15 backdrop-blur-[3px] rounded-full">{post.category}</span>
                    <span className="text-2xl font-semibold leading-tight">{post.title}</span>
                    <span className="text-[10px] leading-tight">{post.description}</span>
                    <span className="text-xs font-medium leading-tight">By {post.author} • {post.date}</span>
                    <button className="flex px-4 h-10 w-full items-center justify-center text-xs bg-white/15 border border-white/20 backdrop-blur-[3px] rounded-full">Read More</button>
                  </div>
                  <img className={`w-full h-full object-cover ${post.flip ? '-scale-x-100' : ''}`} src={post.image} alt={post.title} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </div>
    <section className="rounded-40 container max-2xl:w-auto max-md:mb-0 py-8 overflow-hidden border border-black/20 bg-white flex flex-col relative justify-center max-md:py-4 max-2xl:mx-4">
      <div className="backdrop-blur-2xl bg-[#FAFAFA]/50 border border-black/20 rounded-3xl p-8 absolute max-md:static max-md:w-auto max-md:mx-4 max-md:p-4 max-md:gap-3 max-md:mb-4 top-4 z-20 m-auto right-4 flex flex-col gap-5 h-[calc(100%-32px)] w-[540px]">
        <span className="text-3xl max-md:text-[20px] max-md:leading-tight font-medium">Subscribe and get exclusive deals & offer</span>
        <span className="max-md:text-xs">Subbscribe to our email & get updates right  your inbox</span>
        <input type="text" placeholder="Full Name" className="text-base placeholder:text-[#4B4A4A] bg-transparent font-normal outline-none px-6 w-full h-[70px] rounded-full border border-black max-md:h-12" />
        <input type="text" placeholder="Email" className="text-base placeholder:text-[#4B4A4A] bg-transparent font-normal outline-none px-6 w-full h-[70px] rounded-full border border-black max-md:h-12" />
        <button className="h-20 max-md:h-12 max-md:text-base w-full rounded-full bg-black text-white text-xl font-semibold mt-auto">Subscribe</button>
      </div>
      <div className="max-md:h-[300px] w-full max-md:flex max-md:justify-center">
        <img className="h-full max-w-max" src="/images/cta-block/background.png" />
      </div>
    </section>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BlogDetail />
      {/* {blogDetail()} */}
    </Suspense>
  );
}
