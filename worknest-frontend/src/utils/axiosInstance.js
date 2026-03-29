import axios from "axios";

const envBaseUrl = import.meta.env.VITE_WORKNEST_BASE_URL?.trim();
if (!envBaseUrl) {
  throw new Error("Missing VITE_WORKNEST_BASE_URL in environment variables");
}

let parsedBaseUrl;
try {
  parsedBaseUrl = new URL(envBaseUrl);
} catch {
  throw new Error("Invalid VITE_WORKNEST_BASE_URL. Expected a valid absolute URL.");
}

const BASEURL = parsedBaseUrl.toString().replace(/\/+$/, "");
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
