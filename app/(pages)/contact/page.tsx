"use client";

const Contact = () => {
  return (
    <>
    <div className="container flex flex-col gap-16 pt-16 max-2xl:p-4 max-md:gap-4">
      <section className="flex gap-6 max-md:flex-col max-md:gap-4">
        <div className="flex w-7/12 max-md:w-full rounded-40 p-8 bg-white flex-col items-start max-md:p-4">
          <span className="text-5xl font-light max-md:text-[32px] max-md:leading-snug"><strong className="font-medium relative">Get in touch<img className="absolute w-full max-w-60 max-md:-bottom-2" src="/images/vectors/contactTypeLine.svg" /></strong> with <strong className="font-semibold">Pups4Sale</strong></span>
          <span className="text-lg leading-normal mt-6 relative max-md:text-xs max-md:mt-2">Need <strong className="font-semibold">help</strong> with <strong className="font-semibold">buying, selling,</strong> or <strong className="font-semibold">listing</strong> a puppy?<br /> Our <strong className="font-semibold">team</strong> is available <strong className="font-semibold">24/7</strong> to assist you. <img className="absolute -right-24 top-3 max-md:w-[35px] max-md:-top-[75px] max-md:-right-[15px]" src="/images/vectors/line-9.svg" /></span>
          <span className="text-[40px] font-medium mt-10 max-md:text-[28px] max-md:mt-4">Send Us a Message</span>
          <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
            <div className="flex flex-col w-full">
              <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Your First Name *</label>
              <input placeholder="Enter your First Name" className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12" />
            </div>
            <div className="flex flex-col w-full">
              <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Your Last Name *</label>
              <input placeholder="Enter your Last Name" className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12" />
            </div>
          </div>
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Your Email*</label>
            <input placeholder="Enter your Email" className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12" />
          </div>
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Your Phone Number *</label>
            <input placeholder="Enter your Phone Number" className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12" />
          </div>
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Your Subject</label>
            <input placeholder="Enter your Subject" className="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12" />
          </div>
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">Your Message</label>
            <textarea placeholder="Enter your Message" className="text-base max-md:text-xs max-md:p-4 max-md:rounded-2xl placeholder:text-[#4B4A4A8C] font-normal outline-none p-6 w-full h-60 rounded-40 border border-[#B5B5B5]"></textarea>
          </div>
          <button className="w-full h-20 bg-black text-white text-[22px] rounded-full mt-7 max-md:h-12 max-md:text-base">Send Message</button>
        </div>
        <div className="flex w-5/12 max-md:w-full flex-col gap-6">
          <div className="flex w-full rounded-40 bg-white flex-col items-start overflow-hidden min-h-max">
            <img src="/images/vectors/contact.png" />
          </div>
          <div className="flex w-full h-full rounded-40 bg-white flex-col items-start overflow-hidden px-16 justify-between pt-14 pb-8 relative max-md:gap-6 max-md:px-4 max-md:py-6">
            <img className="absolute left-0 top-0" src="/images/vectors/contactVector.png" />
            <div className="flex gap-4 items-center max-md:flex-col max-md:text-center max-md:w-full max-md:gap-2">
              <span className="w-[70px] h-[70px] rounded-full bg-CPrimary/20 flex items-center justify-center"><img src="/images/vectors/message.png" /></span>
              <span className="flex flex-col text-[#555555] text-[22px] max-md:text-[18px]"><strong className="text-black font-medium">Email</strong> hello@pups4sale.com</span>
            </div>
            <div className="flex gap-4 items-center max-md:flex-col max-md:text-center max-md:w-full max-md:gap-2">
              <span className="w-[70px] h-[70px] rounded-full bg-CPrimary/20 flex items-center justify-center"><img src="/images/vectors/phone.png" /></span>
              <span className="flex flex-col text-[#555555] text-[22px] max-md:text-[18px]"><strong className="text-black font-medium">Phone</strong> 825-362-3175</span>
            </div>
            <div className="flex gap-4 items-center max-md:flex-col max-md:text-center max-md:w-full max-md:gap-2">
              <span className="w-[70px] h-[70px] rounded-full bg-CPrimary/20 flex items-center justify-center"><img src="/images/vectors/address.png" /></span>
              <span className="flex flex-col text-[#555555] text-[22px] max-md:text-[18px]"><strong className="text-black font-medium">Address</strong> 959 Jerde Prairie</span>
            </div>
          </div>
        </div>
      </section>
    </div>
    <section className="rounded-40 container max-2xl:w-auto max-md:my-0 max-2xl:my-4 my-10 py-8 overflow-hidden border border-black/20 bg-white flex flex-col relative justify-center max-md:py-4 max-2xl:mx-4">
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

export default Contact;
