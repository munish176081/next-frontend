"use client";

import { Header } from "@/_components/header";
import { Footer } from "@/_components/common/footer";
import { Suspense } from "react";
import { RequireUser } from "@/_components/common/require-user";

export default function MeetingsList({ children }: React.PropsWithChildren) {
  return (
    <RequireUser>
      <Header />
      <main className="bg-gray-main py-12 max-md:py-4 max-2xl:px-4 max-md:!px-0">
        <div className="flex-col flex gap-16 max-md:gap-4 max-md:px-4 mb-16 max-md:mb-4">
          <Suspense>{children}</Suspense>
        </div>
        <Footer />
      </main>
    </RequireUser>
  );
}
