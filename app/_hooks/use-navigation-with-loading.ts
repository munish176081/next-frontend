"use client";

import { useRouter } from "next/navigation";
import { useLoading } from "../_components/common/loading-provider";

export function useNavigationWithLoading() {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();

  const push = (href: string) => {
    showLoading();
    router.push(href);
  };

  const replace = (href: string) => {
    showLoading();
    router.replace(href);
  };

  const back = () => {
    showLoading();
    router.back();
  };

  const forward = () => {
    showLoading();
    router.forward();
  };

  const refresh = () => {
    showLoading();
    router.refresh();
  };

  return {
    push,
    replace,
    back,
    forward,
    refresh,
    // Expose original router methods if needed
    router,
  };
} 