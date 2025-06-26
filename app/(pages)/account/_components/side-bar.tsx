"use client";

import { Routes } from "@/_config/routes";
import { cn } from "@/_lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const accountSidebarItems = [
  {
    id: 1,
    label: "Profile",
    path: Routes.private.profile,
  },
  {
    id: 2,
    label: "Listings",
    path: Routes.private.listings,
  },
  {
    id: 3,
    label: "Meetings",
    path: Routes.private.meetings,
  },
  {
    id: 4,
    label: "Inbox",
    path: Routes.private.inbox,
  },
];

const AccountSideBar = () => {
  const pathname = usePathname();

  return (
    <aside className="max-w-[200px] w-full bg-orane-400 space-y-1">
      {accountSidebarItems.map((item) => (
        <Link
          key={item.id}
          className={cn(
            "block px-4 py-3 rounded-r-xl",
            pathname.startsWith(item.path)
              ? "bg-gray-lighter font-bold"
              : "hover:bg-gray-lighter hover:font-bold"
          )}
          href={item.path}
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
};

export default AccountSideBar;
