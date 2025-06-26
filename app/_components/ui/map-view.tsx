"use client";

import { GoogleMap, useLoadScript } from "@react-google-maps/api";

interface MapTypes {
  mapContainerClassName?: string;
  lat: number;
  lng: number;
}

const options = {
  mapTypeControl: false,
  fullscreenControl: false,
  streetViewControl: false,
};

export default function MapView({ mapContainerClassName, lat, lng }: MapTypes) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&loading=async`,
  });

  if (!isLoaded) {
    return <span>Loading...</span>;
  }

  return (
    <GoogleMap
      mapContainerClassName={mapContainerClassName}
      center={{
        lat,
        lng,
      }}
      zoom={12}
      options={options}
    ></GoogleMap>
  );
}
