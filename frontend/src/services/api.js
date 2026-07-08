import axios from 'axios';

const getDefaultApiUrl = () => {
  try {
    const { protocol, hostname } = window.location;
    if (hostname && (hostname === 'localhost' || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname))) {
      const cleanProtocol = protocol && protocol.includes(':') ? protocol : 'http:';
      return `${cleanProtocol}//${hostname}:4000/api/v1`;
    }
  } catch (e) {
    // Fallback if window is not defined
  }
  return 'https://exploremytrip.onrender.com/api/v1';
};

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl !== 'undefined' && envUrl !== 'null' && envUrl.trim() !== '') {
    const cleanUrl = envUrl.replace(/\/$/, '');
    if (cleanUrl.endsWith('/api/v1')) {
      return cleanUrl;
    }
    if (cleanUrl.endsWith('/api')) {
      return `${cleanUrl}/v1`;
    }
    return `${cleanUrl}/api/v1`;
  }
  return getDefaultApiUrl();
};

const apiBaseURL = getApiBaseUrl();

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Self-healing token refresh with mutex lock & request de-duplication queue
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized and we haven't retried yet, but skip for all auth/ endpoints
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/')) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        processQueue(new Error('No refresh token found'), null);
        console.warn('Session expired (no refresh token). Logging out.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(error);
      }

      return new Promise((resolve, reject) => {
        axios.post(`${apiBaseURL}/auth/refresh`, { token: refreshToken })
          .then((res) => {
            if (res.data.success) {
              const newAccessToken = res.data.accessToken;
              const newRefreshToken = res.data.refreshToken;

              localStorage.setItem('accessToken', newAccessToken);
              localStorage.setItem('refreshToken', newRefreshToken);

              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              processQueue(null, newAccessToken);
              resolve(api(originalRequest));
            } else {
              throw new Error('Refresh token validation failed on server');
            }
          })
          .catch((refreshError) => {
            processQueue(refreshError, null);
            console.warn('Session expired. Logging out.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth-logout'));
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }
    return Promise.reject(error);
  }
);

export const getBackendUrl = () => {
  return apiBaseURL.replace(/\/api\/v1$/, '');
};

export default api;
