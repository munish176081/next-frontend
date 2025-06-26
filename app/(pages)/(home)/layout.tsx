import { Footer } from "@/_components/common/footer";
import { Header } from "@/_components/header";

export default function HomeLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="bg-gray-main pb-6">
      <Header logoClassName="text-black sm:text-white" variant="light" />
      <main className="flex flex-col px-6 max-md:px-4 max-md:overflow-x-hidden mb-8 max-md:mb-0">{children}</main>
      <Footer />
    </div>
  );
}
