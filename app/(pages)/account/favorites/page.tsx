"use client";

import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { DashboardCard, DashboardTable } from "@/_components/common/dashboard-widgets";

const favoriteRows = [
  { title: "Golden Retriever Puppies", breeder: "John Smith", price: "$1500", added: "2024-01-15", status: "Available", action: "•••" },
  { title: "Labrador Stud Service", breeder: "Sarah Wilson", price: "$500", added: "2024-01-14", status: "Available", action: "•••" },
  { title: "Poodle Semen", breeder: "Mike Johnson", price: "$300", added: "2024-01-13", status: "Sold", action: "•••" },
  { title: "German Shepherd Puppies", breeder: "Emma Davis", price: "$1200", added: "2024-01-12", status: "Available", action: "•••" },
  { title: "Border Collie Stud", breeder: "David Brown", price: "$400", added: "2024-01-11", status: "Available", action: "•••" }
];

const Favorites = () => {
  return (
    <DashboardLayout title="Favorites" showTimeFilter={false}>
      <div className="flex gap-4 min-w-min max-md:flex-col max-md:min-w-full">
        <div className="flex flex-col w-full gap-4">
          <DashboardCard title="Saved Items" className="w-full">
            <DashboardTable
              headers={["TITLE", "BREEDER", "PRICE", "ADDED", "STATUS", "ACTION"]}
              data={favoriteRows}
            />
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Favorites; 