import axios from "axios";

const BASEURL = import.meta.env.VITE_WORKNEST_BASE_URL;
const TIMEOUTMSG = "Waiting for too long...Aborted!";
const timeout = 30000;

const config = {
  baseURL: BASEURL + "/api/v1",
  timeoutErrorMessage: TIMEOUTMSG,
  timeout,
  withCredentials: true, //to allow cookies to be received on the client
};

const axiosInstance = axios.create(config);

export default axiosInstance;
