"use client";

import clsx from "clsx";
import { useAddScrollingClass } from "@/_hooks";
import { HeaderProps } from ".";

interface HeaderWrapperProps extends HeaderProps {
  children: React.ReactNode;
}

export const HeaderWrapper = ({
  children,
  scrollingClass,
  ...props
}: HeaderWrapperProps) => {
  const { el } = useAddScrollingClass({
    scrollingClass: scrollingClass ?? "header-slide-active",
  });

  return (
    <header
      ref={el}
      className={clsx(
        "relative sm:fixed left-0 top-0 z-[100] transition-all flex w-full justify-between px-4 sm:px-6 2xl:px-7 3xl:px-8 4xl:px-16 items-center h-16 md:h-20 4xl:h-24",
        props.variant === "light"
          ? "bg-transparent"
          : "bg-white border-b border-b-gray-lighter",
        props.className
      )}
    >
      {children}
    </header>
  );
};
