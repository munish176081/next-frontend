"use client";

import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { DashboardCard } from "@/_components/common/dashboard-widgets";
import { AdminGuard } from "@/_components/common/admin-guard";

const alerts = [
  {
    type: "System Alert",
    message: "High server load detected - 5 minutes ago",
    priority: "high",
    icon: "!"
  },
  {
    type: "System Info",
    message: "Database backup completed - 1 hour ago",
    priority: "info",
    icon: "i"
  },
  {
    type: "User Activity",
    message: "New user registration spike - 2 hours ago",
    priority: "success",
    icon: "+"
  },
  {
    type: "Security Alert",
    message: "Multiple failed login attempts - 30 minutes ago",
    priority: "high",
    icon: "!"
  }
];

const SystemAlerts = () => {
  return (
    <AdminGuard>
      <DashboardLayout title="System Alerts" showTimeFilter={false}>
        <div className="flex gap-4 min-w-min max-md:flex-col max-md:min-w-full">
          <div className="flex flex-col w-full gap-4">
            <DashboardCard title="Active Alerts" className="w-full">
              <div className="flex mx-4 flex-col gap-2 max-md:pb-4">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex flex-col bg-[#F3F3F3] px-4 py-2.5 rounded-full gap-1">
                    <div className="flex gap-2 text-[10px] font-semibold items-center relative">
                      <span className={`size-1.5 rounded-full ${
                        alert.priority === 'high' ? 'bg-[#FFCE20]' : 
                        alert.priority === 'info' ? 'bg-[#74D27E]' : 'bg-[#74D27E]'
                      } absolute left-[18px] top-[18px] border border-white`}></span>
                      <span className="size-6 rounded-full overflow-hidden">
                        <img className="w-full h-full object-cover" src="/images/vectors/profile.jpg" alt="" />
                      </span>
                      {alert.type}
                      <span className={`size-3 rounded-full ${
                        alert.priority === 'high' ? 'bg-[#EE5D50]' : 
                        alert.priority === 'info' ? 'bg-[#74D27E]' : 'bg-[#74D27E]'
                      } flex items-center justify-center text-[8px] text-white`}>
                        {alert.icon}
                      </span>
                    </div>
                    <span className="text-[9px] whitespace-nowrap text-ellipsis block overflow-hidden text-[#888787]">
                      {alert.message}
                    </span>
                  </div>
                ))}
                <button className="w-full h-16 bg-black text-white text-[22px] rounded-full max-md:h-12 max-md:text-base">
                  View All Alerts
                </button>
              </div>
            </DashboardCard>
          </div>
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
};

export default SystemAlerts; 