import { Header } from "@/_components/header";
import AccountSideBar from "./_components/side-bar";
import { RequireUser } from "@/_components/common/require-user";

export default function AccountLayout({ children }: React.PropsWithChildren) {
  return (
    <RequireUser>
      <Header />
      <main className="pt-5 md:pt-24 4xl:pt-28 flex-grow flex h-[calc(100vh-64px)] sm:h-screen">
        <AccountSideBar />
        <div className="flex-grow px-10">{children}</div>
      </main>
    </RequireUser>
  );
}
