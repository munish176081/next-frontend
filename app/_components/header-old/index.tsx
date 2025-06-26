"use client";

import Link from "next/link";
import { LogoIcon } from "@/_components/icons";
import { Button } from "../ui/button";
import clsx from "clsx";
import { Routes } from "@/_config/routes";
import ProfileMenu from "./profile-menu";
import { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { HeaderWrapper } from "./wrapper";
import { useUser } from "@/_services/hooks/user/use-user";

export interface HeaderProps {
  className?: string;
  logoClassName?: string;
  scrollingClass?: string;
  variant?: "light" | "dark";
}

const menuItems = [
  {
    id: 1,
    label: "Home",
    path: Routes.public.home,
  },
  {
    id: 2,
    label: "Explore",
    path: Routes.public.explore,
  },
  {
    id: 3,
    label: "Create Listings",
    path: "",
    dropdownItems: [
      {
        id: 1,
        label: "Puppy Listings",
        path: Routes.public.createListing.puppyListing,
      },
      {
        id: 2,
        label: "Semen Listings",
        path: Routes.public.createListing.semenListing,
      },
      {
        id: 3,
        label: "Stud or bitch Listings",
        path: Routes.public.createListing.studListing,
      },
      {
        id: 4,
        label: "Future Listings",
        path: Routes.public.createListing.futureListing,
      },
      {
        id: 5,
        label: "Wanted Pupply Listings",
        path: Routes.public.createListing.wantedPuppyListing,
      },
      {
        id: 6,
        label: "Other Services Listings",
        path: Routes.public.createListing.otherServicesListing,
      },
    ],
  },
];

export function Header(props: HeaderProps) {
  const { variant, logoClassName } = props;
  const { data: user } = useUser();

  return (
    <HeaderWrapper {...props}>
      <>
        <Link
          href={Routes.public.home}
          className={clsx(
            "text-black max-w-[150px] sm:max-w-[200px]",
            logoClassName
          )}
        >
          <LogoIcon width="100%" height="100%" />
        </Link>

        <ul className="hidden flex-wrap md:flex">
          {menuItems.map((item) => (
            <Fragment key={item.id}>
              {item.dropdownItems ? (
                <li key={item.id} className="group/parent relative">
                  <a
                    href="#"
                    className={clsx(
                      "px-5 flex items-center transition",
                      variant === "light" ? "text-white" : "text-black"
                    )}
                  >
                    {item.label}
                    <span className="z-[1] transition-transform duration-200 ms-1">
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </a>
                  <ul className="absolute invisible mt-2 py-2 w-64 rounded-md bg-white opacity-0 transition-all group-hover/parent:visible group-hover/parent:top-full group-hover/parent:opacity-100 end-5 shadow-card focus:outline-none">
                    {item.dropdownItems.map((dropdownItem) => {
                      return (
                        <li key={dropdownItem.id}>
                          <Link
                            href={dropdownItem.path as string}
                            className="block rounded-sm px-5 py-2 font-normal capitalize text-gray-dark hover:bg-gray-lightest"
                          >
                            {dropdownItem.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ) : (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    className={clsx(
                      "px-5 capitalize transition",
                      variant === "light" ? "text-white" : "text-black"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )}
            </Fragment>
          ))}
        </ul>

        {user ? (
          <ProfileMenu user={user} />
        ) : (
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              className={clsx(
                variant === "light" ? "text-white" : "text-black"
              )}
              asChild
            >
              <Link href={Routes.auth.signIn}> Sign in</Link>
            </Button>
            <Button asChild>
              <Link href={Routes.auth.signUp}>Register</Link>
            </Button>
          </div>
        )}
      </>
    </HeaderWrapper>
  );
}
