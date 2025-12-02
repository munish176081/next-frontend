"use client";
import React, { useState } from 'react';
const messages = [
  {
    name: "Emma Robertson",
    avatar: "/images/vectors/profile1.png",
    online: true,
    unread:false,
    unreadCount: 0,
    time: "1h",
    color: "#74D27E",
    text: "Thank You for sharing this information! I am so excited"
  },
  {
    name: "James Carter",
    avatar: "/images/vectors/profile2.png",
    online: false,
    unread:false,
    unreadCount: 0,
    time: "1h",
    color: "#CFCFCF",
    text: "Thank You for sharing this information! I am so excited"
  },
  {
    name: "Olivia Mitchell",
    avatar: "/images/vectors/profile3.png",
    online: false,
    unread:true,
    unreadCount: 2,
    time: "1h",
    color: "#74D27E",
    text: "Thank You for sharing this information! I am so excited"
  },
  {
    name: "Ethan Mitchell",
    avatar: "/images/vectors/profile4.png",
    online: false,
    unread:false,
    unreadCount: 0,
    time: "1h",
    color: "#CFCFCF",
    text: "Thank You for sharing this information! I am so excited"
  }
];

const Chat = () => {
    const MessageCard = ({ name, avatar, online, unreadCount, time, color, text, unread }: { name: string, avatar: string, online: boolean, unreadCount: number, time: string, color: string, text: string, unread: boolean }) => (
      <div onClick={() => setIsVisible(true)} className={`flex flex-col ${online ? "bg-[#F4F2F6] border-r-[#B699CA]" : "border-r-transparent"} pr-12 p-4 gap-1 border-r-[6px] border-b border-b-black/20 relative`}>
        <div className="flex gap-2 font-medium items-center relative">
          <span className="size-2.5 rounded-full absolute left-[32px] bottom-[6px] border border-white" style={{ backgroundColor: color }}></span>
          <span className="size-10 rounded-full overflow-hidden"><img className="w-full h-full object-cover" src={avatar} alt={name} /></span>
          {name}
          {unreadCount > 0 && (
            <span className="size-5 rounded-full bg-[#EE5D50] flex items-center justify-center text-[8px] text-white">{unreadCount}</span>
          )}
        </div>
        <span className={`text-sm whitespace-nowrap text-ellipsis block overflow-hidden ${!unread ? 'text-[#888787]' : ''}`}>{text}</span>
        <span className="flex text-[#ADA7A7] flex-col absolute right-3 h-full gap-6">{time}<svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.51475 13.3597C1.55872 13.6276 1.81152 13.8091 2.0794 13.7651L6.44474 13.0486C6.71262 13.0046 6.89413 12.7518 6.85016 12.4839C6.80619 12.2161 6.55339 12.0345 6.28551 12.0785L2.40521 12.7154L1.76831 8.83511C1.72434 8.56723 1.47154 8.38572 1.20366 8.42969C0.935779 8.47366 0.754264 8.72646 0.798233 8.99434L1.51475 13.3597ZM10.6188 0.433292L1.60052 12.9934L2.39905 13.5667L11.4173 1.00665L10.6188 0.433292Z" fill={color}/></svg></span>
      </div>
    );
  const [isVisible, setIsVisible] = useState(false);
  return (
    <>
    <div className="flex flex-col gap-8 max-md:gap-4">
      <section className="flex container gap-4 items-center">
        <span className="text-5xl font-semibold max-md:text-2xl">Hello, <span className="text-[#797777]">Jaz</span></span>
        <div className="ml-auto flex gap-4 items-center max-md:justify-center">
          <select className="text-lg max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 h-[70px] rounded-full border-none w-52 max-md:w-32 max-md:h-12 appearance-none bg-selectArrow2 bg-no-repeat bg-[90%] bg-white font-medium">
            <option>Add Listing</option>
          </select>
          <span className="h-[70px] w-[70px] min-w-[70px] max-md:h-12 max-md:w-12 max-md:min-w-12 bg-white rounded-full items-center justify-center flex cursor-pointer relative max-md:hidden"><img className="w-8 max-md:w-5 invert" src="/images/vectors/search.svg" /></span>
          <span className="h-[70px] w-[70px] min-w-[70px] max-md:h-12 max-md:w-12 max-md:min-w-12 bg-white rounded-full items-center justify-center flex cursor-pointer relative"><span className="w-6 h-6 max-md:w-3 max-md:h-3 absolute rounded-full bg-CPrimary right-0 top-0"></span><img className="w-8 max-md:w-5" src="/images/vectors/notification.svg" /></span>
        </div>
      </section>
      <section className="container relative flex gap-4 items-start">
        <div className="w-max min-w-max rounded-40 bg-white flex flex-col gap-4 p-4 max-md:fixed max-md:flex-row max-md:shadow-section max-md:bottom-4 max-md:left-4 max-md:w-[calc(100%-32px)] z-20 max-md:rounded-full max-md:justify-between">
          <a href="#" className="flex items-center text-[22px] font-semibold gap-4"><span className="w-16 h-16 flex items-center justify-center rounded-full"><img src="/images/vectors/menu1.png" alt="Menu1" /></span><span className="max-md:hidden pr-4">Dashboard</span></a>
          <a href="#" className="flex items-center text-[22px] font-semibold gap-4"><span className="w-16 h-16 flex items-center justify-center rounded-full bg-[#FFD9E8]"><img src="/images/vectors/menu2.png" alt="Menu1" /></span><span className="max-md:hidden pr-4">Inbox</span></a>
          <a href="#" className="flex items-center text-[22px] font-semibold gap-4"><span className="w-16 h-16 flex items-center justify-center rounded-full"><img src="/images/vectors/menu3.png" alt="Menu1" /></span><span className="max-md:hidden pr-4">Meetings</span></a>
          <a href="#" className="flex items-center text-[22px] font-semibold gap-4"><span className="w-16 h-16 flex items-center justify-center rounded-full"><img src="/images/vectors/menu4.png" alt="Menu1" /></span><span className="max-md:hidden pr-4">Listings</span></a>
        </div>
        <div className="w-full p-6 max-md:p-4 max-md:rounded-[20px] rounded-40 bg-white overflow-y-auto flex flex-col max-md:overflow-visible">
          <div className="flex items-center justify-between pb-4">
            <span className="text-[32px] max-md:text-lg font-semibold flex items-center gap-2"><span onClick={() => setIsVisible(false)} className={`size-7 max-md:flex items-center justify-center rounded-full bg-black hidden ${!isVisible ? 'max-md:hidden' : ''}`}><svg width="5" height="9" viewBox="0 0 5 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.42969 1.34872L0.609917 4.96745L4.42969 8.58618" stroke="white" stroke-width="0.734151" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg></span> Inbox</span>
            <select className="hidden text-lg max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-4 h-14 max-md:h-9 max-md:w-28 rounded-full border-[#CBCACA] border-[1px] bg-white w-40 max-md:h-12 appearance-none bg-selectArrow2 bg-no-repeat bg-[90%] font-medium">
              <option>Last Week</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="flex gap-6 max-md:flex-col">
            <div className={`flex flex-col border border-black/20 rounded-[20px] max-w-[400px] max-md:max-w-full w-full h-[800px] max-md:h-auto max-md:overflow-hidden ${isVisible ? 'max-md:hidden' : ''}`}>
              <div className="flex items-center justify-between p-4">
                <select className="text-lg max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-4 h-14 max-md:h-9 max-md:w-28 rounded-full border-[#CBCACA] border-[1px] bg-white w-40 max-md:h-12 appearance-none bg-selectArrow2 bg-no-repeat bg-[90%] font-medium">
                  <option>5 Unread</option>
                </select>
                <span className="text-[32px] font-semibold h-14 max-md:h-9 max-md:w-9 w-14 border border-[#CBCACA] rounded-full flex items-center justify-center">
                  <svg className="max-md:h-4" width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M25.1813 25.1952C24.9998 25.374 24.7553 25.4744 24.5005 25.4748C24.2422 25.4737 23.9942 25.3736 23.8075 25.1952L18.5554 19.931C16.3435 21.7889 13.4996 22.7211 10.617 22.5333C7.73443 22.3454 5.03564 21.0519 3.08353 18.9226C1.13141 16.7933 0.0766993 13.9926 0.139359 11.1046C0.202019 8.21654 1.37721 5.46418 3.41984 3.42155C5.46248 1.37892 8.21483 0.203728 11.1029 0.141068C13.9909 0.0784082 16.7916 1.13312 18.9209 3.08524C21.0502 5.03735 22.3437 7.73614 22.5316 10.6187C22.7194 13.5013 21.7872 16.3452 19.9292 18.5572L25.1813 23.8092C25.2732 23.8997 25.3462 24.0076 25.396 24.1266C25.4458 24.2455 25.4715 24.3732 25.4715 24.5022C25.4715 24.6312 25.4458 24.7589 25.396 24.8778C25.3462 24.9968 25.2732 25.1047 25.1813 25.1952ZM11.3703 20.6118C13.1978 20.6118 14.9842 20.0699 16.5036 19.0546C18.0231 18.0393 19.2074 16.5963 19.9067 14.9079C20.6061 13.2196 20.789 11.3618 20.4325 9.56944C20.076 7.7771 19.196 6.13073 17.9038 4.83853C16.6116 3.54633 14.9652 2.66633 13.1729 2.30981C11.3806 1.95329 9.52276 2.13627 7.83441 2.8356C6.14607 3.53494 4.70302 4.71922 3.68774 6.23869C2.67246 7.75816 2.13056 9.54457 2.13056 11.372C2.13378 13.8216 3.10828 16.1699 4.84037 17.902C6.57247 19.6341 8.92077 20.6086 11.3703 20.6118Z" fill="black"/></svg>
                </span>
              </div>
              <div className="flex flex-col">
                {messages.map((msg, index) => (
                  <MessageCard key={index} {...msg} />
                ))}
              </div>
            </div>
            <div className={`flex flex-col border border-black/20 rounded-[20px] w-full ${!isVisible ? 'max-md:hidden' : ''}`}>
              <div className="flex gap-4 border-b border-black/20 p-4 items-center">
                <div className="flex gap-4 font-semibold items-center relative text-[22px] max-md:text-base">
                  <span className="size-6 max-md:size-4 absolute max-md:left-[20px] left-[42px] -top-1"><img src="/images/vectors/blueTick.png" alt="" /></span>
                  <span className="size-4 max-md:size-2 rounded-full absolute max-md:left-[24px] left-[46px] bottom-[4px] border border-white bg-[#74D27E]"></span>
                  <span className="w-[60px] h-[60px] max-md:w-[30px] max-md:h-[30px] rounded-full overflow-hidden"><img className="w-full h-full object-cover" src={'/images/vectors/profile1.png'} /></span>
                  Emma Robertson
                </div>
                <span className="text-[12px] ml-auto font-semibold h-11 px-4 gap-1 border border-[#CBCACA] rounded-full flex items-center justify-center max-md:hidden"><img src="/images/vectors/doubleTick.png" alt="" /> Mark As Read</span>
                <span className="text-[32px] font-semibold h-11 w-11 max-md:w-7 max-md:h-7 border border-[#CBCACA] rounded-full flex items-center justify-center max-md:ml-auto"><img className="max-md:w-2.5" src="/images/vectors/3dots.png" alt="" /></span>
              </div>

              <div className="flex w-full h-full max-h-[576px] max-md:max-h-fit p-4 flex-col gap-6 overflow-y-auto mb-6">
                <div className="flex flex-col items-center min-h-[175px] max-md:gap-1">
                  <div className="relative flex">
                    <span className="size-6 absolute left-[42px] -top-1 max-md:hidden"><img src="/images/vectors/blueTick.png" alt="" /></span>
                    <span className="size-4 rounded-full absolute left-[46px] bottom-[4px] border border-white bg-[#74D27E]"></span>
                    <span className="w-[60px] h-[60px] min-w-[60px] rounded-full overflow-hidden"><img className="w-full h-full object-cover" src={'/images/vectors/profile1.png'} /></span>
                  </div>
                  <span className="text-[20px] font-semibold mt-2 max-md:mt-1">Emma Robertson (<text className="text-base text-[#8B8B8B] font-normal">Buyer</text>)</span>
                  <span className="text-base text-[#8B8B8B] font-medium"> Joined on January 2025</span>
                  <span className="text-sm text-[#8B8B8B] font-medium text-center max-md:leading-loose">Current Inquiry: Golden Retriever - <u className="text-black">Listing ID GR-2025-001</u></span>
                  <span className="text-sm text-[#8B8B8B] font-medium flex items-center gap-1"><span className="size-4 rounded-full border border-white bg-[#74D27E]"></span> Active</span>
                </div>
                <div className="flex flex-col h-full gap-6">
                  <div className="flex flex-col relative pl-20 w-full max-w-[650px] max-md:pl-12">
                    <span className="w-[60px] h-[60px] max-md:w-[30px] max-md:h-[30px] rounded-full overflow-hidden absolute left-0 bottom-0"><img className="w-full h-full object-cover" src={'/images/vectors/profile1.png'} /></span>
                    <span className="text-[#8B8B8B] ml-6 font-medium flex gap-2 max-md:text-sm"><strong className="font-semibold">Emma Robertson</strong>11:21 am</span>
                    <div className="flex rounded-40 flex-col gap-3 max-md:rounded-[20px] bg-[#F4F2F6] p-6 max-md:p-4 relative before:w-0 before:h-0 before:border-t-[12px] before:border-t-transparent before:border-b-[12px] before:border-b-transparent before:border-r-[20px] before:border-r-[#F4F2F6] before:absolute before:bottom-[5px] before:-left-[10px] before:-rotate-[26deg]">
                      <div className="flex bg-white rounded-[20px] border-l-[16px] max-md:border-l-8 border-l-[#EFC951] p-4 w-full gap-4 max-md:flex-col-reverse">
                        <div className="flex flex-col justify-between">
                          <span className="text-2xl font-medium max-md:flex-col max-md:flex max-md:text-lg">Golden Retriever <text className="text-base max-md:text-sm text-[#736E6E]">Sydney, NSW</text></span>
                          <span className="text-[#A6A4A4] text-sm max-md:mt-2">A gentle and playful Golden Retriever pup, fully vaccinated and ready to join your family.</span>
                          <span className="text-[22px] max-md:mt-2">$1,200</span>
                        </div>
                        <span className="w-[127px] min-w-[127px] rounded-xl h-[110px] max-md:w-full max-md:h-auto max-md:min-w-full overflow-hidden relative">
                          <div className="absolute max-md:w-20 max-md:h-20 w-10 h-10 z-10 flex items-center justify-center">
                            <span className="bg-yellow-400 max-md:text-sm font-semibold text-black -rotate-45 whitespace-nowrap px-10 block text-center w-min text-[8px]">Litter Listing</span>
                          </div>
                          <img className="w-full h-full object-cover" src="/images/vectors/meetingDog1.png" alt="" />
                        </span>
                      </div>
                      <span className="text-[#4A4A4A] font-medium text-[18px] max-md:text-sm">Hi, I need some help! I messaged a breeder about a Golden Retriever puppy yesterday, but I haven’t received a response yet.</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center relative">
                    <span className="text-sm font-semibold text-[#878787] px-4 py-2 flex relative z-10 bg-white border-2 border-[#CBCACA] rounded-full">31 March</span>
                    <hr className="bg-red-300 absolute w-full h-px" />
                  </div>

                  <div className="flex flex-col relative pr-20 w-full max-w-[650px] ml-auto max-md:pr-12">
                    <span className="w-[60px] h-[60px] max-md:w-[30px] max-md:h-[30px] rounded-full overflow-hidden absolute right-0 bottom-0"><img className="w-full h-full object-cover" src={'/images/vectors/profile1.png'} /></span>
                    <span className="text-[#8B8B8B] font-medium flex ml-auto mr-6 gap-2 max-md:text-sm">11:25 am<strong className="font-medium">Seen</strong></span>
                    <div className="flex rounded-40 max-md:rounded-[20px] bg-[#F4F2F6] p-6 max-md:p-4 relative before:w-0 before:h-0 before:border-t-[12px] before:border-t-transparent before:border-b-[12px] before:border-b-transparent before:border-r-[20px] before:border-r-[#F4F2F6] before:absolute before:bottom-[5px] before:-right-[6px] before:-rotate-[30deg]">
                      <span className="text-[#4A4A4A] font-medium text-[18px] max-md:text-sm">Hi Emma! Thanks for reaching out. Let me check on that for you.</span>
                    </div>
                  </div>

                </div>
              </div>

              <div className="flex mx-4 border border-black/20 rounded-xl h-24 max-md:h-16 mt-auto mb-4 items-center">
                <input className="h-full w-full bg-transparent outline-none text-[19px] px-4 max-md:text-sm max-md:px-2" type="text" placeholder="Type something..." />
                <span className="h-full w-16 max-md:w-7 max-md:min-w-7 min-w-16 flex items-center justify-center relative"><img className='max-md:max-h-4' src="/images/vectors/mic.png" alt="" /></span>
                <span className="h-full w-16 max-md:w-7 max-md:min-w-7 min-w-16 flex items-center justify-center relative"><input className="absolute w-full h-full top-0 left-0 cursor-pointer opacity-0" type="file" /><img className='max-md:max-h-4' src="/images/vectors/attachment.png" alt="" /></span>
                <span className="h-full w-16 max-md:w-7 max-md:min-w-7 min-w-16 flex items-center justify-center relative"><img className='max-md:max-h-4' src="/images/vectors/smile.png" alt="" /></span>
                <hr className="bg-black/20 flex h-12 w-0.5 ml-4 max-md:ml-2" />
                <span className="h-full w-24 max-md:w-10 max-md:min-w-10 min-w-24 flex items-center justify-center"><img className='max-md:h-6' src="/images/vectors/sendBtn.png" alt="" /></span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Chat;
