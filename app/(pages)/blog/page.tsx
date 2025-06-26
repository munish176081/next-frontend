"use client";
const categories = [
  { name: "Travel & Adventure", count: 6 },
  { name: "Health & Nutrition", count: 8 },
  { name: "Grooming & Care", count: 12 },
  { name: "Adoption Stories", count: 26 },
  { name: "Training & Behavior", count: 13 },
  { name: "Breed Profiles", count: 5 },
];
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
    description: "Explore hidden coves and scenic routes perfect for curious canines. Pack your dog’s essentials and set sail!",
    author: "Sydney Writers",
    date: "February 28, 2025",
    image: "/images/vectors/blog2.jpg",
  },
  {
    id: "123",
    category: "Travel & Adventure",
    title: "Adventure Cove: Lake Union Cruising",
    description: "Explore hidden coves and scenic routes perfect for curious canines. Pack your dog’s essentials and set sail!",
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
    description: "Explore hidden coves and scenic routes perfect for curious canines. Pack your dog’s essentials and set sail!",
    author: "Sydney Writers",
    date: "February 28, 2025",
    image: "/images/vectors/blog8.jpg",
  },
  {
    id: "123",
    category: "Travel & Adventure",
    title: "Adventure Cove: Lake Union Cruising",
    description: "Explore hidden coves and scenic routes perfect for curious canines. Pack your dog’s essentials and set sail!",
    author: "Sydney Writers",
    date: "February 28, 2025",
    image: "/images/vectors/blog9.jpg",
  },
];
const Blogs = () => {
  return (
    <>
    <section className="container rounded-40 p-8 bg-white flex flex-col relative justify-center gap-3 max-md:p-4">
      <span className="font-normal flex text-[64px] m-auto relative tracking-tight max-md:text-[28px]">The&nbsp;<strong className="font-semibold">Pups4Sale</strong>&nbsp;<strong className="font-medium relative">journal <img className="absolute min-w-max -ml-10 -bottom-2 max-md:hidden" src="/images/vectors/line-10.svg" /></strong><img className="w-12 h-12 ml-2 absolute -right-14 top-0 max-md:hidden" src="/images/vectors/blogSuperScriptDog.jpg" /></span>
      <span className="text-xl max-md:text-sm max-w-[512px] relative m-auto text-center">Your <strong className="font-semibold">go-to source</strong> for <strong className="font-semibold">dog care, adoption stories,</strong> and <span className="relative">everyday <img className="absolute -top-1.5 w-[120%] -left-1 max-md:-left-0.5 max-md:-top-1" src="/images/vectors/line-12.svg" alt="" /></span> pup adventures. <img className="absolute -right-[155px] -top-3 max-md:static max-md:mx-auto" src="/images/vectors/blogDogsOverlap.png" /></span>
      <div className="flex h-16 rounded-full border border-black/20 text-xl p-2 bg-white items-center w-full max-w-[712px] m-auto">
        <input className="w-full h-full text-base placeholder:text-[#A8A8A8] text-black border-none outline-none bg-transparent px-4 py-0" placeholder="Search blog" />
        <span className="h-12 w-12 min-w-12 bg-black rounded-full items-center justify-center flex cursor-pointer"><img className="w-5" src="/images/vectors/search.svg" /></span>
      </div>
    </section>
    <section className="container flex gap-10 max-md:flex-col max-md:gap-4 max-md:flex-col">
      <div className="w-full hidden max-md:flex flex-col">
        <span className="flex whitespace-nowrap items-center text-2xl font-medium gap-4 h-14">Categories<hr className="w-full border-#CECECE border-2" /></span>
        <div className="flex flex-col gap-3">
          {categories.map((cat, index) => (
            <label key={index} className="flex items-center mb-2 cursor-pointer"><input className="w-6 h-6 mr-3" type="radio" name="blogCategory" />{cat.name}&nbsp;<span className="text-[#807979]">({cat.count})</span></label>
          ))}
        </div>
      </div>
      <div className="w-9/12 max-md:w-full">
        <span className="flex whitespace-nowrap items-center max-md:text-2xl text-[40px] font-medium gap-4 h-14 w-full">Featured Blogs<hr className="w-full border-#CECECE border-2" /></span>
        <div className="flex flex-wrap gap-6 pt-6 max-md:gap-4 max-md:pt-4">
          {blogs.map((post) => (
            <div key={post.id} className="flex flex-col w-[calc(100%/3-16px)] max-md:w-full border border-black/20 rounded-40 overflow-hidden relative">
              <div className="w-full h-full z-10 absolute bg-gradient-to-b from-black/0 to-black/80 flex flex-col items-start justify-end text-white p-4 gap-3">
                <span className="flex px-4 h-8 items-center justify-center text-[10px] bg-white/15 backdrop-blur-[3px] rounded-full">{post.category}</span>
                <span className="text-2xl font-semibold leading-tight">{post.title}</span>
                <span className="text-[10px] leading-tight">{post.description}</span>
                <span className="text-xs font-medium leading-tight">By {post.author} • {post.date}</span>
                <button className="flex px-4 h-10 w-full items-center justify-center text-xs bg-white/15 border border-white/20 backdrop-blur-[3px] rounded-full">Read More</button>
              </div>
              <img className={`w-full h-full max-md:h-[450px] object-cover ${post.flip ? '-scale-x-100' : ''}`} src={post.image} alt={post.title} />
            </div>
          ))}
        </div>
      </div>
      <div className="w-3/12 max-md:w-full">
        <span className="flex whitespace-nowrap items-center text-2xl font-medium gap-4 h-14 max-md:hidden">Categories<hr className="w-full border-#CECECE border-2" /></span>
        <div className="flex flex-col gap-3 max-md:hidden">
          {categories.map((cat, index) => (
            <label key={index} className="flex items-center mb-2 cursor-pointer"><input className="w-6 h-6 mr-3" type="radio" name="blogCategory" />{cat.name}&nbsp;<span className="text-[#807979]">({cat.count})</span></label>
          ))}
        </div>
        <span className="flex whitespace-nowrap items-center text-2xl font-medium gap-4 h-14 mt-8 max-md:mt-4">Related<hr className="w-full border-#CECECE border-2" /></span>
        <div className="flex flex-col gap-6 mt-2">
          <a className="flex gap-4" href="#">
            <span className="w-[150px] min-w-[150px] h-[130px] rounded-xl overflow-hidden"><img className="w-full h-full object-cover" src="/images/vectors/blogPost1.jpg" /></span>
            <span className="text-xs min-h-full gap-1 py-1 text-[#606060] flex flex-col">February 28, 2025<strong className="text-lg my-auto leading-tight text-black font-medium">Choosing the Right Breed for Your Lifestyle</strong>By Sarah K.</span>
          </a>
          <a className="flex gap-4" href="#">
            <span className="w-[150px] min-w-[150px] h-[130px] rounded-xl overflow-hidden"><img className="w-full h-full object-cover" src="/images/vectors/blogPost2.jpg" /></span>
            <span className="text-xs min-h-full gap-1 py-1 text-[#606060] flex flex-col">February 28, 2025<strong className="text-lg my-auto leading-tight text-black font-medium">Essential Puppy Training Basics</strong>By Sarah K.</span>
          </a>
          <a className="flex gap-4" href="#">
            <span className="w-[150px] min-w-[150px] h-[130px] rounded-xl overflow-hidden"><img className="w-full h-full object-cover" src="/images/vectors/blogPost3.jpg" /></span>
            <span className="text-xs min-h-full gap-1 py-1 text-[#606060] flex flex-col">February 28, 2025<strong className="text-lg my-auto leading-tight text-black font-medium">The Importance of Regular Vet Checkups</strong>By Sarah K.</span>
          </a>
        </div>
      </div>
    </section>
    <span className="flex items-center gap-2 text-[#736E6E] w-full justify-center max-md:my-4">Loading <img src="/images/vectors/pawsIndigo.svg" /></span>
    <section className="rounded-40 container max-md:w-auto max-md:mb-0 mb-10 py-8 overflow-hidden border border-black/20 bg-white flex flex-col relative justify-center max-md:py-4 max-md:mx-0">
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
};

export default Blogs;
