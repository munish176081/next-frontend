"use client";
import React from "react";

export function EthicalBreederFeature() {
  return (
    <>
    <section className="flex-col flex gap-8 relative">
      <div className="flex gap-8 max-md:flex-col max-md:gap-4">
        <div className="max-md:w-full bg-white w-1/4 h-[464px] max-md:h-auto rounded-40 p-4 gap-8 flex flex-col max-md:gap-4">
          <span className="text-2xl w-full text-center flex font-medium bg-CPrimary rounded-full px-6 py-4 justify-center">Proven Commitment</span>
          <span className="text-[#7D7B7B] flex-col flex items-center text-center text-[22px] gap-10">&ldquo;Pups4Sale truly connects you with breeders who care. I found my perfect puppy effortlessly!&rdquo;<strong className="font-bold text-black text-[25px]">— Emily R.</strong></span>
          <img src="/images/feature/emily.png" alt="Emily R." className="w-[85px] h-[85px] rounded-full m-auto" />
        </div>
        <div className="max-md:w-full bg-white w-1/4 h-[464px] max-md:h-auto order-2 max-md:order-none rounded-40 p-4 flex flex-col gap-4">
          <span className="text-2xl w-full text-center flex font-medium bg-CPrimary rounded-full px-6 py-4 justify-center">Ethical Standards</span>
          <span className="w-full h-full rounded-3xl overflow-hidden"><img className="w-full h-full object-cover" src="/images/feature/ethical-standards.png" /></span>
          <span className="text-sm w-full text-center flex font-medium bg-[#E3E3E3] text-[#646464] mt-auto rounded-full px-6 py-4">Only breeders who adhere to strict welfare guidelines make the cut.</span>
        </div>
        <div className="max-md:w-full w-1/2 h-[464px] max-md:h-[270px] rounded-40 bg-cutout max-md:bg-cutoutM no-repeat bg-bottom bg-cover relative flex flex-col overflow-hidden gap-6 p-6 items-center max-md:gap-3">
          <h2 className="text-5xl text-center font-medium leading-none max-md:text-2xl">Healthy Environment</h2>
          <img src="/images/vectors/healthy.jpg" alt="Healthy environment for puppies" className="w-[350px] h-[106px] max-md:w-[166px] max-md:h-[50px] max-md:border-4 object-cover rounded-[60px] border-8 border-[#F6D77A] bg-white z-10"/>
          <span className="text-lg text-[#3F3D3D] text-center max-md:text-xs max-md:leading-normal">A safe and loving setting that supports the well-<br/>being of every puppy.</span>
          <span className="absolute -bottom-10 rotate-12 max-md:-bottom-3 max-md:-left-6 -left-16 w-48 max-md:w-20 h-48 max-md:h-20  max-md:border-8 rounded-full border-[17px] border-[#F6D77A] overflow-hidden"><img src="/images/vectors/dog-1.jpg" alt="Healthy puppy environment" className="w-full h-full object-cover"/></span>
          <span className="absolute bottom-[100px] -right-20 w-48 max-md:w-20 h-48 max-md:h-20  max-md:border-8 max-md:bottom-[50px] max-md:-right-8 rounded-full border-[17px] border-[#F6D77A] overflow-hidden"><img src="/images/vectors/Image.jpg" alt="Healthy puppy environment" className="w-full h-full object-cover"/></span>
        </div>
      </div>
      <div className="flex gap-8 relative max-md:flex-col">
        <span className="w-80 h-80 max-md:w-44 max-md:h-44 absolute -top-40 max-md:-top-[107px] right-0 left-0 m-auto bg-CPrimary rounded-full overflow-hidden"><img className="w-full h-full object-cover" src="/images/feature/center-dog.png" /></span>
        <div className="max-md:w-full w-1/2 h-[464px] max-md:h-[227px] rounded-40 bg-cutout1 max-md:bg-cutout1M max-md:bg-top bg-no-repeat bg-cover bg-right-top flex flex-col p-4 items-start max-md:p-2 max-md:rounded-3xl">
          <span className="text-3xl font-medium bg-CPrimary rounded-full px-6 py-4 max-md:text-xs max-md:py-2 max-md:px-3 max-md:my-auto">Expert Care</span>
          <span className="bg-[#E3E3E326] max-md:text-xs max-md:px-3 max-md:py-2 text-white text-[22px] font-medium py-4 leading-snug px-8 text-center mt-auto max-md:mt-0 ml-auto max-w-[470px] rounded-full backdrop-blur-3xl">Experienced breeders dedicated to providing exceptional care and training.</span>
        </div>
        <div className="max-md:w-full w-1/2 h-[464px] rounded-40 bg-cutout2 max-md:bg-cutout2M max-md:h-[384px] no-repeat bg-cover bg-left-top"></div>
      </div>
    </section>
    </>
  );
}
