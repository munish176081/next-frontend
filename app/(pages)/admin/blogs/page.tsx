"use client";

import { useState } from "react";
import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { AdminGuard } from "@/_components/common/admin-guard";
import { VerificationGuard } from "@/_components/common/verification-guard";
import { BlogManagementContent } from "@/_components/admin/blog-management/blog-management-content";

export default function AdminBlogsPage() {
  return (
    <VerificationGuard>
      <AdminGuard>
        <DashboardLayout title="Blog Management">
          <BlogManagementContent />
        </DashboardLayout>
      </AdminGuard>
    </VerificationGuard>
  );
}
