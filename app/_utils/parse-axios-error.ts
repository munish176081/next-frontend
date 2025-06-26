import { isAxiosError } from "axios";

interface ErrorType {
  message: string;
  statusCode: number;
}

export const parseAxiosError = <T = ErrorType>(error: unknown) => {
  if (isAxiosError(error)) return error.response?.data as T;
};
