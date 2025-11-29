import { Autocomplete, useLoadScript } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";

interface SearchLocationInputProps {
  restrictedToCountry?: string;
  children: React.ReactChild;
  loader?: React.ReactNode;
  onSearchPlace: (place?: google.maps.places.PlaceResult) => void;
}

type l = "places"[];
const libraries: l = ["places"];

export const LocationAutoComplete = ({
  restrictedToCountry = "AU",
  children,
  onSearchPlace,
  loader,
}: SearchLocationInputProps) => {
  const [autocompleteError, setAutocompleteError] = useState(false);
  const { isLoaded, loadError } = useLoadScript({
    // Always rely on env key (same behaviour as `location-field.tsx`)
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries,
  });
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Listen for global Google Maps script errors – keep behaviour in line
  // with `location-field.tsx` so we can gracefully fall back to manual input.
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.toLowerCase().includes("maps") ||
        event.message?.toLowerCase().includes("google") ||
        event.filename?.toLowerCase().includes("maps")
      ) {
        setAutocompleteError(true);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message =
        event.reason?.message ??
        (typeof event.reason === "string" ? event.reason : "");
      if (
        message?.toLowerCase().includes("maps") ||
        message?.toLowerCase().includes("google")
      ) {
        setAutocompleteError(true);
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  // Detect Google Maps error dialogs / missing Places API – mirrors
  // the robustness of `location-field.tsx`.
  useEffect(() => {
    if (!isLoaded || loadError) return;

    const checkForGoogleError = () => {
      try {
        // Detect Google's standard error overlays
        const dialogNodes = document.querySelectorAll('div[style*="z-index"]');
        let hasErrorDialog = false;

        dialogNodes.forEach((node) => {
          const text = node.textContent || "";
          if (
            text.includes("can't load Google Maps") ||
            text.includes("Do you own this website") ||
            text.includes("Google Maps error")
          ) {
            hasErrorDialog = true;
          }
        });

        if (hasErrorDialog) {
          setAutocompleteError(true);
          return;
        }

        // Also verify Places API is actually available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const g: any = window.google;
        if (!g?.maps?.places) {
          setAutocompleteError(true);
        }
      } catch {
        setAutocompleteError(true);
      }
    };

    checkForGoogleError();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          const el = node as Element;
          const text = el.textContent || "";
          if (
            text.includes("can't load Google Maps") ||
            text.includes("Do you own this website")
          ) {
            setAutocompleteError(true);
          }
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const timer = setTimeout(() => {
      checkForGoogleError();
    }, 3000);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [isLoaded, loadError]);

  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();

    onSearchPlace(place);
  };

  const options = restrictedToCountry
    ? {
      componentRestrictions: { country: restrictedToCountry },
      // Match `location-field.tsx` (region-style results – suburbs / postcodes)
      types: ["(regions)"],
      bounds: {
        north: -10.0, // Northern Australia
        south: -44.0, // Southern Australia
        east: 154.0, // Eastern Australia
        west: 113.0, // Western Australia
      },
    }
    : undefined;

  return (
    <div className="w-full flex-1">
      {/* Loading state – show skeleton / loader while script loads */}
      {!isLoaded && !loadError && !autocompleteError && loader}

      {/* Hard error or script issues – render children without Autocomplete
          so the field still works as a plain text input, same philosophy as
          the manual fallback in `location-field.tsx`. */}
      {(loadError || autocompleteError) && <>{children}</>}

      {/* Normal autocomplete behaviour when script is healthy */}
      {isLoaded && !loadError && !autocompleteError && (
        <Autocomplete
          onLoad={(autocomplete) => {
            try {
              autocompleteRef.current = autocomplete;
              setAutocompleteError(false);
            } catch {
              setAutocompleteError(true);
            }
          }}
          onPlaceChanged={onPlaceChanged}
          options={options}
        >
          {children}
        </Autocomplete>
      )}
    </div>
  );
};
