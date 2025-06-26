"use client";

import { Header } from "@/_components/header";
import { Footer } from "@/_components/common/footer";
import { Suspense } from "react";
import { RequireUser } from "@/_components/common/require-user";

export default function wishlist({ children }: React.PropsWithChildren) {
  return (
    <RequireUser>
      <Header />
      <main className="flex-grow bg-gray-main pb-12 max-md:pb-4">
        <Suspense>{children}</Suspense>
        <Footer />
      </main>
    </RequireUser>
  );
}
