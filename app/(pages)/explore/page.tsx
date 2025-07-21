"use client";
import { Suspense, useState } from "react";
import { useSearchListings } from "@/_services/hooks/listings/use-search-listings";
import { useGetListings } from "@/_services/hooks/listings/use-get-listings";
import { ListingTypeEnum, ListingCategoryEnum } from "@/_types/listing";

function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ListingTypeEnum | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<ListingCategoryEnum | undefined>();

  // Use search if there's a query, otherwise use general listings
  const searchParams = searchQuery ? {
    query: searchQuery,
    type: selectedType,
    category: selectedCategory,
    page: 1,
    limit: 20
  } : undefined;

  const { data: searchResults, isLoading: isSearching } = useSearchListings(searchParams || { query: '' });
  const { data: listings, isLoading: isListingsLoading } = useGetListings({
    type: selectedType,
    category: selectedCategory,
    page: 1,
    limit: 20
  });

  const data = searchQuery ? searchResults : listings;
  const isLoading = searchQuery ? isSearching : isListingsLoading;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is triggered automatically by the hook
  };

  return (
    <div className="container p-8">
      <h1 className="text-3xl font-bold mb-8">Explore Listings</h1>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search listings..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedType || ''}
            onChange={(e) => setSelectedType(e.target.value as ListingTypeEnum || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="PUPPY_LISTING">Puppy Listings</option>
            <option value="SEMEN_LISTING">Semen Listings</option>
            <option value="STUD_LISTING">Stud Listings</option>
            <option value="FUTURE_LISTING">Future Listings</option>
            <option value="WANTED_LISTING">Wanted Listings</option>
            <option value="OTHER_SERVICES">Other Services</option>
          </select>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value as ListingCategoryEnum || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="puppy">Puppy</option>
            <option value="breeding">Breeding</option>
            <option value="service">Service</option>
            <option value="wanted">Wanted</option>
          </select>
        </div>
      </form>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <p>Loading listings...</p>
        </div>
      ) : data && data.data && data.data.length > 0 ? (
        <div className="grid gap-6">
          <div className="text-sm text-gray-600 mb-4">
            Found {data.total} listings
          </div>
          
          {data.data.map((listing) => (
            <div key={listing.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{listing.title}</h2>
                  <p className="text-gray-600">{listing.type}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                    listing.isFeatured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {listing.isFeatured ? 'Featured' : listing.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">${listing.price || 'N/A'}</div>
                  <div className="text-sm text-gray-600">{listing.location}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Breed:</span> {listing.breed || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Views:</span> {listing.viewCount}
                </div>
                <div>
                  <span className="font-medium">Favorites:</span> {listing.favoriteCount}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(listing.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              {listing.user && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Posted by: {listing.user.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No listings found.</p>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ExplorePage />
    </Suspense>
  );
}
