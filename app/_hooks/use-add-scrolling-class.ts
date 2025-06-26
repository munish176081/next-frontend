import { useEffect, useRef } from "react";

export function useAddScrollingClass<T extends HTMLElement = HTMLElement>({
  topOffset = 80,
  scrollingClass = "is-scrolling",
}: {
  topOffset?: number;
  scrollingClass?: string;
}) {
  const el = useRef<T | null>(null);

  useEffect(() => {
    const listener = () => {
      if (window.scrollY > topOffset) {
        el.current?.classList.add(...scrollingClass.split(" "));
      } else {
        el.current?.classList.remove(...scrollingClass.split(" "));
      }
    };
    listener();
    document.addEventListener("scroll", listener);
    return () => {
      document.removeEventListener("scroll", listener);
    };
  }, [el.current?.classList, scrollingClass, topOffset]);

  return { el };
}
