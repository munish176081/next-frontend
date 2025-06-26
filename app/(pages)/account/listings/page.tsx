"use client";

import { Heading } from "@/_components/ui/typegraphy";
import { UserListingsTable } from "./_components/user-listings-table";
import { useUserListings } from "@/_services/hooks/user/use-user-listings";

function ListingsPage() {
  const { data: listings = [] } = useUserListings();

  return (
    <>
      <Heading className="text-h3 md:text-h3">Your Listings</Heading>
      <UserListingsTable listings={listings} />
    </>
  );
}

export default ListingsPage;
