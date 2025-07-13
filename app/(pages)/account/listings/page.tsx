"use client";

import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { DashboardCard, DashboardTable } from "@/_components/common/dashboard-widgets";
import { VerificationGuard } from "@/_components/common/verification-guard";

const listingRows = [
  { title: "Golden Retriever Puppies", type: "Puppy", price: "$1500", status: "Active", views: "245", action: "•••" },
  { title: "Labrador Stud Service", type: "Stud", price: "$500", status: "Active", views: "189", action: "•••" },
  { title: "Poodle Semen", type: "Semen", price: "$300", status: "Pending", views: "67", action: "•••" },
  { title: "German Shepherd Puppies", type: "Puppy", price: "$1200", status: "Expired", views: "156", action: "•••" },
  { title: "Border Collie Stud", type: "Stud", price: "$400", status: "Active", views: "98", action: "•••" }
];

const MyListings = () => {
  return (
    <VerificationGuard>
      <DashboardLayout title="My Listings" showTimeFilter={false}>
        <div className="flex gap-4 min-w-min max-md:flex-col max-md:min-w-full">
          <div className="flex flex-col w-full gap-4">
            <DashboardCard title="All Listings" className="w-full">
              <DashboardTable
                headers={["TITLE", "TYPE", "PRICE", "STATUS", "VIEWS", "ACTION"]}
                data={listingRows}
              />
            </DashboardCard>
          </div>
        </div>
      </DashboardLayout>
    </VerificationGuard>
  );
};

export default MyListings;
