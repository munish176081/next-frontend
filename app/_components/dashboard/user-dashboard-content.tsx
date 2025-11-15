"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUserSubscriptions, Subscription } from '@/_lib/api/subscriptions';
import { formatPrice } from '@/_lib/pricing';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusLabel(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getSubscriptionType(subscription: Subscription): string {
  if (!subscription.listingType) return "Subscription";
  
  const typeMap: Record<string, string> = {
    SEMEN_LISTING: "Semen Listing",
    PUPPY_LISTING: "Puppy Listing",
    PUPPY_LITTER_LISTING: "Puppy Litter Listing",
    STUD_LISTING: "Stud Listing",
    FUTURE_LISTING: "Future Listing",
    WANTED_LISTING: "Wanted Listing",
    OTHER_SERVICES: "Other Services",
  };
  
  let type = typeMap[subscription.listingType] || subscription.listingType.replace(/_/g, " ");
  
  if (subscription.includesFeatured) {
    type += " + Featured";
  }
  
  return type;
}

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
  active: "text-[#74D27E] bg-[#87D78E4D] border border-[#74D27E]",
  pending: "text-[#FFCE20] bg-[#EFC95133] border border-[#FFCE20]",
  expired: "text-[#EE5D50] bg-[#EE5D5033] border border-[#EE5D50]",
  cancelled: "text-gray-600 bg-gray-100 border border-gray-300",
  past_due: "text-white bg-orange-500 border border-orange-500",
  trialing: "text-blue-600 bg-blue-100 border border-blue-300",
  incomplete: "text-yellow-600 bg-yellow-100 border border-yellow-300",
  incomplete_expired: "text-gray-600 bg-gray-100 border border-gray-300",
  unpaid: "text-red-600 bg-red-100 border border-red-300",
};

export const UserDashboardContent = () => {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        setIsLoadingSubscriptions(true);
        // Fetch from Stripe and sync with database
        const data = await getUserSubscriptions(true);
        setSubscriptions(data);
      } catch (error) {
        console.error('Failed to load subscriptions:', error);
        // Fallback to database-only if Stripe sync fails
        try {
          const data = await getUserSubscriptions(false);
          setSubscriptions(data);
        } catch (fallbackError) {
          console.error('Failed to load subscriptions from database:', fallbackError);
          setSubscriptions([]);
        }
      } finally {
        setIsLoadingSubscriptions(false);
      }
    };
    loadSubscriptions();
  }, []);

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
                {isLoadingSubscriptions ? (
                  <tr>
                    <td colSpan={6} className="px-1 py-8 text-center text-sm text-gray-500">
                      Loading subscriptions...
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-1 py-8 text-center text-sm text-gray-500">
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((subscription) => {
                    const status = getStatusLabel(subscription.status);
                    const isExpiredOrCancelled = subscription.status === "expired" || subscription.status === "cancelled";
                    return (
                      <tr key={subscription.id}>
                        <td className="px-1 whitespace-nowrap py-3 text-sm font-medium">
                          {getSubscriptionType(subscription)}
                        </td>
                        <td className="px-1 whitespace-nowrap py-3 text-sm font-medium">
                          {formatPrice(subscription.amount)}
                        </td>
                        <td className="px-1 whitespace-nowrap py-3 text-sm font-medium">
                          {formatDate(subscription.currentPeriodStart)}
                        </td>
                        <td className="px-1 whitespace-nowrap py-3 text-sm font-medium">
                          {formatDate(subscription.currentPeriodEnd)}
                        </td>
                        <td className="px-1 whitespace-nowrap py-3 text-sm font-medium whitespace-nowrap text-center">
                          <span className={`min-h-6 text-[10px] rounded-full w-14 mx-auto flex items-center justify-center ${statusStyles[subscription.status] || statusStyles.cancelled}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-1 whitespace-nowrap py-3 text-sm font-medium whitespace-nowrap text-center">
                          {isExpiredOrCancelled ? (
                            "N/A"
                          ) : (
                            <img 
                              className="w-6 mx-auto cursor-pointer" 
                              src="/images/vectors/ellipses.png" 
                              alt="action"
                              onClick={() => router.push('/account/subscriptions')}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
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