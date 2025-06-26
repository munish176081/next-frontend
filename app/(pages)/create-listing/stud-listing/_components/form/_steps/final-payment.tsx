import { useMultiStepFormContext } from "@/(pages)/create-listing/_context/multi-step-form-context";
import { Button, Divider, FormStepper } from "@/_components/ui";
import { Heading, Text } from "@/_components/ui/typegraphy";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select";
import { RequireUser } from "@/_components/common/require-user";
import { Routes } from "@/_config/routes";
import { useCreateListing } from "@/_services/hooks/listings";
import { parseAxiosError } from "@/_utils/parse-axios-error";
import { toast } from "@/_hooks/use-toast";
import { useCheckoutListing } from "@/_services/hooks/listings/use-checkout-listing";
import { useRouter } from "next/navigation";
import { useListingProducts } from "@/_services/hooks/listings/use-listing-products";
import { useState } from "react";
import { useListingAds } from "@/_services/hooks/listings/use-listing-ads";
import { PAYMENT_CURRENCY } from "@/_config/constants";
import { ListingCheckoutType } from "@/_types/listing";

const encodeAdId = (adIdx: number, productIdx: number) =>
  `${adIdx}@${productIdx}`;

const decodeAdId = (encodedAdId: string) => {
  const [adIdx, productIdx] = encodedAdId.split("@");
  return { adIdx: Number(adIdx), productIdx: Number(productIdx) };
};

