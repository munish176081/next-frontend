import Image from "next/image";

const features = [
  {
    icon: '/images/vectors/eye.png',
    title: "Boost Visibility",
    desc: "Get featured and gain credibility.",
  },
  {
    icon: '/images/vectors/horn.png',
    title: "Reach More Buyers",
    desc: "List your puppies where pet lovers shop.",
  },
  {
    icon: '/images/vectors/check.png',
    title: "Simple & Secure",
    desc: "Easy-to-use platform with verified buyers.",
  },
];

export function CtaBlock() {
  return (
    <>
    <section className="container rounded-40 py-8 overflow-hidden border border-black/20 bg-white flex flex-col relative justify-center">
      <div className="backdrop-blur-2xl bg-[#FAFAFA]/50 border border-black/20 rounded-xl p-8 absolute max-md:w-auto max-md:h-auto max-md:bottom-0 max-md:top-auto w-[500px] h-[330px] max-md:h-max top-0 bottom-0 m-auto left-12 flex flex-col gap-5 max-md:left-auto max-md:mx-4 max-md:mb-4 max-md:p-4 max-md:gap-2">
        <span className="text-3xl max-md:text-[20px] max-md:leading-tight font-medium">Grow Your Breeding Business with Pups4Sale!</span>
        <span className="max-md:text-xs">List your puppies, reach buyers, and grow your business effortlessly.</span>
        <button className="h-20 max-md:h-12 max-md:text-base w-full rounded-full bg-black text-white text-xl font-semibold mt-auto">Sign Up as a Breeder</button>
      </div>
      <div className="flex flex-col gap-6 absolute max-md:relative max-md:right-0 right-16 z-20 max-md:px-4">
        <span className="h-3/4 w-1 flex absolute -top-[70px] left-[38px] max-md:left-[46px] max-md:-top-[26px] z-10 bg-gradient-to-b from-white/0 via-CSecondary via-50% to-white"></span>
        {features.map((feature, index) => (
          <div className="flex w-[420px] max-md:w-full gap-4 z-20">
            <span className={`min-w-20 w-20 h-20 max-md:w-16 max-md:h-16 max-md:min-w-16 rounded-full flex items-center justify-center bg-[#D9D9D9] border-4 ${index == 0 ? 'border-CSecondary' : index == 1 ? 'border-t-CSecondary border-r-CSecondary border-b-[#D9D9D9] border-l-[#D9D9D9] -rotate-45' : 'border-[#D9D9D9]'}`}><img className={`w-8 ${index == 1 ? 'rotate-45': ''}`} src={feature.icon} /></span>
            <span className="flex flex-col rounded-full bg-[#D9D9D9] text-sm w-full items-center justify-center max-md:text-xs max-md:text-center"><strong className="font-semibold">{feature.title}</strong>{feature.desc}</span>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-r from-white/0 via-white via-40% to-white absolute h-full w-1/2 right-0 top-0 max-md:h-[100px] max-md:top-60 max-md:w-full max-md:bg-gradient-to-t"></div>
      <div className="max-md:h-[300px] w-full max-md:flex max-md:justify-center">
        <img className="h-full max-w-max" src="/images/cta-block/background.png" />
      </div>
    </section>
    </>
  );
}
