"use client";

import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { DashboardCard, DashboardTable } from "@/_components/common/dashboard-widgets";

const paymentRows = [
  { type: "Listing Fee", amount: "$150", date: "2024-01-15", status: "Completed", action: "•••" },
  { type: "Featured Listing", amount: "$50", date: "2024-01-14", status: "Completed", action: "•••" },
  { type: "Stud Service", amount: "$200", date: "2024-01-13", status: "Pending", action: "•••" },
  { type: "Subscription", amount: "$100", date: "2024-01-12", status: "Completed", action: "•••" },
  { type: "Premium Listing", amount: "$75", date: "2024-01-11", status: "Failed", action: "•••" }
];

const Payments = () => {
  return (
    <DashboardLayout title="Payments" showTimeFilter={false}>
      <div className="flex gap-4 min-w-min max-md:flex-col max-md:min-w-full">
        <div className="flex flex-col w-full gap-4">
          <DashboardCard title="Payment History" className="w-full">
            <DashboardTable
              headers={["TYPE", "AMOUNT", "DATE", "STATUS", "ACTION"]}
              data={paymentRows}
            />
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payments; 