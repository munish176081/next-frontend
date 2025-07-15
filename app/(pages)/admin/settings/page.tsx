"use client";

import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { DashboardCard } from "@/_components/common/dashboard-widgets";
import { AdminGuard } from "@/_components/common/admin-guard";

const SystemSettings = () => {
  return (
    <AdminGuard>
      <DashboardLayout title="System Settings" showTimeFilter={false}>
        <div className="flex gap-4 min-w-min max-md:flex-col max-md:min-w-full">
          <div className="flex flex-col w-full gap-4">
            <DashboardCard title="General Settings" className="w-full">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Site Maintenance</span>
                  <button className="px-4 py-2 bg-black text-white rounded-full text-sm">Toggle</button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Notifications</span>
                  <button className="px-4 py-2 bg-black text-white rounded-full text-sm">Enable</button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">User Registration</span>
                  <button className="px-4 py-2 bg-black text-white rounded-full text-sm">Open</button>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
};

export default SystemSettings; 