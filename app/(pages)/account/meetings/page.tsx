"use client";

import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { DashboardCard, DashboardTable } from "@/_components/common/dashboard-widgets";

const meetingRows = [
  { buyer: "John Smith", puppy: "Golden Retriever", date: "2024-01-20", time: "14:00", status: "Confirmed", action: "•••" },
  { buyer: "Sarah Wilson", puppy: "Labrador", date: "2024-01-22", time: "10:30", status: "Pending", action: "•••" },
  { buyer: "Mike Johnson", puppy: "German Shepherd", date: "2024-01-25", time: "16:00", status: "Confirmed", action: "•••" },
  { buyer: "Emma Davis", puppy: "Poodle", date: "2024-01-28", time: "11:00", status: "Cancelled", action: "•••" },
  { buyer: "David Brown", puppy: "Border Collie", date: "2024-01-30", time: "13:30", status: "Pending", action: "•••" }
];

const Meetings = () => {
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
