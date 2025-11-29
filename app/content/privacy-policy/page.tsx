"use client";

import { Suspense } from "react";

function PrivacyPage() {
  const privacy_content = `<h2 class="text-2xl font-semibold text-gray-800">Privacy Policy on pups4sale.com.au</h2>

  <p class="mt-6 text-sm leading-relaxed">
    Your privacy is very important to us. Accordingly, we have developed this Policy in order for you to understand how we collect, use, communicate and disclose and make use of personal information. The following outlines our privacy policy.
  </p>

  <p class="mt-2 text-sm leading-relaxed">
    In order to place classified ads with pups4sale.com.au, you will need to agree to comply with the following:
  </p>

  <ul class="mt-4 list-disc pl-6 space-y-3 text-sm leading-relaxed">
    <li>Before or at the time of collecting personal information, we will identify the purposes for which the information is being collected.</li>

    <li>We will collect and use personal information solely with the objective of fulfilling those purposes specified by us and for other compatible purposes, unless we obtain the consent of the individual concerned or as required by law. Primarily this is in order for us to have sufficient information to verify the identity of those people registering with pups4sale.</li>

    <li>We will only retain personal information as long as necessary for the fulfillment of those purposes.</li>

    <li>We will collect personal information by lawful and fair means and, where appropriate, with the knowledge or consent of the individual concerned.</li>

    <li>
      Personal data should be relevant to the purposes for which it is to be used, and, to the extent necessary for those purposes, should be accurate, complete, and up-to-date.
    </li>

    <li>We will protect personal information by utilising industry best standards of data encryption against loss or theft, as well as unauthorized access, disclosure, copying, use or modification.</li>

    <li>We will make readily available to customers information about our policies and practices relating to the management of personal information.</li>

  </ul>
  <p class="mt-4 text-sm leading-relaxed">
      We are committed to conducting our business in accordance with these principles in order to ensure that the confidentiality of personal information is protected and maintained.
  </p>
  `;
  return (
    <>
      <div className="container flex flex-col gap-16 pt-16 max-2xl:p-4 max-md:gap-4">
        <section className="flex gap-6 max-md:flex-col max-md:gap-4">
          <div
            className="flex w-full max-md:w-full rounded-40 p-8 bg-white flex-col items-start max-md:p-4"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: privacy_content }}
          />
        </section>
      </div>

      <section className="rounded-40 container max-2xl:w-auto max-md:my-0 max-2xl:my-4 my-10 py-8 overflow-hidden border border-black/20 bg-white flex flex-col relative justify-center max-md:py-4 max-2xl:mx-4">
        <div className="backdrop-blur-2xl bg-[#FAFAFA]/50 border border-black/20 rounded-3xl p-8 absolute max-md:static max-md:w-auto max-md:mx-4 max-md:p-4 max-md:gap-3 max-md:mb-4 top-4 z-20 m-auto right-4 flex flex-col gap-5 h-[calc(100%-32px)] w-[540px]">
          <span className="text-3xl max-md:text-[20px] max-md:leading-tight font-medium">
            Subscribe and get exclusive deals &amp; offer
          </span>
          <span className="max-md:text-xs">
            Subscribe to our email &amp; get updates right in your inbox
          </span>
          <input
            type="text"
            placeholder="Full Name"
            className="text-base placeholder:text-[#4B4A4A] bg-transparent font-normal outline-none px-6 w-full h-[70px] rounded-full border border-black max-md:h-12"
          />
          <input
            type="text"
            placeholder="Email"
            className="text-base placeholder:text-[#4B4A4A] bg-transparent font-normal outline-none px-6 w-full h-[70px] rounded-full border border-black max-md:h-12"
          />
          <button className="h-20 max-md:h-12 max-md:text-base w-full rounded-full bg-black text-white text-xl font-semibold mt-auto">
            Subscribe
          </button>
        </div>
        <div className="max-md:h-[300px] w-full max-md:flex max-md:justify-center">
          <img
            className="h-full max-w-max"
            src="/images/cta-block/background.png"
            alt="Subscribe background"
          />
        </div>
      </section>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PrivacyPage />
    </Suspense>
  );
}


