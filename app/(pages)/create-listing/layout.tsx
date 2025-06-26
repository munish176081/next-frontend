"use client";

import { Header } from "@/_components/header";
import { RequireUser } from "@/_components/common/require-user";

export default function ListingLayout({ children }: React.PropsWithChildren) {
  return (
    <RequireUser>
      <Header />
      <main className="flex-grow">{children}</main>
    </RequireUser>
  );
}
