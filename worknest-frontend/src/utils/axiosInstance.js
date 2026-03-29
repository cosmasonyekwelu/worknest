import axios from "axios";

export const CSRF_HEADER_NAME = "X-Worknest-Csrf";
export const CSRF_HEADER_VALUE = "1";

export const buildCsrfHeaders = () => ({
  [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE,
  "X-Requested-With": "XMLHttpRequest",
});

export const resolveApiBaseUrl = ({
  rawBaseUrl = import.meta.env.VITE_WORKNEST_BASE_URL,
  mode = import.meta.env.MODE,
} = {}) => {
  const envBaseUrl = rawBaseUrl?.trim();
  const fallbackBaseUrl = mode === "test" ? "http://localhost:5000" : "";
  const effectiveBaseUrl = envBaseUrl || fallbackBaseUrl;

  if (!effectiveBaseUrl) {
    throw new Error("Missing VITE_WORKNEST_BASE_URL in environment variables");
  }

  try {
    return new URL(effectiveBaseUrl).toString().replace(/\/+$/, "");
  } catch {
    throw new Error("Invalid VITE_WORKNEST_BASE_URL. Expected a valid absolute URL.");
  }
};

const BASEURL = resolveApiBaseUrl();
const TIMEOUTMSG = "Waiting for too long...Aborted!";
const timeout = 30000;

axios.defaults.withCredentials = true;

const config = {
  baseURL: BASEURL + "/api/v1",
  timeoutErrorMessage: TIMEOUTMSG,
  timeout,
  withCredentials: true, //to allow cookies to be received on the client
};

const axiosInstance = axios.create(config);
export const refreshClient = axios.create(config);

export default axiosInstance;
