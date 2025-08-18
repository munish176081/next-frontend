"use client";

import { useRouter } from 'next/navigation';

const rows = [
  {
    plan: "Premium Plan",
    price: "$150",
    startDate: "01 Mar 2021",
    endDate: "01 Jun 2021",
    status: "Active",
    action: true
  },
  {
    plan: "Basic Plan",
    price: "$50",
    startDate: "10 Jan 2021",
    endDate: "10 Apr 2021",
    status: "Active",
    action: true
  },
  {
    plan: "Standard Plan",
    price: "$200",
    startDate: "05 Mar 2021",
    endDate: "05 Jun 2021",
    status: "Pending",
    action: true
  },
  {
    plan: "Business Plan",
    price: "$100",
    startDate: "20 Feb 2021",
    endDate: "20 May 2021",
    status: "Expired",
    action: false
  }
];

const payments = [
  {
    plan: "Listing Fee",
    price: "$150",
    startDate: "01 Jun 2021"
  },
  {
    plan: "Featured Listing",
    price: "$50",
    startDate: "10 Apr 2021"
  },
  {
    plan: "Stud Service",
    price: "$200",
    startDate: "05 Jun 2021"
  },
  {
    plan: "Subscription",
    price: "$100",
    startDate: "20 May 2021"
  }
];

const statusStyles: Record<string, string> = {
  Active: "text-[#74D27E] bg-[#87D78E4D] border border-[#74D27E]",
  Pending: "text-[#FFCE20] bg-[#EFC95133] border border-[#FFCE20]",
  Expired: "text-[#EE5D50] bg-[#EE5D5033] border border-[#EE5D50]",
};

