import { PuppyListingForm } from "./_components/form";

const PuppyListing = () => {
  return (
    <section className="pt-16 md:pt-20 4xl:pt-24">
      <div className="flex justify-center mt-24 lg:mt-40 h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] 4xl:h-[calc(100vh-96px)]">
        <PuppyListingForm />
      </div>
    </section>
  );
};

export default PuppyListing;
