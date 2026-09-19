import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("refresh");

            if (!refreshToken) {
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/token/refresh/`,
                    {
                        refresh: refreshToken,
                    }
                );

                const newAccessToken = response.data.access;

                localStorage.setItem("access", newAccessToken);

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;