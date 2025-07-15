"use client";

import { useUser } from "@/_services/hooks/user/use-user";
import { UserDashboardContent } from "@/_components/dashboard/user-dashboard-content";
import { AdminDashboardContent } from "@/_components/dashboard/admin-dashboard-content";
import { AdminGuard } from "@/_components/common/admin-guard";
import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { VerificationGuard } from "@/_components/common/verification-guard";

const Dashboard = () => {
  const { data: user } = useUser();
  const userRole = user?.role || 'user';

  return (
    <VerificationGuard>
      <DashboardLayout title={userRole === 'super_admin' || userRole === 'admin' ? 'Admin Overview' : 'Overview'}>
        {userRole === 'super_admin' || userRole === 'admin' ? (
          <AdminGuard>
            <AdminDashboardContent />
          </AdminGuard>
        ) : (
          <UserDashboardContent />
        )}
      </DashboardLayout>
    </VerificationGuard>
  );
};

export default Dashboard;
