import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const isServer = typeof window === "undefined";
const isProd = process.env.NODE_ENV === "production";

const baseURL = isProd
  ? isServer
    ? process.env.API_URL
    : process.env.NEXT_PUBLIC_API_URL
  : isServer
    ? process.env.API_TEST_URL
    : process.env.NEXT_PUBLIC_API_TEST_URL;

const axiosInstance = axios.create({
  baseURL,
  timeout: isProd ? 60000 : 10000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const newToken = response.headers["x-new-access-token"];
    if (newToken && typeof window !== "undefined") {
      const isAutoLogin = localStorage.getItem("autoLogin") !== "false";
      if (isAutoLogin) {
        localStorage.setItem("accessToken", newToken);
      } else {
        sessionStorage.setItem("accessToken", newToken);
      }
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        const isAdmin = window.location.pathname.startsWith("/admin");
        window.location.href = isAdmin ? "/admin/login" : "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
