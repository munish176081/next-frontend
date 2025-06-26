import { Header } from "@/_components/header";

export default async function HomeLayout({
  children,
}: React.PropsWithChildren) {
  return (
    <>
      {/* <Header className="!relative" /> */}
      <main className="flex-grow bg-[#F3F3F3]">{children}</main>
    </>
  );
}
