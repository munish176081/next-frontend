"use client";

import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { DashboardCard, DashboardTable } from "@/_components/common/dashboard-widgets";
import { AdminGuard } from "@/_components/common/admin-guard";
import { VerificationGuard } from "@/_components/common/verification-guard";

const userRows = [
  { name: "John Doe", email: "john@example.com", role: "user", joined: "2024-01-15", status: "Active", action: "•••" },
  { name: "Jane Smith", email: "jane@example.com", role: "admin", joined: "2024-01-14", status: "Active", action: "•••" },
  { name: "Bob Wilson", email: "bob@example.com", role: "user", joined: "2024-01-13", status: "Pending", action: "•••" },
  { name: "Alice Brown", email: "alice@example.com", role: "user", joined: "2024-01-12", status: "Suspended", action: "•••" },
  { name: "Charlie Davis", email: "charlie@example.com", role: "user", joined: "2024-01-11", status: "Active", action: "•••" },
  { name: "Diana Evans", email: "diana@example.com", role: "admin", joined: "2024-01-10", status: "Active", action: "•••" }
];

const UserManagement = () => {
  return (
    <VerificationGuard>
      <AdminGuard>
        <DashboardLayout title="User Management" showTimeFilter={false}>
          <div className="flex gap-4 min-w-min max-md:flex-col max-md:min-w-full">
            <div className="flex flex-col w-full gap-4">
              <DashboardCard title="All Users" className="w-full">
                <DashboardTable
                  headers={["NAME", "EMAIL", "ROLE", "JOINED", "STATUS", "ACTION"]}
                  data={userRows}
                />
              </DashboardCard>
            </div>
          </div>
        </DashboardLayout>
      </AdminGuard>
    </VerificationGuard>
  );
};

export default UserManagement; 