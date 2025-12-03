"use client";

import { useUser } from "@/_services/hooks/user/use-user";
import { getSidebarConfig } from "@/_config/sidebar-config";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { VerificationGuard } from "./verification-guard";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { LoadingLink } from "./loading-link";
import { Routes } from "@/_config/routes";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  showTimeFilter?: boolean;
}

export const DashboardLayout = ({
  children,
  title = "Overview",
  showTimeFilter = true
}: DashboardLayoutProps) => {
  const { data: user } = useUser();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const userRole = user?.role || 'user';
  const sidebarConfig = getSidebarConfig(userRole);
  const sidebarItems = sidebarConfig.items;

  // Map sidebar items to menu icons
  const getMenuIcon = (href: string) => {
    switch (href) {
      case '/dashboard':
      case '/admin':
      case '/account':
        return '/images/vectors/menu1.png';
      case '/account/inbox':
      case '/admin/users':
        return '/images/vectors/menu2.png';
      case '/account/meetings':
      case '/admin/passwords':
        return '/images/vectors/menu3.png';
      case '/account/listings':
      case '/admin/settings':
        return '/images/vectors/menu4.png';
      case '/account/favorites':
      case '/admin/analytics':
        return '/images/vectors/menu1.png';
      case '/account/subscriptions':
      case '/admin/logs':
        return '/images/vectors/menu2.png';
      case '/account/profile':
        return '/images/vectors/profile-pic.png';
      case '/admin/alerts':
        return '/images/vectors/menu3.png';
      default:
        return '/images/vectors/menu1.png';
    }
  };

  return (
    <VerificationGuard>
      <div className="min-h-screen">
        <div className="flex flex-col gap-8 max-md:gap-4">
          {/* Header Section */}
          <section className="flex container gap-4 items-center">
            <span className="text-5xl font-semibold max-md:text-2xl">
              Hello, <span className="text-[#797777]">{user?.name || 'User'}</span>
            </span>
            {/* User Dashboard */}
            {userRole === 'user' && (
              <div className="ml-auto flex gap-4 items-center max-md:justify-center">
                <Link href={Routes.private.startlisting}>
                  <button className="inline-flex items-center gap-2 text-lg max-md:text-xs font-medium outline-none px-8 h-[70px] rounded-full border-none max-md:w-36 max-md:h-12 bg-CPrimary text-white w-48 hover:bg-CPrimary/90 transition-colors duration-200 shadow-lg hover:shadow-xl whitespace-nowrap">
                    <Plus className="w-5 h-5 max-md:w-4 max-md:h-4" />
                    Add Listing
                  </button>
                </Link>
                <span className="hidden h-[70px] w-[70px] min-w-[70px] max-md:h-12 max-md:w-12 max-md:min-w-12 bg-white rounded-full items-center justify-center flex cursor-pointer relative max-md:hidden">
                  <img className="w-8 max-md:w-5 invert" src="/images/vectors/search.svg" />
                </span>
                <span className="hidden h-[70px] w-[70px] min-w-[70px] max-md:h-12 max-md:w-12 max-md:min-w-12 bg-white rounded-full items-center justify-center flex cursor-pointer relative">
                  <span className="w-6 h-6 max-md:w-3 max-md:h-3 absolute rounded-full bg-CPrimary right-0 top-0"></span>
                  <img className="w-8 max-md:w-5" src="/images/vectors/notification.svg" />
                </span>
              </div>
            )}

          </section>

          {/* Main Dashboard Section */}
          <section className="container relative flex gap-4 items-start">
            {/* Sidebar Navigation */}
            <div className={`${isSidebarCollapsed ? 'w-24' : 'w-max'} min-w-max rounded-40 bg-white flex flex-col gap-4 p-4 max-md:fixed max-md:flex-row max-md:shadow-section max-md:bottom-4 max-md:left-4 max-md:w-[calc(100%-32px)] z-20 max-md:rounded-full max-md:justify-between relative max-md:min-w-[auto] max-md:overflow-x-auto`}>
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10 border border-gray-200 max-md:hidden"
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {sidebarItems.map((item, index) => {
                const isActive = pathname === item.href ||
                  (item.href === '/dashboard' && pathname === '/dashboard') ||
                  (item.href === '/admin' && pathname === '/admin') ||
                  (item.href === '/account' && pathname === '/account');

                return (
                  <LoadingLink
                    key={index}
                    href={item.href}
                    className={`flex items-center text-[22px] font-semibold gap-4 transition-all duration-200 ${isActive ? 'text-black' : 'text-gray-600 hover:text-black'}`}
                    title={isSidebarCollapsed ? item.name : undefined}
                  >
                    <span className={`w-16 h-16 flex items-center justify-center rounded-full transition-all duration-200 ${isActive ? 'bg-[#FFD9E8]' : 'hover:bg-gray-100'}`}>
                      <img src={getMenuIcon(item.href)} alt={item.name} />
                    </span>
                    {!isSidebarCollapsed && (
                      <span className="max-md:hidden pr-4">{item.name}</span>
                    )}
                  </LoadingLink>
                );
              })}
            </div>

            {/* Main Content Area */}
            <div className={`${isSidebarCollapsed ? 'w-[calc(100%-6rem)]' : 'w-full'} p-4 rounded-40 bg-white overflow-y-auto flex flex-col max-md:overflow-visible max-md:rounded-[20px]`}>
              <div className="flex items-center justify-between pb-4">
                {/* <span className="text-[32px] font-semibold max-md:text-lg">
                  {title}
                </span> */}
                {showTimeFilter && (
                  <select className="hidden text-lg max-md:text-xs placeholder:text-[#4B4A4A8C] font-normal outline-none px-4 h-14 rounded-full border-[#CBCACA] border-[1px] w-40 max-md:h-12 appearance-none bg-selectArrow2 bg-no-repeat bg-[90%] font-medium max-md:w-[120px] max-md:h-[34px] max-md:px-2 bg-white">
                    <option>Last Week</option>
                    <option>Last Month</option>
                  </select>
                )}

              {userRole !== 'super_admin' && (
                <a
                  href={`/user/${user?.username || ''}`}
                  className="bg-[#EFC951] hover:bg-[#E6B847] text-black px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </a>
              )}
              </div>

              {/* Dashboard Content */}
              <div className="flex-1">
                {children}
              </div>
            </div>
          </section>
        </div>
      </div>
    </VerificationGuard>
  );
};