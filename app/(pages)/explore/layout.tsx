import { Header } from "@/_components/header";
import { Footer } from "@/_components/common/footer";
import { Suspense } from "react";

export default function ListingLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      <Header />
      <main className="flex-grow bg-gray-main pb-12 max-md:pb-4">
        <Suspense>{children}</Suspense>
        <Footer />
      </main>
    </>
  );
}
