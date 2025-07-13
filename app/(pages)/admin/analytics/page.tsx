"use client";

import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { DashboardCard } from "@/_components/common/dashboard-widgets";
import { AdminGuard } from "@/_components/common/admin-guard";

const Analytics = () => {
  return (
    <AdminGuard>
      <DashboardLayout title="Analytics">
        <div className="flex gap-4 min-w-min max-md:flex-col max-md:min-w-full">
          <div className="flex flex-col w-full gap-4">
            <DashboardCard title="User Analytics" className="w-full">
              <img src="/images/vectors/chart1.svg" className="w-full" alt="User Analytics" />
            </DashboardCard>
            <DashboardCard title="Revenue Analytics" className="w-full">
              <img src="/images/vectors/chart2.svg" className="w-full" alt="Revenue Analytics" />
            </DashboardCard>
          </div>
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
};

export default Analytics; 