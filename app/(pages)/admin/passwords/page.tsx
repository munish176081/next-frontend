"use client";

import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { DashboardCard, DashboardTable } from "@/_components/common/dashboard-widgets";
import { AdminGuard } from "@/_components/common/admin-guard";

const passwordRows = [
  { user: "John Doe", email: "john@example.com", lastChanged: "2024-01-15", status: "Active", action: "•••" },
  { user: "Jane Smith", email: "jane@example.com", lastChanged: "2024-01-14", status: "Active", action: "•••" },
  { user: "Bob Wilson", email: "bob@example.com", lastChanged: "2024-01-13", status: "Expired", action: "•••" },
  { user: "Alice Brown", email: "alice@example.com", lastChanged: "2024-01-12", status: "Active", action: "•••" },
  { user: "Charlie Davis", email: "charlie@example.com", lastChanged: "2024-01-11", status: "Pending", action: "•••" }
];

const PasswordManagement = () => {
  return (
    <AdminGuard>
      <DashboardLayout title="Password Management" showTimeFilter={false}>
        <div className="flex gap-4 min-w-min max-md:flex-col max-md:min-w-full">
          <div className="flex flex-col w-full gap-4">
            <DashboardCard title="Password Status" className="w-full">
              <DashboardTable
                headers={["USER", "EMAIL", "LAST CHANGED", "STATUS", "ACTION"]}
                data={passwordRows}
              />
            </DashboardCard>
          </div>
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
};

export default PasswordManagement; 