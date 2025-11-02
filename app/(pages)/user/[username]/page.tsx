"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/_components/ui/button";
import { Badge } from "@/_components/ui/badge";
import { MapPin, Phone, Mail, Globe, Calendar, CheckCircle, User, Plus, Clock } from "lucide-react";
import { useUserProfile, useUserListings } from "@/_services/hooks/user/use-user-profile";
import { ListingCard } from "@/_components/common/listing-card";
import { useUser } from "@/_services/hooks/user/use-user";
import Link from "next/link";
// import { CtaBlock } from "../(home)/_components/cta-block";


export default function UserProfile() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('puppies');
  const username = params.username as string;
  
  const { data: user, isLoading: userLoading, error: userError } = useUserProfile(username);
  const { data: listings, isLoading: listingsLoading } = useUserListings(username);
  const { data: currentUser } = useUser();
  
  // Check if this is the current user's own profile
  const isOwnProfile = currentUser?.username === username;

  const tabs = [
    { id: 'puppies', label: 'Puppies', count: listings?.puppies?.length || 0 },
    { id: 'litters', label: 'Litters', count: listings?.litters?.length || 0 },
    { id: 'stud', label: 'Stud', count: listings?.stud?.length || 0 },
    { id: 'semen', label: 'Semen', count: listings?.semen?.length || 0 },
    { id: 'wanted', label: 'Wanted', count: listings?.wanted?.length || 0 },
    { id: 'services', label: 'Services', count: listings?.services?.length || 0 }
  ];

  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  // Get the add listing URL for each tab type
  const getAddListingUrl = (tabId: string) => {
    const baseUrl = '/startlistingform';
    switch (tabId) {
      case 'puppies':
        return `${baseUrl}?type=puppy_litter`;
      case 'litters':
        return `${baseUrl}?type=puppy_litter`;
      case 'stud':
        return `${baseUrl}?type=stud`;
      case 'semen':
        return `${baseUrl}?type=semen`;
      case 'wanted':
        return `${baseUrl}?type=wanted`;
      case 'services':
        return `${baseUrl}?type=services`;
      default:
        return baseUrl;
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-500">The user profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const renderListings = () => {
    if (listingsLoading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-CPrimary mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading listings...</p>
        </div>
      );
    }

    const currentListings = listings?.[activeTab as keyof typeof listings] || [];
    
    if (currentListings.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-6">No {activeTab} listings available</p>
          {isOwnProfile && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {activeTab === 'litters' ? (
                <>
                  <Link href="/startlistingform?type=puppy_litter">
                    <Button className="bg-CPrimary hover:bg-CPrimary/90 text-white px-6 py-3 rounded-full flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Add New Born Litter
                    </Button>
                  </Link>
                  <Link href="/startlistingform?type=future_litter">
                    <Button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Add Future Litter
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href={getAddListingUrl(activeTab)}>
                  <Button className="bg-CPrimary hover:bg-CPrimary/90 text-white px-6 py-3 rounded-full flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Listing
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      );
    }

    // For litters tab, separate current litters and future litters
    if (activeTab === 'litters') {
      const currentLitters = currentListings.filter(listing => listing.type === 'PUPPY_LITTER_LISTING');
      const futureLitters = currentListings.filter(listing => listing.type === 'FUTURE_LISTING');

      return (
        <div className="space-y-8">
          {/* Current Litters */}
          {currentLitters.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">New Born Litters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentLitters.map((listing) => (
                  <ListingCard 
                    key={listing.id} 
                    listing={{ 
                      ...listing, 
                      favourite: false,
                      individualPuppies: listing.fields?.individualPuppies || [],
                      fields: listing.fields || {},
                      userId: listing.userId || listing.user?.id || user?.id
                    }} 
                    currentUserId={currentUser?.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Future Litters */}
          {futureLitters.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Future Litters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {futureLitters.map((listing) => (
                  <ListingCard 
                    key={listing.id} 
                    listing={{ 
                      ...listing, 
                      favourite: false,
                      individualPuppies: listing.fields?.individualPuppies || [],
                      fields: listing.fields || {},
                      userId: listing.userId || listing.user?.id || user?.id
                    }} 
                    currentUserId={currentUser?.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // For other tabs, show all listings normally
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentListings.map((listing) => (
          <ListingCard 
            key={listing.id} 
            listing={{ 
              ...listing, 
              favourite: false,
              individualPuppies: listing.fields?.individualPuppies || [],
              fields: listing.fields || {},
              userId: listing.userId || listing.user?.id || user?.id
            }} 
            currentUserId={currentUser?.id}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Profile Header Section */}
      <section className="container relative overflow-hidden p-8 rounded-40 bg-white border border-black/20 max-md:p-4 max-md:rounded-[20px]">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Avatar */}
          <div className="w-32 h-32 max-md:w-24 max-md:h-24 rounded-full overflow-hidden border-4 border-CSecondary flex-shrink-0">
            {user.imageUrl ? (
              <img 
                src={user.imageUrl} 
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder.jpeg";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl max-md:text-2xl font-bold bg-gray-200">
                {user.name.charAt(0)}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-5xl font-medium max-md:text-3xl">{user.name}</h1>
              {user.isVerified && (
                <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 text-sm font-medium">Verified</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-[22px] text-[#9B9B9B] mb-6 max-md:text-base">
              <MapPin className="w-5 h-5" />
              <span>{user.location || 'Location not specified'}</span>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-black/20">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-lg font-medium border-b-2 transition-colors max-md:text-sm max-md:px-4 max-md:py-2 ${
                    activeTab === tab.id
                      ? 'border-CPrimary text-CPrimary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} {tab.count > 0 && `(${tab.count})`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Listings */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {/* Section Headers */}
              {activeTab === 'puppies' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[40px] font-medium max-md:text-[32px]">Puppies</h2>
                    {isOwnProfile && (
                      <Link href={getAddListingUrl('puppies')}>
                        <Button className="bg-CPrimary hover:bg-CPrimary/90 text-white px-4 py-2 rounded-full flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Puppy
                        </Button>
                      </Link>
                    )}
                  </div>
                  {renderListings()}
                </div>
              )}
              
              {activeTab === 'litters' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[40px] font-medium max-md:text-[32px]">Litters</h2>
                    {isOwnProfile && (
                      <div className="flex gap-3">
                        <Link href="/startlistingform?type=puppy_litter">
                          <Button className="bg-CPrimary hover:bg-CPrimary/90 text-white px-4 py-2 rounded-full flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add New Born Litter
                          </Button>
                        </Link>
                        <Link href="/startlistingform?type=future">
                          <Button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Future Litter
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                  {renderListings()}
                </div>
              )}

              {activeTab === 'stud' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[40px] font-medium max-md:text-[32px]">Stud & Bitch Dogs</h2>
                    {isOwnProfile && (
                      <Link href={getAddListingUrl('stud')}>
                        <Button className="bg-CPrimary hover:bg-CPrimary/90 text-white px-4 py-2 rounded-full flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Stud
                        </Button>
                      </Link>
                    )}
                  </div>
                  {renderListings()}
                </div>
              )}

              {activeTab === 'semen' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[40px] font-medium max-md:text-[32px]">Semen Collection</h2>
                    {isOwnProfile && (
                      <Link href={getAddListingUrl('semen')}>
                        <Button className="bg-CPrimary hover:bg-CPrimary/90 text-white px-4 py-2 rounded-full flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Semen
                        </Button>
                      </Link>
                    )}
                  </div>
                  {renderListings()}
                </div>
              )}

              {activeTab === 'wanted' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[40px] font-medium max-md:text-[32px]">Wanted Listings</h2>
                    {isOwnProfile && (
                      <Link href={getAddListingUrl('wanted')}>
                        <Button className="bg-CPrimary hover:bg-CPrimary/90 text-white px-4 py-2 rounded-full flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Wanted
                        </Button>
                      </Link>
                    )}
                  </div>
                  {renderListings()}
                </div>
              )}

              {activeTab === 'services' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[40px] font-medium max-md:text-[32px]">Additional Services</h2>
                    {isOwnProfile && (
                      <Link href={getAddListingUrl('services')}>
                        <Button className="bg-CPrimary hover:bg-CPrimary/90 text-white px-4 py-2 rounded-full flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Service
                        </Button>
                      </Link>
                    )}
                  </div>
                  {renderListings()}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Business Info */}
          <div className="space-y-6">
            {/* Business Bio & Contact */}
            <div className="bg-white rounded-40 border border-black/20 p-8 max-md:p-4 max-md:rounded-[20px]">
              <h3 className="text-[32px] font-medium mb-6 max-md:text-xl">Business Bio & Contact</h3>
              <div className="space-y-6">
                <p className="text-[21px] text-[#7E7E7E] leading-relaxed max-md:text-sm">
                  {user.bio || 'No Bio available'}
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <User className="w-5 h-5 text-CPrimary" />
                    <span className="text-lg font-medium">{user.name}</span>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center gap-4">
                      <Phone className="w-5 h-5 text-CPrimary" />
                      <span className="text-lg">{user.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <Mail className="w-5 h-5 text-CPrimary" />
                    <span className="text-lg">{user.email}</span>
                  </div>
                  
                  {user.website && (
                    <div className="flex items-center gap-4">
                      <Globe className="w-5 h-5 text-CPrimary" />
                      <span className="text-lg">{user.website}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <Clock className="w-5 h-5 text-CPrimary" />
                    <span className="text-lg">Business Hours: Mon-Sat 9am-5pm</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <MapPin className="w-5 h-5 text-CPrimary" />
                    <span className="text-lg">{user.location || 'Location not specified'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-white rounded-40 border border-black/20 p-8 max-md:p-4 max-md:rounded-[20px]">
              <h3 className="text-[32px] font-medium mb-6 max-md:text-xl">Business Details</h3>
              <div className="space-y-4">
                {user.businessABN && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-medium text-lg">ABN/ACN:</span>
                    <span className="text-lg">{user.businessABN}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 py-2 border-b border-gray-200">
                  <Calendar className="w-5 h-5 text-CPrimary" />
                  <span className="text-lg">Joined Pups4Sale: {formatJoinedDate(user.createdAt)}</span>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-lg">Verified Status:</span>
                  {user.isVerified ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">Verified</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Not verified</span>
                  )}
                </div>
              </div>
            </div>

            {/* Breeder Credentials */}
            {(user.stateRegistration || user.totalLitters) && (
              <div className="bg-white rounded-40 border border-black/20 p-8 max-md:p-4 max-md:rounded-[20px]">
                <h3 className="text-[32px] font-medium mb-6 max-md:text-xl">Breeder Credentials</h3>
                <div className="space-y-4">
                  {user.stateRegistration && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-medium text-lg">State Registration:</span>
                      <span className="text-lg">{user.stateRegistration}</span>
                    </div>
                  )}
                  
                  {user.totalLitters && (
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium text-lg">Total Litters Listed:</span>
                      <span className="text-lg">{user.totalLitters}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="container">
          <div className="bg-white rounded-40 border border-black/20 p-8 max-md:p-4 max-md:rounded-[20px] mt-4">
            <h3 className="text-[32px] font-medium mb-6 max-md:text-xl">About {user?.businessName}</h3>
            <p className="text-[21px] leading-relaxed max-md:text-sm text-gray-700">
              {user.description || 'No Bio available'}
            </p>
          </div>
        </div>
    </div>

      {/* CTA Block - Commented out for now */}
      {/* <CtaBlock /> */}
    </>
  );
}
