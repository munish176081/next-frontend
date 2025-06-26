import { API_BASE_URL } from "@/_config/constants";
import { cookies } from "next/headers";

const customServerFetch = async ({
  fullUrl,
  url,
  options,
}: {
  fullUrl?: string | URL | globalThis.Request;
  url?: string | URL | globalThis.Request;
  options?: RequestInit;
}) => {
  if (!fullUrl && !url) throw new Error("No URL provided");

  const res = await fetch(fullUrl || `${API_BASE_URL}${url}`, {
    headers: {
      // TODO: find better way of handling cookies
      Cookie: `token=${cookies().get("token")?.value}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
    ...options,
  });

  return res;
};

export { customServerFetch as fetch };
