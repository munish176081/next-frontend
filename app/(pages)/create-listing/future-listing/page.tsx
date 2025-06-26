import { FutureListingForm } from "./_components/form";

const FutureListing = () => {
  return (
    <section className="pt-16 md:pt-20 4xl:pt-24">
      <div className="flex justify-center mt-10 lg:mt-14 h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] 4xl:h-[calc(100vh-96px)]">
        <FutureListingForm />
      </div>
    </section>
  );
};

export default FutureListing;
