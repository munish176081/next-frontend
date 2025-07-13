"use client";

import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { DashboardCard } from "@/_components/common/dashboard-widgets";

const messages = [
  {
    name: "Emma Robertson",
    message: "Thank You for sharing this information! I am so excited",
    unread: 2,
    online: true,
    time: "2 min ago"
  },
  {
    name: "John Smith",
    message: "Can you provide more details about the breeding process?",
    unread: 1,
    online: true,
    time: "5 min ago"
  },
  {
    name: "Sarah Wilson",
    message: "The puppies look amazing! When can we schedule a visit?",
    unread: 0,
    online: false,
    time: "1 hour ago"
  },
  {
    name: "Mike Johnson",
    message: "Is the stud service still available?",
    unread: 3,
    online: true,
    time: "2 hours ago"
  }
];

const Inbox = () => {
  return (
    <DashboardLayout title="Inbox" showTimeFilter={false}>
      <div className="flex gap-4 min-w-min max-md:flex-col max-md:min-w-full">
        <div className="flex flex-col w-full gap-4">
          <DashboardCard title="Messages" className="w-full">
            <div className="flex mx-4 flex-col gap-2 max-md:pb-4">
              {messages.map((message, index) => (
                <div key={index} className="flex flex-col bg-[#F3F3F3] px-4 py-2.5 rounded-full gap-1">
                  <div className="flex gap-2 text-[10px] font-semibold items-center relative">
                    <span className={`size-1.5 rounded-full ${message.online ? 'bg-[#74D27E]' : 'bg-gray-400'} absolute left-[18px] top-[18px] border border-white`}></span>
                    <span className="size-6 rounded-full overflow-hidden">
                      <img className="w-full h-full object-cover" src="/images/vectors/profile.jpg" alt="" />
                    </span>
                    {message.name}
                    {message.unread > 0 && (
                      <span className="size-3 rounded-full bg-[#EE5D50] flex items-center justify-center text-[8px] text-white">
                        {message.unread}
                      </span>
                    )}
                    <span className="ml-auto text-[8px] text-gray-500">{message.time}</span>
                  </div>
                  <span className="text-[9px] whitespace-nowrap text-ellipsis block overflow-hidden text-[#888787]">
                    {message.message}
                  </span>
                </div>
              ))}
              <button className="w-full h-16 bg-black text-white text-[22px] rounded-full max-md:h-12 max-md:text-base">
                View All Messages
              </button>
            </div>
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Inbox;
