"use client";
import Link from "next/link";
import { LogoIcon } from "../icons";

const infoItems = [
  { label: "Privacy", path: "#" },
  { label: "FAQ", path: "#" },
  { label: "Shipping and payment", path: "#" },
  { label: "Partners", path: "#" },
  { label: "Blog", path: "#" },
  { label: "Contacts", path: "#" },
];

const menuItems = [
  { label: "Home", path: "#" },
  { label: "Explore", path: "#" },
  { label: "Add Listing", path: "#" },
  { label: "Blogs", path: "#" },
  { label: "Contact us", path: "#" },
];

export const Footer = () => {
  return (
    <>
    <footer className="container rounded-40 p-8 overflow-hidden bg-white flex relative flex-col gap-8 max-md:!mx-4 max-md:w-auto max-md:mt-4 max-md:gap-4 max-2xl:w-auto max-2xl:mx-6">
      <div className="flex gap-8 max-md:flex-col max-md:items-center">
        <div className="w-3/12 max-md:w-auto"><LogoIcon /></div>
        <div className="w-6/12 max-md:w-full">
          <div className="flex gap-4">
            <span className="w-1/3 flex flex-col gap-2 max-md:w-1/2">
              <strong className="text-[10px] font-semibold text-[#1B1819]/50 uppercase mb-4">Information</strong>
              {infoItems.map((item, idx) => (<Link key={idx} href={item.path} className="!text-black text-base !no-underline">{item.label}</Link>))}
            </span>
            <span className="w-1/3 flex flex-col gap-2 max-md:w-1/2">
              <strong className="text-[10px] font-semibold text-[#1B1819]/50 uppercase mb-4">Menu</strong>
              {menuItems.map((item, idx) => (<Link key={idx} href={item.path} className="!text-black text-base !no-underline">{item.label}</Link>))}
            </span>
            <span className="w-1/3 flex flex-col gap-2 max-md:hidden"></span>
          </div>
        </div>
        <div className="w-3/12 max-md:w-auto flex flex-col items-end max-md:items-center gap-2">
          <button className="bg-black text-white py-2 px-6 rounded-full text-sm font-medium hover:bg-gray-800 transition w-auto">Request a call</button>
          <span className="text-xs font-semibold">+1 (999) 999-99-99 <br /> info@Pups4sale.com</span>
        </div>
      </div>
      <div className="flex gap-8 max-md:flex-col max-md:items-center">
        <div className="w-3/12 flex gap-2 max-md:w-auto">
          <a className="w-10 h-10 bg-black flex rounded-full items-center justify-center" href="https://t.me/" target="_blank" rel="noopener noreferrer"><img src="/images/vectors/sendPlane.svg" /></a>
          <a className="w-10 h-10 bg-black flex rounded-full items-center justify-center" href="https://wa.me/" target="_blank" rel="noopener noreferrer"><img src="/images/vectors/whatsapp.svg" /></a>
        </div>
        <div className="w-6/12 flex gap-2 text-xs font-semibold justify-center items-center text-center">1901 Thornridge Cir. Shiloh, Hawaii 81063</div>
        <div className="w-3/12"></div>
      </div>
    </footer>
    </>
  );
};
