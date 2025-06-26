"use client";

import Section from "@/_components/common/section";
import { EthicalBreederFeature } from "./feature";

export const EthicalBreeder = () => {
  return (
    <>
    <section className="container flex flex-col relative gap-16 py-16 max-md:gap-4">
      <div className="flex flex-col gap-4 items-center m-auto relative w-full">
        <h1 className="text-40 max-md:text-3xl font-medium leading-none text-center">Committed to Ethical Breeding Excellence</h1>
        <span className="text-xl max-md:text-base text-center font-[300] max-w-[900px] mt-2 w-full leading-normal">At Pups4Sale, we <strong className="font-semibold">prioritize quality</strong>. Our trusted <strong className="font-semibold">breeders</strong> follow <strong className="font-semibold">strict ethical</strong> standards, ensuring every puppy is raised in a <strong className="font-semibold">healthy, loving environment.</strong></span>
      </div>
      <EthicalBreederFeature />
    </section>
    </>
  );
};
