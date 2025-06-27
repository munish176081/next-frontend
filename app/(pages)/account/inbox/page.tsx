'use client';
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

  
export default function Page() {
  return (
    <Suspense fallback={null}>
      <div>InboxPage</div>
    </Suspense>
  );
}