const FinalPayment = () => {
  const {
    stepIdx,
    totalSteps,
    getFormData,
    goToPreviousStep,
    appendFormData,
    replaceFormData,
  } = useMultiStepFormContext();
  const { data, isLoading: isLoadingProducts } =
    useListingProducts("stud_bitch");
  const listingProducts = data?.products ?? [];

  const { data: adsData = [] } = useListingAds("stud_bitch");

  const { mutateAsync: createListing, isPending } = useCreateListing();
  const { mutateAsync: checkoutListing, isPending: isPendingCheckout } =
    useCheckoutListing();
  const router = useRouter();

  const [selectedProductIdx, setSelectedProductIdx] = useState(0);
  const [selectedAdId, setSelectedAdId] = useState<string | undefined>(
    undefined
  );

  const selectedProduct = listingProducts[selectedProductIdx];
  const selectedAdIndexes = selectedAdId ? decodeAdId(selectedAdId) : undefined;

  const selectedAd = selectedAdIndexes
    ? adsData[selectedAdIndexes.adIdx]
    : undefined;

  const selectedAdProduct = selectedAdIndexes
    ? selectedAd?.products?.[selectedAdIndexes.productIdx]
    : undefined;

  const totalPrice =
    (selectedProduct?.price ?? 0) +
    (selectedAdProduct ? selectedAdProduct.price : 0);

  const onCheckoutListing = async (checkoutData: ListingCheckoutType) => {
    try {
      const { checkoutUrl } = await checkoutListing(checkoutData);

      replaceFormData({});

      router.push(checkoutUrl);
    } catch (error) {
      console.error(error);
      const err = parseAxiosError(error);

      toast({
        title: "Failed to create checkout link",
        description: err?.message ?? "Something went wrong",
      });
    }
  };

  const onCreateListing = async () => {
    if (!selectedProduct) {
      toast({
        title: "Failed!",
        description: "Please select a listing duration",
      });

      return;
    }

    if (
      selectedAd &&
      selectedAdProduct &&
      selectedProduct.durationInDays < selectedAdProduct.durationInDays
    ) {
      toast({
        title: "Failed!",
        description: "Ad duration is greater than listing duration",
      });

      return;
    }

    const formData = getFormData();

    if (formData.listingId) {
      onCheckoutListing({
        listingId: formData.listingId as string,
        durationInDays: selectedProduct.durationInDays,
        adId: selectedAd?.id,
        adDurationInDays: selectedAdProduct?.durationInDays,
      });
      return;
    }

    try {
      const data = await createListing({
        type: "stud_bitch",
        fields: formData,
      });

      appendFormData({ listingId: data.id });

      await onCheckoutListing({
        listingId: data.id,
        durationInDays: selectedProduct.durationInDays,
        adId: selectedAd?.id,
        adDurationInDays: selectedAdProduct?.durationInDays,
      });
    } catch (error) {
      console.error(error);

      const err = parseAxiosError(error);

      toast({
        title: "Failed!",
        description: err?.message ?? "Something went wrong",
      });
    }
  };

  return (
    <div className="mt-6 pb-40">
      <RequireUser
        className="max-w-full"
        successRedirect={`${Routes.public.createListing.studListing}?step=${
          stepIdx + 1
        }`}
      >
        <>
          <label className="text-h5">
            <span className="mb-2 block font-bold">Listing Duration</span>

            {isLoadingProducts ? (
              "Loading..."
            ) : (
              <Select
                disabled={listingProducts.length <= 1}
                onValueChange={(value) => {
                  setSelectedProductIdx(Number(value));
                }}
                value={selectedProductIdx.toString()}
              >
                <SelectTrigger
                  disabled={listingProducts.length <= 1}
                  className="mb-4 h-auto [&>span]:block [&_.select-box]:border-none text-start disabled:!opacity-100"
                >
                  <SelectValue placeholder="Select stud / bitch listing" />
                </SelectTrigger>
                <SelectContent>
                  {listingProducts.map((product, idx) => (
                    <SelectItem
                      className="w-full flex-1 [&_span[id^='radix-']]:block [&_span[id^='radix-']]:w-full"
                      key={idx.toString()}
                      value={idx.toString()}
                    >
                      <div className="select-box border rounded-md p-2 w-full flex-1">
                        <Heading tag="h3">{product.title}</Heading>
                        <Text className="mt-3">
                          Duration{" "}
                          <span className="text-gray-light font-bold">
                            {product.durationInDays}
                          </span>{" "}
                          days
                        </Text>
                        <Text className="mt-3">
                          Price{" "}
                          <span className="font-bold">{product.price}</span>{" "}
                          {PAYMENT_CURRENCY}{" "}
                        </Text>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </label>

          {adsData.length > 0 && (
            <label className="text-h5">
              <span className="mb-2 block font-bold">Select Ad</span>

              <Select
                key={selectedAdId}
                onValueChange={(value) => {
                  setSelectedAdId(value);
                }}
                value={selectedAdId}
              >
                <SelectTrigger className="mb-4 h-auto [&>span]:block [&_.select-box]:border-none text-start disabled:!opacity-100">
                  <SelectValue placeholder="Select ad" />
                </SelectTrigger>
                <SelectContent>
                  {selectedAdId && (
                    <Button
                      className="w-full p-4"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAdId(undefined);
                      }}
                    >
                      Clear
                    </Button>
                  )}

                  {adsData.map((ad, adIdx) =>
                    ad.products.map((product, productIdx) => (
                      <SelectItem
                        className="w-full flex-1 [&_span[id^='radix-']]:block [&_span[id^='radix-']]:w-full"
                        key={encodeAdId(adIdx, productIdx)}
                        value={encodeAdId(adIdx, productIdx)}
                      >
                        <div className="select-box border rounded-md p-2 w-full flex-1">
                          <Heading tag="h3">{ad.title}</Heading>
                          <Text>{product.description}</Text>
                          <Text className="mt-3">
                            Duration{" "}
                            <span className="text-gray-light font-bold">
                              {product.durationInDays}
                            </span>{" "}
                            days
                          </Text>
                          <Text className="mt-3">
                            Price{" "}
                            <span className="font-bold">{product.price}</span>{" "}
                            {PAYMENT_CURRENCY}
                          </Text>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </label>
          )}

          <div className="mt-4 flex justify-between items-center">
            <Text>Listing ({selectedProduct?.durationInDays} days)</Text>
            <Text>
              <span className="text-h4 font-bold">
                {PAYMENT_CURRENCY} {selectedProduct?.price}
              </span>
            </Text>
          </div>

          {selectedAd && selectedAdProduct && (
            <div className="mt-2 flex justify-between items-center">
              <div>
                <Text>
                  Ad {selectedAd?.title} ({selectedAdProduct.durationInDays}{" "}
                  days)
                </Text>
                <Text className="text-sm">{selectedAdProduct.description}</Text>
              </div>

              <Text>
                <span className="text-h4 font-bold">
                  {PAYMENT_CURRENCY} {selectedAdProduct.price}
                </span>
              </Text>
            </div>
          )}

          <Divider className="mb-2 mt-4" />
          <div className="flex justify-between items-center">
            <Text>Total</Text>
            <Text>
              <span className="text-h3 font-bold">
                {PAYMENT_CURRENCY} {totalPrice}
              </span>
            </Text>
          </div>

          <Divider className="mt-2 mb-4" />

          <Button
            disabled={isPending || isPendingCheckout}
            isLoading={isPending || isPendingCheckout}
            onClick={onCreateListing}
          >
            {isPending ? "Loading..." : "Checkout"}
          </Button>
        </>
      </RequireUser>

      <FormStepper
        currentStepIdx={stepIdx}
        totalSteps={totalSteps}
        goToPreviousStep={goToPreviousStep}
      />
    </div>
  );
};

export default FinalPayment;
