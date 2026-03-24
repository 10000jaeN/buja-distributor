import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_TEST_URL || "http://localhost:4000",
  timeout: process.env.NODE_ENV === "development" ? 60000 : 1000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
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
    if (newToken) {
      localStorage.setItem("accessToken", newToken);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.status === 401) {
      console.error("인증이 만료되었습니다. 다시 로그인해주세요.");
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
