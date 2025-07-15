"use client";

import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { UserDashboardContent } from "@/_components/dashboard/user-dashboard-content";
import { VerificationGuard } from "@/_components/common/verification-guard";

const AccountDashboard = () => {
  return (
    <VerificationGuard>
      <DashboardLayout title="Overview">
        <UserDashboardContent />
      </DashboardLayout>
    </VerificationGuard>
  );
};

export default AccountDashboard; 