"use client";

import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { DashboardCard, DashboardTable } from "@/_components/common/dashboard-widgets";
import { useMeetings } from '@/_services/hooks/meetings/use-meetings';

const Meetings = () => {
  const { meetings, isLoading } = useMeetings();

  // Transform meetings data to match the original table format
  const meetingRows = meetings.map(meeting => ({
    buyer: meeting.buyerName || "Unknown",
    puppy: meeting.listingTitle || "Unknown Listing",
    date: meeting.date,
    time: meeting.time,
    status: meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1),
    action: "•••"
  }));

  if (isLoading) {
    return (
      <DashboardLayout title="Meetings" showTimeFilter={false}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Meetings" showTimeFilter={false}>
      <div className="flex gap-4 min-w-min max-md:flex-col max-md:min-w-full">
        <div className="flex flex-col w-full gap-4">
          <DashboardCard title="Scheduled Meetings" className="w-full">
            <DashboardTable
              headers={["BUYER", "PUPPY", "DATE", "TIME", "STATUS", "ACTION"]}
              data={meetingRows}
            />
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Meetings;
