"use client";

import { VerifyEmailPage } from "./_components/verify-email-page";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPage />
    </Suspense>
  );
}