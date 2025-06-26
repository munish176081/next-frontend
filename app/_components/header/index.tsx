"use client";

import { LogoIcon } from "@/_components/icons";
import { Routes } from "@/_config/routes";
import { useLogout } from "@/_services/hooks/auth/use-logout";
import { useUser } from "@/_services/hooks/user/use-user";
import { Disclosure } from "@headlessui/react";
import clsx from "clsx";
import { ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState } from "react";
import { MenuIcon } from "../icons/menu";
import { Button } from "../ui/button";
import ProfileMenu from "./profile-menu";
import { HeaderWrapper } from "./wrapper";

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
    label: "Add Listings",
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
  {
    id: 4,
    label: "Blogs",
    path: Routes.public.blog,
  },
  {
    id: 5,
    label: "Contact us",
    path: Routes.public.contact,
  },
];

export function Header(props: HeaderProps) {
  const { logoClassName } = props;
  const { data: user, isPending, isError } = useUser();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mutate: logout } = useLogout();

  const isActive = (path: string) => pathname === path;

  // Don't render user-specific content while loading
  const showUserContent = !isPending && !isError && user;

  return (
    <HeaderWrapper {...props}>
      <>
        <div className="flex items-center justify-between w-full">
          <div className="flex justify-start">
            <Link
              href={Routes.public.home}
              className={clsx(
                "text-black h-[48px] w-[150px] md:w-[181px] lg:w-[181px] md:h-[58px] lg:h-[58px]",
                logoClassName
              )}
            >
              <LogoIcon width="100%" height="100%" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-3">
            {menuItems.map((item) => (
              <Fragment key={item.id}>
                {item.dropdownItems ? (
                  <li className="relative group/parent">
                    <button className="flex items-center px-4 py-2 rounded-full transition hover:bg-indigo-lighter">
                      {item.label}
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </button>
                    <ul className="absolute top-full border-4 border-CPrimary mt-2 w-64 rounded-3xl bg-white opacity-0 invisible group-hover/parent:visible group-hover/parent:opacity-100 shadow-section z-10 transition-all max-h-56 flex flex-col overflow-hidden">
                      <div className="h-full w-full flex flex-col overflow-y-auto !p-4">
                        {item.dropdownItems.map((dropdownItem) => (
                          <li key={dropdownItem.id} className="border-b border-black/20">
                            <Link
                              href={dropdownItem.path as string}
                              className="block px-2 py-2 text-gray-dark hover:bg-indigo-lighter transition"
                            >
                              {dropdownItem.label}
                            </Link>
                          </li>
                        ))}
                      </div>
                    </ul>
                  </li>
                ) : (
                  <li>
                    <Link
                      href={item.path}
                      className={clsx(
                        "px-4 py-2 rounded-full transition capitalize hover:bg-indigo-lighter",
                        isActive(item.path)
                          ? "bg-indigo-lighter text-black"
                          : "hover:bg-gray-100"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                )}
              </Fragment>
            ))}
          </ul>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-4">
            <div className="lg:hidden flex items-center">
              <button
                className="p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <MenuIcon height="30" width="30" />
                )}
              </button>
            </div>

            {/* Desktop Auth/Profile */}
            <div className="hidden lg:flex items-center gap-4">
              {showUserContent ? (
                <ProfileMenu user={user} />
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    className="rounded-full border-black text-black hover:bg-gray-100 px-6"
                    asChild
                  >
                    <Link href={Routes.auth.signIn}>Log In</Link>
                  </Button>
                  <Button
                    className="rounded-full bg-black text-white hover:bg-gray-900 px-6"
                    asChild
                  >
                    <Link href={Routes.auth.signUp}>Register</Link>
                  </Button>
                </div>
              )}
            </div>
            {/* <span className="h-14 w-14 border-4 border-CSecondary flex flex-col rounded-full overflow-hidden"><img className="w-full h-full object-cover" src="/images/vectors/profile.jpg" alt="" /></span> */}
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-full max-w-xs bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <Link
                href={Routes.public.home}
                className="text-black"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LogoIcon width="120px" height="40px" />
              </Link>
            </div>

            <nav className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    {item.dropdownItems ? (
                      <Disclosure>
                        {({ open }) => (
                          <>
                            <Disclosure.Button className="w-full flex justify-between items-center px-4 py-2 rounded-lg hover:bg-gray-100">
                              <span>{item.label}</span>
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  open ? "rotate-180" : ""
                                }`}
                              />
                            </Disclosure.Button>
                            <Disclosure.Panel className="pl-4">
                              {item.dropdownItems.map((subItem) => (
                                <Link
                                  key={subItem.id}
                                  href={subItem.path}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                  {subItem.label}
                                </Link>
                              ))}
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    ) : (
                      <Link
                        href={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-2 rounded-lg hover:bg-gray-100"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-t border-gray-200 pt-4">
                {showUserContent ? (
                  <>
                    <Link
                      href={Routes.private.account}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg hover:bg-gray-100 font-medium"
                    >
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 font-medium text-red-600"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href={Routes.auth.signIn}>Log In</Link>
                    </Button>
                    <Button
                      className="w-full"
                      asChild
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href={Routes.auth.signUp}>Register</Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </>
    </HeaderWrapper>
  );
}
