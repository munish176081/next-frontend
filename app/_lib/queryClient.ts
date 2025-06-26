import { QueryClient } from "@tanstack/react-query";
import { parseAxiosError } from "@/_utils/parse-axios-error";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // refetchOnWindowFocus: false,
      retry(failureCount, error) {
        const data = parseAxiosError(error);

        // if error code starts with 4 (user error), do not retry
        if (data?.statusCode?.toString().startsWith("4")) {
          return false;
        }

        // max retry 3 times
        if (failureCount > 3) {
          return false;
        }

        return true;
      },
    },
  },
});

export default queryClient;
