"use client";

import clsx from "clsx";
import Link from "next/link";
import { Fragment } from "react";
import {
  Menu,
  MenuButton,
  MenuItem as HeadlessMenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { Avatar } from "@/_components/ui";
import { Routes } from "@/_config/routes";
import { UserType } from "@/_types/user";
import { useLogout } from "@/_services/hooks/auth/use-logout";

interface MenuItemProps {
  text: string;
  link?: string;
}

// Menu items for super admin
const superAdminMenu = {
  top: [
    {
      path: Routes.admin.dashboard,
      text: "Admin Dashboard",
    },
    {
      path: Routes.admin.users,
      text: "User Management",
    },
    {
      path: Routes.private.account,
      text: "My Account",
    },
  ],
  bottom: [
    {
      path: Routes.admin.settings,
      text: "System Settings",
    },
    {
      path: Routes.admin.passwords,
      text: "Password Management",
    },
    {
      path: Routes.private.profile,
      text: "Account Settings",
    },
    {
      path: Routes.public.contact,
      text: "Help",
    },
  ],
};

// Menu items for normal users
const normalUserMenu = {
  top: [
    {
      path: Routes.private.account,
      text: "Dashboard",
    },
    {
      path: Routes.private.listings,
      text: "My Listings",
    },
    {
      path: Routes.private.inbox,
      text: "Inbox",
    },
  ],
  bottom: [
    {
      path: Routes.private.profile,
      text: "Profile",
    },
    // {
    //   path: Routes.private.accountSettings || Routes.private.profile,
    //   text: "Settings",
    // },
    // {
    //   path: Routes.public.contact,
    //   text: "Help",
    // },
  ],
};

function MenuItem({ text, link }: MenuItemProps) {
  return (
    <HeadlessMenuItem>
      {({ focus }) => (
        <Link
          href={`${link}`}
          className={clsx(
            "block rounded-sm px-5 py-2 text-base font-normal capitalize text-gray-dark",
            focus && "bg-gray-lightest"
          )}
        >
          {text}
        </Link>
      )}
    </HeadlessMenuItem>
  );
}

export default function ProfileMenu({
  user,
  className,
}: {
  user: UserType;
  className?: string;
}) {
  const { mutate: logout } = useLogout();

  // Determine if user is super admin
  const isSuperAdmin = user.role === 'super_admin' || user.isSuperAdmin === true;
  
  // Select menu based on user role
  const menu = isSuperAdmin ? superAdminMenu : normalUserMenu;
  
  // Debug: Log user role (remove in production if needed)
  if (typeof window !== 'undefined') {
    console.log('User role:', user.role, 'isSuperAdmin:', user.isSuperAdmin, 'Menu:', isSuperAdmin ? 'superAdmin' : 'normalUser');
  }

  return (
    <Menu
      as="div"
      className={clsx(
        "relative h-16 w-16 rounded-full bg-white sm:h-14 sm:w-14",
        className
      )}
    >
      <MenuButton className="relative rounded-full bg-white h-16 w-16 border-4 border-CSecondary">
        <Avatar
          className="cursor-pointer !text-3xl "
          name={user.username}
          src={user.imageUrl}
          rounded="full"
          textSizeRatio={3}
          size="100%"
        />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-lighter rounded-md bg-white py-2 shadow-card focus:outline-none z-50">
          <div className="pb-1">
            {menu.top.map((item) => (
              <MenuItem key={item.text} text={item.text} link={item.path} />
            ))}
          </div>
          <div className="pt-1">
            {menu.bottom.map((item) => (
              <MenuItem key={item.text} text={item.text} link={item.path} />
            ))}
            <HeadlessMenuItem
              className="block w-full rounded-sm px-5 py-2 text-left text-base font-normal text-gray-dark hover:bg-gray-lightest"
              as="button"
              onClick={() => {
                logout();
              }}
            >
              Log out
            </HeadlessMenuItem>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}