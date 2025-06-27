'use client';
import { OtherServicesListingForm } from "./_components/form";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

function OtherServicesListing() {
  return (
    <section className="pt-16 md:pt-20 4xl:pt-24">
      <div className="flex justify-center mt-10 lg:mt-14 h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] 4xl:h-[calc(100vh-96px)]">
        <OtherServicesListingForm />
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OtherServicesListing />
    </Suspense>
  );
}
