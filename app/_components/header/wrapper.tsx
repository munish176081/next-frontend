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
        // "fixed top-0 left-0 right-0 z-40",
        "flex w-full justify-between px-4 sm:px-6 2xl:px-7 3xl:px-8 4xl:px-16",
        "items-center rounded-b-[40px] bg-white text-black",
        "h-[90px] border-b border-b-gray-lighter navbar",
        props.variant === "light"
          ? "bg-transparent border-none shadow-none"
          : "bg-white",
        props.className
      )}
    >
      <div className="container">{children}</div>
    </header>
  );
};