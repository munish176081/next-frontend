"use client";

import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { AdminDashboardContent } from "@/_components/dashboard/admin-dashboard-content";
import { AdminGuard } from "@/_components/common/admin-guard";
import { VerificationGuard } from "@/_components/common/verification-guard";

const AdminDashboard = () => {
  return (
    <VerificationGuard>
      <AdminGuard>
        <DashboardLayout title="Admin Overview">
          <AdminDashboardContent />
        </DashboardLayout>
      </AdminGuard>
    </VerificationGuard>
  );
};

export default AdminDashboard; 