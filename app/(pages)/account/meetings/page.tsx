'use client';
import { Heading } from "@/_components/ui/typegraphy";
import SearchInput from "./_components/search-input";
import { Suspense } from "react";
import { MeetingsTable } from "./_components/meetings-table";

export const dynamic = 'force-dynamic';

const MeetingsPage = () => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:item-center md:justify-between mb-4">
        <Heading className="text-h3 md:text-h3 mb-2 md:mb-0">
          Your Meetings
        </Heading>
        <SearchInput />
      </div>
      <MeetingsTable meetings={[]} isLoading={false} />
    </>
  );
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MeetingsPage />
    </Suspense>
  );
}
