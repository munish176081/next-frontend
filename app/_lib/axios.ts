import { API_BASE_URL } from "@/_config/constants";
import _axios from "axios";

export const axios = _axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
