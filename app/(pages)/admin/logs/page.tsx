"use client";

import { useState } from "react";
import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { AdminGuard } from "@/_components/common/admin-guard";
import { VerificationGuard } from "@/_components/common/verification-guard";
import { ActivityLogsView } from "@/_components/admin/activity-logs/activity-logs-view";

const ActivityLogsPage = () => {
  return (
    <VerificationGuard>
      <AdminGuard>
        <DashboardLayout title="Activity Logs">
          <ActivityLogsView />
        </DashboardLayout>
      </AdminGuard>
    </VerificationGuard>
  );
};

export default ActivityLogsPage; 