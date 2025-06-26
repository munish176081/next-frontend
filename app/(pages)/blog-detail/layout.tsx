import { Header } from "@/_components/header";
import { Footer } from "@/_components/common/footer";
import { Suspense } from "react";

export default function blogDetail({ children }: React.PropsWithChildren) {
  return (
    <>
      <Header />
      <main className="bg-gray-main py-12 flex-col flex gap-16 max-md:gap-4 max-md:py-4">
        <Suspense>{children}</Suspense>
        <Footer />
      </main>
    </>
  );
}
