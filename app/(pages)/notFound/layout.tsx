import { Header } from "@/_components/header";
import { Footer } from "@/_components/common/footer";
import { Suspense } from "react";

export default function notFound({ children }: React.PropsWithChildren) {
  return (
    <>
      <Header />
      <main className="bg-gray-main py-12 max-md:py-4">
        <div className="flex-col flex gap-16 max-md:gap-4 max-2xl:px-4 mb-16 max-md:mb-4">
          <Suspense>{children}</Suspense>
        </div>
        <Footer />
      </main>
    </>
  );
}
