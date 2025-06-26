import { Heading } from "@/_components/ui/typegraphy";
import { FindForm } from "./form";
import { Suspense } from "react";

export function FindPupiesForm() {
  return (
    <section className="backdrop-blur-2xl bg-[#FAFAFA]/15 border border-black/20 rounded-40  rounded-[25px] flex flex-col absolute max-md:static z-10 w-full max-w-[510px] p-8 bottom-8 right-8 max-md:p-4 max-md:-mt-12 max-md:backdrop-blur-lg">
      Buy & Sell with Confidence
      <Heading className="!text-4xl max-md:!text-xl font-medium mt-2 mb-4">Australia's #1 Puppy<br/> Marketplace</Heading>
      <Suspense>
      <FindForm />
      </Suspense>
    </section>
  );
}