export const UserDashboardContent = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full gap-4 max-md:flex-col">
      <div className="flex flex-col w-full gap-4 max-md:flex-col">
        <div className="flex gap-4 h-full max-md:flex-col max-md:w-full">
          {/* Analytics Card */}
          <div className="flex flex-col border border-black/20 rounded-[20px] min-w-[298px] max-md:min-w-full max-md:max-w-full w-full">
            <div className="flex gap-4 items-center px-4 min-h-20 justify-between">
              <span className="text-[22px] font-semibold flex items-center gap-2">
                <span className="size-11 bg-[#E6E6E6] rounded-full flex items-center justify-center">
                  <img src="/images/vectors/analytics.png" alt="" />
                </span>
                Analytics
              </span>
            </div>
            <span className="p-4 pt-0">
              <img src="/images/vectors/chart1.svg" className="w-full" alt="" />
            </span>
          </div>

          {/* Subscriptions Card */}
          <div className="flex flex-col border border-black/20 rounded-[20px] min-w-[298px] max-md:min-w-full max-md:max-w-full w-full">
            <div className="flex gap-4 items-center px-4 min-h-20 justify-between">
              <span className="text-[22px] font-semibold flex items-center gap-2">
                <span className="size-11 bg-[#E6E6E6] rounded-full flex items-center justify-center">
                  <img src="/images/vectors/subscriptions.png" alt="" />
                </span>
                Subscriptions
              </span>
            </div>
            <span className="mx-4 rounded-2xl flex overflow-hidden">
              <img src="/images/vectors/dog6.png" className="w-full" alt="" />
            </span>
            <div className="flex flex-col gap-2 mt-2 mx-4">
              <div className="h-8 border border-black/20 rounded-full flex items-center justify-between font-medium text-[10px] p-1.5">
                <span>Active Subscriptions</span>
                <span className="size-5 bg-[#F0D9FF] flex items-center justify-center rounded-full">1</span>
              </div>
              <div className="h-8 border border-black/20 rounded-full flex items-center justify-between font-medium text-[10px] p-1.5">
                <span>Plan</span>
                <span>Premium</span>
              </div>
              <div className="h-8 border border-black/20 rounded-full flex items-center justify-between font-medium text-[10px] p-1.5">
                <span>Next Renewal Date</span>
                <span>15.04.2025</span>
              </div>
              <span className="min-h-6 text-[10px] rounded-full w-14 flex items-center justify-center ml-auto text-[#74D27E] bg-[#87D78E4D] border border-[#74D27E]">Active</span>
            </div>
          </div>

          {/* Messages Card */}
          <div className="flex flex-col border border-black/20 rounded-[20px] max-w-[298px] max-md:min-w-full max-md:max-w-full w-full">
            <div className="flex gap-4 items-center px-4 min-h-20 justify-between">
              <span className="text-[22px] font-semibold flex items-center gap-2">
                <span className="size-11 bg-[#E6E6E6] rounded-full flex items-center justify-center relative">
                  <span className="size-4 bg-[#B699CA] rounded-full absolute -right-0.5 -top-0.5 border-2 border-white"></span>
                  <img src="/images/vectors/messages.png" alt="" />
                </span>
                Messages
              </span>
            </div>
            <div className="flex mx-4 flex-col gap-2 max-md:pb-4">
              <div className="flex flex-col bg-[#F3F3F3] px-4 py-2.5 rounded-full gap-1">
                <div className="flex gap-2 text-[10px] font-semibold items-center relative">
                  <span className="size-1.5 rounded-full bg-[#74D27E] rounded-full absolute left-[18px] top-[18px] border border-white"></span>
                  <span className="size-6 rounded-full overflow-hidden">
                    <img className="w-full h-full object-cover" src="/images/vectors/profile.jpg" alt="" />
                  </span>
                  Emma Robertson
                  <span className="size-3 rounded-full bg-[#EE5D50] flex items-center justify-center text-[8px] text-white">2</span>
                </div>
                <span className="text-[9px] whitespace-nowrap text-ellipsis block overflow-hidden text-[#888787]">Thank You for sharing this information! I am so exited</span>
              </div>
              <div className="flex flex-col bg-[#F3F3F3] px-4 py-2.5 rounded-full gap-1">
                <div className="flex gap-2 text-[10px] font-semibold items-center relative">
                  <span className="size-1.5 rounded-full bg-[#74D27E] rounded-full absolute left-[18px] top-[18px] border border-white"></span>
                  <span className="size-6 rounded-full overflow-hidden">
                    <img className="w-full h-full object-cover" src="/images/vectors/profile.jpg" alt="" />
                  </span>
                  Emma Robertson
                  <span className="size-3 rounded-full bg-[#EE5D50] flex items-center justify-center text-[8px] text-white">2</span>
                </div>
                <span className="text-[9px] whitespace-nowrap text-ellipsis block overflow-hidden text-[#888787]">Thank You for sharing this information! I am so exited</span>
              </div>
              <div className="flex flex-col bg-[#F3F3F3] px-4 py-2.5 rounded-full gap-1">
                <div className="flex gap-2 text-[10px] font-semibold items-center relative">
                  <span className="size-1.5 rounded-full bg-[#74D27E] rounded-full absolute left-[18px] top-[18px] border border-white"></span>
                  <span className="size-6 rounded-full overflow-hidden">
                    <img className="w-full h-full object-cover" src="/images/vectors/profile.jpg" alt="" />
                  </span>
                  Emma Robertson
                  <span className="size-3 rounded-full bg-[#EE5D50] flex items-center justify-center text-[8px] text-white">2</span>
                </div>
                <span className="text-[9px] whitespace-nowrap text-ellipsis block overflow-hidden text-[#888787]">Thank You for sharing this information! I am so exited</span>
              </div>
              <button className="w-full h-16 bg-black text-white text-[22px] rounded-full max-md:h-12 max-md:text-base" onClick={() => router.push('/account/inbox')}>View Inbox</button>
            </div>
          </div>
        </div>

        {/* Active Subscriptions Table */}
        <div className="flex flex-col border border-black/20 rounded-[20px] w-full mt-auto">
          <div className="flex gap-4 items-center px-4 min-h-20 justify-between">
            <span className="text-[22px] font-semibold">Active Subscriptions</span>
          </div>
          <div className="overflow-y-auto w-full px-4">
            <table className="w-full text-left">
              <thead className="text-[#A3AED0] text-sm border-b border-[#E9EDF7]">
                <tr>
                  <th className="px-1 whitespace-nowrap py-3 font-medium">TYPE</th>
                  <th className="px-1 whitespace-nowrap py-3 font-medium">AMOUNT</th>
                  <th className="px-1 whitespace-nowrap py-3 font-medium">START DATE</th>
                  <th className="px-1 whitespace-nowrap py-3 font-medium">END DATE</th>
                  <th className="px-1 whitespace-nowrap py-3 font-medium text-center">STATUS</th>
                  <th className="px-1 whitespace-nowrap py-3 font-medium text-center">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td className="px-1 whitespace-nowrap py-3 text-sm font-medium whitespace-nowrap">{row.plan}</td>
                    <td className="px-1 whitespace-nowrap py-3 text-sm font-medium whitespace-nowrap">{row.price}</td>
                    <td className="px-1 whitespace-nowrap py-3 text-sm font-medium whitespace-nowrap">{row.startDate}</td>
                    <td className="px-1 whitespace-nowrap py-3 text-sm font-medium whitespace-nowrap">{row.endDate}</td>
                    <td className="px-1 whitespace-nowrap py-3 text-sm font-medium whitespace-nowrap text-center">
                      <span className={`min-h-6 text-[10px] rounded-full w-14 mx-auto flex items-center justify-center ${statusStyles[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-1 whitespace-nowrap py-3 text-sm font-medium whitespace-nowrap text-center">
                      {row.action ? (<img className="w-6 mx-auto" src="/images/vectors/ellipses.png" alt="action" />) : ("N/A")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="flex flex-col w-72 min-w-72 gap-4 max-md:w-full max-md:min-w-full">
        {/* Total Listings Card */}
        <div className="flex flex-col border border-black/20 rounded-[20px] w-full h-full">
          <div className="flex gap-4 items-center px-4 min-h-20 justify-between">
            <span className="text-[22px] font-semibold flex items-center gap-2">
              <span className="size-11 bg-[#E6E6E6] rounded-full flex items-center justify-center">
                <img src="/images/vectors/totalListings.png" alt="" />
              </span>
              Total Listings
            </span>
          </div>
          <span className="p-4 pt-0 flex flex-col">
            <img src="/images/vectors/chart2.svg" className="w-full" alt="" />
            <button className="w-full h-16 bg-black text-white text-[22px] rounded-full mt-7 max-md:h-12 max-md:text-base">Manage List</button>
          </span>
        </div>

        {/* Payments Card */}
        <div className="flex flex-col border border-black/20 rounded-[20px] w-full mt-auto">
          <div className="flex gap-4 items-center px-4 min-h-20 justify-between">
            <span className="text-[22px] font-semibold">Payments</span>
          </div>
          <div className="overflow-auto w-full px-4">
            <table className="w-full text-left table-fixed">
              <thead className="text-[#A3AED0] text-sm border-b border-[#E9EDF7]">
                <tr>
                  <th className="px-1 whitespace-nowrap py-3 font-medium">Type</th>
                  <th className="px-1 whitespace-nowrap py-3 font-medium w-[75px]">Amount</th>
                  <th className="px-1 whitespace-nowrap py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((row, index) => (
                  <tr key={index}>
                    <td className="px-1 py-3 text-sm font-medium">
                      <span className="text-ellipsis overflow-hidden block whitespace-nowrap">{row.plan}</span>
                    </td>
                    <td className="px-1 py-3 text-sm font-medium">
                      <span className="text-ellipsis overflow-hidden block whitespace-nowrap">{row.price}</span>
                    </td>
                    <td className="px-1 py-3 text-sm font-medium">
                      <span className="whitespace-nowrap">{row.startDate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}; 